import { ImageFiltering } from './Filtering';
import { ImageWrapConfiguration } from './ImageSource';
import { SourceView, Sprite } from './Sprite';
import { ImageWrapping } from './Wrapping';
import { Animation, AnimationOptions } from './Animation';
import { GraphicOptions } from './Graphic';
import { TiledSprite } from './TiledSprite';
import { watch } from '../Util/Watch';
import { Future } from '../Util/Future';

export interface TiledAnimationOptions {
  /**
   * Animation to tile
   */
  animation: Animation;
  /**
   * Optionally override source view on frame graphics
   */
  sourceView?: Partial<SourceView>;
  /**
   * Optionally override filtering options
   */
  filtering?: ImageFiltering;
  /**
   * Default wrapping is Repeat for TiledAnimation
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

export class TiledAnimation extends Animation {
  private _ready = new Future<void>();
  public ready = this._ready.promise;
  private _tiledWidth: number = 0;
  private _tiledHeight: number = 0;
  private _sourceView: Partial<SourceView> = {};
  constructor(options: GraphicOptions & Omit<AnimationOptions, 'frames'> & TiledAnimationOptions) {
    super({
      ...options,
      frames: options.animation.frames.slice(),
      strategy: options.animation.strategy,
      frameDuration: options.animation.frameDuration,
      speed: options.animation.speed,
      reverse: options.animation.isReversed
    });
    this._sourceView = { ...options.sourceView };
    this._tiledWidth = options.width;
    this._tiledHeight = options.height;

    const promises: Promise<void>[] = [];
    for (let i = 0; i < this.frames.length; i++) {
      const graphic = this.frames[i].graphic;
      if (graphic && graphic instanceof Sprite) {
        const tiledSprite = new TiledSprite({
          image: graphic.image,
          width: options.width,
          height: options.height,
          sourceView: { ...graphic.sourceView },
          wrapping: options.wrapping,
          filtering: options.filtering
        });
        this.frames[i].graphic = tiledSprite;

        // There is a new calc'd sourceView when ready
        tiledSprite.ready.then(() => {
          tiledSprite.sourceView = { ...tiledSprite.sourceView, ...this._sourceView };
        });
        promises.push(tiledSprite.ready);
      }
    }
    Promise.all(promises).then(() => this._ready.resolve());
  }

  public static fromAnimation(animation: Animation, options?: Omit<TiledAnimationOptions, 'animation'>): TiledAnimation {
    return new TiledAnimation({
      width: animation.width,
      height: animation.height,
      ...options,
      animation
    });
  }

  private _updateSourceView() {
    for (let i = 0; i < this.frames.length; i++) {
      const graphic = this.frames[i].graphic;
      if (graphic && graphic instanceof Sprite) {
        graphic.sourceView = { ...graphic.sourceView, ...this._sourceView };
      }
    }
  }

  get sourceView(): Partial<SourceView> {
    return watch(this._sourceView, () => this._updateSourceView());
  }

  set sourceView(sourceView: Partial<SourceView>) {
    this._sourceView = watch(sourceView, () => this._updateSourceView());
    this._updateSourceView();
  }

  private _updateWidthHeight() {
    for (let i = 0; i < this.frames.length; i++) {
      const graphic = this.frames[i].graphic;
      if (graphic && graphic instanceof Sprite) {
        graphic.sourceView.height = this._tiledHeight || graphic.height;
        graphic.destSize.height = this._tiledHeight || graphic.height;
        graphic.sourceView.width = this._tiledWidth || graphic.width;
        graphic.destSize.width = this._tiledWidth || graphic.width;
      }
    }
  }

  get width() {
    return this._tiledWidth;
  }

  get height() {
    return this._tiledHeight;
  }

  override set width(width: number) {
    this._tiledWidth = width;
    this._updateWidthHeight();
  }

  override set height(height: number) {
    this._tiledHeight = height;
    this._updateWidthHeight();
  }
}
