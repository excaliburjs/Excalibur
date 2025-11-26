import type { ExcaliburGraphicsContext } from '../Context/ExcaliburGraphicsContext';
import { ImageSource } from '../ImageSource';
import { SpriteFont } from '../SpriteFont';
import { SpriteSheet } from '../SpriteSheet';
import type { Vector } from '../../Math/vector';
// import debugFont from './debug-font.png';
import debugFont2 from './monogram-bitmap.png';
import { Debug } from '../Debug';
import type { Color } from '../../Color';

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
  public foregroundColor: Color = Debug.config.settings.text.foreground;
  public backgroundColor: Color = Debug.config.settings.text.background;
  public borderColor: Color = Debug.config.settings.text.border;
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
   * Writes debug text using the built in sprint font
   * @param ctx
   * @param text
   * @param pos
   */
  public write(ctx: ExcaliburGraphicsContext, text: string, pos: Vector, foreground?: Color, background?: Color) {
    if (this._imageSource.isLoaded()) {
      const pos1 = ctx.getTransform().getPosition();
      ctx.save();
      ctx.resetTransform();
      ctx.z = Debug.config.settings.z.text;
      ctx.translate(pos1.x, pos1.y);
      const bounds = this._spriteFont.measureText(text);
      const color = foreground ?? this.foregroundColor;
      const bg = background ?? this.backgroundColor;
      ctx.save();
      ctx.z = Debug.config.settings.z.solid;
      ctx.drawRectangle(pos, bounds.width, bounds.height, bg, this.borderColor, 1);
      ctx.restore();
      ctx.tint = color;
      this._spriteFont.render(ctx, text, null, pos.x, pos.y);
      ctx.restore();
    }
  }
}
