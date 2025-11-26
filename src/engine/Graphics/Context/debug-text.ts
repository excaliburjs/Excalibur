import type { ExcaliburGraphicsContext } from '../Context/ExcaliburGraphicsContext';
import { ImageSource } from '../ImageSource';
import { SpriteFont } from '../SpriteFont';
import { SpriteSheet } from '../SpriteSheet';
import type { Vector } from '../../Math/vector';
import debugFont from './debug-font.png';

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
  public readonly fontSheet = debugFont;
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
          rows: 4,
          columns: 16,
          spriteWidth: 16,
          spriteHeight: 16
        }
      });
      this._spriteFont = new SpriteFont({
        alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ,!\'&."?-()+# ',
        caseInsensitive: true,
        spriteSheet: this._spriteSheet,
        spacing: -6
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
      this._spriteFont.render(ctx, text, null, pos.x, pos.y);
      ctx.restore();
    }
  }
}
