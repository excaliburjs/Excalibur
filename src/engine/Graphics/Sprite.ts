import { Graphic, GraphicOptions } from './Graphic';
import { RawImage } from './RawImage';
import { nullish } from '../Util/Util';
import { vec } from '../Algebra';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';

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
  public get image(): HTMLImageElement {
    return this.rawImage.image;
  }
  public source: SourceView;
  public size: Size;

  private _readyToPaintResolve: () => void;
  private _readyToPaint: Promise<any> = new Promise((resolve) => {
    this._readyToPaintResolve = resolve;
  });

  public static from(image: RawImage): Sprite {
    return new Sprite({
      image: image
    });
  }

  constructor(options: GraphicOptions & SpriteOptions) {
    super(options);
    this.rawImage = options.image;
    this.source = nullish(options.source, { x: 0, y: 0, width: 0, height: 0 });
    this.size = nullish(options.size, { width: 0, height: 0 });
    this.rawImage.whenLoaded.then(() => {
      this.origin = vec(this.rawImage.width / 2, this.rawImage.height / 2);
      this._updateSpriteDimensions();
      this._readyToPaintResolve();
    });
  }

  public get readyToRasterize(): Promise<any> {
    return this._readyToPaint;
  }

  private _updateSpriteDimensions() {
    const { width: nativeWidth, height: nativeHeight } = this.rawImage;
    this.source.width = this.source.width || nativeWidth;
    this.source.height = this.source.height || nativeHeight;
    this.size.width = this.size.width || nativeWidth;
    this.size.height = this.size.height || nativeHeight;

    let canvasWidth = this.size.width * this.scale.x;
    let canvasHeight = this.size.height * this.scale.y;
    this.origin = vec(canvasWidth / 2, canvasHeight / 2);

    this.width = Math.ceil(canvasWidth);
    this.height = Math.ceil(canvasHeight);
  }

  public _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.rawImage.isLoaded()) {
      // this is weird, but drawImage sampling is better than applying the native scale
      ex.scale(1 / this.scale.x, 1 / this.scale.y);
      let width = this.size.width * this.scale.x;
      let height = this.size.height * this.scale.y;
      ex.drawImage(this.rawImage.image, this.source.x, this.source.y, this.source.width, this.source.height, x, y, width, height);
    }
  }

  public clone(): Sprite {
    return new Sprite({
      image: this.rawImage,
      source: { ...this.source },
      size: { ...this.size }
    });
  }
}
