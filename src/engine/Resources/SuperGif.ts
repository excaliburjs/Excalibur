import { SuperGifParser } from './parser';
import { SuperGifStream } from './stream';

export class SuperGif {
  private options: any = {
    autoPlay: true
  };

  private hdr: any;

  private loadErrorCause: string;
  private loading = false;
  private ready = false;

  private transparency: any = null;
  private delay: any = null;
  private disposalMethod: any = null;
  private disposalRestoreFromIdx: any = null;
  private lastDisposalMethod: any = null;
  private frame: any = null;
  private lastImg: any = null;

  private playing = true;
  private forward = true;

  private ctxScaled = false;

  private frames: any = [];
  private frameOffsets: any = []; // Elements have .x and .y properties

  private onEndListener: any;
  private loopDelay: any;
  private overrideLoopMode: any;
  private drawWhileLoading: any;

  private canvas: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private tmpCanvas: HTMLCanvasElement;
  private initialized = false;
  private loadCallback: any;

  private currentFrameIndex = -1;
  private iterationCount = 0;
  private stepping = false;

  private handler = {
    hdr: this.withProgress(this.doHdr.bind(this)),
    gce: this.withProgress(this.doGCE.bind(this)),
    com: this.withProgress(this.doNothing.bind(this)),
    // I guess that's all for now.
    app: {
      // TODO: Is there much point in actually supporting iterations?
      NETSCAPE: this.withProgress(this.doNothing.bind(this))
    },
    img: this.withProgress(this.doImg.bind(this)),
    eof: () => {
      this.pushFrame();

      this.canvas.width = this.hdr.width * this.getCanvasScale();
      this.canvas.height = this.hdr.height * this.getCanvasScale();

      this.playerInit();
      this.loading = false;
      this.ready = true;

      if (this.loadCallback) {
        this.loadCallback(this.gifImgElement);
      }
    }
  };

  constructor(private gifImgElement: HTMLImageElement, opts: any) {
    for (let i in opts) {
      this.options[i] = opts[i];
    }

    this.onEndListener = opts.onEnd;
    this.loopDelay = opts.loopDelay || 0;
    this.overrideLoopMode = opts.loopMode || 'auto';
    this.drawWhileLoading = opts.drawWhileLoading || true;
  }

  private init() {
    let parentNode = this.gifImgElement.parentNode;
    let divElement: HTMLElement = document.createElement('div');

    this.canvas = document.createElement('canvas');
    this.canvasContext = this.canvas.getContext('2d');
    this.tmpCanvas = document.createElement('canvas');

    divElement.className = this.options.enclosingClass || 'super-gif';
    divElement.appendChild(this.canvas);

    if (parentNode) {
      parentNode.insertBefore(divElement, this.gifImgElement);
      parentNode.removeChild(this.gifImgElement);
    }

    this.initialized = true;
  }

  private loadSetup(callback: any) {
    if (this.loading) {
      return false;
    }

    if (callback) {
      this.loadCallback = callback;
    }

    this.loading = true;
    this.frames = [];
    this.clear();
    this.disposalRestoreFromIdx = null;
    this.lastDisposalMethod = null;
    this.frame = null;
    this.lastImg = null;

    return true;
  }

  private completeLoop() {
    if (this.onEndListener) {
      this.onEndListener(this.gifImgElement);
    }

    this.iterationCount++;

    if (this.overrideLoopMode !== false || this.iterationCount < 0) {
      this.doStep();
    } else {
      this.stepping = false;
      this.playing = false;
    }
  }

  private doStep() {
    this.stepping = this.playing;
    if (!this.stepping) {
      return;
    }

    this.stepFrame(1);
    let delay = this.frames[this.currentFrameIndex].delay * 10;

    if (!delay) {
      // FIXME: Should this even default at all? What should it be?
      delay = 100;
    }

    let nextFrameNo = this.getNextFrameNo();
    if (nextFrameNo === 0) {
      delay += this.loopDelay;
      setTimeout(this.completeLoop.bind(this), delay);
    } else {
      setTimeout(this.doStep.bind(this), delay);
    }
  }

  private step() {
    if (!this.stepping) {
      setTimeout(this.doStep.bind(this), 0);
    }
  }

  private putFrame() {
    let offset;
    this.currentFrameIndex = parseInt(this.currentFrameIndex.toString(), 10);

    if (this.currentFrameIndex > this.frames.length - 1) {
      this.currentFrameIndex = 0;
    }

    if (this.currentFrameIndex < 0) {
      this.currentFrameIndex = 0;
    }

    offset = this.frameOffsets[this.currentFrameIndex];

    this.tmpCanvas.getContext('2d').putImageData(this.frames[this.currentFrameIndex].data, offset.x, offset.y);
    this.canvasContext.globalCompositeOperation = 'copy';
    this.canvasContext.drawImage(this.tmpCanvas, 0, 0);
  }

  private playerInit() {
    if (this.loadErrorCause) return;

    this.canvasContext.scale(this.getCanvasScale(), this.getCanvasScale());

    if (this.options.autoPlay) {
      this.step();
    } else {
      this.currentFrameIndex = 0;
      this.putFrame();
    }
  }

  private clear() {
    this.transparency = null;
    this.delay = null;
    this.lastDisposalMethod = this.disposalMethod;
    this.disposalMethod = null;
    this.frame = null;
  }

  // XXX: There's probably a better way to handle catching exceptions when
  // callbacks are involved.
  private parseStream(stream: SuperGifStream) {
    try {
      let parser = new SuperGifParser(stream, this.handler);
      parser.parse();
    } catch (err) {
      this.handleError('parse');
    }
  }

  private setSizes(width: number, height: number) {
    this.canvas.width = width * this.getCanvasScale();
    this.canvas.height = height * this.getCanvasScale();

    this.tmpCanvas.width = width;
    this.tmpCanvas.height = height;
    this.tmpCanvas.style.width = width + 'px';
    this.tmpCanvas.style.height = height + 'px';
    this.tmpCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
  }

  private drawError() {
    this.canvasContext.fillStyle = 'black';
    this.canvasContext.fillRect(0, 0, this.hdr.width, this.hdr.height);
    this.canvasContext.strokeStyle = 'red';
    this.canvasContext.lineWidth = 3;
    this.canvasContext.moveTo(0, 0);
    this.canvasContext.lineTo(this.hdr.width, this.hdr.height);
    this.canvasContext.moveTo(0, this.hdr.height);
    this.canvasContext.lineTo(this.hdr.width, 0);
    this.canvasContext.stroke();
  }

  private handleError(originOfError: string) {
    this.loadErrorCause = originOfError;
    this.hdr = {
      width: this.gifImgElement.width,
      height: this.gifImgElement.height
    }; // Fake header.

    this.frames = [];
    this.drawError();
  }

  private doHdr(_hdr: any) {
    this.hdr = _hdr;
    this.setSizes(this.hdr.width, this.hdr.height);
  }

  private doGCE(gce: any) {
    this.pushFrame();
    this.clear();
    this.transparency = gce.transparencyGiven ? gce.transparencyIndex : null;
    this.delay = gce.delayTime;
    this.disposalMethod = gce.disposalMethod;
    // We don't have much to do with the rest of GCE.
  }

  private pushFrame() {
    if (!this.frame) {
      return;
    }

    this.frames.push({
      data: this.frame.getImageData(0, 0, this.hdr.width, this.hdr.height),
      delay: this.delay
    });

    this.frameOffsets.push({ x: 0, y: 0 });
  }

  private doImg(img: any) {
    if (!this.frame) {
      this.frame = this.tmpCanvas.getContext('2d');
    }

    let currIndex = this.frames.length;

    //ct = color table, gct = global color table
    let ct = img.lctFlag ? img.lct : this.hdr.gct; // TODO: What if neither exists?

    if (currIndex > 0) {
      if (this.lastDisposalMethod === 3) {
        // Restore to previous
        // If we disposed every frame including first frame up to this point, then we have
        // no composited frame to restore to. In this case, restore to background instead.
        if (this.disposalRestoreFromIdx !== null) {
          this.frame.putImageData((<any>frames)[this.disposalRestoreFromIdx].data, 0, 0);
        } else {
          this.frame.clearRect(this.lastImg.leftPos, this.lastImg.topPos, this.lastImg.width, this.lastImg.height);
        }
      } else {
        this.disposalRestoreFromIdx = currIndex - 1;
      }

      if (this.lastDisposalMethod === 2) {
        // Restore to background color
        // Browser implementations historically restore to transparent; we do the same.
        // http://www.wizards-toolkit.org/discourse-server/viewtopic.php?f=1&t=21172#p86079
        this.frame.clearRect(this.lastImg.leftPos, this.lastImg.topPos, this.lastImg.width, this.lastImg.height);
      }
    }
    // else, Undefined/Do not dispose.
    // frame contains final pixel data from the last frame; do nothing

    //Get existing pixels for img region after applying disposal method
    let imgData = this.frame.getImageData(img.leftPos, img.topPos, img.width, img.height);

    //apply color table colors
    img.pixels.forEach((pixel: any, i: any) => {
      // imgData.data === [R,G,B,A,R,G,B,A,...]
      if (pixel !== this.transparency) {
        imgData.data[i * 4 + 0] = ct[pixel][0];
        imgData.data[i * 4 + 1] = ct[pixel][1];
        imgData.data[i * 4 + 2] = ct[pixel][2];
        imgData.data[i * 4 + 3] = 255; // Opaque.
      }
    });

    this.frame.putImageData(imgData, img.leftPos, img.topPos);

    if (!this.ctxScaled) {
      this.canvasContext.scale(this.getCanvasScale(), this.getCanvasScale());
      this.ctxScaled = true;
    }

    // We could use the on-page canvas directly, except that we draw a progress
    // bar for each image chunk (not just the final image).
    if (this.drawWhileLoading) {
      this.canvasContext.drawImage(this.tmpCanvas, 0, 0);
      this.drawWhileLoading = this.options.autoPlay;
    }

    this.lastImg = img;
  }

  private doNothing() {}

  private withProgress(fn: any) {
    return function(block: any) {
      fn(block);
    };
  }

  /**
   * Gets the index of the frame "up next".
   * @returns {number}
   */
  getNextFrameNo() {
    let delta = this.forward ? 1 : -1;
    return (this.currentFrameIndex + delta + this.frames.length) % this.frames.length;
  }

  stepFrame(amount: any) {
    // XXX: Name is confusing.
    this.currentFrameIndex = this.currentFrameIndex + amount;
    this.putFrame();
  }

  getCanvasScale() {
    let scale: number;

    if (this.options.maxWidth && this.hdr && this.hdr.width > this.options.maxWidth) {
      scale = this.options.maxWidth / this.hdr.width;
    } else {
      scale = window.devicePixelRatio || 1;
    }

    return scale;
  }

  play() {
    this.playing = true;
    this.step();
  }

  pause() {
    this.playing = false;
  }

  isPlaying() {
    return this.playing;
  }

  getCanvas() {
    return this.canvas;
  }

  isLoading() {
    return this.loading;
  }

  isReady() {
    return this.ready;
  }

  isAutoPlay() {
    return this.options.autoPlay;
  }

  getLength() {
    return this.frames.length;
  }

  getCurrentFrame() {
    return this.currentFrameIndex;
  }

  moveTo(idx: any) {
    this.currentFrameIndex = idx;
    this.putFrame();
  }

  loadURL(src: string, callback: any) {
    if (!this.loadSetup(callback)) {
      return;
    }

    let request = new XMLHttpRequest();
    // New browsers (XMLHttpRequest2-compliant)
    request.open('GET', src, true);

    if ('overrideMimeType' in request) {
      request.overrideMimeType('text/plain; charset=x-user-defined');
    } else if ('responseType' in request) {
      // old browsers (XMLHttpRequest-compliant)
      // @ts-ignore
      request.responseType = 'arraybuffer';
    } else {
      // IE9 (Microsoft.XMLHTTP-compliant)
      // @ts-ignore
      request.setRequestHeader('Accept-Charset', 'x-user-defined');
    }

    request.onloadstart = () => {
      // Wait until connection is opened to replace the gif element with a canvas to avoid a blank img
      if (!this.initialized) {
        this.init();
      }
    };

    request.onload = () => {
      if (request.status !== 200) {
        this.handleError('xhr - response');
        return;
      }

      let data = request.response;
      if (data.toString().indexOf('ArrayBuffer') > 0) {
        data = new Uint8Array(data);
      }

      const stream = new SuperGifStream(data);
      setTimeout(() => {
        this.parseStream(stream);
      }, 0);
    };

    request.onerror = () => {
      this.handleError('xhr');
    };

    request.send();
  }

  load(callback: any): void {
    this.loadURL(this.gifImgElement.src, callback);
  }
}
