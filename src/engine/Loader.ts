import { Color } from './Drawing/Color';
import { WebAudio } from './Util/WebAudio';
import { Logger } from './Util/Log';
import { Promise, PromiseState } from './Promises';
import { Engine } from './Engine';
import { Loadable } from './Interfaces/Loadable';
import { CanLoad } from './Interfaces/Loader';
import { Class } from './Class';
import * as DrawUtil from './Util/DrawUtil';

import logoImg from './Loader.logo.png';
import loaderCss from './Loader.css';

/**
 * Pre-loading assets
 *
 * The loader provides a mechanism to preload multiple resources at
 * one time. The loader must be passed to the engine in order to
 * trigger the loading progress bar.
 *
 * The [[Loader]] itself implements [[ILoadable]] so you can load loaders.
 *
 * ## Example: Pre-loading resources for a game
 *
 * ```js
 * // create a loader
 * var loader = new ex.Loader();
 *
 * // create a resource dictionary (best practice is to keep a separate file)
 * var resources = {
 *   TextureGround: new ex.Texture("/images/textures/ground.png"),
 *   SoundDeath: new ex.Sound("/sound/death.wav", "/sound/death.mp3")
 * };
 *
 * // loop through dictionary and add to loader
 * for (var loadable in resources) {
 *   if (resources.hasOwnProperty(loadable)) {
 *     loader.addResource(resources[loadable]);
 *   }
 * }
 *
 * // start game
 * game.start(loader).then(function () {
 *   console.log("Game started!");
 * });
 * ```
 *
 * ## Customize the Loader
 *
 * The loader can be customized to show different, text, logo, background color, and button.
 *
 * ```typescript
 * const loader = new ex.Loader([playerTexture]);
 *
 * // The loaders button text can simply modified using this
 * loader.playButtonText = 'Start the best game ever';
 *
 * // The logo can be changed by inserting a base64 image string here
 *
 * loader.logo = 'data:image/png;base64,iVBORw...';
 * loader.logoWidth = 15;
 * loader.logoHeight = 14;
 *
 * // The background color can be changed like so by supplying a valid CSS color string
 *
 * loader.backgroundColor = 'red'
 * loader.backgroundColor = '#176BAA'
 *
 * // To build a completely new button
 * loader.startButtonFactory = () => {
 *     let myButton = document.createElement('button');
 *     myButton.textContent = 'The best button';
 *     return myButton;
 * };
 *
 * engine.start(loader).then(() => {});
 * ```
 */
export class Loader extends Class implements CanLoad {
  private _resourceList: Loadable[] = [];
  private _index = 0;

  private _playButtonShown: boolean = false;
  private _resourceCount: number = 0;
  private _numLoaded: number = 0;
  private _progressCounts: { [key: string]: number } = {};
  private _totalCounts: { [key: string]: number } = {};
  private _engine: Engine;

  // logo drawing stuff

  // base64 string encoding of the excalibur logo (logo-white.png)
  public logo = logoImg;
  public logoWidth = 468;
  public logoHeight = 118;
  public backgroundColor = '#176BAA';

  protected _imageElement: HTMLImageElement;
  protected get _image() {
    if (!this._imageElement) {
      this._imageElement = new Image();
      this._imageElement.src = this.logo;
    }

    return this._imageElement;
  }

  public suppressPlayButton: boolean = false;
  protected _playButtonRootElement: HTMLElement;
  protected _playButtonElement: HTMLButtonElement;
  protected _styleBlock: HTMLStyleElement;
  /** Loads the css from Loader.css */
  protected _playButtonStyles: string = loaderCss.toString();
  protected get _playButton() {
    if (!this._playButtonRootElement) {
      this._playButtonRootElement = document.createElement('div');
      this._playButtonRootElement.style.position = 'absolute';
      document.body.appendChild(this._playButtonRootElement);
    }
    if (!this._styleBlock) {
      this._styleBlock = document.createElement('style');
      this._styleBlock.textContent = this._playButtonStyles;
      document.head.appendChild(this._styleBlock);
    }
    if (!this._playButtonElement) {
      this._playButtonElement = this.startButtonFactory();
      this._playButtonRootElement.appendChild(this._playButtonElement);
    }
    return this._playButtonElement;
  }

  /**
   * Get/set play button text
   */
  public playButtonText: string = 'Play game';

  /**
   * Return a html button element for excalibur to use as a play button
   */
  public startButtonFactory = () => {
    const buttonElement = document.createElement('button');
    buttonElement.id = 'excalibur-play';
    buttonElement.textContent = this.playButtonText;
    buttonElement.style.display = 'none';
    return buttonElement;
  };

  /**
   * @param loadables  Optionally provide the list of resources you want to load at constructor time
   */
  constructor(loadables?: Loadable[]) {
    super();

    if (loadables) {
      this.addResources(loadables);
    }
  }

  public wireEngine(engine: Engine) {
    this._engine = engine;
  }

  /**
   * Add a resource to the loader to load
   * @param loadable  Resource to add
   */
  public addResource(loadable: Loadable) {
    const key = this._index++;
    this._resourceList.push(loadable);
    this._progressCounts[key] = 0;
    this._totalCounts[key] = 1;
    this._resourceCount++;
  }

  /**
   * Add a list of resources to the loader to load
   * @param loadables  The list of resources to load
   */
  public addResources(loadables: Loadable[]) {
    let i = 0;
    const len = loadables.length;

    for (i; i < len; i++) {
      this.addResource(loadables[i]);
    }
  }

  /**
   * Returns true if the loader has completely loaded all resources
   */
  public isLoaded() {
    return this._numLoaded === this._resourceCount;
  }

  /**
   * Shows the play button and returns a promise that resolves when clicked
   */
  public showPlayButton(): Promise<any> {
    if (this.suppressPlayButton) {
      return Promise.resolve();
    } else {
      this._playButtonShown = true;
      this._playButton.style.display = 'block';
      const promise = new Promise();

      this._playButton.addEventListener('click', () => (promise.state() === PromiseState.Pending ? promise.resolve() : promise));
      this._playButton.addEventListener('touchend', () => (promise.state() === PromiseState.Pending ? promise.resolve() : promise));
      this._playButton.addEventListener('pointerup', () => (promise.state() === PromiseState.Pending ? promise.resolve() : promise));

      return promise;
    }
  }

  public hidePlayButton() {
    this._playButtonShown = false;
    this._playButton.style.display = 'none';
  }

  /**
   * Begin loading all of the supplied resources, returning a promise
   * that resolves when loading of all is complete
   */
  public load(): Promise<any> {
    const complete = new Promise<any>();
    const me = this;
    if (this._resourceList.length === 0) {
      me.showPlayButton().then(() => {
        // Unlock audio context in chrome after user gesture
        // https://github.com/excaliburjs/Excalibur/issues/262
        // https://github.com/excaliburjs/Excalibur/issues/1031
        WebAudio.unlock().then(() => {
          me.hidePlayButton();
          me.oncomplete.call(me);
          complete.resolve();
        });
      });
      return complete;
    }

    const progressArray = new Array<any>(this._resourceList.length);
    const progressChunks = this._resourceList.length;

    this._resourceList.forEach((r, i) => {
      if (this._engine) {
        r.wireEngine(this._engine);
      }
      r.onprogress = function(e) {
        const total = <number>e.total;
        const loaded = <number>e.loaded;
        progressArray[i] = { loaded: (loaded / total) * (100 / progressChunks), total: 100 };

        const progressResult: any = progressArray.reduce(
          function(accum, next) {
            return { loaded: accum.loaded + next.loaded, total: 100 };
          },
          { loaded: 0, total: 100 }
        );

        me.onprogress.call(me, progressResult);
      };
      r.oncomplete = r.onerror = function() {
        me._numLoaded++;
        if (me._numLoaded === me._resourceCount) {
          setTimeout(() => {
            me.showPlayButton().then(() => {
              // Unlock audio context in chrome after user gesture
              // https://github.com/excaliburjs/Excalibur/issues/262
              // https://github.com/excaliburjs/Excalibur/issues/1031
              WebAudio.unlock().then(() => {
                me.hidePlayButton();
                me.oncomplete.call(me);
                complete.resolve();
              });
            });
          }, 200); // short delay in showing the button for aesthetics
        }
      };
    });

    function loadNext(list: Loadable[], index: number) {
      if (!list[index]) {
        return;
      }
      list[index].load().then(function() {
        loadNext(list, index + 1);
      });
    }
    loadNext(this._resourceList, 0);

    return complete;
  }

  /**
   * Loader draw function. Draws the default Excalibur loading screen.
   * Override `logo`, `logoWidth`, `logoHeight` and `backgroundColor` properties
   * to customize the drawing, or just override entire method.
   */
  public draw(ctx: CanvasRenderingContext2D) {
    const canvasHeight = this._engine.canvasHeight / this._engine.pixelRatio;
    const canvasWidth = this._engine.canvasWidth / this._engine.pixelRatio;

    if (this._playButtonRootElement) {
      const left = ctx.canvas.offsetLeft;
      const top = ctx.canvas.offsetTop;
      const buttonWidth = this._playButton.clientWidth;
      const buttonHeight = this._playButton.clientHeight;
      this._playButtonRootElement.style.left = `${left + canvasWidth / 2 - buttonWidth / 2}px`;
      this._playButtonRootElement.style.top = `${top + canvasHeight / 2 - buttonHeight / 2 + 100}px`;
    }

    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const y = canvasHeight / 2;
    const width = Math.min(this.logoWidth, canvasWidth * 0.75);
    const x = canvasWidth / 2 - width / 2;

    const imageHeight = Math.floor(width * (this.logoHeight / this.logoWidth)); // OG height/width factor
    const oldAntialias = this._engine.getAntialiasing();
    this._engine.setAntialiasing(true);
    ctx.drawImage(this._image, 0, 0, this.logoWidth, this.logoHeight, x, y - imageHeight - 20, width, imageHeight);

    // loading box
    if (!this.suppressPlayButton && this._playButtonShown) {
      this._engine.setAntialiasing(oldAntialias);
      return;
    }

    ctx.lineWidth = 2;
    DrawUtil.roundRect(ctx, x, y, width, 20, 10);
    const progress = width * (this._numLoaded / this._resourceCount);
    const margin = 5;
    const progressWidth = progress - margin * 2;
    const height = 20 - margin * 2;
    DrawUtil.roundRect(ctx, x + margin, y + margin, progressWidth > 0 ? progressWidth : 0, height, 5, null, Color.White);
    this._engine.setAntialiasing(oldAntialias);
  }

  /**
   * Perform any calculations or logic in the `update` method. The default `Loader` does not
   * do anything in this method so it is safe to override.
   */
  public update(_engine: Engine, _delta: number) {
    // overridable update
  }

  public getData: () => any = () => {
    return;
  };

  public setData: (data: any) => any = () => {
    return;
  };

  public processData: (data: any) => any = () => {
    return;
  };

  public onprogress: (e: any) => void = (e: any) => {
    Logger.getInstance().debug('[ex.Loader] Loading ' + ((100 * e.loaded) / e.total).toFixed(0));

    return;
  };

  public oncomplete: () => void = () => {
    return;
  };

  public onerror: () => void = () => {
    return;
  };
}
