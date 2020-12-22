import { Vector } from './Algebra';
import { Logger } from './Util/Log';
import { Camera } from './Camera';
import { BrowserEvents } from './Util/Browser';
import { BoundingBox } from './Collision/Index';
import { getPosition } from './Util/Util';

/**
 * Enum representing the different display modes available to Excalibur.
 */
export enum DisplayMode {
  /**
   * Use as much space as possible that still fits in the screen while maintaining aspect ratio and resolution.
   * This is not the same as [[Screen.goFullScreen]]
   *
   * You may want to center your game here is an example
   * ```html
   * <!-- html -->
   * <body>
   * <main>
   *   <canvas id="game"></canvas>
   * </main>
   * </body>
   * ```
   *
   * ```css
   * // css
   * main {
   *   display: flex;
   *   align-items: center;
   *   justify-content: center;
   *   height: 100%;
   *   width: 100%;
   * }
   * ```
   *
   */
  FullScreen = 'FullScreen',

  /**
   * Use the entire screen's css width/height for the game resolution dynamically. This means the resolution of the game will
   * change dynamically as the window is resized This is not the same as [[Screen.goFullScreen]]
   */
  Dynamic = 'Dynamic',

  /**
   * Default, use a specified resolution for the game. Like 800x600 pixels for example.
   */
  Fixed = 'Fixed',

  /**
   * Allow the game to be positioned with the [[EngineOptions.position]] option
   * @deprecated Use CSS to position the game canvas, will be removed in v0.26.0
   */
  Position = 'Position',

  /**
   * Use the parent DOM container's css width/height for the game resolution dynamically
   */
  Container = 'Container',
}

/**
 * Convenience class for quick resolutions
 * Mostly sourced from https://emulation.gametechwiki.com/index.php/Resolution
 */
export class Resolution {
  /* istanbul ignore next */
  public static get SVGA(): ScreenDimension {
    return { width: 800, height: 600 };
  }

  /* istanbul ignore next */
  public static get Standard(): ScreenDimension {
    return { width: 1920, height: 1080 };
  }

  /* istanbul ignore next */
  public static get Atari2600(): ScreenDimension {
    return { width: 160, height: 192 };
  }

  /* istanbul ignore next */
  public static get GameBoy(): ScreenDimension {
    return { width: 160, height: 144 };
  }

  /* istanbul ignore next */
  public static get GameBoyAdvance(): ScreenDimension {
    return { width: 240, height: 160 };
  }

  /* istanbul ignore next */
  public static get NintendoDS(): ScreenDimension {
    return { width: 256, height: 192 };
  }

  /* istanbul ignore next */
  public static get NES(): ScreenDimension {
    return { width: 256, height: 224 };
  }

  /* istanbul ignore next */
  public static get SNES(): ScreenDimension {
    return { width: 256, height: 244 };
  }
}

/**
 * Interface describing the absolute CSS position of the game window. For use when [[DisplayMode.Position]]
 * is specified and when the user wants to define exact pixel spacing of the window.
 * When a number is given, the value is interpreted as pixels
 */
export interface AbsolutePosition {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
}

export type CanvasPosition = string | AbsolutePosition;

export interface ScreenDimension {
  width: number;
  height: number;
}

export interface ExcaliburGraphicsContext {
  save(): void;
  resetTransform(): void;
  scale(x: number, y: number): void;
  imageSmoothingEnabled: boolean;
  restore(): void;
}

export interface ScreenOptions {
  /**
   * Canvas element to build a screen on
   */
  canvas: HTMLCanvasElement;
  /**
   * Graphics context for the screen
   */
  context: ExcaliburGraphicsContext;

  /**
   * Browser abstraction
   */
  browser: BrowserEvents;
  /**
   * Optionally set antialiasing, defaults to true. If set to true, images will be smoothed
   */
  antialiasing?: boolean;
  /**
   * Optionally override the pixel ratio to use for the screen, otherwise calculated automatically from the browser
   */
  pixelRatio?: number;
  /**
   * Optionally specify the actual pixel resolution in width/height pixels (also known as logical resolution), by default the
   * resolution will be the same as the viewport. Resolution will be overridden by DisplayMode.Container and DisplayMode.FullScreen.
   */
  resolution?: ScreenDimension;
  /**
   * Visual viewport size in css pixel, if resolution is not specified it will be the same as the viewport
   */
  viewport: ScreenDimension;
  /**
   * Set the display mode of the screen, by default DisplayMode.Fixed.
   */
  displayMode?: DisplayMode;
  /**
   * Specify how the game window is to be positioned when the [[DisplayMode.Position]] is chosen. This option MUST be specified
   * if the DisplayMode is set as [[DisplayMode.Position]]. The position can be either a string or an [[AbsolutePosition]].
   * String must be in the format of css style background-position. The vertical position must precede the horizontal position in strings.
   *
   * Valid String examples: "top left", "top", "bottom", "middle", "middle center", "bottom right"
   * Valid [[AbsolutePosition]] examples: `{top: 5, right: 10%}`, `{bottom: 49em, left: 10px}`, `{left: 10, bottom: 40}`
   */
  position?: CanvasPosition;
}

/**
 * The Screen handles all aspects of interacting with the screen for Excalibur.
 */
export class Screen {
  private _canvas: HTMLCanvasElement;
  private _ctx: ExcaliburGraphicsContext;
  private _antialiasing: boolean = true;
  private _browser: BrowserEvents;
  private _camera: Camera;
  private _resolution: ScreenDimension;
  private _resolutionStack: ScreenDimension[] = [];
  private _viewport: ScreenDimension;
  private _viewportStack: ScreenDimension[] = [];
  private _pixelRatio: number | null = null;
  private _position: CanvasPosition;
  private _displayMode: DisplayMode;
  private _isFullScreen = false;
  private _mediaQueryList: MediaQueryList;
  private _isDisposed = false;
  private _logger = Logger.getInstance();

  constructor(options: ScreenOptions) {
    this.viewport = options.viewport;
    this.resolution = options.resolution ?? { ...this.viewport };
    this._displayMode = options.displayMode ?? DisplayMode.Fixed;
    this._canvas = options.canvas;
    this._ctx = options.context;
    this._antialiasing = options.antialiasing ?? this._antialiasing;
    this._browser = options.browser;
    this._position = options.position;
    this._pixelRatio = options.pixelRatio;
    this._applyDisplayMode();

    this._mediaQueryList = this._browser.window.nativeComponent.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    this._mediaQueryList.addEventListener('change', this._pixelRatioChangeHandler);

    this._canvas.addEventListener('fullscreenchange', this._fullscreenChangeHandler);
  }

  public dispose(): void {
    if (!this._isDisposed) {
      // Clean up handlers
      this._isDisposed = true;
      this._browser.window.off('resize', this._windowResizeHandler);
      this._mediaQueryList.removeEventListener('change', this._pixelRatioChangeHandler);
      this._canvas.removeEventListener('fullscreenchange', this._fullscreenChangeHandler);
    }
  }

  private _fullscreenChangeHandler = () => {
    this._isFullScreen = !this._isFullScreen;
    this._logger.debug('Fullscreen Change', this._isFullScreen);
  }

  private _pixelRatioChangeHandler = () => {
    this._logger.debug('Pixel Ratio Change', window.devicePixelRatio);
    this.applyResolutionAndViewport();
  };

  private _windowResizeHandler = () => {
    const parent = <any>(this.displayMode === DisplayMode.Container ? <any>(this.canvas.parentElement || document.body) : <any>window);
    this._logger.debug('View port resized');
    this._setResolutionAndViewportByDisplayMode(parent);
    this.applyResolutionAndViewport();
  };

  public get pixelRatio(): number {
    if (this._pixelRatio) {
      return this._pixelRatio;
    }

    if (window.devicePixelRatio < 1) {
      return 1;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;

    return devicePixelRatio;
  }

  public get isHiDpi() {
    return this.pixelRatio !== 1;
  }

  public get displayMode(): DisplayMode {
    return this._displayMode;
  }

  public get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  public get resolution(): ScreenDimension {
    return this._resolution;
  }

  public set resolution(resolution: ScreenDimension) {
    this._resolution = resolution;
  }

  public get viewport(): ScreenDimension {
    if (this._viewport) {
      return this._viewport;
    }
    return this._resolution;
  }

  public set viewport(viewport: ScreenDimension) {
    this._viewport = viewport;
  }

  public get aspectRatio() {
    return this._resolution.width / this._resolution.height;
  }

  public get scaledWidth() {
    return this._resolution.width * this.pixelRatio;
  }

  public get scaledHeight() {
    return this._resolution.height * this.pixelRatio;
  }

  public setCurrentCamera(camera: Camera) {
    this._camera = camera;
  }

  public pushResolutionAndViewport() {
    this._resolutionStack.push(this.resolution);
    this._viewportStack.push(this.viewport);

    this.resolution = { ...this.resolution };
    this.viewport = { ...this.viewport };
  }

  public popResolutionAndViewport() {
    this.resolution = this._resolutionStack.pop();
    this.viewport = this._viewportStack.pop();
  }

  public applyResolutionAndViewport() {
    this._canvas.width = this.scaledWidth;
    this._canvas.height = this.scaledHeight;

    if (this._antialiasing) {
      this._canvas.style.imageRendering = 'auto';
    } else {
      this._canvas.style.imageRendering = 'pixelated';
      // Fall back to 'crisp-edges' if 'pixelated' is not supported
      // Currently for firefox https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering
      if (this._canvas.style.imageRendering === '') {
        this._canvas.style.imageRendering = 'crisp-edges';
      }
    }
    this._canvas.style.width = this.viewport.width + 'px';
    this._canvas.style.height = this.viewport.height + 'px';

    // After messing with the canvas width/height the graphics context is invalidated and needs to have some properties reset
    this._ctx.resetTransform();
    this._ctx.scale(this.pixelRatio, this.pixelRatio);
    this._ctx.imageSmoothingEnabled = this._antialiasing;
  }

  public get antialiasing() {
    return this._antialiasing;
  }

  public set antialiasing(isSmooth: boolean) {
    this._antialiasing = isSmooth;
    this._ctx.imageSmoothingEnabled = this._antialiasing;
  }

  /**
   * Returns true if excalibur is fullscreened using the browser fullscreen api
   */
  public get isFullScreen() {
    return this._isFullScreen;
  }

  /**
   * Requests to go fullscreen using the browser fullscreen api
   */
  public goFullScreen(): Promise<void> {
    return this._canvas.requestFullscreen();
  }

  /**
   * Requests to exit fullscreen using the browser fullscreen api
   */
  public exitFullScreen(): Promise<void> {
    return document.exitFullscreen();
  }

  /**
   * Takes a coordinate in normal html page space, for example from a pointer move event, and translates it to
   * Excalibur screen space.
   *
   * Excalibur screen space starts at the top left (0, 0) corner of the viewport, and extends to the
   * bottom right corner (resolutionX, resolutionY)
   * @param point
   */
  public pageToScreenCoordinates(point: Vector): Vector {
    let newX = point.x;
    let newY = point.y;

    newX -= getPosition(this._canvas).x;
    newY -= getPosition(this._canvas).y;


    // if fullscreen api on it centers with black bars
    // we need to adjust the screen to world coordinates in this case
    if (this._isFullScreen) {
      if (window.innerWidth / this.aspectRatio < window.innerHeight) {
        newY -= (window.innerHeight - this.viewport.height) / 2;
      } else {
        newX -= (window.innerWidth - this.viewport.width) / 2;
      }
    }

    newX = (newX / this.viewport.width) * this.resolution.width;
    newY = (newY / this.viewport.height) * this.resolution.height;

    return new Vector(newX, newY);
  }

  /**
   * Takes a coordinate in Excalibur screen space, and translates it to normal html page space. For example,
   * this is where html elements might live if you want to position them relative to Excalibur.
   *
   * Excalibur screen space starts at the top left (0, 0) corner of the viewport, and extends to the
   * bottom right corner (resolutionX, resolutionY)
   * @param point
   */
  public screenToPageCoordinates(point: Vector): Vector {
    let newX = point.x;
    let newY = point.y;

    newX = (newX / this.resolution.width) * this.viewport.width;
    newY = (newY / this.resolution.height) * this.viewport.height;

    if (this._isFullScreen) {
      if (window.innerWidth / this.aspectRatio < window.innerHeight) {
        newY += (window.innerHeight - this.viewport.height) / 2;
      } else {
        newX += (window.innerWidth - this.viewport.width) / 2;
      }
    }

    newX += getPosition(this._canvas).x;
    newY += getPosition(this._canvas).y;

    return new Vector(newX, newY);
  }

  /**
   * Takes a coordinate in Excalibur screen space, and translates it to Excalibur world space.
   *
   * World space is where [[entities|Entity]] in Excalibur live by default [[CoordPlane.World]]
   * and extends infinitely out relative from the [[Camera]].
   * @param point  Screen coordinate to convert
   */
  public screenToWorldCoordinates(point: Vector): Vector {
    let newX = point.x;
    let newY = point.y;

    // transform back to world space
    newX = (newX / this.resolution.width) * this.drawWidth;
    newY = (newY / this.resolution.height) * this.drawHeight;

    // transform based on zoom
    newX = newX - this.halfDrawWidth;
    newY = newY - this.halfDrawHeight;

    // shift by camera focus
    newX += this._camera?.x ?? 0;
    newY += this._camera?.y ?? 0;

    return new Vector(newX, newY);
  }

  /**
   * Takes a coordinate in Excalibur world space, and translates it to Excalibur screen space.
   *
   * Screen space is where [[ScreenElements]] and [[entities|Entity]] with [[CoordPlane.Screen]] live.
   * @param point  World coordinate to convert
   */
  public worldToScreenCoordinates(point: Vector): Vector {
    let screenX = point.x;
    let screenY = point.y;

    // shift by camera focus
    screenX -= this._camera?.x ?? 0;
    screenY -= this._camera?.y ?? 0;

    // transform back on zoom
    screenX = screenX + this.halfDrawWidth;
    screenY = screenY + this.halfDrawHeight;

    // transform back to screen space
    screenX = (screenX / this.drawWidth) * this.resolution.width;
    screenY = (screenY / this.drawHeight) * this.resolution.height;

    return new Vector(screenX, screenY);
  }

  public pageToWorldCoordinates(point: Vector): Vector {
    const screen = this.pageToScreenCoordinates(point);
    return this.screenToWorldCoordinates(screen);
  }

  public worldToPageCoordinates(point: Vector): Vector {
    const screen = this.worldToScreenCoordinates(point);
    return this.screenToPageCoordinates(screen);
  }

  /**
   * Returns a BoundingBox of the top left corner of the screen
   * and the bottom right corner of the screen.
   *
   * World bounds are in world coordinates, useful for culling objects offscreen
   */
  public getWorldBounds(): BoundingBox {
    const left = this.screenToWorldCoordinates(Vector.Zero).x;
    const top = this.screenToWorldCoordinates(Vector.Zero).y;
    const right = left + this.drawWidth;
    const bottom = top + this.drawHeight;

    return new BoundingBox(left, top, right, bottom);
  }

  /**
   * The width of the game canvas in pixels (physical width component of the
   * resolution of the canvas element)
   */
  public get canvasWidth(): number {
    return this.canvas.width;
  }

  /**
   * Returns half width of the game canvas in pixels (half physical width component)
   */
  public get halfCanvasWidth(): number {
    return this.canvas.width / 2;
  }

  /**
   * The height of the game canvas in pixels, (physical height component of
   * the resolution of the canvas element)
   */
  public get canvasHeight(): number {
    return this.canvas.height;
  }

  /**
   * Returns half height of the game canvas in pixels (half physical height component)
   */
  public get halfCanvasHeight(): number {
    return this.canvas.height / 2;
  }

  /**
   * Returns the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
   */
  public get drawWidth(): number {
    if (this._camera) {
      return this.scaledWidth / this._camera.z / this.pixelRatio;
    }
    return this.scaledWidth / this.pixelRatio;
  }

  /**
   * Returns half the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
   */
  public get halfDrawWidth(): number {
    return this.drawWidth / 2;
  }

  /**
   * Returns the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
   */
  public get drawHeight(): number {
    if (this._camera) {
      return this.scaledHeight / this._camera.z / this.pixelRatio;
    }
    return this.scaledHeight / this.pixelRatio;
  }

  /**
   * Returns half the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
   */
  public get halfDrawHeight(): number {
    return this.drawHeight / 2;
  }

  private _computeFullScreen() {
    document.body.style.margin = '0px';
    document.body.style.overflow = 'hidden';
    const aspect = this.aspectRatio;
    let adjustedWidth = 0;
    let adjustedHeight = 0;
    if (window.innerWidth / aspect < window.innerHeight) {
      adjustedWidth = window.innerWidth;
      adjustedHeight = window.innerWidth / aspect;
    } else {
      adjustedWidth = window.innerHeight * aspect;
      adjustedHeight = window.innerHeight;
    }

    this.viewport = {
      width: adjustedWidth,
      height: adjustedHeight
    };
  }

  private _applyDisplayMode() {
    if (this.displayMode === DisplayMode.FullScreen ||
        this.displayMode === DisplayMode.Dynamic ||
        this.displayMode === DisplayMode.Container) {
      const parent = <any>(this.displayMode === DisplayMode.Container ? <any>(this.canvas.parentElement || document.body) : <any>window);

      this._setResolutionAndViewportByDisplayMode(parent);

      this._browser.window.on('resize', this._windowResizeHandler);
    } else if (this.displayMode === DisplayMode.Position) {
      this._initializeDisplayModePosition(this._position);
    }
  }

  /**
   * Sets the resoultion and viewport based on the selected display mode.
   */
  private _setResolutionAndViewportByDisplayMode(parent: HTMLElement | Window) {
    if (this.displayMode === DisplayMode.Container) {
      this.resolution = {
        width: (<HTMLElement>parent).clientWidth,
        height: (<HTMLElement>parent).clientHeight
      };

      this.viewport = this.resolution;
    }

    if (this.displayMode === DisplayMode.Dynamic) {
      document.body.style.margin = '0px';
      document.body.style.overflow = 'hidden';
      this.resolution = {
        width: (<Window>parent).innerWidth,
        height: (<Window>parent).innerHeight
      };

      this.viewport = this.resolution;
    }

    if (this.displayMode === DisplayMode.FullScreen) {
      this._computeFullScreen();
    }
  }

  private _initializeDisplayModePosition(position: CanvasPosition) {
    if (!position) {
      throw new Error('DisplayMode of Position was selected but no position option was given');
    } else {
      this.canvas.style.display = 'block';
      this.canvas.style.position = 'absolute';

      if (typeof position === 'string') {
        const specifiedPosition = position.split(' ');

        switch (specifiedPosition[0]) {
          case 'top':
            this.canvas.style.top = '0px';
            break;
          case 'bottom':
            this.canvas.style.bottom = '0px';
            break;
          case 'middle':
            this.canvas.style.top = '50%';
            const offsetY = -this.halfDrawHeight;
            this.canvas.style.marginTop = offsetY.toString();
            break;
          default:
            throw new Error('Invalid Position Given');
        }

        if (specifiedPosition[1]) {
          switch (specifiedPosition[1]) {
            case 'left':
              this.canvas.style.left = '0px';
              break;
            case 'right':
              this.canvas.style.right = '0px';
              break;
            case 'center':
              this.canvas.style.left = '50%';
              const offsetX = -this.halfDrawWidth;
              this.canvas.style.marginLeft = offsetX.toString();
              break;
            default:
              throw new Error('Invalid Position Given');
          }
        }
      } else {
        if (position.top) {
          typeof position.top === 'number'
            ? (this.canvas.style.top = position.top.toString() + 'px')
            : (this.canvas.style.top = position.top);
        }
        if (position.right) {
          typeof position.right === 'number'
            ? (this.canvas.style.right = position.right.toString() + 'px')
            : (this.canvas.style.right = position.right);
        }
        if (position.bottom) {
          typeof position.bottom === 'number'
            ? (this.canvas.style.bottom = position.bottom.toString() + 'px')
            : (this.canvas.style.bottom = position.bottom);
        }
        if (position.left) {
          typeof position.left === 'number'
            ? (this.canvas.style.left = position.left.toString() + 'px')
            : (this.canvas.style.left = position.left);
        }
      }
    }
  }
}
