import { Graphic, GraphicOptions } from './Graphic';
import { ImageSource } from './ImageSource';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';

import { Sprite as LegacySprite } from '../Drawing/Sprite';
import { Texture } from '../Drawing/Texture';

export type SourceView = { x: number; y: number; width: number; height: number };
export type DestinationSize = { width: number; height: number };

export interface SpriteOptions {
  /**
   * Image to create a sprite from
   */
  image: ImageSource;
  /**
   * By default the source is the entire dimension of the [[ImageSource]]
   */
  sourceView?: { x: number; y: number; width: number; height: number };
  /**
   * By default the size of the final sprite is the size of the [[ImageSource]]
   */
  destSize?: { width: number; height: number };
}

export class Sprite extends Graphic {
  public image: ImageSource;
  public sourceView: SourceView;
  public destSize: DestinationSize;

  public static from(image: ImageSource): Sprite {
    return new Sprite({
      image: image
    });
  }

  constructor(options: GraphicOptions & SpriteOptions) {
    super(options);
    this.image = options.image;
    const { width, height } = options;
    this.sourceView = options.sourceView ?? { x: 0, y: 0, width: width ?? 0, height: height ?? 0 };
    this.destSize = options.destSize ?? { width: width ?? 0, height: height ?? 0 };
    this._updateSpriteDimensions();
    this.image.ready.then(() => {
      this._updateSpriteDimensions();
    });
  }

  public get width(): number {
    return this.destSize.width;
  }

  public get height(): number {
    return this.destSize.height;
  }

  public set width(newWidth: number) {
    this.destSize.width = newWidth;
    super.width = Math.ceil(this.destSize.width);
  }

  public set height(newHeight: number) {
    this.destSize.height = newHeight;
    super.height = Math.ceil(this.destSize.height);
  }

  private _updateSpriteDimensions() {
    const { width: nativeWidth, height: nativeHeight } = this.image;
    // This code uses || to avoid 0's
    // If the source is not specified, use the native dimension
    this.sourceView.width = this.sourceView?.width || nativeWidth;
    this.sourceView.height = this.sourceView?.height || nativeHeight;

    // If the destination is not specified, use the source if specified, then native
    this.destSize.width = this.destSize?.width || this.sourceView?.width || nativeWidth;
    this.destSize.height = this.destSize?.height || this.sourceView?.height || nativeHeight;

    this.width = Math.ceil(this.destSize.width);
    this.height = Math.ceil(this.destSize.height);
  }

  protected _preDraw(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    if (this.image.isLoaded()) {
      this._updateSpriteDimensions();
    }
    super._preDraw(ex, x, y);
  }

  public _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    if (this.image.isLoaded()) {
      this._updateSpriteDimensions();
      ex.drawImage(
        this.image.image,
        this.sourceView.x,
        this.sourceView.y,
        this.sourceView.width,
        this.sourceView.height,
        x,
        y,
        this.destSize.width,
        this.destSize.height
      );
    }
  }

  /**
   * Create a ImageSource from legacy texture
   * @param sprite
   */
  public static fromLegacySprite(sprite: LegacySprite): Sprite {
    const tex = sprite.texture;
    const image = ImageSource.fromLegacyTexture(tex);
    return new Sprite({
      image,
      sourceView: {
        x: sprite.x,
        y: sprite.y,
        width: sprite.width,
        height: sprite.height
      }
    });
  }

  /**
   * Converts a sprite to a Legacy sprite
   * @deprecated
   * @param sprite
   * @returns LegacyDrawing.Sprite
   */
  public static toLegacySprite(sprite: Sprite): LegacySprite {
    const image = sprite.image;
    const tex = new Texture(image.path);
    tex.data = image.image;

    return new LegacySprite(tex, sprite.sourceView.x, sprite.sourceView.y, sprite.sourceView.width, sprite.sourceView.height);
  }

  public clone(): Sprite {
    return new Sprite({
      image: this.image,
      sourceView: { ...this.sourceView },
      destSize: { ...this.destSize },
      ...this.cloneGraphicOptions()
    });
  }
}
