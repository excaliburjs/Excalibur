import { SuperGifUtils } from './utils';
import { SuperGifStream } from './stream';

// The actual parsing; returns an object with properties.
export class SuperGifParser {
  constructor(private stream: SuperGifStream, private handler: any) {}

  // LZW (GIF-specific)
  private parseCT(entries: any) {
    // Each entry is 3 bytes, for RGB.
    let ct = [];
    for (let i = 0; i < entries; i++) {
      ct.push(this.stream.readBytes(3));
    }
    return ct;
  }

  private readSubBlocks() {
    let size, data;
    data = '';
    do {
      size = this.stream.readByte();
      data += this.stream.read(size);
    } while (size !== 0);
    return data;
  }

  private parseHeader() {
    let hdr: any = {};
    hdr.sig = this.stream.read(3);
    hdr.ver = this.stream.read(3);
    if (hdr.sig !== 'GIF') throw new Error('Not a GIF file.'); // XXX: This should probably be handled more nicely.
    hdr.width = this.stream.readUnsigned();
    hdr.height = this.stream.readUnsigned();

    let bits = SuperGifUtils.byteToBitArr(this.stream.readByte());
    hdr.gctFlag = bits.shift();
    hdr.colorRes = SuperGifUtils.bitsToNum(bits.splice(0, 3));
    hdr.sorted = bits.shift();
    hdr.gctSize = SuperGifUtils.bitsToNum(bits.splice(0, 3));

    hdr.bgColor = this.stream.readByte();
    hdr.pixelAspectRatio = this.stream.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    if (hdr.gctFlag) {
      hdr.gct = this.parseCT(1 << (hdr.gctSize + 1));
    }
    this.handler.hdr && this.handler.hdr(hdr);
  }

  private parseExt(block: any) {
    let parseGCExt = (block: any) => {
      // let blockSize = this.stream.readByte(); // Always 4
      let bits = SuperGifUtils.byteToBitArr(this.stream.readByte());
      block.reserved = bits.splice(0, 3); // Reserved; should be 000.
      block.disposalMethod = SuperGifUtils.bitsToNum(bits.splice(0, 3));
      block.userInput = bits.shift();
      block.transparencyGiven = bits.shift();

      block.delayTime = this.stream.readUnsigned();

      block.transparencyIndex = this.stream.readByte();

      block.terminator = this.stream.readByte();

      this.handler.gce && this.handler.gce(block);
    };

    let parseComExt = (block: any) => {
      block.comment = this.readSubBlocks();
      this.handler.com && this.handler.com(block);
    };

    let parsePTExt = (block: any) => {
      // No one *ever* uses this. If you use it, deal with parsing it yourself.
      // let blockSize = this.stream.readByte(); // Always 12
      block.ptHeader = this.stream.readBytes(12);
      block.ptData = this.readSubBlocks();
      this.handler.pte && this.handler.pte(block);
    };

    let parseAppExt = (block: any) => {
      let parseNetscapeExt = (block: any) => {
        // let blockSize = this.stream.readByte(); // Always 3
        block.unknown = this.stream.readByte(); // ??? Always 1? What is this?
        block.iterations = this.stream.readUnsigned();
        block.terminator = this.stream.readByte();
        this.handler.app && this.handler.app.NETSCAPE && this.handler.app.NETSCAPE(block);
      };

      let parseUnknownAppExt = (block: any) => {
        block.appData = this.readSubBlocks();
        // FIXME: This won't work if a handler wants to match on any identifier.
        this.handler.app && this.handler.app[block.identifier] && this.handler.app[block.identifier](block);
      };

      // let blockSize = this.stream.readByte(); // Always 11
      block.identifier = this.stream.read(8);
      block.authCode = this.stream.read(3);
      switch (block.identifier) {
        case 'NETSCAPE':
          parseNetscapeExt(block);
          break;
        default:
          parseUnknownAppExt(block);
          break;
      }
    };

    let parseUnknownExt = (block: any) => {
      block.data = this.readSubBlocks();
      this.handler.unknown && this.handler.unknown(block);
    };

    block.label = this.stream.readByte();
    switch (block.label) {
      case 0xf9:
        block.extType = 'gce';
        parseGCExt(block);
        break;
      case 0xfe:
        block.extType = 'com';
        parseComExt(block);
        break;
      case 0x01:
        block.extType = 'pte';
        parsePTExt(block);
        break;
      case 0xff:
        block.extType = 'app';
        parseAppExt(block);
        break;
      default:
        block.extType = 'unknown';
        parseUnknownExt(block);
        break;
    }
  }

  private parseImg(img: any) {
    let deinterlace = (pixels: any, width: number) => {
      // Of course this defeats the purpose of interlacing. And it's *probably*
      // the least efficient way it's ever been implemented. But nevertheless...
      let newPixels = new Array(pixels.length);
      let rows = pixels.length / width;
      let cpRow = (toRow: any, fromRow: any) => {
        let fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
        newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
      };

      // See appendix E.
      let offsets = [0, 4, 2, 1];
      let steps = [8, 8, 4, 2];

      let fromRow = 0;
      for (let pass = 0; pass < 4; pass++) {
        for (let toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
          cpRow(toRow, fromRow);
          fromRow++;
        }
      }

      return newPixels;
    };

    img.leftPos = this.stream.readUnsigned();
    img.topPos = this.stream.readUnsigned();
    img.width = this.stream.readUnsigned();
    img.height = this.stream.readUnsigned();

    let bits = SuperGifUtils.byteToBitArr(this.stream.readByte());
    img.lctFlag = bits.shift();
    img.interlaced = bits.shift();
    img.sorted = bits.shift();
    img.reserved = bits.splice(0, 2);
    img.lctSize = SuperGifUtils.bitsToNum(bits.splice(0, 3));

    if (img.lctFlag) {
      img.lct = this.parseCT(1 << (img.lctSize + 1));
    }

    img.lzwMinCodeSize = this.stream.readByte();

    let lzwData = this.readSubBlocks();

    img.pixels = SuperGifUtils.lzwDecode(img.lzwMinCodeSize, lzwData);

    if (img.interlaced) {
      // Move
      img.pixels = deinterlace(img.pixels, img.width);
    }

    this.handler.img && this.handler.img(img);
  }

  private parseBlock() {
    let block: any = {};
    block.sentinel = this.stream.readByte();

    switch (
      String.fromCharCode(block.sentinel) // For ease of matching
    ) {
      case '!':
        block.type = 'ext';
        this.parseExt(block);
        break;
      case ',':
        block.type = 'img';
        this.parseImg(block);
        break;
      case ';':
        block.type = 'eof';
        this.handler.eof && this.handler.eof(block);
        break;
      default:
        throw new Error('Unknown block: 0x' + block.sentinel.toString(16)); // TODO: Pad this with a 0.
    }

    if (block.type !== 'eof') setTimeout(this.parseBlock.bind(this), 0);
  }

  parse() {
    this.parseHeader();
    setTimeout(this.parseBlock.bind(this), 0);
  }
}
