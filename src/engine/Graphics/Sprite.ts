import { Graphic, GraphicOptions, DrawOptions } from './Graphic';
import { RawImage } from './RawImage';
import { nullish } from '../Util/Util';
import { vec } from '../Algebra';

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
  public rawImage: RawImage;
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
      this.origin = vec(this.image.width, this.image.height);
      this._updateSpriteDimensions();
      this._readyToPaintResolve();
      this.paint();
    });
  }

  public get readyToPaint(): Promise<any> {
    return this._readyToPaint;
  }

  private _updateSpriteDimensions() {
    const { width: nativeWidth, height: nativeHeight } = this.image;
    this.source.width = this.source.width || nativeWidth;
    this.source.height = this.source.height || nativeHeight;
    this.size.width = this.size.width || nativeWidth;
    this.size.height = this.size.height || nativeHeight;

    let canvasWidth = this.size.width * this.scale.x;
    let canvasHeight = this.size.height * this.scale.y;
    this.origin = vec(canvasWidth / 2, canvasHeight / 2);

    // TODO can rotation be moved to graphic?
    if (this.rotation) {
      let rotatedWidth = canvasWidth * Math.abs(Math.cos(this.rotation)) + canvasHeight * Math.abs(Math.sin(this.rotation));
      let rotatedHeight = canvasWidth * Math.abs(Math.sin(this.rotation)) + canvasHeight * Math.abs(Math.cos(this.rotation));
      canvasWidth = rotatedWidth;
      canvasHeight = rotatedHeight;
      this.origin = this.origin.rotate(this.rotation, vec(rotatedWidth / 2, rotatedHeight / 2));
    }

    this.width = Math.ceil(canvasWidth);
    this.height = Math.ceil(canvasHeight);
  }

  public draw(ctx: CanvasRenderingContext2D, _options?: DrawOptions): void {
    if (this.rawImage.isLoaded()) {
      let paddingLeftRight = (this.width - this.size.width * this.scale.x) / 2;
      let paddingTopBottom = (this.height - this.size.height * this.scale.y) / 2;
      ctx.drawImage(
        this.rawImage.image,
        this.source.x,
        this.source.y,
        this.source.width,
        this.source.height,
        // Close but this still isn't perfect
        0 + paddingLeftRight,
        0 + paddingTopBottom,
        this.size.width * this.scale.x,
        this.size.height * this.scale.y
      );
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
