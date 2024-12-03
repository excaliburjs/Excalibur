import { Future } from '../Util/Future';
import { ImageFiltering } from './Filtering';
import { ImageSource, ImageWrapConfiguration } from './ImageSource';
import { SourceView, Sprite } from './Sprite';
import { ImageWrapping } from './Wrapping';

export interface TiledSpriteOptions {
  image: ImageSource;
  sourceView?: SourceView;
  filtering?: ImageFiltering;
  /**
   * Default wrapping is Repeat for TiledSprite
   */
  wrapping?: ImageWrapConfiguration | ImageWrapping;
  /**
   * Total width in pixels for the tiling to take place
   */
  width: number;
  /**
   * Total height in pixels for the tiling to take place
   */
  height: number;
}

export class TiledSprite extends Sprite {
  private _ready = new Future<void>();
  public ready = this._ready.promise;
  private _options: TiledSpriteOptions;
  constructor(options: TiledSpriteOptions) {
    super({
      image: options.image,
      sourceView: options.sourceView,
      destSize: { width: options.width, height: options.height }
    });
    this._options = options;

    if (this.image.isLoaded()) {
      this._applyTiling();
    } else {
      this.image.ready.then(() => this._applyTiling());
    }
  }

  private _applyTiling() {
    const { width, height, filtering, wrapping } = { ...this._options };
    const spriteCanvas = document.createElement('canvas')!;
    spriteCanvas.width = this.sourceView.width;
    spriteCanvas.height = this.sourceView.height;
    const spriteCtx = spriteCanvas.getContext('2d')!;
    // prettier-ignore
    spriteCtx.drawImage(
        this.image.image,
        this.sourceView.x, this.sourceView.y,
        this.sourceView.width, this.sourceView.height,
        0, 0,
        this.sourceView.width, this.sourceView.height);

    // prettier-ignore
    const imgSource = ImageSource.fromHtmlCanvasElement(spriteCanvas, {
        wrapping: wrapping ?? ImageWrapping.Repeat,
        filtering
      });
    if (width) {
      this.destSize.width = width;
      this.sourceView.width = width;
    }
    if (height) {
      this.destSize.height = height;
      this.sourceView.height = height;
    }
    this.sourceView.x = 0;
    this.sourceView.y = 0;
    this.image = imgSource;
    this._ready.resolve();
  }
}
