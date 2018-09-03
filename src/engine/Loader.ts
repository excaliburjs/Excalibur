import { Color } from './Drawing/Color';
import { WebAudio } from './Util/WebAudio';
import { Logger } from './Util/Log';
import { Promise, PromiseState } from './Promises';
import { Engine } from './Engine';
import { ILoadable } from './Interfaces/ILoadable';
import { ILoader } from './Interfaces/ILoader';
import { Class } from './Class';
import * as DrawUtil from './Util/DrawUtil';
import { AudioContextFactory } from './Resources/Sound/AudioContext';

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

  private _resourceCount: number = 0;
  private _numLoaded: number = 0;
  private _progressCounts: { [key: string]: number } = {};
  private _totalCounts: { [key: string]: number } = {};
  private _engine: Engine;

  // logo drawing stuff

  /* tslint:disable:max-line-length */
  // base64 string encoding of the excalibur logo (logo-white.png)
  public logo =
    'data:image/png;base64,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';
  /* tslint:enable:max-line-length */
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
  protected _playButtonStyles = `

  /* Buttons styles start */

  button#excalibur-play {
      display: inline-block;
      position: relative;
      border-radius: 6px;
      border: none;
      /*border: 3px solid;
      border-color: white;
      box-shadow: 0 0 10px #ccc;*/
      padding: 1.0rem 1.5rem 1.0rem 4rem;
      margin: 0;
      text-decoration: none;
      background: #00B233;
      color: #ffffff;
      font-family: sans-serif;
      font-size: 2rem;
      line-height: 1;
      cursor: pointer;
      text-align: center;
      transition: background 250ms ease-in-out, transform 150ms ease;
      -webkit-appearance: none;
      -moz-appearance: none;
  }
  
  /*
  button#excalibur-play {
    display: none;
  }*/
  
  button#excalibur-play:after {
    position: absolute;
    content: '';
    border: 8px solid;
    border-color: transparent transparent transparent white;
    left: 35px;
    top: 24px;
    width: 0;
    height: 0;
  }
  
  button#excalibur-play:before {
    position: absolute;
    content: '';
    border: 3px solid;
    left: 19px;
    top: 14px;
    border-radius: 20px;
    width: 30px;
    height: 30px;
    
  }
  
  button#excalibur-play:hover,
  button#excalibur-play:focus {
      background: #00982C;
  }
  
  button#excalibur-play:focus {
      outline: 1px solid #fff;
      outline-offset: -4px;
  }
  
  button#excalibur-play:active {
      transform: scale(0.99);
  }
  /* Button styles end */
  `;
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
    this._playButton.style.display = 'block';
    let promise = new Promise();
    this._playButton.onclick = () => promise.resolve();

    if (this.suppressPlayButton) {
      return Promise.resolve();
    }
    return promise;
  }

  public hidePlayButton() {
    this._playButton.style.display = 'none';
  }

  /**
   * Begin loading all of the supplied resources, returning a promise
   * that resolves when loading of all is complete
   */
  public load(): Promise<any> {
    var complete = new Promise<any>();
    let audioContext = AudioContextFactory.create();
    var me = this;
    if (this._resourceList.length === 0) {
      me.showPlayButton().then(() => {
        // Unlock audio context in chrome after user gesture
        // https://github.com/excaliburjs/Excalibur/issues/1031
        audioContext.resume().then(() => {
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
          me.showPlayButton().then(() => {
            // Unlock audio context in chrome after user gesture
            // https://github.com/excaliburjs/Excalibur/issues/1031
            audioContext.resume().then(() => {
              me.hidePlayButton();
              me.oncomplete.call(me);
              complete.resolve();
            });
          });
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
    if (!this.suppressPlayButton && this._numLoaded / this._resourceCount === 1) {
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
