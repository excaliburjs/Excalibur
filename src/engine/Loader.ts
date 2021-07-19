import { Color } from './Drawing/Color';
import { WebAudio } from './Util/WebAudio';
import { Engine } from './Engine';
import { Loadable } from './Interfaces/Loadable';
import { Class } from './Class';
import * as DrawUtil from './Util/DrawUtil';

import logoImg from './Loader.logo.png';
import loaderCss from './Loader.css';
import { Canvas } from './Graphics/Canvas';
import { Vector } from './Algebra';
import { clamp, delay } from './Util/Util';

/**
 * Pre-loading assets
 *
 * The loader provides a mechanism to preload multiple resources at
 * one time. The loader must be passed to the engine in order to
 * trigger the loading progress bar.
 *
 * The [[Loader]] itself implements [[Loadable]] so you can load loaders.
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
export class Loader extends Class implements Loadable<Loadable<any>[]> {
  public canvas: Canvas = new Canvas({
    smoothing: true,
    draw: this.draw.bind(this)
  });
  private _resourceList: Loadable<any>[] = [];
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
  /**
   * Positions the top left corner of the logo image
   * If not set, the loader automatically positions the logo
   */
  public logoPosition: Vector | null;
  /**
   * Positions the top left corner of the play button.
   * If not set, the loader automatically positions the play button
   */
  public playButtonPosition: Vector | null;
  /**
   * Positions the top left corner of the loading bar
   * If not set, the loader automatically positions the loading bar
   */
  public loadingBarPosition: Vector | null;

  /**
   * Gets or sets the color of the loading bar, default is [[Color.White]]
   */
  public loadingBarColor: Color = Color.White;

  /**
   * Gets or sets the background color of the loader as a hex string
   */
  public backgroundColor: string = '#176BAA';

  protected _imageElement: HTMLImageElement;
  protected get _image() {
    if (!this._imageElement) {
      this._imageElement = new Image();
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
  protected _playButtonRootElement: HTMLElement;
  protected _playButtonElement: HTMLButtonElement;
  protected _styleBlock: HTMLStyleElement;
  /** Loads the css from Loader.css */
  protected _playButtonStyles: string = loaderCss.toString();
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
    buttonElement.textContent = this.playButtonText;
    buttonElement.style.display = 'none';
    return buttonElement;
  };

  /**
   * @param loadables  Optionally provide the list of resources you want to load at constructor time
   */
  constructor(loadables?: Loadable<any>[]) {
    super();

    if (loadables) {
      this.addResources(loadables);
    }
  }

  public wireEngine(engine: Engine) {
    this._engine = engine;
    this.canvas.width = this._engine.canvas.width;
    this.canvas.height = this._engine.canvas.height;
  }

  /**
   * Add a resource to the loader to load
   * @param loadable  Resource to add
   */
  public addResource(loadable: Loadable<any>) {
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
  public addResources(loadables: Loadable<any>[]) {
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
  public showPlayButton(): Promise<void> {
    if (this.suppressPlayButton) {
      return Promise.resolve();
    } else {
      this._playButtonShown = true;
      this._playButton.style.display = 'block';
      document.body.addEventListener('keyup', (evt: KeyboardEvent) => {
        if (evt.key === 'Enter') {
          this._playButton.click();
        }
      });
      const promise = new Promise<void>((resolve) => {
        const startButtonHandler = (e: Event) => {
          // We want to stop propogation to keep bubbling to the engine pointer handlers
          e.stopPropagation();
          resolve();
        };
        this._playButton.addEventListener('click', startButtonHandler);
        this._playButton.addEventListener('touchend', startButtonHandler);
        this._playButton.addEventListener('pointerup', startButtonHandler);
      });

      return promise;
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
    if (this._playButtonRootElement.parentElement) {
      this._playButtonRootElement.removeChild(this._playButtonElement);
      document.body.removeChild(this._playButtonRootElement);
      document.head.removeChild(this._styleBlock);
      this._playButtonRootElement = null;
      this._playButtonElement = null;
      this._styleBlock = null;
    }
  }

  update(_engine: Engine, _delta: number): void {
    // override me
  }

  data: Loadable<any>[];

  /**
   * Begin loading all of the supplied resources, returning a promise
   * that resolves when loading of all is complete
   */
  public async load(): Promise<Loadable<any>[]> {
    await Promise.all(
      this._resourceList.map((r) =>
        r.load().finally(() => {
          // capture progress
          this._numLoaded++;
        })
      )
    );

    // short delay in showing the button for aesthetics
    await delay(200);
    await this.showPlayButton();
    // Unlock browser AudioContext in after user gesture
    // See: https://github.com/excaliburjs/Excalibur/issues/262
    // See: https://github.com/excaliburjs/Excalibur/issues/1031
    await WebAudio.unlock();
    this.hidePlayButton();

    return (this.data = this._resourceList);
  }

  public markResourceComplete(): void {
    this._numLoaded++;
  }

  /**
   * Returns the progess of the loader as a number between [0, 1] inclusive.
   */
  public get progress(): number {
    return this._resourceCount > 0 ? clamp(this._numLoaded, 0, this._resourceCount) / this._resourceCount : 1;
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
      const left = this._engine.canvas.offsetLeft;
      const top = this._engine.canvas.offsetTop;
      const buttonWidth = this._playButton.clientWidth;
      const buttonHeight = this._playButton.clientHeight;
      if (this.playButtonPosition) {
        this._playButtonRootElement.style.left = `${this.playButtonPosition.x}px`;
        this._playButtonRootElement.style.top = `${this.playButtonPosition.y}px`;
      } else {
        this._playButtonRootElement.style.left = `${left + canvasWidth / 2 - buttonWidth / 2}px`;
        this._playButtonRootElement.style.top = `${top + canvasHeight / 2 - buttonHeight / 2 + 100}px`;
      }
    }

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
    const oldAntialias = this._engine.getAntialiasing();
    this._engine.setAntialiasing(true);
    if (!this.logoPosition) {
      ctx.drawImage(this._image, 0, 0, this.logoWidth, this.logoHeight, logoX, logoY - imageHeight - 20, width, imageHeight);
    } else {
      ctx.drawImage(this._image, 0, 0, this.logoWidth, this.logoHeight, logoX, logoY, width, imageHeight);
    }

    // loading box
    if (!this.suppressPlayButton && this._playButtonShown) {
      this._engine.setAntialiasing(oldAntialias);
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
    this._engine.setAntialiasing(oldAntialias);
  }
}
