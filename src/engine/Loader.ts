import { Color } from './Drawing/Color';
import { WebAudio } from './Util/WebAudio';
import { Logger } from './Util/Log';
import { Promise, PromiseState } from './Promises';
import { Engine } from './Engine';
import { ILoadable } from './Interfaces/ILoadable';
import { ILoader } from './Interfaces/ILoader';
import { Class } from './Class';
import * as DrawUtil from './Util/DrawUtil';
import { obsolete } from './Util/Decorators';

const loaderCss = require('./Loader.css').toString();
const logoImg = require('./Loader.logo.png');

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
 */
export class Loader extends Class implements ILoader {
  private _resourceList: ILoadable[] = [];
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
  protected _playButtonStyles: string = loaderCss;
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
      // Todo make this a overridable factory
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
    let buttonElement = document.createElement('button');
    buttonElement.id = 'excalibur-play';
    buttonElement.textContent = this.playButtonText;
    buttonElement.style.display = 'none';
    return buttonElement;
  };

  /**
   * @param loadables  Optionally provide the list of resources you want to load at constructor time
   */
  constructor(loadables?: ILoadable[]) {
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
  public addResource(loadable: ILoadable) {
    var key = this._index++;
    this._resourceList.push(loadable);
    this._progressCounts[key] = 0;
    this._totalCounts[key] = 1;
    this._resourceCount++;
  }

  /**
   * Add a list of resources to the loader to load
   * @param loadables  The list of resources to load
   */
  public addResources(loadables: ILoadable[]) {
    var i = 0,
      len = loadables.length;

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
    this._playButtonShown = true;
    this._playButton.style.display = 'block';
    let promise = new Promise();
    this._playButton.onclick = () => promise.resolve();

    if (this.suppressPlayButton) {
      return Promise.resolve();
    }
    return promise;
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
    var complete = new Promise<any>();
    var me = this;
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

    var progressArray = new Array<any>(this._resourceList.length);
    var progressChunks = this._resourceList.length;

    this._resourceList.forEach((r, i) => {
      if (this._engine) {
        r.wireEngine(this._engine);
      }
      r.onprogress = function(e) {
        var total = <number>e.total;
        var loaded = <number>e.loaded;
        progressArray[i] = { loaded: (loaded / total) * (100 / progressChunks), total: 100 };

        var progressResult: any = progressArray.reduce(
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

    function loadNext(list: ILoadable[], index: number) {
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
    let canvasHeight = this._engine.canvasHeight / window.devicePixelRatio;
    let canvasWidth = this._engine.canvasWidth / window.devicePixelRatio;

    if (this._playButtonRootElement) {
      let left = ctx.canvas.offsetLeft;
      let top = ctx.canvas.offsetTop;
      let buttonWidth = this._playButton.clientWidth;
      let buttonHeight = this._playButton.clientHeight;
      this._playButtonRootElement.style.left = `${left + canvasWidth / 2 - buttonWidth / 2}px`;
      this._playButtonRootElement.style.top = `${top + canvasHeight / 2 - buttonHeight / 2 + 100}px`;
    }

    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    var y = canvasHeight / 2;
    var width = Math.min(this.logoWidth, canvasWidth * 0.75);
    var x = canvasWidth / 2 - width / 2;

    var imageHeight = Math.floor(width * (this.logoHeight / this.logoWidth)); // OG height/width factor
    var oldAntialias = this._engine.getAntialiasing();
    this._engine.setAntialiasing(true);
    ctx.drawImage(this._image, 0, 0, this.logoWidth, this.logoHeight, x, y - imageHeight - 20, width, imageHeight);

    // loading box
    if (!this.suppressPlayButton && this._playButtonShown) {
      return;
    }

    ctx.lineWidth = 2;
    DrawUtil.roundRect(ctx, x, y, width, 20, 10);
    var progress = width * (this._numLoaded / this._resourceCount);
    var margin = 5;
    var progressWidth = progress - margin * 2;
    var height = 20 - margin * 2;
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

/**
 * @obsolete Use [[Loader]] instead, this functionality has been made default
 *
 * A [[Loader]] that pauses after loading to allow user
 * to proceed to play the game. Typically you will
 * want to use this loader for iOS to allow sounds
 * to play after loading (Apple Safari requires user
 * interaction to allow sounds, even for games)
 *
 * **Note:** Because Loader is not part of a Scene, you must
 * call `update` and `draw` manually on "child" objects.
 *
 * ## Implementing a Trigger
 *
 * The `PauseAfterLoader` requires an element to act as the trigger button
 * to start the game.
 *
 * For example, let's create an `<a>` tag to be our trigger and call it `tap-to-play`.
 *
 * ```html
 * <div id="wrapper">
 *    <canvas id="game"></canvas>
 *    <a id="tap-to-play" href='javascript:void(0);'>Tap to Play</a>
 * </div>
 * ```
 *
 * We've put it inside a wrapper to position it properly over the game canvas.
 *
 * Now let's add some CSS to style it (insert into `<head>`):
 *
 * ```html
 * <style>
 *     #wrapper {
 *         position: relative;
 *         width: 500px;
 *         height: 500px;
 *     }
 *     #tap-to-play {
 *         display: none;
 *         font-size: 24px;
 *         font-family: sans-serif;
 *         text-align: center;
 *         border: 3px solid white;
 *         position: absolute;
 *         color: white;
 *         width: 200px;
 *         height: 50px;
 *         line-height: 50px;
 *         text-decoration: none;
 *         left: 147px;
 *         top: 80%;
 *     }
 * </style>
 * ```
 *
 * Now we can create a `PauseAfterLoader` with a reference to our trigger button:
 *
 * ```ts
 * var loader = new ex.PauseAfterLoader('tap-to-play', [...]);
 * ```
 *
 * ## Use PauseAfterLoader for iOS
 *
 * The primary use case for pausing before starting the game is to
 * pass Apple's requirement of user interaction. The Web Audio context
 * in Safari is disabled by default until user interaction.
 *
 * Therefore, you can use this snippet to only use PauseAfterLoader when
 * iOS is detected (see [this thread](http://stackoverflow.com/questions/9038625/detect-if-device-is-ios)
 * for more techniques).
 *
 * ```ts
 * var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream;
 * var loader: ex.Loader = iOS ? new ex.PauseAfterLoader('tap-to-play') : new ex.Loader();
 *
 * loader.addResource(...);
 * ```
 */
export class PauseAfterLoader extends Loader {
  private _loadedValue: any;
  private _waitPromise: Promise<any>;
  private _playTrigger: HTMLElement;

  constructor(triggerElementId: string, loadables?: ILoadable[]) {
    super(loadables);

    this._playTrigger = document.getElementById(triggerElementId);
    this._playTrigger.addEventListener('click', this._handleOnTrigger);
  }

  @obsolete({ message: 'Deprecated in v0.20.0', alternateMethod: 'Use ex.Loader instead' })
  public load(): Promise<any> {
    this._waitPromise = new Promise<any>();

    // wait until user indicates to proceed before finishing load
    super.load().then(
      (value?) => {
        this._loadedValue = value;

        // show element
        this._playTrigger.style.display = 'block';
      },
      (value?) => {
        this._waitPromise.reject(value);
      }
    );

    return this._waitPromise;
  }

  private _handleOnTrigger = () => {
    if (this._waitPromise.state() !== PromiseState.Pending) {
      return false;
    }

    // unlock Safari WebAudio context
    WebAudio.unlock();

    // continue to play game
    this._waitPromise.resolve(this._loadedValue);

    // hide DOM element
    this._playTrigger.style.display = 'none';

    return false;
  };
}
