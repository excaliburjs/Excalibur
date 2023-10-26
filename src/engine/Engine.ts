import { EX_VERSION } from './';
import { EventEmitter, EventKey, Handler, Subscription } from './EventEmitter';
import { Gamepads } from './Input/Gamepad';
import { Keyboard } from './Input/Keyboard';
import { PointerScope } from './Input/PointerScope';
import { EngineInput } from './Input/EngineInput';
import { Flags } from './Flags';
import { polyfill } from './Polyfill';
polyfill();
import { CanUpdate, CanDraw, CanInitialize } from './Interfaces/LifecycleEvents';
import { Loadable } from './Interfaces/Loadable';
import { Vector } from './Math/vector';
import { Screen, DisplayMode, ScreenDimension, Resolution } from './Screen';
import { ScreenElement } from './ScreenElement';
import { Actor } from './Actor';
import { Timer } from './Timer';
import { TileMap } from './TileMap';
import { Loader } from './Loader';
import { Detector } from './Util/Detector';
import {
  VisibleEvent,
  HiddenEvent,
  GameStartEvent,
  GameStopEvent,
  PreUpdateEvent,
  PostUpdateEvent,
  PreFrameEvent,
  PostFrameEvent,
  DeactivateEvent,
  ActivateEvent,
  PreDrawEvent,
  PostDrawEvent,
  InitializeEvent
} from './Events';
import { Logger, LogLevel } from './Util/Log';
import { Color } from './Color';
import { Scene } from './Scene';
import { Entity } from './EntityComponentSystem/Entity';
import { Debug, DebugStats } from './Debug/Debug';
import { BrowserEvents } from './Util/Browser';
import { ExcaliburGraphicsContext, ExcaliburGraphicsContext2DCanvas, ExcaliburGraphicsContextWebGL, TextureLoader } from './Graphics';
import { PointerEventReceiver } from './Input/PointerEventReceiver';
import { Clock, StandardClock } from './Util/Clock';
import { ImageFiltering } from './Graphics/Filtering';
import { GraphicsDiagnostics } from './Graphics/GraphicsDiagnostics';
import { Toaster } from './Util/Toaster';
import { InputMapper } from './Input/InputMapper';

export type EngineEvents = {
  fallbackgraphicscontext: ExcaliburGraphicsContext2DCanvas,
  initialize: InitializeEvent<Engine>,
  visible: VisibleEvent,
  hidden: HiddenEvent,
  start: GameStartEvent,
  stop: GameStopEvent,
  preupdate: PreUpdateEvent<Engine>,
  postupdate: PostUpdateEvent<Engine>,
  preframe: PreFrameEvent,
  postframe: PostFrameEvent,
  predraw: PreDrawEvent,
  postdraw: PostDrawEvent,
}

export const EngineEvents = {
  FallbackGraphicsContext: 'fallbackgraphicscontext',
  Initialize: 'initialize',
  Visible: 'visible',
  Hidden: 'hidden',
  Start: 'start',
  Stop: 'stop',
  PreUpdate: 'preupdate',
  PostUpdate: 'postupdate',
  PreFrame: 'preframe',
  PostFrame: 'postframe',
  PreDraw: 'predraw',
  PostDraw: 'postdraw'
} as const;

/**
 * Enum representing the different mousewheel event bubble prevention
 */
export enum ScrollPreventionMode {
  /**
   * Do not prevent any page scrolling
   */
  None,
  /**
   * Prevent page scroll if mouse is over the game canvas
   */
  Canvas,
  /**
   * Prevent all page scrolling via mouse wheel
   */
  All
}

/**
 * Defines the available options to configure the Excalibur engine at constructor time.
 */
export interface EngineOptions {
  /**
   * Optionally configure the width of the viewport in css pixels
   */
  width?: number;

  /**
   * Optionally configure the height of the viewport in css pixels
   */
  height?: number;

  /**
   * Optionally configure the width & height of the viewport in css pixels.
   * Use `viewport` instead of [[EngineOptions.width]] and [[EngineOptions.height]], or vice versa.
   */
  viewport?: ScreenDimension;

  /**
   * Optionally specify the size the logical pixel resolution, if not specified it will be width x height.
   * See [[Resolution]] for common presets.
   */
  resolution?: ScreenDimension;

  /**
   * Optionally specify antialiasing (smoothing), by default true (smooth pixels)
   *
   *  * `true` - useful for high resolution art work you would like smoothed, this also hints excalibur to load images
   * with [[ImageFiltering.Blended]]
   *
   *  * `false` - useful for pixel art style art work you would like sharp, this also hints excalibur to load images
   * with [[ImageFiltering.Pixel]]
   */
  antialiasing?: boolean;

  /**
   * Optionally upscale the number of pixels in the canvas. Normally only useful if you need a smoother look to your assets, especially
   * [[Text]].
   *
   * **WARNING** It is recommended you try using `antialiasing: true` before adjusting pixel ratio. Pixel ratio will consume more memory
   * and on mobile may break if the internal size of the canvas exceeds 4k pixels in width or height.
   *
   * Default is based the display's pixel ratio, for example a HiDPI screen might have the value 2;
   */
  pixelRatio?: number;

  /**
   * Optionally configure the native canvas transparent backdrop
   */
  enableCanvasTransparency?: boolean;

  /**
   * Optionally specify the target canvas DOM element to render the game in
   */
  canvasElementId?: string;

  /**
   * Optionally specify the target canvas DOM element directly
   */
  canvasElement?: HTMLCanvasElement;

  /**
   * Optionally snap graphics to nearest pixel, default is false
   */
  snapToPixel?: boolean;

  /**
   * The [[DisplayMode]] of the game, by default [[DisplayMode.FitScreen]] with aspect ratio 4:3 (800x600).
   * Depending on this value, [[width]] and [[height]] may be ignored.
   */
  displayMode?: DisplayMode;

  /**
   * Configures the pointer scope. Pointers scoped to the 'Canvas' can only fire events within the canvas viewport; whereas, 'Document'
   * (default) scoped will fire anywhere on the page.
   */
  pointerScope?: PointerScope;

  /**
   * Suppress boot up console message, which contains the "powered by Excalibur message"
   */
  suppressConsoleBootMessage?: boolean;

  /**
   * Suppress minimum browser feature detection, it is not recommended users of excalibur switch this off. This feature ensures that
   * the currently running browser meets the minimum requirements for running excalibur. This can be useful if running on non-standard
   * browsers or if there is a bug in excalibur preventing execution.
   */
  suppressMinimumBrowserFeatureDetection?: boolean;

  /**
   * Suppress HiDPI auto detection and scaling, it is not recommended users of excalibur switch off this feature. This feature detects
   * and scales the drawing canvas appropriately to accommodate HiDPI screens.
   */
  suppressHiDPIScaling?: boolean;

  /**
   * Suppress play button, it is not recommended users of excalibur switch this feature. Some browsers require a user gesture (like a click)
   * for certain browser features to work like web audio.
   */
  suppressPlayButton?: boolean;

  /**
   * Sets the focus of the window, this is needed when hosting excalibur in a cross-origin iframe in order for certain events
   * (like keyboard) to work.
   * For example: itch.io or codesandbox.io
   *
   * By default set to true,
   */
  grabWindowFocus?: boolean;

  /**
   * Scroll prevention method.
   */
  scrollPreventionMode?: ScrollPreventionMode;

  /**
   * Optionally set the background color
   */
  backgroundColor?: Color;

  /**
   * Optionally set the maximum fps if not set Excalibur will go as fast as the device allows.
   *
   * You may want to constrain max fps if your game cannot maintain fps consistently, it can look and feel better to have a 30fps game than
   * one that bounces between 30fps and 60fps
   */
  maxFps?: number;

  /**
   * Optionally configure a fixed update fps, this can be desireable if you need the physics simulation to be very stable. When set
   * the update step and physics will use the same elapsed time for each tick even if the graphical framerate drops. In order for the
   * simulation to be correct, excalibur will run multiple updates in a row (at the configured update elapsed) to catch up, for example
   * there could be X updates and 1 draw each clock step.
   *
   * **NOTE:** This does come at a potential perf cost because each catch-up update will need to be run if the fixed rate is greater than
   * the current instantaneous framerate, or perf gain if the fixed rate is less than the current framerate.
   *
   * By default is unset and updates will use the current instantaneous framerate with 1 update and 1 draw each clock step.
   */
  fixedUpdateFps?: number

  /**
   * Default `true`, optionally configure excalibur to use optimal draw call sorting, to opt out set this to `false`.
   *
   * Excalibur will automatically sort draw calls by z and priority into renderer batches for maximal draw performance,
   * this can disrupt a specific desired painter order.
   */
  useDrawSorting?: boolean;

  /**
   * Optionally configure how excalibur handles poor performance on a player's browser
   */
  configurePerformanceCanvas2DFallback?: {
    /**
     * By default `true`, this will switch the internal graphics context to Canvas2D which can improve performance on non hardware
     * accelerated browsers.
     */
    allow: boolean;
    /**
     * By default `false`, if set to `true` a dialogue will be presented to the player about their browser and how to potentially
     * address any issues.
     */
    showPlayerMessage?: boolean;
    /**
     * Default `{ numberOfFrames: 100, fps: 20 }`, optionally configure excalibur to fallback to the 2D Canvas renderer
     * if bad performance is detected.
     *
     * In this example of the default if excalibur is running at 20fps or less for 100 frames it will trigger the fallback to the 2D
     * Canvas renderer.
     */
    threshold?: { numberOfFrames: number, fps: number };
  }
}

/**
 * The Excalibur Engine
 *
 * The [[Engine]] is the main driver for a game. It is responsible for
 * starting/stopping the game, maintaining state, transmitting events,
 * loading resources, and managing the scene.
 */
export class Engine implements CanInitialize, CanUpdate, CanDraw {
  /**
   * Listen to and emit events on the Engine
   */
  public events = new EventEmitter<EngineEvents>();

  /**
   * Excalibur browser events abstraction used for wiring to native browser events safely
   */
  public browser: BrowserEvents;

  /**
   * Screen abstraction
   */
  public screen: Screen;

  /**
   * Direct access to the engine's canvas element
   */
  public canvas: HTMLCanvasElement;

  /**
   * Direct access to the ExcaliburGraphicsContext used for drawing things to the screen
   */
  public graphicsContext: ExcaliburGraphicsContext;

  /**
   * Direct access to the canvas element ID, if an ID exists
   */
  public canvasElementId: string;

  /**
   * Optionally set the maximum fps if not set Excalibur will go as fast as the device allows.
   *
   * You may want to constrain max fps if your game cannot maintain fps consistently, it can look and feel better to have a 30fps game than
   * one that bounces between 30fps and 60fps
   */
  public maxFps: number = Number.POSITIVE_INFINITY;

  /**
   * Optionally configure a fixed update fps, this can be desireable if you need the physics simulation to be very stable. When set
   * the update step and physics will use the same elapsed time for each tick even if the graphical framerate drops. In order for the
   * simulation to be correct, excalibur will run multiple updates in a row (at the configured update elapsed) to catch up, for example
   * there could be X updates and 1 draw each clock step.
   *
   * **NOTE:** This does come at a potential perf cost because each catch-up update will need to be run if the fixed rate is greater than
   * the current instantaneous framerate, or perf gain if the fixed rate is less than the current framerate.
   *
   * By default is unset and updates will use the current instantaneous framerate with 1 update and 1 draw each clock step.
   */
  public fixedUpdateFps?: number;

  /**
   * Direct access to the excalibur clock
   */
  public clock: Clock;

  /**
   * The width of the game canvas in pixels (physical width component of the
   * resolution of the canvas element)
   */
  public get canvasWidth(): number {
    return this.screen.canvasWidth;
  }

  /**
   * Returns half width of the game canvas in pixels (half physical width component)
   */
  public get halfCanvasWidth(): number {
    return this.screen.halfCanvasWidth;
  }

  /**
   * The height of the game canvas in pixels, (physical height component of
   * the resolution of the canvas element)
   */
  public get canvasHeight(): number {
    return this.screen.canvasHeight;
  }

  /**
   * Returns half height of the game canvas in pixels (half physical height component)
   */
  public get halfCanvasHeight(): number {
    return this.screen.halfCanvasHeight;
  }

  /**
   * Returns the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
   */
  public get drawWidth(): number {
    return this.screen.drawWidth;
  }

  /**
   * Returns half the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
   */
  public get halfDrawWidth(): number {
    return this.screen.halfDrawWidth;
  }

  /**
   * Returns the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
   */
  public get drawHeight(): number {
    return this.screen.drawHeight;
  }

  /**
   * Returns half the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
   */
  public get halfDrawHeight(): number {
    return this.screen.halfDrawHeight;
  }

  /**
   * Returns whether excalibur detects the current screen to be HiDPI
   */
  public get isHiDpi(): boolean {
    return this.screen.isHiDpi;
  }

  /**
   * Access engine input like pointer, keyboard, or gamepad
   */
  public input: EngineInput;

  /**
   * Map multiple input sources to specific game actions actions
   */
  public inputMapper: InputMapper;

  /**
   * Access Excalibur debugging functionality.
   *
   * Useful when you want to debug different aspects of built in engine features like
   *   * Transform
   *   * Graphics
   *   * Colliders
   */
  public debug: Debug;

  /**
   * Access [[stats]] that holds frame statistics.
   */
  public get stats(): DebugStats {
    return this.debug.stats;
  }

  /**
   * The current [[Scene]] being drawn and updated on screen
   */
  public currentScene: Scene;

  /**
   * The default [[Scene]] of the game, use [[Engine.goToScene]] to transition to different scenes.
   */
  public readonly rootScene: Scene;

  /**
   * Contains all the scenes currently registered with Excalibur
   */
  public readonly scenes: { [key: string]: Scene } = {};

  /**
   * Indicates whether the engine is set to fullscreen or not
   */
  public get isFullscreen(): boolean {
    return this.screen.isFullScreen;
  }

  /**
   * Indicates the current [[DisplayMode]] of the engine.
   */
  public get displayMode(): DisplayMode {
    return this.screen.displayMode;
  }

  private _suppressPlayButton: boolean = false;
  /**
   * Returns the calculated pixel ration for use in rendering
   */
  public get pixelRatio(): number {
    return this.screen.pixelRatio;
  }

  /**
   * Indicates whether audio should be paused when the game is no longer visible.
   */
  public pauseAudioWhenHidden: boolean = true;

  /**
   * Indicates whether the engine should draw with debug information
   */
  private _isDebug: boolean = false;
  public get isDebug(): boolean {
    return this._isDebug;
  }

  /**
   * Sets the background color for the engine.
   */
  public backgroundColor: Color;

  /**
   * Sets the Transparency for the engine.
   */
  public enableCanvasTransparency: boolean = true;

  /**
   * Hints the graphics context to truncate fractional world space coordinates
   */
  public get snapToPixel(): boolean {
    return this.graphicsContext.snapToPixel;
  };

  public set snapToPixel(shouldSnapToPixel: boolean) {
    this.graphicsContext.snapToPixel = shouldSnapToPixel;
  };

  /**
   * The action to take when a fatal exception is thrown
   */
  public onFatalException = (e: any) => {
    Logger.getInstance().fatal(e);
  };

  /**
   * The mouse wheel scroll prevention mode
   */
  public pageScrollPreventionMode: ScrollPreventionMode;

  private _logger: Logger;

  private _toaster: Toaster = new Toaster();

  // this determines whether excalibur is compatible with your browser
  private _compatible: boolean;

  private _timescale: number = 1.0;

  // loading
  private _loader: Loader;

  private _isInitialized: boolean = false;

  private _deferredGoTo: string = null;

  public emit<TEventName extends EventKey<EngineEvents>>(eventName: TEventName, event: EngineEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<EngineEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<EngineEvents>>(eventName: TEventName, handler: Handler<EngineEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<EngineEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<EngineEvents>>(eventName: TEventName, handler: Handler<EngineEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<EngineEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<EngineEvents>>(eventName: TEventName, handler: Handler<EngineEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<EngineEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    this.events.off(eventName, handler);
  }

  /**
   * Default [[EngineOptions]]
   */
  private static _DEFAULT_ENGINE_OPTIONS: EngineOptions = {
    width: 0,
    height: 0,
    enableCanvasTransparency: true,
    useDrawSorting: true,
    configurePerformanceCanvas2DFallback: {
      allow: true,
      showPlayerMessage: false,
      threshold: { fps: 20, numberOfFrames: 100 }
    },
    canvasElementId: '',
    canvasElement: undefined,
    snapToPixel: false,
    pointerScope: PointerScope.Canvas,
    suppressConsoleBootMessage: null,
    suppressMinimumBrowserFeatureDetection: null,
    suppressHiDPIScaling: null,
    suppressPlayButton: null,
    grabWindowFocus: true,
    scrollPreventionMode: ScrollPreventionMode.Canvas,
    backgroundColor: Color.fromHex('#2185d0') // Excalibur blue
  };

  private _originalOptions: EngineOptions = {};
  public readonly _originalDisplayMode: DisplayMode;

  /**
   * Creates a new game using the given [[EngineOptions]]. By default, if no options are provided,
   * the game will be rendered full screen (taking up all available browser window space).
   * You can customize the game rendering through [[EngineOptions]].
   *
   * Example:
   *
   * ```js
   * var game = new ex.Engine({
   *   width: 0, // the width of the canvas
   *   height: 0, // the height of the canvas
   *   enableCanvasTransparency: true, // the transparencySection of the canvas
   *   canvasElementId: '', // the DOM canvas element ID, if you are providing your own
   *   displayMode: ex.DisplayMode.FullScreen, // the display mode
   *   pointerScope: ex.PointerScope.Document, // the scope of capturing pointer (mouse/touch) events
   *   backgroundColor: ex.Color.fromHex('#2185d0') // background color of the engine
   * });
   *
   * // call game.start, which is a Promise
   * game.start().then(function () {
   *   // ready, set, go!
   * });
   * ```
   */
  constructor(options?: EngineOptions) {
    options = { ...Engine._DEFAULT_ENGINE_OPTIONS, ...options };
    this._originalOptions = options;

    Flags.freeze();

    // Initialize browser events facade
    this.browser = new BrowserEvents(window, document);

    // Check compatibility
    const detector = new Detector();
    if (!options.suppressMinimumBrowserFeatureDetection && !(this._compatible = detector.test())) {
      const message = document.createElement('div');
      message.innerText = 'Sorry, your browser does not support all the features needed for Excalibur';
      document.body.appendChild(message);

      detector.failedTests.forEach(function (test) {
        const testMessage = document.createElement('div');
        testMessage.innerText = 'Browser feature missing ' + test;
        document.body.appendChild(testMessage);
      });

      if (options.canvasElementId) {
        const canvas = document.getElementById(options.canvasElementId);
        if (canvas) {
          canvas.parentElement.removeChild(canvas);
        }
      }

      return;
    } else {
      this._compatible = true;
    }

    // Use native console API for color fun
    // eslint-disable-next-line no-console
    if (console.log && !options.suppressConsoleBootMessage) {
      // eslint-disable-next-line no-console
      console.log(
        `%cPowered by Excalibur.js (v${EX_VERSION})`,
        'background: #176BAA; color: white; border-radius: 5px; padding: 15px; font-size: 1.5em; line-height: 80px;'
      );
      // eslint-disable-next-line no-console
      console.log('\n\
      /| ________________\n\
O|===|* >________________>\n\
      \\|');
      // eslint-disable-next-line no-console
      console.log('Visit', 'http://excaliburjs.com', 'for more information');
    }

    // Suppress play button
    if (options.suppressPlayButton) {
      this._suppressPlayButton = true;
    }

    this._logger = Logger.getInstance();

    // If debug is enabled, let's log browser features to the console.
    if (this._logger.defaultLevel === LogLevel.Debug) {
      detector.logBrowserFeatures();
    }

    this._logger.debug('Building engine...');

    this.canvasElementId = options.canvasElementId;

    if (options.canvasElementId) {
      this._logger.debug('Using Canvas element specified: ' + options.canvasElementId);
      this.canvas = <HTMLCanvasElement>document.getElementById(options.canvasElementId);
    } else if (options.canvasElement) {
      this._logger.debug('Using Canvas element specified:', options.canvasElement);
      this.canvas = options.canvasElement;
    } else {
      this._logger.debug('Using generated canvas element');
      this.canvas = <HTMLCanvasElement>document.createElement('canvas');
    }

    let displayMode = options.displayMode ?? DisplayMode.Fixed;
    if ((options.width && options.height) || options.viewport) {
      if (options.displayMode === undefined) {
        displayMode = DisplayMode.Fixed;
      }
      this._logger.debug('Engine viewport is size ' + options.width + ' x ' + options.height);
    } else if (!options.displayMode) {
      this._logger.debug('Engine viewport is fit');
      displayMode = DisplayMode.FitScreen;
    }

    this._originalDisplayMode = displayMode;

    // Canvas 2D fallback can be flagged on
    let useCanvasGraphicsContext = Flags.isEnabled('use-canvas-context');
    if (!useCanvasGraphicsContext) {
      // Attempt webgl first
      try {
        this.graphicsContext = new ExcaliburGraphicsContextWebGL({
          canvasElement: this.canvas,
          enableTransparency: this.enableCanvasTransparency,
          smoothing: options.antialiasing,
          backgroundColor: options.backgroundColor,
          snapToPixel: options.snapToPixel,
          useDrawSorting: options.useDrawSorting
        });
      } catch (e) {
        this._logger.warn(
          `Excalibur could not load webgl for some reason (${(e as Error).message}) and loaded a Canvas 2D fallback. ` +
          `Some features of Excalibur will not work in this mode. \n\n` +
          'Read more about this issue at https://excaliburjs.com/docs/webgl'
        );
        // fallback to canvas in case of failure
        useCanvasGraphicsContext = true;
      }
    }

    if (useCanvasGraphicsContext) {
      this.graphicsContext = new ExcaliburGraphicsContext2DCanvas({
        canvasElement: this.canvas,
        enableTransparency: this.enableCanvasTransparency,
        smoothing: options.antialiasing,
        backgroundColor: options.backgroundColor,
        snapToPixel: options.snapToPixel,
        useDrawSorting: options.useDrawSorting
      });
    }

    this.screen = new Screen({
      canvas: this.canvas,
      context: this.graphicsContext,
      antialiasing: options.antialiasing ?? true,
      browser: this.browser,
      viewport: options.viewport ?? (options.width && options.height ? { width: options.width, height: options.height } : Resolution.SVGA),
      resolution: options.resolution,
      displayMode,
      pixelRatio: options.suppressHiDPIScaling ? 1 : (options.pixelRatio ?? null)
    });

    // Set default filtering based on antialiasing
    TextureLoader.filtering = options.antialiasing ? ImageFiltering.Blended : ImageFiltering.Pixel;

    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor.clone();
    }

    this.maxFps = options.maxFps ?? this.maxFps;
    this.fixedUpdateFps = options.fixedUpdateFps ?? this.fixedUpdateFps;

    this.clock = new StandardClock({
      maxFps: this.maxFps,
      tick: this._mainloop.bind(this),
      onFatalException: (e) => this.onFatalException(e)
    });

    this.enableCanvasTransparency = options.enableCanvasTransparency;

    this._loader = new Loader();
    this._loader.wireEngine(this);
    this.debug = new Debug(this);

    this._initialize(options);

    this.rootScene = this.currentScene = new Scene();

    this.addScene('root', this.rootScene);
    (window as any).___EXCALIBUR_DEVTOOL = this;
  }

  private _performanceThresholdTriggered = false;
  private _fpsSamples: number[] = [];
  private _monitorPerformanceThresholdAndTriggerFallback() {
    const { allow } = this._originalOptions.configurePerformanceCanvas2DFallback;
    let { threshold, showPlayerMessage } = this._originalOptions.configurePerformanceCanvas2DFallback;
    if (threshold === undefined) {
      threshold = Engine._DEFAULT_ENGINE_OPTIONS.configurePerformanceCanvas2DFallback.threshold;
    }
    if (showPlayerMessage === undefined) {
      showPlayerMessage = Engine._DEFAULT_ENGINE_OPTIONS.configurePerformanceCanvas2DFallback.showPlayerMessage;
    }
    if (!Flags.isEnabled('use-canvas-context') && allow && this.ready && !this._performanceThresholdTriggered) {
      // Calculate Average fps for last X number of frames after start
      if (this._fpsSamples.length === threshold.numberOfFrames) {
        this._fpsSamples.splice(0, 1);
      }
      this._fpsSamples.push(this.clock.fpsSampler.fps);
      let total = 0;
      for (let i = 0; i < this._fpsSamples.length; i++) {
        total += this._fpsSamples[i];
      }
      const average = total / this._fpsSamples.length;

      if (this._fpsSamples.length === threshold.numberOfFrames) {
        if (average <= threshold.fps) {
          this._performanceThresholdTriggered = true;
          this._logger.warn(
            `Switching to browser 2D Canvas fallback due to performance. Some features of Excalibur will not work in this mode.\n` +
            'this might mean your browser doesn\'t have webgl enabled or hardware acceleration is unavailable.\n\n' +
            'If in Chrome:\n' +
            '  * Visit Settings > Advanced > System, and ensure "Use Hardware Acceleration" is checked.\n'+
            '  * Visit chrome://flags/#ignore-gpu-blocklist and ensure "Override software rendering list" is "enabled"\n' +
            'If in Firefox, visit about:config\n' +
            '  * Ensure webgl.disabled = false\n' +
            '  * Ensure webgl.force-enabled = true\n' +
            '  * Ensure layers.acceleration.force-enabled = true\n\n' +
            'Read more about this issue at https://excaliburjs.com/docs/performance'
          );

          if (showPlayerMessage) {
            this._toaster.toast(
              'Excalibur is encountering performance issues. '+
              'It\'s possible that your browser doesn\'t have hardware acceleration enabled. ' +
              'Visit [LINK] for more information and potential solutions.',
              'https://excaliburjs.com/docs/performance'
            );
          }
          this.useCanvas2DFallback();
          this.emit('fallbackgraphicscontext', this.graphicsContext);
        }
      }
    }
  }

  /**
   * Switches the engine's graphics context to the 2D Canvas.
   * @warning Some features of Excalibur will not work in this mode.
   */
  public useCanvas2DFallback() {
    // Swap out the canvas
    const newCanvas = this.canvas.cloneNode(false) as HTMLCanvasElement;
    this.canvas.parentNode.replaceChild(newCanvas, this.canvas);
    this.canvas = newCanvas;

    const options = this._originalOptions;
    const displayMode = this._originalDisplayMode;

    // New graphics context
    this.graphicsContext = new ExcaliburGraphicsContext2DCanvas({
      canvasElement: this.canvas,
      enableTransparency: this.enableCanvasTransparency,
      smoothing: options.antialiasing,
      backgroundColor: options.backgroundColor,
      snapToPixel: options.snapToPixel,
      useDrawSorting: options.useDrawSorting
    });

    // Reset screen
    if (this.screen) {
      this.screen.dispose();
    }

    this.screen = new Screen({
      canvas: this.canvas,
      context: this.graphicsContext,
      antialiasing: options.antialiasing ?? true,
      browser: this.browser,
      viewport: options.viewport ?? (options.width && options.height ? { width: options.width, height: options.height } : Resolution.SVGA),
      resolution: options.resolution,
      displayMode,
      pixelRatio: options.suppressHiDPIScaling ? 1 : (options.pixelRatio ?? null)
    });
    this.screen.setCurrentCamera(this.currentScene.camera);

    // Reset pointers
    this.input.pointers.detach();
    const pointerTarget = options && options.pointerScope === PointerScope.Document ? document : this.canvas;
    this.input.pointers = this.input.pointers.recreate(pointerTarget, this);
    this.input.pointers.init();
  }

  /**
   * Returns a BoundingBox of the top left corner of the screen
   * and the bottom right corner of the screen.
   */
  public getWorldBounds() {
    return this.screen.getWorldBounds();
  }

  /**
   * Gets the current engine timescale factor (default is 1.0 which is 1:1 time)
   */
  public get timescale() {
    return this._timescale;
  }

  /**
   * Sets the current engine timescale factor. Useful for creating slow-motion effects or fast-forward effects
   * when using time-based movement.
   */
  public set timescale(value: number) {
    if (value <= 0) {
      Logger.getInstance().error('Cannot set engine.timescale to a value of 0 or less than 0.');
      return;
    }

    this._timescale = value;
  }

  /**
   * Adds a [[Timer]] to the [[currentScene]].
   * @param timer  The timer to add to the [[currentScene]].
   */
  public addTimer(timer: Timer): Timer {
    return this.currentScene.addTimer(timer);
  }

  /**
   * Removes a [[Timer]] from the [[currentScene]].
   * @param timer  The timer to remove to the [[currentScene]].
   */
  public removeTimer(timer: Timer): Timer {
    return this.currentScene.removeTimer(timer);
  }

  /**
   * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
   * would levels or menus.
   * @param key  The name of the scene, must be unique
   * @param scene The scene to add to the engine
   */
  public addScene(key: string, scene: Scene) {
    if (this.scenes[key]) {
      this._logger.warn('Scene', key, 'already exists overwriting');
    }
    this.scenes[key] = scene;
  }

  /**
   * Removes a [[Scene]] instance from the engine
   * @param scene  The scene to remove
   */
  public removeScene(scene: Scene): void;
  /**
   * Removes a scene from the engine by key
   * @param key  The scene key to remove
   */
  public removeScene(key: string): void;
  /**
   * @internal
   */
  public removeScene(entity: any): void {
    if (entity instanceof Scene) {
      // remove scene
      for (const key in this.scenes) {
        if (this.scenes.hasOwnProperty(key)) {
          if (this.scenes[key] === entity) {
            delete this.scenes[key];
          }
        }
      }
    }

    if (typeof entity === 'string') {
      // remove scene
      delete this.scenes[entity];
    }
  }

  /**
   * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
   * would levels or menus.
   * @param sceneKey  The key of the scene, must be unique
   * @param scene     The scene to add to the engine
   */
  public add(sceneKey: string, scene: Scene): void;
  /**
   * Adds a [[Timer]] to the [[currentScene]].
   * @param timer  The timer to add to the [[currentScene]].
   */
  public add(timer: Timer): void;
  /**
   * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
   * will be drawn and updated.
   */
  public add(tileMap: TileMap): void;
  /**
   * Adds an actor to the [[currentScene]] of the game. This is synonymous
   * to calling `engine.currentScene.add(actor)`.
   *
   * Actors can only be drawn if they are a member of a scene, and only
   * the [[currentScene]] may be drawn or updated.
   * @param actor  The actor to add to the [[currentScene]]
   */
  public add(actor: Actor): void;

  public add(entity: Entity): void;

  /**
   * Adds a [[ScreenElement]] to the [[currentScene]] of the game,
   * ScreenElements do not participate in collisions, instead the
   * remain in the same place on the screen.
   * @param screenElement  The ScreenElement to add to the [[currentScene]]
   */
  public add(screenElement: ScreenElement): void;
  public add(entity: any): void {
    if (arguments.length === 2) {
      this.addScene(<string>arguments[0], <Scene>arguments[1]);
      return;
    }
    if (this._deferredGoTo && this.scenes[this._deferredGoTo]) {
      this.scenes[this._deferredGoTo].add(entity);
    } else {
      this.currentScene.add(entity);
    }
  }

  /**
   * Removes a scene instance from the engine
   * @param scene  The scene to remove
   */
  public remove(scene: Scene): void;
  /**
   * Removes a scene from the engine by key
   * @param sceneKey  The scene to remove
   */
  public remove(sceneKey: string): void;
  /**
   * Removes a [[Timer]] from the [[currentScene]].
   * @param timer  The timer to remove to the [[currentScene]].
   */
  public remove(timer: Timer): void;
  /**
   * Removes a [[TileMap]] from the [[currentScene]], it will no longer be drawn or updated.
   */
  public remove(tileMap: TileMap): void;
  /**
   * Removes an actor from the [[currentScene]] of the game. This is synonymous
   * to calling `engine.currentScene.removeChild(actor)`.
   * Actors that are removed from a scene will no longer be drawn or updated.
   * @param actor  The actor to remove from the [[currentScene]].
   */
  public remove(actor: Actor): void;
  /**
   * Removes a [[ScreenElement]] to the scene, it will no longer be drawn or updated
   * @param screenElement  The ScreenElement to remove from the [[currentScene]]
   */
  public remove(screenElement: ScreenElement): void;
  public remove(entity: any): void {
    if (entity instanceof Entity) {
      this.currentScene.remove(entity);
    }

    if (entity instanceof Scene) {
      this.removeScene(entity);
    }

    if (typeof entity === 'string') {
      this.removeScene(entity);
    }
  }

  /**
   * Changes the currently updating and drawing scene to a different,
   * named scene. Calls the [[Scene]] lifecycle events.
   * @param key  The key of the scene to transition to.
   * @param data Optional data to send to the scene's onActivate method
   */
  public goToScene<TData = undefined>(key: string, data?: TData): void {
    // if not yet initialized defer goToScene
    if (!this.isInitialized) {
      this._deferredGoTo = key;
      return;
    }

    if (this.scenes[key]) {
      const previousScene = this.currentScene;
      const nextScene = this.scenes[key];

      this._logger.debug('Going to scene:', key);

      // only deactivate when initialized
      if (this.currentScene.isInitialized) {
        const context = { engine: this, previousScene, nextScene };
        this.currentScene._deactivate.apply(this.currentScene, [context, nextScene]);
        this.currentScene.events.emit('deactivate', new DeactivateEvent(context, this.currentScene));
      }

      // set current scene to new one
      this.currentScene = nextScene;
      this.screen.setCurrentCamera(nextScene.camera);

      // initialize the current scene if has not been already
      this.currentScene._initialize(this);

      const context = { engine: this, previousScene, nextScene, data };
      this.currentScene._activate.apply(this.currentScene, [context, nextScene]);
      this.currentScene.events.emit('activate', new ActivateEvent(context, this.currentScene));
    } else {
      this._logger.error('Scene', key, 'does not exist!');
    }
  }

  /**
   * Transforms the current x, y from screen coordinates to world coordinates
   * @param point  Screen coordinate to convert
   */
  public screenToWorldCoordinates(point: Vector): Vector {
    return this.screen.screenToWorldCoordinates(point);
  }

  /**
   * Transforms a world coordinate, to a screen coordinate
   * @param point  World coordinate to convert
   */
  public worldToScreenCoordinates(point: Vector): Vector {
    return this.screen.worldToScreenCoordinates(point);
  }

  /**
   * Initializes the internal canvas, rendering context, display mode, and native event listeners
   */
  private _initialize(options?: EngineOptions) {
    this.pageScrollPreventionMode = options.scrollPreventionMode;

    // initialize inputs
    const pointerTarget = options && options.pointerScope === PointerScope.Document ? document : this.canvas;
    this.input = {
      keyboard: new Keyboard(),
      pointers: new PointerEventReceiver(pointerTarget, this),
      gamepads: new Gamepads()
    };
    this.input.keyboard.init({
      grabWindowFocus: this._originalOptions?.grabWindowFocus ?? true
    });
    this.input.pointers.init({
      grabWindowFocus: this._originalOptions?.grabWindowFocus ?? true
    });
    this.input.gamepads.init();
    this.inputMapper = new InputMapper(this.input);

    // Issue #385 make use of the visibility api
    // https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API

    this.browser.document.on('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.events.emit('hidden', new HiddenEvent(this));
        this._logger.debug('Window hidden');
      } else if (document.visibilityState === 'visible') {
        this.events.emit('visible', new VisibleEvent(this));
        this._logger.debug('Window visible');
      }
    });

    if (!this.canvasElementId && !options.canvasElement) {
      document.body.appendChild(this.canvas);
    }
  }

  public onInitialize(_engine: Engine) {
    // Override me
  }

  /**
   * If supported by the browser, this will set the antialiasing flag on the
   * canvas. Set this to `false` if you want a 'jagged' pixel art look to your
   * image resources.
   * @param isSmooth  Set smoothing to true or false
   */
  public setAntialiasing(isSmooth: boolean) {
    this.screen.antialiasing = isSmooth;
  }

  /**
   * Return the current smoothing status of the canvas
   */
  public getAntialiasing(): boolean {
    return this.screen.antialiasing;
  }

  /**
   * Gets whether the actor is Initialized
   */
  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  private _overrideInitialize(engine: Engine) {
    if (!this.isInitialized) {
      this.onInitialize(engine);
      this.events.emit('initialize', new InitializeEvent(engine, this));
      this._isInitialized = true;
      if (this._deferredGoTo) {
        const deferredScene = this._deferredGoTo;
        this._deferredGoTo = null;
        this.goToScene(deferredScene);
      } else {
        this.goToScene('root');
      }
    }
  }

  /**
   * Updates the entire state of the game
   * @param delta  Number of milliseconds elapsed since the last update.
   */
  private _update(delta: number) {
    if (!this.ready) {
      // suspend updates until loading is finished
      this._loader.update(this, delta);
      // Update input listeners
      this.inputMapper.execute();
      this.input.keyboard.update();
      this.input.gamepads.update();
      return;
    }


    // Publish preupdate events
    this._preupdate(delta);

    // process engine level events
    this.currentScene.update(this, delta);

    // Update graphics postprocessors
    this.graphicsContext.updatePostProcessors(delta);

    // Publish update event
    this._postupdate(delta);

    // Update input listeners
    this.inputMapper.execute();
    this.input.keyboard.update();
    this.input.gamepads.update();
  }

  /**
   * @internal
   */
  public _preupdate(delta: number) {
    this.emit('preupdate', new PreUpdateEvent(this, delta, this));
    this.onPreUpdate(this, delta);
  }

  public onPreUpdate(_engine: Engine, _delta: number) {
    // Override me
  }

  /**
   * @internal
   */
  public _postupdate(delta: number) {
    this.emit('postupdate', new PostUpdateEvent(this, delta, this));
    this.onPostUpdate(this, delta);
  }

  public onPostUpdate(_engine: Engine, _delta: number) {
    // Override me
  }

  /**
   * Draws the entire game
   * @param delta  Number of milliseconds elapsed since the last draw.
   */
  private _draw(delta: number) {
    this.graphicsContext.beginDrawLifecycle();
    this.graphicsContext.clear();
    this._predraw(this.graphicsContext, delta);

    // Drawing nothing else while loading
    if (!this._isReady) {
      this._loader.canvas.draw(this.graphicsContext, 0, 0);
      this.graphicsContext.flush();
      return;
    }

    this.graphicsContext.backgroundColor = this.backgroundColor;

    this.currentScene.draw(this.graphicsContext, delta);

    this._postdraw(this.graphicsContext, delta);

    // Flush any pending drawings
    this.graphicsContext.flush();
    this.graphicsContext.endDrawLifecycle();

    this._checkForScreenShots();
  }

  /**
   * @internal
   */
  public _predraw(_ctx: ExcaliburGraphicsContext, delta: number) {
    this.emit('predraw', new PreDrawEvent(_ctx, delta, this));
    this.onPreDraw(_ctx, delta);
  }

  public onPreDraw(_ctx: ExcaliburGraphicsContext, _delta: number) {
    // Override me
  }

  /**
   * @internal
   */
  public _postdraw(_ctx: ExcaliburGraphicsContext, delta: number) {
    this.emit('postdraw', new PostDrawEvent(_ctx, delta, this));
    this.onPostDraw(_ctx, delta);
  }

  public onPostDraw(_ctx: ExcaliburGraphicsContext, _delta: number) {
    // Override me
  }

  /**
   * Enable or disable Excalibur debugging functionality.
   * @param toggle a value that debug drawing will be changed to
   */
  public showDebug(toggle: boolean): void {
    this._isDebug = toggle;
  }

  /**
   * Toggle Excalibur debugging functionality.
   */
  public toggleDebug(): boolean {
    this._isDebug = !this._isDebug;
    return this._isDebug;
  }

  private _loadingComplete: boolean = false;

  /**
   * Returns true when loading is totally complete and the player has clicked start
   */
  public get loadingComplete() {
    return this._loadingComplete;
  }

  private _isReady = false;
  public get ready() {
    return this._isReady;
  }
  private _isReadyResolve: () => any;
  private _isReadyPromise = new Promise<void>(resolve => {
    this._isReadyResolve = resolve;
  });
  public isReady(): Promise<void> {
    return this._isReadyPromise;
  }


  /**
   * Starts the internal game loop for Excalibur after loading
   * any provided assets.
   * @param loader  Optional [[Loader]] to use to load resources. The default loader is [[Loader]], override to provide your own
   * custom loader.
   *
   * Note: start() only resolves AFTER the user has clicked the play button
   */
  public async start(loader?: Loader): Promise<void> {
    if (!this._compatible) {
      throw new Error('Excalibur is incompatible with your browser');
    }

    // Wire loader if we have it
    if (loader) {
      // Push the current user entered resolution/viewport
      this.screen.pushResolutionAndViewport();

      // Configure resolution for loader, it expects resolution === viewport
      this.screen.resolution = this.screen.viewport;
      this.screen.applyResolutionAndViewport();
      this._loader = loader;
      this._loader.suppressPlayButton = this._suppressPlayButton || this._loader.suppressPlayButton;
      this._loader.wireEngine(this);
    }

    // Start the excalibur clock which drives the mainloop
    // has started is a slight misnomer, it's really mainloop started
    this._logger.debug('Starting game clock...');
    this.browser.resume();
    this.clock.start();
    this._logger.debug('Game clock started');

    if (loader) {
      await this.load(this._loader);
      this._loadingComplete = true;

      // reset back to previous user resolution/viewport
      this.screen.popResolutionAndViewport();
      this.screen.applyResolutionAndViewport();
    }

    this._loadingComplete = true;

    // Initialize before ready
    this._overrideInitialize(this);

    this._isReady = true;

    this._isReadyResolve();
    this.emit('start', new GameStartEvent(this));
    return this._isReadyPromise;
  }

  /**
   * Returns the current frames elapsed milliseconds
   */
  public currentFrameElapsedMs = 0;

  /**
   * Returns the current frame lag when in fixed update mode
   */
  public currentFrameLagMs = 0;

  private _lagMs = 0;
  private _mainloop(elapsed: number) {
    this.emit('preframe', new PreFrameEvent(this, this.stats.prevFrame));
    const delta = elapsed * this.timescale;
    this.currentFrameElapsedMs = delta;

    // reset frame stats (reuse existing instances)
    const frameId = this.stats.prevFrame.id + 1;
    this.stats.currFrame.reset();
    this.stats.currFrame.id = frameId;
    this.stats.currFrame.delta = delta;
    this.stats.currFrame.fps = this.clock.fpsSampler.fps;
    GraphicsDiagnostics.clear();

    const beforeUpdate = this.clock.now();
    const fixedTimestepMs = 1000 / this.fixedUpdateFps;
    if (this.fixedUpdateFps) {
      this._lagMs += delta;
      while (this._lagMs >= fixedTimestepMs) {
        this._update(fixedTimestepMs);
        this._lagMs -= fixedTimestepMs;
      }
    } else {
      this._update(delta);
    }
    const afterUpdate = this.clock.now();
    this.currentFrameLagMs = this._lagMs;
    this._draw(delta);
    const afterDraw = this.clock.now();

    this.stats.currFrame.duration.update = afterUpdate - beforeUpdate;
    this.stats.currFrame.duration.draw = afterDraw - afterUpdate;
    this.stats.currFrame.graphics.drawnImages = GraphicsDiagnostics.DrawnImagesCount;
    this.stats.currFrame.graphics.drawCalls = GraphicsDiagnostics.DrawCallCount;

    this.emit('postframe', new PostFrameEvent(this, this.stats.currFrame));
    this.stats.prevFrame.reset(this.stats.currFrame);

    this._monitorPerformanceThresholdAndTriggerFallback();
  }

  /**
   * Stops Excalibur's main loop, useful for pausing the game.
   */
  public stop() {
    if (this.clock.isRunning()) {
      this.emit('stop', new GameStopEvent(this));
      this.browser.pause();
      this.clock.stop();
      this._logger.debug('Game stopped');
    }
  }

  /**
   * Returns the Engine's running status, Useful for checking whether engine is running or paused.
   */
  public isRunning() {
    return this.clock.isRunning();
  }


  private _screenShotRequests: { preserveHiDPIResolution: boolean, resolve: (image: HTMLImageElement) => void }[] = [];
  /**
   * Takes a screen shot of the current viewport and returns it as an
   * HTML Image Element.
   * @param preserveHiDPIResolution in the case of HiDPI return the full scaled backing image, by default false
   */
  public screenshot(preserveHiDPIResolution = false): Promise<HTMLImageElement> {
    const screenShotPromise = new Promise<HTMLImageElement>((resolve) => {
      this._screenShotRequests.push({preserveHiDPIResolution, resolve});
    });
    return screenShotPromise;
  }

  private _checkForScreenShots() {
    // We must grab the draw buffer before we yield to the browser
    // the draw buffer is cleared after compositing
    // the reason for the asynchrony is setting `preserveDrawingBuffer: true`
    // forces the browser to copy buffers which can have a mass perf impact on mobile
    for (const request of this._screenShotRequests) {
      const finalWidth = request.preserveHiDPIResolution ? this.canvas.width : this.screen.resolution.width;
      const finalHeight = request.preserveHiDPIResolution ? this.canvas.height : this.screen.resolution.height;
      const screenshot = document.createElement('canvas');
      screenshot.width = finalWidth;
      screenshot.height = finalHeight;
      const ctx = screenshot.getContext('2d');
      ctx.imageSmoothingEnabled = this.screen.antialiasing;
      ctx.drawImage(this.canvas, 0, 0, finalWidth, finalHeight);

      const result = new Image();
      const raw = screenshot.toDataURL('image/png');
      result.src = raw;
      request.resolve(result);
    }
    // Reset state
    this._screenShotRequests.length = 0;
  }

  /**
   * Another option available to you to load resources into the game.
   * Immediately after calling this the game will pause and the loading screen
   * will appear.
   * @param loader  Some [[Loadable]] such as a [[Loader]] collection, [[Sound]], or [[Texture]].
   */
  public async load(loader: Loadable<any>): Promise<void> {
    try {
      await loader.load();
    } catch (e) {
      this._logger.error('Error loading resources, things may not behave properly', e);
      await Promise.resolve();
    }
  }
}