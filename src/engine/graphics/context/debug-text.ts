import type { ExcaliburGraphicsContext } from '../context/excalibur-graphics-context';
import { ImageSource } from '../image-source';
import { SpriteFont } from '../sprite-font';
import { SpriteSheet } from '../sprite-sheet';
import type { Vector } from '../../math/vector';
import { BoundingBox } from '../../collision/bounding-box';
import { Vector as VectorClass } from '../../math/vector';
// import debugFont from './debug-font.png';
import debugFont2 from './monogram-bitmap.png';
import { Debug } from '../debug';
import { Color } from '../../color';

/**
 * Internal debug text helper
 */
export class DebugText {
  constructor() {
    // We fire and forget, we don't care if it's loaded or not
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.load();
  }

  /**
   * base64 font
   */
  public readonly fontSheet = debugFont2;
  public size: number = 16;
  public get foregroundColor(): Color {
    return Debug.config.settings.text.foreground;
  }
  public get backgroundColor(): Color {
    return Debug.config.settings.text.background;
  }
  public get borderColor(): Color {
    return Debug.config.settings.text.border;
  }
  private _imageSource!: ImageSource;
  private _spriteSheet!: SpriteSheet;
  private _spriteFont!: SpriteFont;
  public load() {
    this._imageSource = new ImageSource(this.fontSheet);
    return this._imageSource.load().then(() => {
      this._spriteSheet = SpriteSheet.fromImageSource({
        image: this._imageSource,
        grid: {
          rows: 8,
          columns: 16,
          spriteWidth: 6 * 2 - 2, // hack to avoid sample bleed
          spriteHeight: 12 * 2
        },
        spacing: {
          // hack to avoid sample bleed
          originOffset: { x: 2, y: 0 },
          margin: { x: 2, y: 0 }
        }
      });
      this._spriteFont = new SpriteFont({
        alphabet:
          ' !"#$%&\'()*+,-./' + '0123456789:;<=>?' + '@ABCDEFGHIJKLMNO' + 'PQRSTUVWXYZ[\\]^_' + '`abcdefghijklmno' + 'pqrstuvwxyz{|}~?',
        caseInsensitive: false,
        spriteSheet: this._spriteSheet,
        spacing: 2
      });
    });
  }

  /**
   * Measures the pixel dimensions of `text` as it would be drawn by {@apilink DebugText.write},
   * accounting for the optional scale factor.
   * @param text   Text to measure
   * @param scale  Glyph scale factor, defaults to 1
   * @returns BoundingBox whose width/height are the rendered size in pixels (origin Zero)
   */
  public measureText(text: string, scale: number = 1): BoundingBox {
    if (this._imageSource?.isLoaded() && this._spriteFont) {
      const base = this._spriteFont.measureText(text);
      return BoundingBox.fromDimension(base.width * scale, base.height * scale, VectorClass.Zero);
    }
    // Rough estimate before the debug sprite font finishes loading (fire-and-forget load
    // in the constructor); keeps legend sizing reasonable pre-load.
    return BoundingBox.fromDimension(text.length * 7 * scale, 12 * scale, VectorClass.Zero);
  }

  /**
   * Writes debug text using the built in sprint font
   * @param ctx
   * @param text
   * @param pos
   * @param foreground Optional foreground color override
   * @param background Optional background color override
   * @param scale Optional glyph scale factor, defaults to 1
   */
  public write(ctx: ExcaliburGraphicsContext, text: string, pos: Vector, foreground?: Color, background?: Color, scale: number = 1) {
    if (this._imageSource.isLoaded()) {
      const pos1 = ctx.getTransform().getPosition();
      ctx.save();
      ctx.resetTransform();
      ctx.z = Debug.config.settings.z.text;
      ctx.translate(pos1.x, pos1.y);
      if (scale !== 1) {
        ctx.scale(scale, scale);
      }
      // Convert the screen-space `pos` into the scaled local space so the glyphs
      // land at the intended screen position after the scale transform is applied.
      const localPos = scale !== 1 ? pos.scale(1 / scale) : pos;
      const bounds = this._spriteFont.measureText(text);
      const color = foreground ?? this.foregroundColor ?? Color.Black;
      const bg = background ?? this.backgroundColor ?? Color.Transparent;
      ctx.save();
      ctx.z = Debug.config.settings.z.solid;
      ctx.drawRectangle(localPos, bounds.width, bounds.height, bg, this.borderColor ?? Color.Transparent, 1);
      ctx.restore();
      ctx.tint = color;
      this._spriteFont.render(ctx, text, null, localPos.x, localPos.y);
      ctx.restore();
    }
  }
}
