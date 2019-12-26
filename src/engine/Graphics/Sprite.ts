import { Graphic, GraphicOptions, DrawOptions } from './Graphic';
import { RawImage } from './RawImage';
import { nullish } from '../Util/Util';

export type SourceView = { x: number; y: number; width: number; height: number };
export type Size = { width: number; height: number };

export interface SpriteOptions {
  /**
   * Image to create a sprite from
   */
  image: RawImage;
  /**
   * By default the source is the entire RawImage
   */
  source?: { x: number; y: number; width: number; height: number };
  /**
   * By default the size of the sprite is the size of the RawImage
   */
  size?: { width: number; height: number };
}

export class Sprite extends Graphic {
  public image: RawImage;
  public source: SourceView;
  public size: Size;

  constructor(options: GraphicOptions & SpriteOptions) {
    super(options);
    // this.image = options.image;
    // image might not be loaded... 0 might be a bad sentinel
    this.source = nullish(options.source, { x: 0, y: 0, width: 0, height: 0 });
    this.size = nullish(options.size, { width: 0, height: 0 });
  }

  private _updateSpriteDimensions() {
    const { width: nativeWidth, height: nativeHeight } = this.image;
    this.source.width = this.source.width || nativeWidth;
    this.source.height = this.source.height || nativeHeight;
    this.size.width = this.size.width || nativeWidth;
    this.size.height = this.size.height || nativeHeight;
    this.width = this.size.width;
    this.height = this.size.height;
  }

  public draw(ctx: CanvasRenderingContext2D, options?: DrawOptions): void {
    this.image.load().then(() => {
      this._updateSpriteDimensions();
      super._pushTransforms(options);
      ctx.drawImage(
        this.image.image,
        this.source.x,
        this.source.y,
        this.source.width,
        this.source.height,
        0,
        0,
        this.size.width,
        this.size.height
      );
      super._popTransforms();
    });
  }
}
