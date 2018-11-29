import { Resource } from './Resource';
import { Promise } from '../Promises';
/**
 * The [[Gif]] object allows games built in Excalibur to load gif resources.
 * [[Gif]] is an [[ILoadable]] which means it can be passed to a [[Loader]]
 * to pre-load before starting a level or game.
 *
 * [[include:Gif.md]]
 */

export interface Frame {
  sentinel: number;
  type: string;
  leftPos: number;
  topPos: number;
  width: number;
  height: number;
  lctFlag: boolean;
  interlaced: boolean;
  sorted: boolean;
  reserved: boolean[];
  lctSize: number;
  lzwMinCodeSize: number;
  pixels: number[];
}

export class Gif extends Resource<Animation> {
  /**
   * The width of the texture in pixels
   */
  public width: number;

  /**
   * The height of the texture in pixels
   */
  public height: number;

  /**
   * The array of frames in the gif
   */
  images: Frame[] = [];

  /**
   * an array of RGB colors in the gif
   */
  globalColorTable: any = [];

  /**
   * A [[Promise]] that resolves when the Texture is loaded.
   */
  public loaded: Promise<any> = new Promise<any>();

  private _isLoaded: boolean = false;

  private _gifParser: GifParser;

  /**
   * @param path       Path to the image resource
   * @param bustCache  Optionally load texture with cache busting
   */
  constructor(public path: string, public bustCache = true) {
    super(path, 'blob', bustCache);
  }

  /**
   * Returns true if the Texture is completely loaded and is ready
   * to be drawn.
   */
  public isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * Begins loading the texture and returns a promise to be resolved on completion
   */
  public load(): Promise<Animation> {
    var complete = new Promise<Animation>();

    var loaded = super.load();
    loaded.then(() => {
      const stream = new Stream(super.getArrayData());
      // this.image.addEventListener('load', () => {
      this._isLoaded = true;
      this._gifParser = new GifParser(stream, 0);
      return this._gifParser.loaded.then((frames: Frame[]) => {
        console.log(frames);
        const animation: Animation = new Animation();
        complete.resolve(animation);
      });
    });
    return complete;
  }
}

// public asSprite(): Sprite {
//   return this._sprite;
// }

// Generic functions
var bitsToNum = function(ba: any) {
  return ba.reduce(function(s: any, n: any) {
    return s * 2 + n;
  }, 0);
};

var byteToBitArr = function(bite: any) {
  var a = [];
  for (var i = 7; i >= 0; i--) {
    a.push(!!(bite & (1 << i)));
  }
  return a;
};

var lzwDecode = function(minCodeSize: any, data: any) {
  // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
  var pos = 0; // Maybe this streaming thing should be merged with the Stream?

  var readCode = function(size: any) {
    var code = 0;
    for (var i = 0; i < size; i++) {
      if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
        code |= 1 << i;
      }
      pos++;
    }
    return code;
  };

  var output: any[] = [];

  var clearCode = 1 << minCodeSize;
  var eoiCode = clearCode + 1;

  var codeSize = minCodeSize + 1;

  var dict: any[] = [];

  var clear = function() {
    dict = [];
    codeSize = minCodeSize + 1;
    for (var i = 0; i < clearCode; i++) {
      dict[i] = [i];
    }
    dict[clearCode] = [];
    dict[eoiCode] = null;
  };

  var code;
  var last;

  while (true) {
    last = code;
    code = readCode(codeSize);
    if (code === clearCode) {
      clear();
      continue;
    }
    if (code === eoiCode) {
      break;
    }

    if (code < dict.length) {
      if (last !== clearCode) {
        dict.push(dict[last].concat(dict[code][0]));
      }
    } else {
      if (code !== dict.length) {
        throw new Error('Invalid LZW code.');
      }
      dict.push(dict[last].concat(dict[last][0]));
    }
    output.push.apply(output, dict[code]);

    if (dict.length === 1 << codeSize && codeSize < 12) {
      // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
      codeSize++;
    }
  }

  // I don't know if this is technically an error, but some GIFs do it.
  //if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
  return output;
};

// The actual parsing; returns an object with properties.
class GifParser {
  private _st: any;
  private _handler: any = {};
  public globalColorTable: any[] = [];
  public images: Frame[] = [];
  public loaded: Promise<any> = new Promise<any>();

  constructor(st: any, handler: any) {
    this._st = st;
    this._handler = handler;
    this.loaded.resolve(this.parse());
  }

  // LZW (GIF-specific)
  private _parseColorTable(entries: any) {
    // Each entry is 3 bytes, for RGB.
    var ct = [];
    for (var i = 0; i < entries; i++) {
      ct.push(this._st.readBytes(3));
    }
    return ct;
  }

  private _readSubBlocks() {
    var size, data;
    data = '';
    do {
      size = this._st.readByte();
      data += this._st.read(size);
    } while (size !== 0);
    return data;
  }

  private _parseHeader() {
    var hdr: any = {
      sig: null,
      ver: null,
      width: null,
      height: null,
      colorRes: null,
      globalColorTableSize: null,
      gctFlag: null,
      sorted: null,
      globalColorTable: [],
      bgColor: null,
      pixelAspectRatio: null // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    };

    hdr.sig = this._st.read(3);
    hdr.ver = this._st.read(3);
    if (hdr.sig !== 'GIF') {
      throw new Error('Not a GIF file.'); // XXX: This should probably be handled more nicely.
    }

    hdr.width = this._st.readUnsigned();
    hdr.height = this._st.readUnsigned();

    var bits = byteToBitArr(this._st.readByte());
    hdr.gctFlag = bits.shift();
    hdr.colorRes = bitsToNum(bits.splice(0, 3));
    hdr.sorted = bits.shift();
    hdr.globalColorTableSize = bitsToNum(bits.splice(0, 3));

    hdr.bgColor = this._st.readByte();
    hdr.pixelAspectRatio = this._st.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64

    if (hdr.gctFlag) {
      hdr.globalColorTable = this._parseColorTable(1 << (hdr.globalColorTableSize + 1));
      this.globalColorTable = hdr.globalColorTable;
    }
    if (this._handler.hdr) {
      this._handler.hdr(hdr);
    }
  }

  private _parseGCExt(block: any) {
    // var blockSize = st.readByte(); // Always 4

    var bits = byteToBitArr(this._st.readByte());
    block.reserved = bits.splice(0, 3); // Reserved; should be 000.
    block.disposalMethod = bitsToNum(bits.splice(0, 3));
    block.userInput = bits.shift();
    block.transparencyGiven = bits.shift();

    block.delayTime = this._st.readUnsigned();

    block.transparencyIndex = this._st.readByte();

    block.terminator = this._st.readByte();

    if (this._handler.gce) {
      this._handler.gce(block);
    }
  }

  private _parseComExt(block: any) {
    block.comment = this._readSubBlocks();
    if (this._handler.com) {
      this._handler.com(block);
    }
  }

  private _parsePTExt(block: any) {
    block.ptHeader = this._st.readBytes(12);
    block.ptData = this._readSubBlocks();
    if (this._handler.pte) {
      this._handler.pte(block);
    }
  }

  private _parseNetscapeExt(block: any) {
    block.unknown = this._st.readByte(); // ??? Always 1? What is this?
    block.iterations = this._st.readUnsigned();
    block.terminator = this._st.readByte();
    if (this._handler.app) {
      if (this._handler.app.NETSCAPE) {
        this._handler.app.NETSCAPE(block);
      }
    }
  }
  private _parseAppExt(block: any) {
    // var blockSize = this._st.readByte(); // Always 11
    block.identifier = this._st.read(8);
    block.authCode = this._st.read(3);
    switch (block.identifier) {
      case 'NETSCAPE':
        this._parseNetscapeExt(block);
        break;
      default:
        this._parseUnknownAppExt(block);
        break;
    }
  }

  private _parseUnknownAppExt(block: any) {
    block.appData = this._readSubBlocks();
    // FIXME: This won't work if a handler wants to match on any identifier.
    if (this._handler.app) {
      if (this._handler.app[block.identifier]) {
        this._handler.app[block.identifier](block);
      }
    }
  }
  private _parseExt(block: any) {
    // var blockSize = st.readByte(); // Always 11
    block.identifier = this._st.read(8);
    block.authCode = this._st.read(3);
    switch (block.identifier) {
      case 'NETSCAPE':
        this._parseNetscapeExt(block);
        break;
      default:
        this._parseUnknownAppExt(block);
        break;
    }

    block.label = this._st.readByte();
    switch (block.label) {
      case 0xf9:
        block.extType = 'gce';
        this._parseGCExt(block);
        break;
      case 0xfe:
        block.extType = 'com';
        this._parseComExt(block);
        break;
      case 0x01:
        block.extType = 'pte';
        this._parsePTExt(block);
        break;
      case 0xff:
        block.extType = 'app';
        this._parseAppExt(block);
        break;
      default:
        block.extType = 'unknown';
        this._parseUnknownExt(block);
        break;
    }
  }

  private _parseUnknownExt(block: any) {
    block.data = this._readSubBlocks();
    if (this._handler.unknown) {
      this._handler.unknown(block);
    }
  }

  private _parseImg(img: any) {
    var deinterlace = function(pixels: any, width: any) {
      // Of course this defeats the purpose of interlacing. And it's *probably*
      // the least efficient way it's ever been implemented. But nevertheless...

      var newPixels = new Array(pixels.length);
      var rows = pixels.length / width;
      var cpRow = function(toRow: any, fromRow: any) {
        var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
        newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
      };

      // See appendix E.
      var offsets = [0, 4, 2, 1];
      var steps = [8, 8, 4, 2];

      var fromRow = 0;
      for (var pass = 0; pass < 4; pass++) {
        for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
          cpRow(toRow, fromRow);
          fromRow++;
        }
      }

      return newPixels;
    };

    img.leftPos = this._st.readUnsigned();
    img.topPos = this._st.readUnsigned();
    img.width = this._st.readUnsigned();
    img.height = this._st.readUnsigned();

    var bits = byteToBitArr(this._st.readByte());
    img.lctFlag = bits.shift();
    img.interlaced = bits.shift();
    img.sorted = bits.shift();
    img.reserved = bits.splice(0, 2);
    img.lctSize = bitsToNum(bits.splice(0, 3));

    if (img.lctFlag) {
      img.lct = this._parseColorTable(1 << (img.lctSize + 1));
    }

    img.lzwMinCodeSize = this._st.readByte();

    var lzwData = this._readSubBlocks();

    img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData);

    if (img.interlaced) {
      // Move
      img.pixels = deinterlace(img.pixels, img.width);
    }

    this.images.push(img);
    if (this._handler.img) {
      this._handler.img(img);
    }
  }

  private _parseBlock() {
    var block = {
      sentinel: this._st.readByte(),
      type: ''
    };
    var blockChar = String.fromCharCode(block.sentinel);
    switch (blockChar) {
      case '!':
        block.type = 'ext';
        this._parseExt(block);
        break;
      case ',':
        block.type = 'img';
        this._parseImg(block);
        break;
      case ';':
        block.type = 'eof';
        if (this._handler.eof) {
          this._handler.eof(block);
        }
        break;
      default:
        throw new Error('Unknown block: 0x' + block.sentinel.toString(16)); // TODO: Pad this with a 0.
    }

    if (block.type !== 'eof') {
      this._parseBlock();
    }
  }

  public parse() {
    this._parseHeader();
    this._parseBlock();
  }
}

// Stream
class Stream {
  data: Uint8Array = null;
  len: number = null;
  position: number = 0;
  constructor(data: ArrayBuffer) {
    this.data = new Uint8Array(data);
    this.len = this.data.length;
  }

  public readByte() {
    if (this.position >= this.data.length) {
      throw new Error('Attempted to read past end of stream.');
    }
    //return data.charCodeAt(position++) & 0xFF;
    return this.data[this.position++];
  }

  public readBytes(n: number) {
    var bytes = [];
    for (var i = 0; i < n; i++) {
      bytes.push(this.readByte());
    }
    return bytes;
  }

  public read(n: any) {
    var s = '';
    for (var i = 0; i < n; i++) {
      s += String.fromCharCode(this.readByte());
    }
    return s;
  }

  readUnsigned() {
    // Little-endian.
    var a = this.readBytes(2);
    return (a[1] << 8) + a[0];
  }
}
