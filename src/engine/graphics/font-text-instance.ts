import { BoundingBox } from '../collision/bounding-box';
import { Color } from '../color';
import { line } from '../util/draw-util';
import { ExcaliburGraphicsContextWebGL } from './context/excalibur-graphics-context-webgl';
import type { ExcaliburGraphicsContext } from './context/excalibur-graphics-context';
import type { Font } from './font';

export class FontTextInstance {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private _textFragments: { x: number; y: number; canvas: HTMLCanvasElement }[] = [];
  public dimensions: BoundingBox;
  public disposed: boolean = false;
  private _lastHashCode: string;

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

    const maxWidthLine = lines.reduce((a, b) => {
      return a.length > b.length ? a : b;
    });

    this._applyFont(this.ctx); // font must be applied to the context to measure it
    const metrics = this.ctx.measureText(maxWidthLine);
    let textHeight = Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent);

    // TODO line height makes the text bounds wonky
    const lineAdjustedHeight = textHeight * lines.length;
    textHeight = lineAdjustedHeight;
    const bottomBounds = lineAdjustedHeight - Math.abs(metrics.actualBoundingBoxAscent);
    const x = 0;
    const y = 0;
    const measurement = new BoundingBox({
      left: x - Math.abs(metrics.actualBoundingBoxLeft) - this.font.padding,
      top: y - Math.abs(metrics.actualBoundingBoxAscent) - this.font.padding,
      bottom: y + bottomBounds + this.font.padding,
      right: x + Math.abs(metrics.actualBoundingBoxRight) + this.font.padding
    });

    return measurement;
  }

  private _setDimension(textBounds: BoundingBox, bitmap: CanvasRenderingContext2D) {
    let lineHeightRatio = 1;
    if (this.font.lineHeight) {
      lineHeightRatio = this.font.lineHeight / this.font.size;
    }
    // Changing the width and height clears the context properties
    // We double the bitmap width to account for all possible alignment
    // We scale by "quality" so we render text without jaggies
    bitmap.canvas.width = (textBounds.width + this.font.padding * 2) * 2 * this.font.quality;
    bitmap.canvas.height = (textBounds.height + this.font.padding * 2) * 2 * this.font.quality * lineHeightRatio;
  }

  public static getHashCode(font: Font, text: string, color?: Color) {
    const hash =
      text +
      '__hashcode__' +
      font.fontString +
      font.showDebug +
      font.textAlign +
      font.baseAlign +
      font.direction +
      font.lineHeight +
      JSON.stringify(font.shadow) +
      (font.padding.toString() +
        font.smoothing.toString() +
        font.lineWidth.toString() +
        font.lineDash.toString() +
        font.strokeColor?.toString() +
        (color ? color.toString() : font.color.toString()));
    return hash;
  }

  getHashCode(includeColor: boolean = true) {
    return FontTextInstance.getHashCode(this.font, this.text, includeColor ? this.color : undefined);
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
    ctx.translate(this.font.padding + ctx.canvas.width / 2, this.font.padding + ctx.canvas.height / 2);
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (this.color) {
        ctx.fillText(line, 0, i * lineHeight);
      }

      if (this.font.strokeColor) {
        ctx.strokeText(line, 0, i * lineHeight);
      }
    }

    if (this.font.showDebug) {
      // Horizontal line
      /* istanbul ignore next */
      line(ctx, Color.Green, -ctx.canvas.width / 2, 0, ctx.canvas.width / 2, 0, 2);
      // Vertical line
      /* istanbul ignore next */
      line(ctx, Color.Red, 0, -ctx.canvas.height / 2, 0, ctx.canvas.height / 2, 2);
    }
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
      const lineHeight = this.font.lineHeight ?? this.dimensions.height / lines.length;

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

    // draws the bitmap fragments to excalibur graphics context
    for (const frag of this._textFragments) {
      ex.drawImage(
        frag.canvas,
        0,
        0,
        frag.canvas.width,
        frag.canvas.height,
        frag.x / this.font.quality + x - this.ctx.canvas.width / this.font.quality / 2,
        frag.y / this.font.quality + y - this.ctx.canvas.height / this.font.quality / 2,
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
