import type { ExcaliburGraphicsContext } from '../Context/ExcaliburGraphicsContext';
import { ImageSource } from '../ImageSource';
import { SpriteFont } from '../SpriteFont';
import { SpriteSheet } from '../SpriteSheet';
import type { Vector } from '../../Math/vector';
// import debugFont from './debug-font.png';
import debugFont2 from './monogram-bitmap.png';
import { Debug } from '../Debug';
import { Color } from '../../Color';

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
          spriteWidth: 6,
          spriteHeight: 12
        }
      });
      this._spriteFont = new SpriteFont({
        // alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ,!\'&."?-()+# ',
        alphabet: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
        // caseInsensitive: true,
        caseInsensitive: false,
        spriteSheet: this._spriteSheet
        // spacing: -2
      });
    });
  }

  /**
   * Writes debug text using the built in sprint font
   * @param ctx
   * @param text
   * @param pos
   */
  public write(ctx: ExcaliburGraphicsContext, text: string, pos: Vector) {
    if (this._imageSource.isLoaded()) {
      const pos1 = ctx.getTransform().getPosition();
      ctx.save();
      ctx.resetTransform();
      ctx.translate(pos1.x, pos1.y);
      ctx.scale(1.5, 1.5);
      ctx.z = 9999;
      const bounds = this._spriteFont.measureText(text);
      const color = Color.Red;
      const inverted = color.invert();
      inverted.a = 1;
      ctx.drawRectangle(pos, bounds.width, bounds.height, inverted, Color.Gray, 1);
      ctx.z = Debug.z;
      ctx.tint = color;
      this._spriteFont.render(ctx, text, null, pos.x, pos.y);
      ctx.restore();
    }
  }
}
