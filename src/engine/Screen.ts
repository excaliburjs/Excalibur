import { vec, Vector } from './Math/vector';
import { Logger } from './Util/Log';
import type { Camera } from './Camera';
import type { BrowserEvents } from './Util/Browser';
import { BoundingBox } from './Collision/Index';
import type { ExcaliburGraphicsContext } from './Graphics/Context/ExcaliburGraphicsContext';
import { getPosition } from './Util/Util';
import { ExcaliburGraphicsContextWebGL } from './Graphics/Context/ExcaliburGraphicsContextWebGL';
import { ExcaliburGraphicsContext2DCanvas } from './Graphics/Context/ExcaliburGraphicsContext2DCanvas';
import { EventEmitter } from './EventEmitter';

/**
 * Enum representing the different display modes available to Excalibur.
 */
export enum DisplayMode {
  /**
   * Default, use a specified resolution for the game. Like 800x600 pixels for example.
   */
  Fixed = 'Fixed',

  /**
   * Fit the aspect ratio given by the game resolution within the container at all times will fill any gaps with canvas.
   * The displayed area outside the aspect ratio is not guaranteed to be on the screen, only the {@apilink Screen.contentArea}
   * is guaranteed to be on screen.
   */
  FitContainerAndFill = 'FitContainerAndFill',

  /**
   * Fit the aspect ratio given by the game resolution the screen at all times will fill the screen.
   * This displayed area outside the aspect ratio is not guaranteed to be on the screen, only the {@apilink Screen.contentArea}
   * is guaranteed to be on screen.
   */
  FitScreenAndFill = 'FitScreenAndFill',

  /**
   * Fit the viewport to the parent element maintaining aspect ratio given by the game resolution, but zooms in to avoid the black bars
   * (letterbox) that would otherwise be present in {@apilink FitContainer}.
   *
   * **warning** This will clip some drawable area from the user because of the zoom,
   * use {@apilink Screen.contentArea} to know the safe to draw area.
   */
  FitContainerAndZoom = 'FitContainerAndZoom',

  /**
   * Fit the viewport to the device screen maintaining aspect ratio given by the game resolution, but zooms in to avoid the black bars
   * (letterbox) that would otherwise be present in {@apilink FitScreen}.
   *
   * **warning** This will clip some drawable area from the user because of the zoom,
   * use {@apilink Screen.contentArea} to know the safe to draw area.
   */
  FitScreenAndZoom = 'FitScreenAndZoom',

  /**
   * Fit to screen using as much space as possible while maintaining aspect ratio and resolution.
   * This is not the same as {@apilink Screen.enterFullscreen} but behaves in a similar way maintaining aspect ratio.
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
   */
  FitScreen = 'FitScreen',

  /**
   * Fill the entire screen's css width/height for the game resolution dynamically. This means the resolution of the game will
   * change dynamically as the window is resized. This is not the same as {@apilink Screen.enterFullscreen}
   */
  FillScreen = 'FillScreen',

  /**
   * Fit to parent element width/height using as much space as possible while maintaining aspect ratio and resolution.
   */
  FitContainer = 'FitContainer',

  /**
   * Use the parent DOM container's css width/height for the game resolution dynamically
   */
  FillContainer = 'FillContainer'
}

/**
 * Convenience class for quick resolutions
 * Mostly sourced from https://emulation.gametechwiki.com/index.php/Resolution
 */
export class Resolution {
  /* istanbul ignore next */
  public static get SVGA(): Resolution {
    return { width: 800, height: 600 };
  }

  /* istanbul ignore next */
  public static get Standard(): Resolution {
    return { width: 1920, height: 1080 };
  }

  /* istanbul ignore next */
  public static get Atari2600(): Resolution {
    return { width: 160, height: 192 };
  }

  /* istanbul ignore next */
  public static get GameBoy(): Resolution {
    return { width: 160, height: 144 };
  }

  /* istanbul ignore next */
  public static get GameBoyAdvance(): Resolution {
    return { width: 240, height: 160 };
  }

  /* istanbul ignore next */
  public static get NintendoDS(): Resolution {
    return { width: 256, height: 192 };
  }

  /* istanbul ignore next */
  public static get NES(): Resolution {
    return { width: 256, height: 224 };
  }

  /* istanbul ignore next */
  public static get SNES(): Resolution {
    return { width: 256, height: 244 };
  }
}

export type ViewportUnit = 'pixel' | 'percent';

export interface Resolution {
  width: number;
  height: number;
}

export interface ViewportDimension {
  widthUnit?: ViewportUnit;
  heightUnit?: ViewportUnit;
  width: number;
  height: number;
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
   * Optionally set the image rendering CSS hint on the canvas element, default is auto
   */
  canvasImageRendering?: 'auto' | 'pixelated';
  /**
   * Optionally override the pixel ratio to use for the screen, otherwise calculated automatically from the browser
   */
  pixelRatio?: number;
  /**
   * Optionally specify the actual pixel resolution in width/height pixels (also known as logical resolution), by default the
   * resolution will be the same as the viewport. Resolution will be overridden by {@apilink DisplayMode.FillContainer} and
   * {@apilink DisplayMode.FillScreen}.
   */
  resolution?: Resolution;
  /**
   * Visual viewport size in css pixel, if resolution is not specified it will be the same as the viewport
   */
  viewport: ViewportDimension;
  /**
   * Set the display mode of the screen, by default DisplayMode.Fixed.
   */
  displayMode?: DisplayMode;
}

/**
 * Fires when the screen resizes, useful if you have logic that needs to be aware of resolution/viewport constraints
 */
export interface ScreenResizeEvent {
  /**
   * Native browser event (if any)
   */
  event?: Event;
  /**
   * Current viewport in css pixels of the screen
   */
  viewport: ViewportDimension;
  /**
   * Current resolution in world pixels of the screen
   */
  resolution: Resolution;
}

/**
 * Fires when the pixel ratio changes, useful to know if you've moved to a hidpi screen or back
 */
export interface PixelRatioChangeEvent {
  /**
   * Current pixel ratio of the screen
   */
  pixelRatio: number;
}

/**
 * Fires when the browser fullscreen api is successfully engaged or disengaged
 */
export interface FullScreenChangeEvent {
  /**
   * Current fullscreen state
   */
  fullscreen: boolean;
}

/**
 * Built in events supported by all entities
 */
export type ScreenEvents = {
  /**
   * Fires when the screen resizes, useful if you have logic that needs to be aware of resolution/viewport constraints
   */
  resize: ScreenResizeEvent;
  /**
   * Fires when the pixel ratio changes, useful to know if you've moved to a hidpi screen or back
   */
  pixelratio: PixelRatioChangeEvent;
  /**
   * Fires when the browser fullscreen api is successfully engaged or disengaged
   */
  fullscreen: FullScreenChangeEvent;
};

export const ScreenEvents = {
  ScreenResize: 'resize',
  PixelRatioChange: 'pixelratio',
  FullScreenChange: 'fullscreen'
} as const;

/**
 * The Screen handles all aspects of interacting with the screen for Excalibur.
 */
export class Screen {
  public graphicsContext: ExcaliburGraphicsContext;
  /**
   * Listen to screen events {@apilink ScreenEvents}
   */
  public events = new EventEmitter<ScreenEvents>();
  private _canvas: HTMLCanvasElement;
  private _antialiasing: boolean = true;
  private _canvasImageRendering: 'auto' | 'pixelated' = 'auto';
  private _contentResolution: Resolution;
  private _browser: BrowserEvents;
  private _camera: Camera;
  private _resolution: Resolution;
  private _resolutionStack: Resolution[] = [];
  private _viewport: ViewportDimension;
  private _viewportStack: ViewportDimension[] = [];
  private _pixelRatioOverride: number | null = null;
  private _displayMode: DisplayMode;
  private _isFullscreen = false;
  private _mediaQueryList: MediaQueryList;
  private _isDisposed = false;
  private _logger = Logger.getInstance();
  private _resizeObserver: ResizeObserver;

  constructor(options: ScreenOptions) {
    this.viewport = options.viewport;
    this.resolution = options.resolution ?? { ...this.viewport };
    this._contentResolution = this.resolution;
    this._displayMode = options.displayMode ?? DisplayMode.Fixed;
    this._canvas = options.canvas;
    this.graphicsContext = options.context;
    this._antialiasing = options.antialiasing ?? this._antialiasing;
    this._canvasImageRendering = options.canvasImageRendering ?? this._canvasImageRendering;
    this._browser = options.browser;
    this._pixelRatioOverride = options.pixelRatio;

    this._applyDisplayMode();

    this._listenForPixelRatio();

    this._listenForOrientationChange();

    this._canvas.addEventListener('fullscreenchange', this._fullscreenChangeHandler);
    this.applyResolutionAndViewport();
  }

  private _listenForOrientationChange() {
    if (window?.screen?.orientation) {
      window.screen.orientation.addEventListener('change', this._resizeHandler);
    }
  }

  private _listenForPixelRatio() {
    if (this._mediaQueryList && !this._mediaQueryList.addEventListener) {
      // Safari <=13.1 workaround, remove any existing handlers
      this._mediaQueryList.removeListener(this._pixelRatioChangeHandler);
    }
    this._mediaQueryList = this._browser.window.nativeComponent.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);

    // Safari <=13.1 workaround
    if (this._mediaQueryList.addEventListener) {
      this._mediaQueryList.addEventListener('change', this._pixelRatioChangeHandler, { once: true });
    } else {
      this._mediaQueryList.addListener(this._pixelRatioChangeHandler);
    }
  }

  public dispose(): void {
    if (!this._isDisposed) {
      // Clean up handlers
      this._isDisposed = true;
      this.events.clear();
      this._browser.window.off('resize', this._resizeHandler);
      this._browser.window.clear();

      if (window?.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', this._resizeHandler);
      }

      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
      }
      this.parent.removeEventListener('resize', this._resizeHandler);
      // Safari <=13.1 workaround
      if (this._mediaQueryList.removeEventListener) {
        this._mediaQueryList.removeEventListener('change', this._pixelRatioChangeHandler);
      } else {
        this._mediaQueryList.removeListener(this._pixelRatioChangeHandler);
      }
      this._canvas.removeEventListener('fullscreenchange', this._fullscreenChangeHandler);
      this._canvas = null;
    }
  }

  private _fullscreenChangeHandler = () => {
    if (this._isDisposed) {
      return;
    }
    this._isFullscreen = !this._isFullscreen;
    this._logger.debug('Fullscreen Change', this._isFullscreen);
    this.events.emit('fullscreen', {
      fullscreen: this.isFullscreen
    } satisfies FullScreenChangeEvent);
  };

  private _pixelRatioChangeHandler = () => {
    if (this._isDisposed) {
      return;
    }
    this._logger.debug('Pixel Ratio Change', window.devicePixelRatio);
    this._listenForPixelRatio();
    this._devicePixelRatio = this._calculateDevicePixelRatio();
    this.applyResolutionAndViewport();

    this.events.emit('pixelratio', {
      pixelRatio: this.pixelRatio
    } satisfies PixelRatioChangeEvent);
  };

  private _resizeHandler = (event?: Event) => {
    if (this._isDisposed) {
      return;
    }
    const parent = this.parent;
    this._logger.debug('View port resized');
    this._setResolutionAndViewportByDisplayMode(parent);
    this.applyResolutionAndViewport();

    // Emit resize event
    this.events.emit('resize', {
      event,
      resolution: this.resolution,
      viewport: this.viewport
    } satisfies ScreenResizeEvent);
  };

  private _calculateDevicePixelRatio() {
    if (window.devicePixelRatio < 1) {
      return 1;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;

    return devicePixelRatio;
  }

  // Asking the window.devicePixelRatio is expensive we do it once
  private _devicePixelRatio = this._calculateDevicePixelRatio();

  /**
   * Returns the computed pixel ratio, first using any override, then the device pixel ratio
   */
  public get pixelRatio(): number {
    if (this._pixelRatioOverride) {
      return this._pixelRatioOverride;
    }

    return this._devicePixelRatio;
  }

  /**
   * This calculates the ratio between excalibur pixels and the HTML pixels.
   *
   * This is useful for scaling HTML UI so that it matches your game.
   */
  public get worldToPagePixelRatio(): number {
    if (this._canvas) {
      const pageOrigin = this.worldToPageCoordinates(Vector.Zero);
      const pageDistance = this.worldToPageCoordinates(vec(1, 0)).sub(pageOrigin);
      const pixelConversion = pageDistance.x;
      return pixelConversion;
    } else {
      return 1;
    }
  }

  /**
   * Get or set the pixel ratio override
   *
   * You will need to call applyResolutionAndViewport() affect change on the screen
   */
  public get pixelRatioOverride(): number | undefined {
    return this._pixelRatioOverride;
  }

  public set pixelRatioOverride(value: number | undefined) {
    this._pixelRatioOverride = value;
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

  public get parent(): HTMLElement | Window {
    switch (this.displayMode) {
      case DisplayMode.FillContainer:
      case DisplayMode.FitContainer:
      case DisplayMode.FitContainerAndFill:
      case DisplayMode.FitContainerAndZoom:
        return this.canvas.parentElement || document.body;
      default:
        return window;
    }
  }

  public get resolution(): Resolution {
    return this._resolution;
  }

  public set resolution(resolution: Resolution) {
    this._resolution = resolution;
  }

  /**
   * Returns screen dimensions in pixels or percentage
   */
  public get viewport(): ViewportDimension {
    if (this._viewport) {
      return this._viewport;
    }
    return this._resolution;
  }

  public set viewport(viewport: ViewportDimension) {
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

  public peekViewport(): ViewportDimension {
    return this._viewportStack[this._viewportStack.length - 1];
  }

  public peekResolution(): Resolution {
    return this._resolutionStack[this._resolutionStack.length - 1];
  }

  public popResolutionAndViewport() {
    if (this._resolutionStack.length && this._viewportStack.length) {
      this.resolution = this._resolutionStack.pop();
      this.viewport = this._viewportStack.pop();
    }
  }

  public applyResolutionAndViewport() {
    if (this.graphicsContext instanceof ExcaliburGraphicsContextWebGL) {
      const scaledResolutionSupported = this.graphicsContext.checkIfResolutionSupported({
        width: this.scaledWidth,
        height: this.scaledHeight
      });
      if (!scaledResolutionSupported) {
        this._logger.warnOnce(
          `The currently configured resolution (${this.resolution.width}x${this.resolution.height}) and pixel ratio (${this.pixelRatio})` +
            ' are too large for the platform WebGL implementation, this may work but cause WebGL rendering to behave oddly.' +
            ' Try reducing the resolution or disabling Hi DPI scaling to avoid this' +
            ' (read more here https://excaliburjs.com/docs/screens#understanding-viewport--resolution).'
        );

        // Attempt to recover if the user hasn't configured a specific ratio for up scaling
        if (!this.pixelRatioOverride) {
          let currentPixelRatio = Math.max(1, this.pixelRatio - 0.5);
          let newResolutionSupported = false;
          while (currentPixelRatio > 1 && !newResolutionSupported) {
            currentPixelRatio = Math.max(1, currentPixelRatio - 0.5);
            const width = this._resolution.width * currentPixelRatio;
            const height = this._resolution.height * currentPixelRatio;
            newResolutionSupported = this.graphicsContext.checkIfResolutionSupported({ width, height });
          }
          this.pixelRatioOverride = currentPixelRatio;
          this._logger.warnOnce(
            'Scaled resolution too big attempted recovery!' +
              ` Pixel ratio was automatically reduced to (${this.pixelRatio}) to avoid 4k texture limit.` +
              ' Setting `ex.Engine({pixelRatio: ...}) will override any automatic recalculation, do so at your own risk.` ' +
              ' (read more here https://excaliburjs.com/docs/screens#understanding-viewport--resolution).'
          );
        }
      }
    }

    this._canvas.width = this.scaledWidth;
    this._canvas.height = this.scaledHeight;

    if (this._canvasImageRendering === 'auto') {
      this._canvas.style.imageRendering = 'auto';
    } else {
      this._canvas.style.imageRendering = 'pixelated';
      // Fall back to 'crisp-edges' if 'pixelated' is not supported
      // Currently for firefox https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering
      if (this._canvas.style.imageRendering === '') {
        this._canvas.style.imageRendering = 'crisp-edges';
      }
    }

    const widthUnit = this.viewport.widthUnit === 'percent' ? '%' : 'px';
    const heightUnit = this.viewport.heightUnit === 'percent' ? '%' : 'px';

    this._canvas.style.width = this.viewport.width + widthUnit;
    this._canvas.style.height = this.viewport.height + heightUnit;

    // After messing with the canvas width/height the graphics context is invalidated and needs to have some properties reset
    this.graphicsContext.updateViewport(this.resolution);
    this.graphicsContext.resetTransform();
    this.graphicsContext.smoothing = this._antialiasing;
    if (this.graphicsContext instanceof ExcaliburGraphicsContext2DCanvas) {
      this.graphicsContext.scale(this.pixelRatio, this.pixelRatio);
    }
    // Add the excalibur world pixel to page pixel
    document.documentElement.style.setProperty('--ex-pixel-ratio', this.worldToPagePixelRatio.toString());
  }

  /**
   * Get or set screen antialiasing,
   *
   * If true smoothing is applied
   */
  public get antialiasing() {
    return this._antialiasing;
  }

  /**
   * Get or set screen antialiasing
   */
  public set antialiasing(isSmooth: boolean) {
    this._antialiasing = isSmooth;
    this.graphicsContext.smoothing = this._antialiasing;
  }

  /**
   * Returns true if excalibur is fullscreen using the browser fullscreen api
   * @deprecated use isFullscreen()
   */
  public get isFullScreen() {
    return this._isFullscreen;
  }

  /**
   * Returns true if excalibur is fullscreen using the browser fullscreen api
   */
  public get isFullscreen() {
    return this._isFullscreen;
  }

  /**
   * Requests to go fullscreen using the browser fullscreen api, requires user interaction to be successful.
   * For example, wire this to a user click handler.
   *
   * Optionally specify a target element id to go fullscreen, by default the game canvas is used
   * @param elementId
   * @deprecated use enterFullscreen(...)
   */
  public goFullScreen(elementId?: string): Promise<void> {
    return this.enterFullscreen(elementId);
  }

  /**
   * Requests to enter fullscreen using the browser fullscreen api, requires user interaction to be successful.
   * For example, wire this to a user click handler.
   *
   * Optionally specify a target element id to go fullscreen, by default the game canvas is used
   * @param elementId
   */
  public enterFullscreen(elementId?: string): Promise<void> {
    if (elementId) {
      const maybeElement = document.getElementById(elementId);
      // workaround for safari partial support
      if (maybeElement?.requestFullscreen || (maybeElement as any)?.webkitRequestFullscreen) {
        if (!maybeElement.getAttribute('ex-fullscreen-listener')) {
          maybeElement.setAttribute('ex-fullscreen-listener', 'true');
          maybeElement.addEventListener('fullscreenchange', this._fullscreenChangeHandler);
        }
        if (maybeElement.requestFullscreen) {
          return maybeElement.requestFullscreen() ?? Promise.resolve();
        } else if ((maybeElement as any).webkitRequestFullscreen) {
          return (maybeElement as any).webkitRequestFullscreen() ?? Promise.resolve();
        }
      }
    }
    if (this._canvas?.requestFullscreen) {
      return this._canvas?.requestFullscreen() ?? Promise.resolve();
    } else if ((this._canvas as any).webkitRequestFullscreen) {
      return (this._canvas as any).webkitRequestFullscreen() ?? Promise.resolve();
    }
    this._logger.warnOnce('Could not go fullscreen, is this an iPhone? Currently Apple does not support fullscreen on iPhones');
    return Promise.resolve();
  }

  /**
   * Requests to exit fullscreen using the browser fullscreen api
   * @deprecated use exitFullscreen()
   */
  public exitFullScreen(): Promise<void> {
    return this.exitFullscreen();
  }

  public exitFullscreen(): Promise<void> {
    return document.exitFullscreen();
  }

  private _viewportToPixels(viewport: ViewportDimension) {
    return {
      width: viewport.widthUnit === 'percent' ? this.canvas.offsetWidth : viewport.width,
      height: viewport.heightUnit === 'percent' ? this.canvas.offsetHeight : viewport.height
    } satisfies ViewportDimension;
  }

  /**
   * Takes a coordinate in normal html page space, for example from a pointer move event, and translates it to
   * Excalibur screen space.
   *
   * Excalibur screen space starts at the top left (0, 0) corner of the viewport, and extends to the
   * bottom right corner (resolutionX, resolutionY). When using *AndFill suffixed display modes screen space
   * (0, 0) is the top left of the safe content area bounding box not the viewport.
   * @param point
   */
  public pageToScreenCoordinates(point: Vector): Vector {
    let newX = point.x;
    let newY = point.y;

    if (!this._isFullscreen) {
      newX -= getPosition(this._canvas).x;
      newY -= getPosition(this._canvas).y;
    }

    const viewport = this._viewportToPixels(this.viewport);

    // if fullscreen api on it centers with black bars
    // we need to adjust the screen to world coordinates in this case
    if (this._isFullscreen) {
      if (window.innerWidth / this.aspectRatio < window.innerHeight) {
        const screenHeight = window.innerWidth / this.aspectRatio;
        const screenMarginY = (window.innerHeight - screenHeight) / 2;
        newY = ((newY - screenMarginY) / screenHeight) * viewport.height;
        newX = (newX / window.innerWidth) * viewport.width;
      } else {
        const screenWidth = window.innerHeight * this.aspectRatio;
        const screenMarginX = (window.innerWidth - screenWidth) / 2;
        newX = ((newX - screenMarginX) / screenWidth) * viewport.width;
        newY = (newY / window.innerHeight) * viewport.height;
      }
    }

    newX = (newX / viewport.width) * this.resolution.width;
    newY = (newY / viewport.height) * this.resolution.height;

    // offset by content area
    newX = newX - this.contentArea.left;
    newY = newY - this.contentArea.top;

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

    // no need to offset by content area, drawing is already offset by this

    const viewport = this._viewportToPixels(this.viewport);

    newX = (newX / this.resolution.width) * viewport.width;
    newY = (newY / this.resolution.height) * viewport.height;

    if (this._isFullscreen) {
      if (window.innerWidth / this.aspectRatio < window.innerHeight) {
        const screenHeight = window.innerWidth / this.aspectRatio;
        const screenMarginY = (window.innerHeight - screenHeight) / 2;
        newY = (newY / viewport.height) * screenHeight + screenMarginY;
        newX = (newX / viewport.width) * window.innerWidth;
      } else {
        const screenWidth = window.innerHeight * this.aspectRatio;
        const screenMarginX = (window.innerWidth - screenWidth) / 2;
        newX = (newX / viewport.width) * screenWidth + screenMarginX;
        newY = (newY / viewport.height) * window.innerHeight;
      }
    }

    if (!this._isFullscreen) {
      newX += getPosition(this._canvas).x;
      newY += getPosition(this._canvas).y;
    }

    return new Vector(newX, newY);
  }

  /**
   * Takes a coordinate in Excalibur screen space, and translates it to Excalibur world space.
   *
   * World space is where {@apilink Entity | `entities`} in Excalibur live by default {@apilink CoordPlane.World}
   * and extends infinitely out relative from the {@apilink Camera}.
   * @param point  Screen coordinate to convert
   */
  public screenToWorldCoordinates(point: Vector): Vector {
    // offset by content area
    point = point.add(vec(this.contentArea.left, this.contentArea.top));

    // the only difference between screen & world is the camera transform
    if (this._camera) {
      return this._camera.inverse.multiply(point);
    }
    return point.sub(vec(this.resolution.width / 2, this.resolution.height / 2));
  }

  /**
   * Takes a coordinate in Excalibur world space, and translates it to Excalibur screen space.
   *
   * Screen space is where {@apilink ScreenElement | `screen elements`} and {@apilink Entity | `entities`} with {@apilink CoordPlane.Screen} live.
   * @param point  World coordinate to convert
   */
  public worldToScreenCoordinates(point: Vector): Vector {
    if (this._camera) {
      return this._camera.transform.multiply(point);
    }
    return point.add(vec(this.resolution.width / 2, this.resolution.height / 2));
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
   * World bounds are in world coordinates, useful for culling objects offscreen that are in world space
   */
  public getWorldBounds(): BoundingBox {
    const bounds = BoundingBox.fromDimension(this.resolution.width, this.resolution.height, Vector.Half)
      .scale(vec(1 / this._camera.zoom, 1 / this._camera.zoom))
      .rotate(this._camera.rotation)
      .translate(this._camera.drawPos);
    return bounds;
  }

  /**
   * Returns a BoundingBox of the top left corner of the screen and the bottom right corner of the screen.
   *
   * Screen bounds are in screen coordinates, useful for culling objects offscreen that are in screen space
   */
  public getScreenBounds(): BoundingBox {
    const bounds = BoundingBox.fromDimension(this.resolution.width, this.resolution.height, Vector.Zero, Vector.Zero);
    return bounds;
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
      return this.resolution.width / this._camera.zoom;
    }
    return this.resolution.width;
  }

  /**
   * Returns the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
   */
  public get width(): number {
    if (this._camera) {
      return this.resolution.width / this._camera.zoom;
    }
    return this.resolution.width;
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
      return this.resolution.height / this._camera.zoom;
    }
    return this.resolution.height;
  }

  public get height(): number {
    if (this._camera) {
      return this.resolution.height / this._camera.zoom;
    }
    return this.resolution.height;
  }

  /**
   * Returns half the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
   */
  public get halfDrawHeight(): number {
    return this.drawHeight / 2;
  }

  /**
   * Returns screen center coordinates including zoom and device pixel ratio.
   */
  public get center(): Vector {
    return vec(this.halfDrawWidth, this.halfDrawHeight);
  }

  /**
   * Returns the content area in screen space where it is safe to place content
   */
  public get contentArea(): BoundingBox {
    return this._contentArea;
  }

  /**
   * Returns the unsafe area in screen space, this is the full screen and some space may not be onscreen.
   */
  public get unsafeArea(): BoundingBox {
    return this._unsafeArea;
  }

  private _contentArea: BoundingBox = new BoundingBox();
  private _unsafeArea: BoundingBox = new BoundingBox();

  private _computeFit() {
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
    this._contentArea = BoundingBox.fromDimension(this.resolution.width, this.resolution.height, Vector.Zero);
    this._unsafeArea = BoundingBox.fromDimension(this.resolution.width, this.resolution.height, Vector.Zero);
    this.events.emit('resize', {
      resolution: this.resolution,
      viewport: this.viewport
    } satisfies ScreenResizeEvent);
  }

  private _computeFitScreenAndFill() {
    document.body.style.margin = '0px';
    document.body.style.overflow = 'hidden';
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this._computeFitAndFill(vw, vh);
    this.events.emit('resize', {
      resolution: this.resolution,
      viewport: this.viewport
    } satisfies ScreenResizeEvent);
  }

  private _computeFitContainerAndFill() {
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    this._computeFitAndFill(this.canvas.offsetWidth, this.canvas.offsetHeight, {
      width: 100,
      widthUnit: 'percent',
      height: 100,
      heightUnit: 'percent'
    });
    this.events.emit('resize', {
      resolution: this.resolution,
      viewport: this.viewport
    } satisfies ScreenResizeEvent);
  }

  private _computeFitAndFill(vw: number, vh: number, viewport?: ViewportDimension) {
    this.viewport = viewport ?? {
      width: vw,
      height: vh
    };
    // if the current screen aspectRatio is less than the original aspectRatio
    if (vw / vh <= this._contentResolution.width / this._contentResolution.height) {
      // compute new resolution to match the original aspect ratio
      this.resolution = {
        width: (vw * this._contentResolution.width) / vw,
        height: (((vw * this._contentResolution.width) / vw) * vh) / vw
      };
      const clip = (this.resolution.height - this._contentResolution.height) / 2;
      this._contentArea = new BoundingBox({
        top: clip,
        left: 0,
        right: this._contentResolution.width,
        bottom: this.resolution.height - clip
      });
      this._unsafeArea = new BoundingBox({
        top: -clip,
        left: 0,
        right: this._contentResolution.width,
        bottom: this.resolution.height + clip
      });
    } else {
      this.resolution = {
        width: (((vh * this._contentResolution.height) / vh) * vw) / vh,
        height: (vh * this._contentResolution.height) / vh
      };
      const clip = (this.resolution.width - this._contentResolution.width) / 2;
      this._contentArea = new BoundingBox({
        top: 0,
        left: clip,
        right: this.resolution.width - clip,
        bottom: this._contentResolution.height
      });
      this._unsafeArea = new BoundingBox({
        top: 0,
        left: -clip,
        right: this.resolution.width + clip,
        bottom: this._contentResolution.height
      });
    }
  }

  private _computeFitScreenAndZoom() {
    document.body.style.margin = '0px';
    document.body.style.overflow = 'hidden';
    this.canvas.style.position = 'absolute';

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    this._computeFitAndZoom(vw, vh);
    this.events.emit('resize', {
      resolution: this.resolution,
      viewport: this.viewport
    } satisfies ScreenResizeEvent);
  }

  private _computeFitContainerAndZoom() {
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.position = 'relative';
    const parent = this.canvas.parentElement;
    parent.style.overflow = 'hidden';
    const { offsetWidth: vw, offsetHeight: vh } = this.canvas;

    this._computeFitAndZoom(vw, vh);
    this.events.emit('resize', {
      resolution: this.resolution,
      viewport: this.viewport
    } satisfies ScreenResizeEvent);
  }

  private _computeFitAndZoom(vw: number, vh: number) {
    const aspect = this.aspectRatio;
    let adjustedWidth = 0;
    let adjustedHeight = 0;
    if (vw / aspect < vh) {
      adjustedWidth = vw;
      adjustedHeight = vw / aspect;
    } else {
      adjustedWidth = vh * aspect;
      adjustedHeight = vh;
    }

    const scaleX = vw / adjustedWidth;
    const scaleY = vh / adjustedHeight;

    const maxScaleFactor = Math.max(scaleX, scaleY);

    const zoomedWidth = adjustedWidth * maxScaleFactor;
    const zoomedHeight = adjustedHeight * maxScaleFactor;

    // Center zoomed dimension if bigger than the screen
    if (zoomedWidth > vw) {
      this.canvas.style.left = -(zoomedWidth - vw) / 2 + 'px';
    } else {
      this.canvas.style.left = '';
    }

    if (zoomedHeight > vh) {
      this.canvas.style.top = -(zoomedHeight - vh) / 2 + 'px';
    } else {
      this.canvas.style.top = '';
    }

    this.viewport = {
      width: zoomedWidth,
      height: zoomedHeight
    };

    const bounds = BoundingBox.fromDimension(this.viewport.width, this.viewport.height, Vector.Zero);
    // return safe area
    if (this.viewport.width > vw) {
      const clip = ((this.viewport.width - vw) / this.viewport.width) * this.resolution.width;
      bounds.top = 0;
      bounds.left = clip / 2;
      bounds.right = this.resolution.width - clip / 2;
      bounds.bottom = this.resolution.height;
    }

    if (this.viewport.height > vh) {
      const clip = ((this.viewport.height - vh) / this.viewport.height) * this.resolution.height;
      bounds.top = clip / 2;
      bounds.left = 0;
      bounds.bottom = this.resolution.height - clip / 2;
      bounds.right = this.resolution.width;
    }
    this._contentArea = bounds;
  }

  private _computeFitContainer() {
    const aspect = this.aspectRatio;
    let adjustedWidth = 0;
    let adjustedHeight = 0;
    let widthUnit: ViewportUnit = 'pixel';
    let heightUnit: ViewportUnit = 'pixel';
    const parent = this.canvas.parentElement;
    if (parent.clientWidth / aspect < parent.clientHeight) {
      this.canvas.style.width = '100%';
      adjustedWidth = 100;
      widthUnit = 'percent';
      adjustedHeight = this.canvas.offsetWidth / aspect;
    } else {
      this.canvas.style.height = '100%';
      adjustedHeight = 100;
      heightUnit = 'percent';
      adjustedWidth = this.canvas.offsetHeight * aspect;
    }

    this.viewport = {
      width: adjustedWidth,
      widthUnit,
      height: adjustedHeight,
      heightUnit
    };
    this._contentArea = BoundingBox.fromDimension(this.resolution.width, this.resolution.height, Vector.Zero);
    this.events.emit('resize', {
      resolution: this.resolution,
      viewport: this.viewport
    } satisfies ScreenResizeEvent);
  }

  private _applyDisplayMode() {
    this._setResolutionAndViewportByDisplayMode(this.parent);

    // watch resizing
    if (this.parent instanceof Window) {
      this._browser.window.on('resize', this._resizeHandler);
    } else {
      this._resizeObserver = new ResizeObserver(() => {
        this._resizeHandler();
      });
      this._resizeObserver.observe(this.parent);
    }
    this.parent.addEventListener('resize', this._resizeHandler);
  }

  /**
   * Sets the resolution and viewport based on the selected display mode.
   */
  private _setResolutionAndViewportByDisplayMode(parent: HTMLElement | Window) {
    if (this.displayMode === DisplayMode.FillContainer) {
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.viewport = {
        width: 100,
        widthUnit: 'percent',
        height: 100,
        heightUnit: 'percent'
      };
      this.resolution = {
        width: this.canvas.offsetWidth,
        height: this.canvas.offsetHeight
      };
    }

    if (this.displayMode === DisplayMode.FillScreen) {
      document.body.style.margin = '0px';
      document.body.style.overflow = 'hidden';
      this.resolution = {
        width: (<Window>parent).innerWidth,
        height: (<Window>parent).innerHeight
      };

      this.viewport = this.resolution;
    }

    this._contentArea = BoundingBox.fromDimension(this.resolution.width, this.resolution.height, Vector.Zero);

    if (this.displayMode === DisplayMode.FitScreen) {
      this._computeFit();
    }

    if (this.displayMode === DisplayMode.FitContainer) {
      this._computeFitContainer();
    }

    if (this.displayMode === DisplayMode.FitScreenAndFill) {
      this._computeFitScreenAndFill();
    }

    if (this.displayMode === DisplayMode.FitContainerAndFill) {
      this._computeFitContainerAndFill();
    }

    if (this.displayMode === DisplayMode.FitScreenAndZoom) {
      this._computeFitScreenAndZoom();
    }

    if (this.displayMode === DisplayMode.FitContainerAndZoom) {
      this._computeFitContainerAndZoom();
    }
  }
}
