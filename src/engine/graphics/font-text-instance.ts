import { BoundingBox } from '../collision/bounding-box';
import type { Color } from '../color';
import { ExcaliburGraphicsContextWebGL } from './context/excalibur-graphics-context-webgl';
import type { ExcaliburGraphicsContext } from './context/excalibur-graphics-context';
import type { Font } from './font';
import { Vector } from '../math';

export class FontTextInstance {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private _textFragments: { x: number; y: number; canvas: HTMLCanvasElement }[] = [];
  public dimensions: BoundingBox;
  public disposed: boolean = false;
  private _lastHashCode: string;
  private _maxDescent: number = 0;
  private _maxAscent: number = 0;
  private _maxLineHeight: number = 0;
  public lineHeight: number = 0;

  constructor(
    public readonly font: Font,
    public readonly text: string,
    public readonly color: Color,
    public readonly maxWidth?: number
  ) {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to create FontTextInstance, internal canvas failed to create');
    }

    this.ctx = ctx;

    this.dimensions = this.measureText(text);

    this._setDimension(this.dimensions, this.ctx);
    this._lastHashCode = this.getHashCode();
  }

  measureText(text: string, maxWidth?: number): BoundingBox {
    if (this.disposed) {
      throw Error('Accessing disposed text instance! ' + this.text);
    }
    let lines = null;
    if (maxWidth != null) {
      lines = this._getLinesFromText(text, maxWidth);
    } else {
      lines = text.split('\n');
    }

    this._applyFont(this.ctx); // font must be applied to the context to measure it
    let maxWidthLine = 0;
    let maxAscent = 0;
    let maxDescent = 0;
    for (let i = 0; i < lines.length; i++) {
      const metrics = this.ctx.measureText(lines[i]);
      // metrics.width is the glyph advance which is more accurate
      maxWidthLine = Math.max(maxWidthLine, metrics.width);
      maxAscent = Math.max(maxAscent, metrics.actualBoundingBoxAscent);
      maxDescent = Math.max(maxDescent, metrics.actualBoundingBoxDescent);
    }

    const textHeight = Math.abs(maxAscent) + Math.abs(maxDescent);
    this._maxLineHeight = textHeight;
    this._maxAscent = maxAscent;
    this._maxDescent = maxDescent;

    return BoundingBox.fromDimension(maxWidthLine, textHeight * lines.length, Vector.Zero, Vector.Zero);
  }

  private _setDimension(textBounds: BoundingBox, bitmap: CanvasRenderingContext2D) {
    let lineHeightRatio = 1;
    if (this.font.lineHeight) {
      lineHeightRatio = this.font.lineHeight / this.font.size;
    }
    bitmap.canvas.width = (textBounds.width + this.font.padding * 2) * this.font.quality;
    bitmap.canvas.height = (textBounds.height + this.font.padding * 2) * this.font.quality * lineHeightRatio;
  }

  public static getHashCode(font: Font, text: string, color?: Color) {
    const hash = text + '__hashcode__' + font.hashCode + (color?.hashCode ?? 0);
    return hash;
  }

  getHashCode(includeColor: boolean = true) {
    return FontTextInstance.getHashCode(this.font, this.text, includeColor ? this.color : undefined);
  }

  private _xFromAlignment() {
    // const strokeOffset = this.font.strokeStyle ? this.lineWidth / 2 : 0;

    // Calculate x position based on alignment
    let x;
    const ltr = this.font.direction === 'ltr';
    switch (this.font.textAlign) {
      case 'left':
      case 'start':
        x = ltr ? 0 : this.canvas.width; // TODO padding from the end?
        break;
      case 'center':
        x = this.canvas.width / 2;
        break;
      case 'right':
      case 'end':
        x = ltr ? this.canvas.width : 0;
        break;
      default:
        x = 0;
    }
    return x / this.font.quality;
  }

  private _yFromBaseline() {
    let startY;

    switch (this.font.baseAlign) {
      case 'top':
      case 'hanging':
        startY = -this.font.padding;
        break;
      case 'middle':
        startY = (this.canvas.height - this.dimensions.height) / 2 + this._maxLineHeight;
        break;
      case 'bottom':
      case 'ideographic':
        startY = this.canvas.height - this.dimensions.height + this._maxLineHeight;
        break;
      case 'alphabetic':
      default:
        // For alphabetic, position first line properly
        startY = this._maxLineHeight - this.font.padding;
        break;
    }
    return startY / this.font.quality;
  }

  protected _applyRasterProperties(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.font.padding, this.font.padding);
    ctx.imageSmoothingEnabled = this.font.smoothing;
    ctx.lineWidth = this.font.lineWidth;
    ctx.setLineDash(this.font.lineDash ?? ctx.getLineDash());
    ctx.strokeStyle = this.font.strokeColor?.toString() ?? '';
    ctx.fillStyle = this.color.toString();
  }

  private _applyFont(ctx: CanvasRenderingContext2D) {
    ctx.resetTransform();
    ctx.translate(this.font.padding, this.font.padding);
    ctx.scale(this.font.quality, this.font.quality);
    ctx.textAlign = this.font.textAlign;
    ctx.textBaseline = this.font.baseAlign;
    ctx.font = this.font.fontString;
    ctx.direction = this.font.direction;

    if (this.font.shadow) {
      if (this.font.shadow.color) {
        ctx.shadowColor = this.font.shadow.color.toString();
      }
      if (this.font.shadow.blur) {
        ctx.shadowBlur = this.font.shadow.blur;
      }
      if (this.font.shadow.offset) {
        ctx.shadowOffsetX = this.font.shadow.offset.x;
        ctx.shadowOffsetY = this.font.shadow.offset.y;
      }
    }
  }

  private _drawText(ctx: CanvasRenderingContext2D, lines: string[], lineHeight: number): void {
    this._applyRasterProperties(ctx);
    this._applyFont(ctx);
    const x = this._xFromAlignment();
    const y = this._yFromBaseline();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (this.color) {
        ctx.fillText(line, x, y + i * lineHeight);
      }

      if (this.font.strokeColor) {
        ctx.strokeText(line, x, y + i * lineHeight);
      }
    }
    document.body.appendChild(this.canvas);
  }

  private _splitTextBitmap(bitmap: CanvasRenderingContext2D) {
    const textImages: { x: number; y: number; canvas: HTMLCanvasElement }[] = [];
    let currentX = 0;
    let currentY = 0;
    // 4k is the max for mobile devices
    const width = Math.min(4096, bitmap.canvas.width);
    const height = Math.min(4096, bitmap.canvas.height);

    // Splits the original bitmap into 4k max chunks
    while (currentX < bitmap.canvas.width) {
      while (currentY < bitmap.canvas.height) {
        // create new bitmap
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Unable to split internal FontTextInstance bitmap, failed to create internal canvas');
        }

        // draw current slice to new bitmap in < 4k chunks
        ctx.drawImage(bitmap.canvas, currentX, currentY, width, height, 0, 0, width, height);

        textImages.push({ x: currentX, y: currentY, canvas });
        currentY += height;
      }
      currentX += width;
      currentY = 0;
    }
    return textImages;
  }

  public flagDirty() {
    this._dirty = true;
  }
  private _dirty = true;
  private _ex?: ExcaliburGraphicsContext;
  public render(ex: ExcaliburGraphicsContext, x: number, y: number, maxWidth?: number) {
    if (this.disposed) {
      throw Error('Accessing disposed text instance! ' + this.text);
    }
    this._ex = ex;
    const hashCode = this.getHashCode();
    if (this._lastHashCode !== hashCode) {
      this._dirty = true;
    }

    // Calculate image chunks
    if (this._dirty) {
      this.dimensions = this.measureText(this.text, maxWidth);
      this._setDimension(this.dimensions, this.ctx);
      const lines = this._getLinesFromText(this.text, maxWidth);
      const lineHeight = this.font.lineHeight ?? this.dimensions.height / lines.length - this._maxAscent;

      // draws the text to the main bitmap
      this._drawText(this.ctx, lines, lineHeight);

      // clear any out old fragments
      if (ex instanceof ExcaliburGraphicsContextWebGL) {
        for (const frag of this._textFragments) {
          ex.textureLoader.delete(frag.canvas);
        }
      }

      // splits to < 4k fragments for large text
      this._textFragments = this._splitTextBitmap(this.ctx);

      if (ex instanceof ExcaliburGraphicsContextWebGL) {
        for (const frag of this._textFragments) {
          ex.textureLoader.load(frag.canvas, { filtering: this.font.filtering }, true);
        }
      }
      this._lastHashCode = hashCode;
      this._dirty = false;
    }

    const alignment = this._xFromAlignment();
    const baseline = this._yFromBaseline();

    // draws the bitmap fragments to excalibur graphics context
    for (const frag of this._textFragments) {
      ex.drawImage(
        frag.canvas,
        0,
        0,
        frag.canvas.width,
        frag.canvas.height,

        frag.x / this.font.quality + x - alignment, // - this.ctx.canvas.width / this.font.quality,
        frag.y / this.font.quality + y - baseline, // - this.ctx.canvas.height / this.font.quality,
        frag.canvas.width / this.font.quality,
        frag.canvas.height / this.font.quality
      );
    }
  }

  dispose() {
    this.disposed = true;
    this.dimensions = undefined as any;
    this.canvas = undefined as any;
    this.ctx = undefined as any;
    if (this._ex instanceof ExcaliburGraphicsContextWebGL) {
      for (const frag of this._textFragments) {
        this._ex.textureLoader.delete(frag.canvas);
      }
    }
    this._textFragments.length = 0;
  }

  /**
   * Return array of lines split based on the \n character, and the maxWidth? constraint
   * @param text
   * @param maxWidth
   */
  private _cachedText?: string;
  private _cachedLines?: string[];
  private _cachedRenderWidth?: number;
  private _getLinesFromText(text: string, maxWidth?: number): string[] {
    if (this._cachedText === text && this._cachedRenderWidth === maxWidth && this._cachedLines?.length) {
      return this._cachedLines;
    }

    const lines = text.split('\n');

    if (maxWidth == null) {
      return lines;
    }

    // If the current line goes past the maxWidth, append a new line without modifying the underlying text.
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let newLine = '';
      if (this.measureText(line).width > maxWidth) {
        // FIXME is this width different now since we are using the glyph advance which is more accurate?
        while (this.measureText(line).width > maxWidth) {
          newLine = line[line.length - 1] + newLine;
          line = line.slice(0, -1); // Remove last character from line
        }

        // Update the array with our new values
        lines[i] = line;
        lines[i + 1] = newLine;
      }
    }

    this._cachedText = text;
    this._cachedLines = lines;
    this._cachedRenderWidth = maxWidth;

    return lines;
  }
}
