import { Resource } from './resource';
import type { Sprite } from '../graphics/sprite';
import { SpriteSheet } from '../graphics/sprite-sheet';
import { Animation } from '../graphics/animation';
import type { Loadable } from '../interfaces/index';
import { ImageSource } from '../graphics/image-source';
/**
 * The {@apilink Texture} object allows games built in Excalibur to load image resources.
 * {@apilink Texture} is an {@apilink Loadable} which means it can be passed to a {@apilink Loader}
 * to pre-load before starting a level or game.
 */
export class Gif implements Loadable<ImageSource[]> {
  private _resource: Resource<ArrayBuffer>;

  /**
   * The width of the texture in pixels
   */
  public width: number = 0;

  /**
   * The height of the texture in pixels
   */
  public height: number = 0;

  private _stream?: Stream;
  private _gif?: GifParser;
  private _images: ImageSource[] = [];
  private _animation?: Animation;

  public data: ImageSource[] = [];
  private _sprites: Sprite[] = [];

  /**
   * @param path       Path to the image resource
   * @param bustCache  Optionally load texture with cache busting
   */
  constructor(
    public path: string,
    bustCache = false
  ) {
    this._resource = new Resource(path, 'arraybuffer', bustCache);
  }

  /**
   * Should excalibur add a cache busting querystring? By default false.
   * Must be set before loading
   */
  public get bustCache() {
    return this._resource.bustCache;
  }

  public set bustCache(val: boolean) {
    this._resource.bustCache = val;
  }

  /**
   * Begins loading the texture and returns a promise to be resolved on completion
   */
  public async load(): Promise<ImageSource[]> {
    const arraybuffer = await this._resource.load();
    this._stream = new Stream(arraybuffer);
    this._gif = new GifParser(this._stream);
    const images = this._gif.images.map((i) => new ImageSource(i.src, false));
    // Load all textures
    await Promise.all(images.map((t) => t.load()));
    this.data = this._images = images;
    this._sprites = this._images.map((image) => {
      return image.toSprite();
    });
    return this.data;
  }

  public isLoaded() {
    return !!this.data;
  }

  /**
   * Return a frame of the gif as a sprite by id
   * @param id
   */
  public toSprite(id: number = 0): Sprite | null {
    return this._sprites[id] ?? null;
  }

  /**
   * Return the gif as a spritesheet
   */
  public toSpriteSheet(): SpriteSheet | null {
    const sprites: Sprite[] = this._sprites;
    if (sprites.length) {
      return new SpriteSheet({ sprites });
    }

    return null;
  }

  /**
   * Transform the GIF into an animation with duration per frame
   * @param durationPerFrame Optionally override duration per frame
   */
  public toAnimation(durationPerFrame?: number): Animation | null {
    const images = this._gif?.images;
    if (images?.length) {
      const frames = images.map((image, index) => {
        return {
          graphic: this._sprites[index],
          duration: this._gif?.frames[index].delayMs || undefined
        };
      });
      this._animation = new Animation({
        frames,
        frameDuration: durationPerFrame
      });

      return this._animation;
    }
    return null;
  }

  public get readCheckBytes(): number[] {
    return this._gif?.checkBytes ?? [];
  }
}

export interface GifFrame {
  sentinel: number;
  type: string;
  leftPos: number;
  topPos: number;
  width: number;
  height: number;
  lctFlag: boolean;
  lctBytes: [number, number, number][];
  interlaced: boolean;
  sorted: boolean;
  reserved: boolean[];
  lctSize: number;
  lzwMinCodeSize: number;
  pixels: number[];
  delayTime: number;
  delayMs: number;
}

const bitsToNum = (ba: any) => {
  return ba.reduce(function (s: number, n: number) {
    return s * 2 + n;
  }, 0);
};

const byteToBitArr = (bite: number) => {
  const a = [];
  for (let i = 7; i >= 0; i--) {
    a.push(!!(bite & (1 << i)));
  }
  return a as [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
};

export class Stream {
  data: Uint8Array;
  len: number = 0;
  position: number = 0;

  constructor(dataArray: ArrayBuffer) {
    this.data = new Uint8Array(dataArray);
    this.len = this.data.byteLength;
    if (this.len === 0) {
      throw new Error('No data loaded from file');
    }
  }

  public readByte = () => {
    if (this.position >= this.data.byteLength) {
      throw new Error('Attempted to read past end of stream.');
    }
    return this.data[this.position++];
  };

  public readBytes = (n: number) => {
    const bytes = [];
    for (let i = 0; i < n; i++) {
      bytes.push(this.readByte());
    }
    return bytes;
  };

  public read = (n: number) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      s += String.fromCharCode(this.readByte());
    }
    return s;
  };

  public readUnsigned = () => {
    // Little-endian.
    const a = this.readBytes(2);
    return (a[1] << 8) + a[0];
  };
}

const lzwDecode = function (minCodeSize: number, data: any) {
  // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
  let pos = 0; // Maybe this streaming thing should be merged with the Stream?

  const readCode = function (size: number) {
    let code = 0;
    for (let i = 0; i < size; i++) {
      if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
        code |= 1 << i;
      }
      pos++;
    }
    return code;
  };

  const output: any[] = [];

  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  let codeSize = minCodeSize + 1;

  let dict: any[] = [];

  const clear = function () {
    dict = [];
    codeSize = minCodeSize + 1;
    for (let i = 0; i < clearCode; i++) {
      dict[i] = [i];
    }
    dict[clearCode] = [];
    dict[eoiCode] = null;
  };

  let code = 0;
  let last = 0;

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

interface GifBlock {
  sentinel: number;
  type: string;
}

interface GifHeader {
  sig: string;
  ver: string;
  width: number;
  height: number;
  colorResolution: number;
  globalColorTableSize: number;
  gctFlag: boolean;
  sortedFlag: boolean;
  globalColorTable: [number, number, number][];
  backgroundColorIndex: number;
  pixelAspectRatio: number; // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
}

interface GCExtBlock extends GifBlock {
  type: 'ext';
  label: number;
  extType: string;
  reserved: boolean[];
  disposalMethod: number;
  userInputFlag: boolean;
  transparentColorFlag: boolean;
  delayTime: number;
  transparentColorIndex: number;
  terminator: number;
}

/**
 * GifParser for binary format
 *
 * Roughly based on the documentation https://giflib.sourceforge.net/whatsinagif/index.html
 */
export class GifParser {
  private _st: Stream;
  private _handler: any = {};
  public frames: GifFrame[] = [];
  public images: HTMLImageElement[] = [];
  private _currentFrameCanvas: HTMLCanvasElement;
  private _currentFrameContext: CanvasRenderingContext2D;
  public globalColorTableBytes: [number, number, number][] = [];
  public checkBytes: number[] = [];
  private _gce?: GCExtBlock;
  private _hdr?: GifHeader;

  constructor(stream: Stream) {
    this._st = stream;
    this._handler = {};
    this._currentFrameCanvas = document.createElement('canvas');
    this._currentFrameContext = this._currentFrameCanvas.getContext('2d')!;
    this.parseHeader();
    this.parseBlocks();
  }

  parseColorTableBytes = (entries: number) => {
    // Each entry is 3 bytes, for RGB.
    const colorTable: [number, number, number][] = [];
    for (let i = 0; i < entries; i++) {
      const rgb = this._st.readBytes(3) as [number, number, number];
      colorTable.push(rgb);
    }
    return colorTable;
  };

  readSubBlocks = () => {
    let size, data;
    data = '';
    do {
      size = this._st.readByte();
      data += this._st.read(size);
    } while (size !== 0);
    return data;
  };

  parseHeader = () => {
    const hdr: GifHeader = {
      sig: '',
      ver: '',
      width: 0,
      height: 0,
      colorResolution: 0,
      globalColorTableSize: 0,
      gctFlag: false,
      sortedFlag: false,
      globalColorTable: [],
      backgroundColorIndex: 0,
      pixelAspectRatio: 0 // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    };

    hdr.sig = this._st.read(3);
    hdr.ver = this._st.read(3);
    if (hdr.sig !== 'GIF') {
      throw new Error('Not a GIF file.'); // XXX: This should probably be handled more nicely.
    }

    hdr.width = this._st.readUnsigned();
    hdr.height = this._st.readUnsigned();

    this._currentFrameCanvas.width = hdr.width;
    this._currentFrameCanvas.height = hdr.height;

    const bits = byteToBitArr(this._st.readByte());
    hdr.gctFlag = bits.shift()!;
    hdr.colorResolution = bitsToNum(bits.splice(0, 3));
    hdr.sortedFlag = bits.shift()!;
    hdr.globalColorTableSize = bitsToNum(bits.splice(0, 3));

    hdr.backgroundColorIndex = this._st.readByte();
    hdr.pixelAspectRatio = this._st.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64

    if (hdr.gctFlag) {
      // hdr.globalColorTable = this.parseColorTable(1 << (hdr.globalColorTableSize + 1));
      this.globalColorTableBytes = this.parseColorTableBytes(1 << (hdr.globalColorTableSize + 1));
    }
    if (this._handler.hdr && this._handler.hdr(hdr)) {
      this.checkBytes.push(this._handler.hdr);
    }
  };

  parseExt = (block: GCExtBlock) => {
    const parseGCExt = (block: GCExtBlock) => {
      this.checkBytes.push(this._st.readByte()); // Always 4

      const bits = byteToBitArr(this._st.readByte());
      block.reserved = bits.splice(0, 3); // Reserved; should be 000.
      block.disposalMethod = bitsToNum(bits.splice(0, 3));
      block.userInputFlag = bits.shift()!;
      block.transparentColorFlag = bits.shift()!;

      block.delayTime = this._st.readUnsigned();

      block.transparentColorIndex = this._st.readByte();

      block.terminator = this._st.readByte(); // always 0

      if (this._handler.gce && this._handler.gce(block)) {
        this.checkBytes.push(this._handler.gce);
      }
      return block;
    };

    const parseComExt = (block: any) => {
      block.comment = this.readSubBlocks();
      if (this._handler.com && this._handler.com(block)) {
        this.checkBytes.push(this._handler.com);
      }
    };

    const parsePTExt = (block: any) => {
      this.checkBytes.push(this._st.readByte()); // Always 12
      block.ptHeader = this._st.readBytes(12);
      block.ptData = this.readSubBlocks();
      if (this._handler.pte && this._handler.pte(block)) {
        this.checkBytes.push(this._handler.pte);
      }
    };

    const parseAppExt = (block: any) => {
      const parseNetscapeExt = (block: any) => {
        this.checkBytes.push(this._st.readByte()); // Always 3
        block.unknown = this._st.readByte(); // Q: Always 1? What is this?
        block.iterations = this._st.readUnsigned();
        block.terminator = this._st.readByte();
        if (this._handler.app && this._handler.app.NETSCAPE && this._handler.app.NETSCAPE(block)) {
          this.checkBytes.push(this._handler.app);
        }
      };

      const parseUnknownAppExt = (block: any) => {
        block.appData = this.readSubBlocks();
        // FIXME: This won't work if a handler wants to match on any identifier.
        if (this._handler.app && this._handler.app[block.identifier] && this._handler.app[block.identifier](block)) {
          this.checkBytes.push(this._handler.app[block.identifier]);
        }
      };

      this.checkBytes.push(this._st.readByte()); // Always 11
      block.identifier = this._st.read(8);
      block.authCode = this._st.read(3);
      switch (block.identifier) {
        case 'NETSCAPE':
          parseNetscapeExt(block);
          break;
        default:
          parseUnknownAppExt(block);
          break;
      }
    };

    const parseUnknownExt = (block: any) => {
      block.data = this.readSubBlocks();
      if (this._handler.unknown && this._handler.unknown(block)) {
        this.checkBytes.push(this._handler.unknown);
      }
    };

    block.label = this._st.readByte();
    switch (block.label) {
      case 0xf9:
        block.extType = 'gce';
        this._gce = parseGCExt(block);
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
  };

  parseImg = (img: GifFrame) => {
    const deinterlace = (pixels: number[], width: number) => {
      // Of course this defeats the purpose of interlacing. And it's *probably*
      // the least efficient way it's ever been implemented. But nevertheless...

      const newPixels: number[] = new Array(pixels.length);
      const rows = pixels.length / width;
      const cpRow = (toRow: number, fromRow: number) => {
        const fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
        newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels) as any);
      };

      const offsets = [0, 4, 2, 1];
      const steps = [8, 8, 4, 2];

      let fromRow = 0;
      for (let pass = 0; pass < 4; pass++) {
        for (let toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
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

    const bits = byteToBitArr(this._st.readByte());
    img.lctFlag = bits.shift()!;
    img.interlaced = bits.shift()!;
    img.sorted = bits.shift()!;
    img.reserved = bits.splice(0, 2);
    img.lctSize = bitsToNum(bits.splice(0, 3));

    if (img.lctFlag) {
      img.lctBytes = this.parseColorTableBytes(1 << (img.lctSize + 1));
    }

    img.lzwMinCodeSize = this._st.readByte();

    const lzwData = this.readSubBlocks();

    img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData);

    if (img.interlaced) {
      // Move
      img.pixels = deinterlace(img.pixels, img.width);
    }

    if (this._gce?.delayTime) {
      img.delayMs = this._gce.delayTime * 10;
    }

    this.frames.push(img);
    this.arrayToImage(img, img.lctFlag ? img.lctBytes : this.globalColorTableBytes);
    if (this._handler.img && this._handler.img(img)) {
      this.checkBytes.push(this._handler);
    }
  };

  public parseBlocks = () => {
    const block: GifBlock = {
      sentinel: this._st.readByte(),
      type: ''
    };
    const blockChar = String.fromCharCode(block.sentinel);
    switch (blockChar) {
      case '!':
        block.type = 'ext';
        this.parseExt(block as GCExtBlock);
        break;
      case ',':
        block.type = 'img';
        this.parseImg(block as any);
        break;
      case ';':
        block.type = 'eof';
        if (this._handler.eof && this._handler.eof(block)) {
          this.checkBytes.push(this._handler.eof);
        }
        break;
      default:
        throw new Error('Unknown block: 0x' + block.sentinel.toString(16));
    }

    if (block.type !== 'eof') {
      this.parseBlocks();
    }
  };

  arrayToImage = (frame: GifFrame, colorTable: [number, number, number][]) => {
    const canvas = document.createElement('canvas')!;
    canvas.width = frame.width;
    canvas.height = frame.height;
    const context = canvas.getContext('2d')!;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    let transparentColorIndex = -1;
    if (this._gce?.transparentColorFlag) {
      transparentColorIndex = this._gce.transparentColorIndex;
    }

    for (let pixel = 0; pixel < frame.pixels.length; pixel++) {
      const colorIndex = frame.pixels[pixel];
      const color = colorTable[colorIndex];
      if (colorIndex === transparentColorIndex) {
        imageData.data.set([0, 0, 0, 0], pixel * 4);
      } else {
        imageData.data.set([...color, 255], pixel * 4);
      }
    }
    context.putImageData(imageData, 0, 0);

    // A value of 1 which tells the decoder to leave the image in place and draw the next image on top of it.
    // A value of 2 would have meant that the canvas should be restored to the background color (as indicated by the logical screen descriptor).
    // A value of 3 is defined to mean that the decoder should restore the canvas to its previous state before the current image was drawn.
    // The behavior for values 4-7 are yet to be defined.
    if (this._gce?.disposalMethod === 1 && this.images.length) {
      this._currentFrameContext.drawImage(this.images[this.images.length - 1]!, 0, 0);
    } else if (this._gce?.disposalMethod === 2 && this._hdr?.gctFlag) {
      const bg = colorTable[this._hdr.backgroundColorIndex];
      this._currentFrameContext.fillStyle = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`;
      this._currentFrameContext.fillRect(0, 0, this._hdr.width, this._hdr.height);
    } else {
      this._currentFrameContext.clearRect(0, 0, this._currentFrameCanvas.width, this._currentFrameCanvas.height);
    }

    this._currentFrameContext.drawImage(canvas, frame.leftPos, frame.topPos, frame.width, frame.height);

    const img = new Image();
    img.src = this._currentFrameCanvas.toDataURL(); // default is png
    this.images.push(img);
  };
}
