import { ExcaliburGraphicsContext, ImageSource, SpriteFont, SpriteSheet } from '..';
import { Vector } from '../..';
import debugFont from './debug-font.png';

/**
 * Internal debugtext helper
 */
export class DebugText {
  constructor() {
    this.load();
  }

  /**
   * base64 font
   */
  public readonly fontSheet = debugFont;
  public size: number = 16;
  private _imageSource: ImageSource;
  private _spriteSheet: SpriteSheet;
  private _spriteFont: SpriteFont;
  public load() {
    this._imageSource = new ImageSource(this.fontSheet);
    return this._imageSource.load().then(() => {
      this._spriteSheet = SpriteSheet.fromImageSource({
        image: this._imageSource,
        grid: {
          rows: 3,
          columns: 16,
          spriteWidth: 16,
          spriteHeight: 16
        }
      });
      this._spriteFont = new SpriteFont({
        alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ,!\'&."?-()+ ',
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
      this._spriteFont.render(ctx, text, null, pos.x, pos.y);
    }
  }
}
