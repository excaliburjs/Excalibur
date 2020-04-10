import { Graphic, GraphicOptions } from './Graphic';
import { RawImage } from './RawImage';
import { ExcaliburGraphicsContext, ImageSource } from './Context/ExcaliburGraphicsContext';

export type SourceView = { x: number; y: number; width: number; height: number };
export type Size = { width: number; height: number };

export interface SpriteOptions {
  /**
   * Image to create a sprite from
   */
  image: RawImage;
  /**
   * By default the source is the entire dimension of the [[RawImage]]
   */
  source?: { x: number; y: number; width: number; height: number };
  /**
   * By default the size of the sprite is the size of the [[RawImage]]
   */
  size?: { width: number; height: number };
}

export class Sprite extends Graphic {
  public rawImage: RawImage;
  public source: SourceView;
  // TODO this is slightly confusing with the base width/height
  public size: Size;

  public static from(image: RawImage): Sprite {
    return new Sprite({
      image: image
    });
  }

  constructor(options: GraphicOptions & SpriteOptions) {
    super(options);
    this.rawImage = options.image;
    this.source = options.source ?? { x: 0, y: 0, width: 0, height: 0 };
    this.size = options.size ?? { width: 0, height: 0 };
    this.rawImage.whenLoaded.then(() => {
      this._updateSpriteDimensions();
    });
  }

  private _updateSpriteDimensions() {
    const { width: nativeWidth, height: nativeHeight } = this.rawImage;
    this.source.width = this.source.width || nativeWidth;
    this.source.height = this.source.height || nativeHeight;
    this.size.width = this.size.width || nativeWidth;
    this.size.height = this.size.height || nativeHeight;

    this.width = Math.ceil(this.size.width);
    this.height = Math.ceil(this.size.height);
  }

  public _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.rawImage.isLoaded()) {
      this._updateSpriteDimensions();
      ex.drawImage(this, this.source.x, this.source.y, this.source.width, this.source.height, x, y, this.size.width, this.size.height);
    }
  }

  public getSource(): ImageSource {
    return this.rawImage.image;
  }

  public clone(): Sprite {
    return new Sprite({
      image: this.rawImage,
      source: { ...this.source },
      size: { ...this.size }
    });
  }
}
