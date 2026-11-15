import { Color } from '../color';
import type { Loadable } from '../interfaces/loadable';
import * as DrawUtil from '../util/draw-util';

import logoImg from './Loader.logo.png';
import loaderCss from './Loader.css?inline';
import type { Vector } from '../math/vector';
import { delay } from '../util/util';
import { EventEmitter } from '../event-emitter';
import type { DefaultLoaderOptions } from './default-loader';
import { DefaultLoader } from './default-loader';
import type { Engine } from '../engine';
import type { Screen } from '../screen';
import { Logger } from '../util/log';
import { Future } from '../util/future';
import type { Subscription } from '../event-emitter';
import { throwIfAborted, withAbort } from '../resources/abort';

export interface LoaderOptions extends DefaultLoaderOptions {
  /**
   * Go fullscreen after loading and clicking play
   */
  fullscreenAfterLoad?: boolean;
  /**
   * Fullscreen container element or id
   */
  fullscreenContainer?: HTMLElement | string;
}

/**
 * Pre-loading assets
 *
 * The loader provides a mechanism to preload multiple resources at
 * one time. The loader must be passed to the engine in order to
 * trigger the loading progress bar.
 *
 * The {@apilink Loader} itself implements {@apilink Loadable} so you can load loaders.
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
export class Loader extends DefaultLoader {
  private _logger = Logger.getInstance();
  private static _DEFAULT_LOADER_OPTIONS: LoaderOptions = {
    loadables: [],
    fullscreenAfterLoad: false,
    fullscreenContainer: undefined
  };
  private _originalOptions: LoaderOptions = { loadables: [] };
  public override events = new EventEmitter();
  public screen!: Screen;
  private _playButtonShown: boolean = false;
  private _hasLoaderViewport = false;
  private _resizeSubscription?: Subscription;

  // logo drawing stuff

  // base64 string encoding of the excalibur logo (logo-white.png)
  public logo = logoImg;
  public logoWidth = 468;
  public logoHeight = 118;
  /**
   * Positions the top left corner of the logo image
   * If not set, the loader automatically positions the logo
   */
  public logoPosition!: Vector | null;
  /**
   * Positions the top left corner of the play button.
   * If not set, the loader automatically positions the play button
   */
  public playButtonPosition!: Vector | null;
  /**
   * Positions the top left corner of the loading bar
   * If not set, the loader automatically positions the loading bar
   */
  public loadingBarPosition!: Vector | null;

  /**
   * Gets or sets the color of the loading bar, default is {@apilink Color.White}
   */
  public loadingBarColor: Color = Color.White;

  /**
   * Gets or sets the background color of the loader as a hex string
   */
  public backgroundColor: string = '#176BAA';

  protected _imageElement!: HTMLImageElement;
  protected _imageLoaded: Future<void> = new Future();
  protected get _image() {
    if (!this._imageElement) {
      this._imageElement = new Image();
      this._imageElement.onload = () => this._imageLoaded.resolve();
      this._imageElement.src = this.logo;
    }

    return this._imageElement;
  }

  public suppressPlayButton: boolean = false;
  public get playButtonRootElement(): HTMLElement | null {
    return this._playButtonRootElement;
  }
  public get playButtonElement(): HTMLButtonElement | null {
    return this._playButtonElement;
  }
  protected _playButtonRootElement!: HTMLElement;
  protected _playButtonElement!: HTMLButtonElement;
  protected _styleBlock!: HTMLStyleElement;
  /** Loads the css from Loader.css */
  protected _playButtonStyles: string = loaderCss;
  protected get _playButton() {
    const existingRoot = document.getElementById('excalibur-play-root');
    if (existingRoot) {
      this._playButtonRootElement = existingRoot;
    }
    if (!this._playButtonRootElement) {
      this._playButtonRootElement = document.createElement('div');
      this._playButtonRootElement.id = 'excalibur-play-root';
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
    let buttonElement: HTMLButtonElement = document.getElementById('excalibur-play') as HTMLButtonElement;
    if (!buttonElement) {
      buttonElement = document.createElement('button');
    }

    buttonElement.id = 'excalibur-play';
    buttonElement.style.display = 'none';

    if (buttonElement) {
      let [span, text] = buttonElement.getElementsByTagName('span');

      if (!span) {
        span ??= document.createElement('span');
        buttonElement.appendChild(span);
      }
      span.id = 'excalibur-play-icon';

      if (!text) {
        text ??= document.createElement('span');
        buttonElement.appendChild(text);
      }
      text.id = 'excalibur-play-text';
      text.textContent = this.playButtonText;
    }
    return buttonElement;
  };

  /**
   * @param options Optionally provide options to loader
   */
  constructor(options?: LoaderOptions);
  /**
   * @param loadables  Optionally provide the list of resources you want to load at constructor time
   */
  constructor(loadables?: Loadable<any>[]);
  constructor(loadablesOrOptions?: Loadable<any>[] | LoaderOptions) {
    const options = Array.isArray(loadablesOrOptions)
      ? {
          loadables: loadablesOrOptions
        }
      : loadablesOrOptions;
    super(options);
    this._originalOptions = { ...Loader._DEFAULT_LOADER_OPTIONS, ...options };
  }

  public override onInitialize(engine: Engine): void {
    this._resizeSubscription?.close();
    this.engine = engine;
    this.screen = engine.screen;
    this.canvas.width = this.engine.canvas.width;
    this.canvas.height = this.engine.canvas.height;
    this._resizeSubscription = this.screen.events.on('resize', () => {
      this.canvas.width = this.engine.canvas.width;
      this.canvas.height = this.engine.canvas.height;
    });
  }

  /**
   * Shows the play button and returns a promise that resolves when clicked
   */
  public async showPlayButton(signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    if (this.suppressPlayButton) {
      this.hidePlayButton();
      // Delay is to give the logo a chance to show, otherwise don't delay
      await withAbort(delay(500, this.engine?.clock), signal);
    } else {
      const resizeHandler = () => {
        try {
          this._positionPlayButton();
        } catch {
          // swallow if can't position
        }
      };
      if (this.engine?.browser) {
        this.engine.browser.window.on('resize', resizeHandler);
      }
      this._playButtonShown = true;
      const button = this._playButton;
      button.style.display = 'flex';
      const onKeyUp = (evt: KeyboardEvent) => {
        if (evt.key === 'Enter') {
          button.click();
        }
      };
      document.body.addEventListener('keyup', onKeyUp);
      this._positionPlayButton();
      let gamepadButton: Subscription | undefined;
      let startButtonHandler: ((event: Event) => void) | undefined;
      const playButtonClicked = new Promise<void>((resolve) => {
        startButtonHandler = (e: Event) => {
          // We want to stop propagation to keep bubbling to the engine pointer handlers
          e.stopPropagation();
          // Hide Button after click
          this.hidePlayButton();
          if (this.engine?.browser) {
            this.engine.browser.window.off('resize', resizeHandler);
          }

          if (this._originalOptions.fullscreenAfterLoad) {
            try {
              this._logger.info('requesting fullscreen');
              if (this._originalOptions.fullscreenContainer instanceof HTMLElement) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this._originalOptions.fullscreenContainer.requestFullscreen();
              } else {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.engine.screen.enterFullscreen(this._originalOptions.fullscreenContainer);
              }
            } catch (error) {
              this._logger.error('could not go fullscreen', error);
            }
          }

          resolve();
        };
        button.addEventListener('click', startButtonHandler);
        button.addEventListener('touchend', startButtonHandler);
        button.addEventListener('pointerup', startButtonHandler);
        if (this.engine) {
          gamepadButton = this.engine.input.gamepads.once('button', () => startButtonHandler!(new Event('button')));
        }
      });
      try {
        await withAbort(playButtonClicked, signal);
      } finally {
        button.removeEventListener('click', startButtonHandler!);
        button.removeEventListener('touchend', startButtonHandler!);
        button.removeEventListener('pointerup', startButtonHandler!);
        document.body.removeEventListener('keyup', onKeyUp);
        this.engine?.browser?.window.off('resize', resizeHandler);
        gamepadButton?.close();
        button.style.display = 'none';
        this._playButtonShown = false;
      }
    }
  }

  public hidePlayButton() {
    this._playButtonShown = false;
    this._playButton.style.display = 'none';
  }

  /**
   * Clean up generated elements for the loader
   */
  public dispose() {
    this._resizeSubscription?.close();
    this._resizeSubscription = undefined;
    this._playButtonElement?.remove();
    this._playButtonRootElement?.remove();
    this._styleBlock?.remove();
    this._playButtonRootElement = null as any;
    this._playButtonElement = null as any;
    this._styleBlock = null as any;
  }

  override data!: Loadable<any>[];

  public override async onUserAction(signal?: AbortSignal): Promise<void> {
    // short delay in showing the button for aesthetics
    await withAbort(delay(200, this.engine?.clock), signal);
    throwIfAborted(signal);
    this.canvas.flagDirty();
    // show play button
    await this.showPlayButton(signal);
  }

  public override async onBeforeLoad(): Promise<void> {
    this.screen.pushResolutionAndViewport();
    this._hasLoaderViewport = true;
    this.screen.resolution = { width: this.screen.resolution.width, height: this.screen.resolution.height };
    this.screen.applyResolutionAndViewport();
    const image = this._image;
    await this._imageLoaded.promise;
    await image?.decode(); // decode logo if it exists
  }

  // eslint-disable-next-line require-await
  public override async onAfterLoad(): Promise<void> {
    this.screen.popResolutionAndViewport();
    this._hasLoaderViewport = false;
    this.screen.applyResolutionAndViewport();
    this.dispose();
  }

  public override async load(signal?: AbortSignal): Promise<Loadable<any>[]> {
    try {
      return await super.load(signal);
    } catch (error) {
      if (this._loadWaiters === 0 && (error as Error)?.name === 'AbortError') {
        if (this._hasLoaderViewport) {
          this.screen.popResolutionAndViewport();
          this._hasLoaderViewport = false;
          this.screen.applyResolutionAndViewport();
        }
        if (this._playButtonRootElement) {
          this.hidePlayButton();
        }
        this.dispose();
      }
      throw error;
    }
  }

  private _positionPlayButton() {
    if (this.engine) {
      const { x: left, y: top, width: screenWidth, height: screenHeight } = this.engine.canvas.getBoundingClientRect();
      if (this._playButtonRootElement && this._playButtonElement) {
        const text = this._playButtonElement.querySelector('#excalibur-play-text')! as HTMLElement;
        if (screenWidth < 450) {
          text.style.display = 'none';
        } else {
          text.style.display = 'inline-block';
        }

        const buttonWidth = this._playButton.clientWidth;
        const buttonHeight = this._playButton.clientHeight;
        if (this.playButtonPosition) {
          this._playButtonRootElement.style.left = `${this.playButtonPosition.x}px`;
          this._playButtonRootElement.style.top = `${this.playButtonPosition.y}px`;
        } else {
          this._playButtonRootElement.style.left = `${left + screenWidth / 2 - buttonWidth / 2}px`;
          this._playButtonRootElement.style.top = `${top + screenHeight / 2 - buttonHeight / 2 + 100}px`;
        }

        if (screenWidth < 450) {
          this._playButtonRootElement.style.left = `${left + screenWidth / 2 - buttonWidth / 2}px`;
          this._playButtonRootElement.style.top = `${top + screenHeight / 2 - buttonHeight / 2 + 25}px`;
        }
      }
    }
  }

  /**
   * Loader draw function. Draws the default Excalibur loading screen.
   * Override `logo`, `logoWidth`, `logoHeight` and `backgroundColor` properties
   * to customize the drawing, or just override entire method.
   */
  public override onDraw(ctx: CanvasRenderingContext2D) {
    const canvasHeight = this.engine.canvasHeight / this.engine.pixelRatio;
    const canvasWidth = this.engine.canvasWidth / this.engine.pixelRatio;

    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    let logoY = canvasHeight / 2;
    const width = Math.min(this.logoWidth, canvasWidth * 0.75);
    let logoX = canvasWidth / 2 - width / 2;

    if (this.logoPosition) {
      logoX = this.logoPosition.x;
      logoY = this.logoPosition.y;
    }

    const imageHeight = Math.floor(width * (this.logoHeight / this.logoWidth)); // OG height/width factor
    const oldAntialias = this.engine.screen.antialiasing;
    this.engine.screen.antialiasing = true;
    if (!this.logoPosition) {
      ctx.drawImage(this._image, 0, 0, this.logoWidth, this.logoHeight, logoX, logoY - imageHeight - 20, width, imageHeight);
    } else {
      ctx.drawImage(this._image, 0, 0, this.logoWidth, this.logoHeight, logoX, logoY, width, imageHeight);
    }

    // loading box
    if (!this.suppressPlayButton && this._playButtonShown) {
      this.engine.screen.antialiasing = oldAntialias;
      return;
    }

    let loadingX = logoX;
    let loadingY = logoY;
    if (this.loadingBarPosition) {
      loadingX = this.loadingBarPosition.x;
      loadingY = this.loadingBarPosition.y;
    }

    ctx.lineWidth = 2;
    DrawUtil.roundRect(ctx, loadingX, loadingY, width, 20, 10, this.loadingBarColor);
    const progress = width * this.progress;
    const margin = 5;
    const progressWidth = progress - margin * 2;
    const height = 20 - margin * 2;
    DrawUtil.roundRect(
      ctx,
      loadingX + margin,
      loadingY + margin,
      progressWidth > 10 ? progressWidth : 10,
      height,
      5,
      null,
      this.loadingBarColor
    );
    this.engine.screen.antialiasing = oldAntialias;
  }
}
