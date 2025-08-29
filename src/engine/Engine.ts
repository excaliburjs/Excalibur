import { EX_VERSION } from './';
import { Future } from './Util/Future';
import type { EventKey, Handler, Subscription } from './EventEmitter';
import { EventEmitter } from './EventEmitter';
import { PointerScope } from './Input/PointerScope';
import { Flags } from './Flags';
import { polyfill } from './Polyfill';
polyfill();
import type { CanUpdate, CanDraw, CanInitialize } from './Interfaces/LifecycleEvents';
import type { Vector } from './Math/vector';
import type { ViewportDimension } from './Screen';
import { Screen, DisplayMode, Resolution } from './Screen';
import type { ScreenElement } from './ScreenElement';
import type { Actor } from './Actor';
import type { Timer } from './Timer';
import type { TileMap } from './TileMap';
import { DefaultLoader } from './Director/DefaultLoader';
import { Loader } from './Director/Loader';
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
  PreDrawEvent,
  PostDrawEvent,
  InitializeEvent
} from './Events';
import { Logger, LogLevel } from './Util/Log';
import { Color } from './Color';
import type { SceneConstructor } from './Scene';
import { Scene, isSceneConstructor } from './Scene';
import { Entity } from './EntityComponentSystem/Entity';
import type { DebugStats } from './Debug/DebugConfig';
import { DebugConfig } from './Debug/DebugConfig';
import { BrowserEvents } from './Util/Browser';
import type { AntialiasOptions, ExcaliburGraphicsContext } from './Graphics';
import {
  DefaultAntialiasOptions,
  DefaultPixelArtOptions,
  ExcaliburGraphicsContext2DCanvas,
  ExcaliburGraphicsContextWebGL,
  TextureLoader
} from './Graphics';
import type { Clock } from './Util/Clock';
import { StandardClock } from './Util/Clock';
import { ImageFiltering } from './Graphics/Filtering';
import { GraphicsDiagnostics } from './Graphics/GraphicsDiagnostics';
import { Toaster } from './Util/Toaster';
import type { InputMapper } from './Input/InputMapper';
import type { GoToOptions, SceneMap, StartOptions, SceneWithOptions, WithRoot } from './Director/Director';
import { Director, DirectorEvents } from './Director/Director';
import { InputHost } from './Input/InputHost';
import type { PhysicsConfig } from './Collision/PhysicsConfig';
import { getDefaultPhysicsConfig } from './Collision/PhysicsConfig';
import type { DeepRequired } from './Util/Required';
import type { Context } from './Context';
import { createContext, useContext } from './Context';
import type { GarbageCollectionOptions } from './GarbageCollector';
import { DefaultGarbageCollectionOptions, GarbageCollector } from './GarbageCollector';
import { mergeDeep } from './Util/Util';
import { getDefaultGlobal } from './Util/IFrame';

export type EngineEvents = DirectorEvents & {
  fallbackgraphicscontext: ExcaliburGraphicsContext2DCanvas;
  initialize: InitializeEvent<Engine>;
  visible: VisibleEvent;
  hidden: HiddenEvent;
  start: GameStartEvent;
  stop: GameStopEvent;
  preupdate: PreUpdateEvent<Engine>;
  postupdate: PostUpdateEvent<Engine>;
  preframe: PreFrameEvent;
  postframe: PostFrameEvent;
  predraw: PreDrawEvent;
  postdraw: PostDrawEvent;
};

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
  PostDraw: 'postdraw',
  ...DirectorEvents
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
export interface EngineOptions<TKnownScenes extends string = any> {
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
   * Use `viewport` instead of {@apilink EngineOptions.width} and {@apilink EngineOptions.height}, or vice versa.
   */
  viewport?: ViewportDimension;

  /**
   * Optionally specify the size the logical pixel resolution, if not specified it will be width x height.
   * See {@apilink Resolution} for common presets.
   */
  resolution?: Resolution;

  /**
   * Optionally specify antialiasing (smoothing), by default true (smooth pixels)
   *
   *  * `true` - useful for high resolution art work you would like smoothed, this also hints excalibur to load images
   * with default blending {@apilink ImageFiltering.Blended}
   *
   *  * `false` - useful for pixel art style art work you would like sharp, this also hints excalibur to load images
   * with default blending {@apilink ImageFiltering.Pixel}
   *
   * * {@apilink AntialiasOptions} Optionally deeply configure the different antialiasing settings, **WARNING** thar be dragons here.
   * It is recommended you stick to `true` or `false` unless you understand what you're doing and need to control rendering to
   * a high degree.
   */
  antialiasing?: boolean | AntialiasOptions;

  /**
   * Optionally specify excalibur garbage collection, by default true.
   *
   * * `true` - garbage collection defaults are enabled (default)
   *
   * * `false` - garbage collection is completely disabled (not recommended)
   *
   * * {@apilink GarbageCollectionOptions} Optionally deeply configure garbage collection settings, **WARNING** thar be dragons here.
   * It is recommended you stick to `true` or `false` unless you understand what you're doing, it is possible to get into a downward
   * spiral if collection timings are set too low where you are stuck in repeated collection.
   */
  garbageCollection?: boolean | GarbageCollectionOptions;

  /**
   * Quick convenience property to configure Excalibur to use special settings for "pretty" anti-aliased pixel art
   *
   * 1. Turns on special shader condition to blend for pixel art and enables various antialiasing settings,
   *  notice blending is ON for this special mode.
   *
   * Equivalent to:
   * ```javascript
   * antialiasing: {
   *  pixelArtSampler: true,
   *  canvasImageRendering: 'auto',
   *  filtering: ImageFiltering.Blended,
   *  webglAntialiasing: true
   * }
   * ```
   */
  pixelArt?: boolean;

  /**
   * Specify any UV padding you want use in pixels, this brings sampling into the texture if you're using
   * a sprite sheet in one image to prevent sampling bleed.
   *
   * Defaults:
   * * `antialiasing: false` or `filtering: ImageFiltering.Pixel` - 0.0;
   * * `pixelArt: true` - 0.25
   * * All else 0.01
   */
  uvPadding?: number;

  /**
   * Optionally hint the graphics context into a specific power profile
   *
   * Default "high-performance"
   */
  powerPreference?: 'default' | 'high-performance' | 'low-power';

  /**
   * Optionally upscale the number of pixels in the canvas. Normally only useful if you need a smoother look to your assets, especially
   * {@apilink Text} or Pixel Art assets.
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
   * Optionally enable the right click context menu on the canvas
   *
   * Default if unset is false
   */
  enableCanvasContextMenu?: boolean;

  /**
   * Optionally snap graphics to nearest pixel, default is false
   */
  snapToPixel?: boolean;

  /**
   * The {@apilink DisplayMode} of the game, by default {@apilink DisplayMode.FitScreen} with aspect ratio 4:3 (800x600).
   * Depending on this value, {@apilink width} and {@apilink height} may be ignored.
   */
  displayMode?: DisplayMode;

  /**
   * Optionally configure the global, or a factory to produce it to listen to for browser events for Excalibur to listen to
   */
  global?: GlobalEventHandlers | (() => GlobalEventHandlers);

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
   * Sets the focus of the window, this is needed when hosting excalibur in a cross-origin/same-origin iframe in order for certain events
   * (like keyboard) to work. You can use
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
   * Optionally configure a fixed update timestep in milliseconds, this can be desirable if you need the physics simulation to be very stable. When
   * set the update step and physics will use the same elapsed time for each tick even if the graphical framerate drops. In order for the
   * simulation to be correct, excalibur will run multiple updates in a row (at the configured update elapsed) to catch up, for example
   * there could be X updates and 1 draw each clock step.
   *
   * **NOTE:** This does come at a potential perf cost because each catch-up update will need to be run if the fixed rate is greater than
   * the current instantaneous framerate, or perf gain if the fixed rate is less than the current framerate.
   *
   * By default is unset and updates will use the current instantaneous framerate with 1 update and 1 draw each clock step.
   *
   * **WARN:** `fixedUpdateTimestep` takes precedence over `fixedUpdateFps` use whichever is most convenient.
   */
  fixedUpdateTimestep?: number;

  /**
   * Optionally configure a fixed update fps, this can be desirable if you need the physics simulation to be very stable. When set
   * the update step and physics will use the same elapsed time for each tick even if the graphical framerate drops. In order for the
   * simulation to be correct, excalibur will run multiple updates in a row (at the configured update elapsed) to catch up, for example
   * there could be X updates and 1 draw each clock step.
   *
   * **NOTE:** This does come at a potential perf cost because each catch-up update will need to be run if the fixed rate is greater than
   * the current instantaneous framerate, or perf gain if the fixed rate is less than the current framerate.
   *
   * By default is unset and updates will use the current instantaneous framerate with 1 update and 1 draw each clock step.
   *
   * **WARN:** `fixedUpdateTimestep` takes precedence over `fixedUpdateFps` use whichever is most convenient.
   */
  fixedUpdateFps?: number;

  /**
   * Default `true`, optionally configure excalibur to use optimal draw call sorting, to opt out set this to `false`.
   *
   * Excalibur will automatically sort draw calls by z and priority into renderer batches for maximal draw performance,
   * this can disrupt a specific desired painter order.
   *
   */
  useDrawSorting?: boolean;

  /**
   * Optionally provide a custom handler for the webgl context lost event
   */
  handleContextLost?: (e: Event) => void;

  /**
   * Optionally provide a custom handler for the webgl context restored event
   */
  handleContextRestored?: (e: Event) => void;

  /**
   * Optionally configure how excalibur handles poor performance on a player's browser
   */
  configurePerformanceCanvas2DFallback?: {
    /**
     * By default `false`, this will switch the internal graphics context to Canvas2D which can improve performance on non hardware
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
    threshold?: { numberOfFrames: number; fps: number };
  };

  /**
   * Optionally configure the physics simulation in excalibur
   *
   * If false, Excalibur will not produce a physics simulation.
   *
   * Default is configured to use {@apilink SolverStrategy.Arcade} physics simulation
   */
  physics?: boolean | PhysicsConfig;

  /**
   * Optionally specify scenes with their transitions and loaders to excalibur's scene {@apilink Director}
   *
   * Scene transitions can can overridden dynamically by the `Scene` or by the call to `.goToScene`
   */
  scenes?: SceneMap<TKnownScenes>;
}

/**
 * The Excalibur Engine
 *
 * The {@apilink Engine} is the main driver for a game. It is responsible for
 * starting/stopping the game, maintaining state, transmitting events,
 * loading resources, and managing the scene.
 */
export class Engine<TKnownScenes extends string = any> implements CanInitialize, CanUpdate, CanDraw {
  static Context: Context<Engine | null> = createContext<Engine | null>();
  static useEngine(): Engine {
    const value = useContext(Engine.Context);

    if (!value) {
      throw new Error('Cannot inject engine with `useEngine()`, `useEngine()` was called outside of Engine lifecycle scope.');
    }

    return value;
  }
  static InstanceCount = 0;

  /**
   * Anything run under scope can use `useEngine()` to inject the current engine
   * @param cb
   */
  scope = <TReturn>(cb: () => TReturn) => Engine.Context.scope(this, cb);

  public global: GlobalEventHandlers;

  private _garbageCollector: GarbageCollector;

  public readonly garbageCollectorConfig: GarbageCollectionOptions | null;

  /**
   * Current Excalibur version string
   *
   * Useful for plugins or other tools that need to know what features are available
   */
  public readonly version = EX_VERSION;

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
   * Scene director, manages all scenes, scene transitions, and loaders in excalibur
   */
  public director: Director<TKnownScenes>;

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
   * Direct access to the physics configuration for excalibur
   */
  public physics: DeepRequired<PhysicsConfig>;

  /**
   * Optionally set the maximum fps if not set Excalibur will go as fast as the device allows.
   *
   * You may want to constrain max fps if your game cannot maintain fps consistently, it can look and feel better to have a 30fps game than
   * one that bounces between 30fps and 60fps
   */
  public maxFps: number = Number.POSITIVE_INFINITY;

  /**
   * Optionally configure a fixed update fps, this can be desirable if you need the physics simulation to be very stable. When set
   * the update step and physics will use the same elapsed time for each tick even if the graphical framerate drops. In order for the
   * simulation to be correct, excalibur will run multiple updates in a row (at the configured update elapsed) to catch up, for example
   * there could be X updates and 1 draw each clock step.
   *
   * **NOTE:** This does come at a potential perf cost because each catch-up update will need to be run if the fixed rate is greater than
   * the current instantaneous framerate, or perf gain if the fixed rate is less than the current framerate.
   *
   * By default is unset and updates will use the current instantaneous framerate with 1 update and 1 draw each clock step.
   *
   * **WARN:** `fixedUpdateTimestep` takes precedence over `fixedUpdateFps` use whichever is most convenient.
   */
  public readonly fixedUpdateFps?: number;

  /**
   * Optionally configure a fixed update timestep in milliseconds, this can be desirable if you need the physics simulation to be very stable. When
   * set the update step and physics will use the same elapsed time for each tick even if the graphical framerate drops. In order for the
   * simulation to be correct, excalibur will run multiple updates in a row (at the configured update elapsed) to catch up, for example
   * there could be X updates and 1 draw each clock step.
   *
   * **NOTE:** This does come at a potential perf cost because each catch-up update will need to be run if the fixed rate is greater than
   * the current instantaneous framerate, or perf gain if the fixed rate is less than the current framerate.
   *
   * By default is unset and updates will use the current instantaneous framerate with 1 update and 1 draw each clock step.
   *
   * **WARN:** `fixedUpdateTimestep` takes precedence over `fixedUpdateFps` use whichever is most convenient.
   */
  public readonly fixedUpdateTimestep?: number;

  /**
   * Direct access to the excalibur clock
   */
  public clock: Clock;

  public readonly pointerScope: PointerScope;
  public readonly grabWindowFocus: boolean;

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
  public input: InputHost;

  /**
   * Map multiple input sources to specific game actions actions
   */
  public inputMapper: InputMapper;

  private _inputEnabled: boolean = true;

  /**
   * Access Excalibur debugging functionality.
   *
   * Useful when you want to debug different aspects of built in engine features like
   *   * Transform
   *   * Graphics
   *   * Colliders
   */
  public debug: DebugConfig;

  /**
   * Access {@apilink stats} that holds frame statistics.
   */
  public get stats(): DebugStats {
    return this.debug.stats;
  }

  /**
   * The current {@apilink Scene} being drawn and updated on screen
   */
  public get currentScene(): Scene {
    return this.director.currentScene;
  }

  /**
   * The current {@apilink Scene} being drawn and updated on screen
   */
  public get currentSceneName(): string {
    return this.director.currentSceneName;
  }

  /**
   * The default {@apilink Scene} of the game, use {@apilink Engine.goToScene} to transition to different scenes.
   */
  public get rootScene(): Scene {
    return this.director.rootScene;
  }

  /**
   * Contains all the scenes currently registered with Excalibur
   */
  public get scenes(): { [key: string]: Scene | SceneConstructor | SceneWithOptions } {
    return this.director.scenes;
  }

  /**
   * Indicates whether the engine is set to fullscreen or not
   */
  public get isFullscreen(): boolean {
    return this.screen.isFullScreen;
  }

  /**
   * Indicates the current {@apilink DisplayMode} of the engine.
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
  }

  public set snapToPixel(shouldSnapToPixel: boolean) {
    this.graphicsContext.snapToPixel = shouldSnapToPixel;
  }

  /**
   * The action to take when a fatal exception is thrown
   */
  public onFatalException = (e: any) => {
    Logger.getInstance().fatal(e, e.stack);
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
  private _loader: DefaultLoader;

  private _isInitialized: boolean = false;

  private _hasCreatedCanvas: boolean = false;

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
   * Default {@apilink EngineOptions}
   */
  private static _DEFAULT_ENGINE_OPTIONS: EngineOptions = {
    width: 0,
    height: 0,
    enableCanvasTransparency: true,
    useDrawSorting: true,
    configurePerformanceCanvas2DFallback: {
      allow: false,
      showPlayerMessage: false,
      threshold: { fps: 20, numberOfFrames: 100 }
    },
    canvasElementId: '',
    canvasElement: undefined,
    enableCanvasContextMenu: false,
    snapToPixel: false,
    antialiasing: true,
    pixelArt: false,
    garbageCollection: true,
    powerPreference: 'high-performance',
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
   * Creates a new game using the given {@apilink EngineOptions}. By default, if no options are provided,
   * the game will be rendered full screen (taking up all available browser window space).
   * You can customize the game rendering through {@apilink EngineOptions}.
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
  constructor(options?: EngineOptions<TKnownScenes>) {
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
      console.log(
        '\n\
      /| ________________\n\
O|===|* >________________>\n\
      \\|'
      );
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
    if (options.garbageCollection === true) {
      this.garbageCollectorConfig = {
        ...DefaultGarbageCollectionOptions
      };
    } else if (options.garbageCollection === false) {
      this._logger.warn(
        'WebGL Garbage Collection Disabled!!! If you leak any images over time your game will crash when GPU memory is exhausted'
      );
      this.garbageCollectorConfig = null;
    } else {
      this.garbageCollectorConfig = {
        ...DefaultGarbageCollectionOptions,
        ...options.garbageCollection
      };
    }
    this._garbageCollector = new GarbageCollector({ getTimestamp: Date.now });

    this.canvasElementId = options.canvasElementId;

    if (options.canvasElementId) {
      this._logger.debug('Using Canvas element specified: ' + options.canvasElementId);

      //test for existence of element
      if (document.getElementById(options.canvasElementId) === null) {
        throw new Error('Cannot find existing element in the DOM, please ensure element is created prior to engine creation.');
      }

      this.canvas = <HTMLCanvasElement>document.getElementById(options.canvasElementId);
      this._hasCreatedCanvas = false;
    } else if (options.canvasElement) {
      this._logger.debug('Using Canvas element specified:', options.canvasElement);
      this.canvas = options.canvasElement;
      this._hasCreatedCanvas = false;
    } else {
      this._logger.debug('Using generated canvas element');
      this.canvas = <HTMLCanvasElement>document.createElement('canvas');
      this._hasCreatedCanvas = true;
    }

    if (this.canvas && !options.enableCanvasContextMenu) {
      this.canvas.addEventListener('contextmenu', (evt) => {
        evt.preventDefault();
      });
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

    const global = (options.global && typeof options.global === 'function' ? options.global() : options.global) as GlobalEventHandlers;

    this.global = global ?? getDefaultGlobal();
    this.grabWindowFocus = options.grabWindowFocus;
    this.pointerScope = options.pointerScope;

    this._originalDisplayMode = displayMode;

    let pixelArtSampler: boolean;
    let uvPadding: number;
    let nativeContextAntialiasing: boolean;
    let canvasImageRendering: 'pixelated' | 'auto';
    let filtering: ImageFiltering;
    let multiSampleAntialiasing: boolean | { samples: number };
    if (typeof options.antialiasing === 'object') {
      ({ pixelArtSampler, nativeContextAntialiasing, multiSampleAntialiasing, filtering, canvasImageRendering } = {
        ...(options.pixelArt ? DefaultPixelArtOptions : DefaultAntialiasOptions),
        ...options.antialiasing
      });
    } else {
      pixelArtSampler = !!options.pixelArt;
      nativeContextAntialiasing = false;
      multiSampleAntialiasing = options.antialiasing;
      canvasImageRendering = options.antialiasing ? 'auto' : 'pixelated';
      filtering = options.antialiasing ? ImageFiltering.Blended : ImageFiltering.Pixel;
    }

    if (nativeContextAntialiasing && multiSampleAntialiasing) {
      this._logger.warnOnce(
        `Cannot use antialias setting nativeContextAntialiasing and multiSampleAntialiasing` +
          ` at the same time, they are incompatible settings. If you aren\'t sure use multiSampleAntialiasing`
      );
    }

    if (options.pixelArt) {
      uvPadding = 0.25;
    }

    if (!options.antialiasing || filtering === ImageFiltering.Pixel) {
      uvPadding = 0;
    }

    // Override with any user option, if non default to .25 for pixel art, 0.01 for everything else
    uvPadding = options.uvPadding ?? uvPadding ?? 0.01;

    // Canvas 2D fallback can be flagged on
    let useCanvasGraphicsContext = Flags.isEnabled('use-canvas-context');
    if (!useCanvasGraphicsContext) {
      // Attempt webgl first
      try {
        this.graphicsContext = new ExcaliburGraphicsContextWebGL({
          canvasElement: this.canvas,
          enableTransparency: this.enableCanvasTransparency,
          pixelArtSampler: pixelArtSampler,
          antialiasing: nativeContextAntialiasing,
          multiSampleAntialiasing: multiSampleAntialiasing,
          uvPadding: uvPadding,
          powerPreference: options.powerPreference,
          backgroundColor: options.backgroundColor,
          snapToPixel: options.snapToPixel,
          useDrawSorting: options.useDrawSorting,
          garbageCollector: this.garbageCollectorConfig
            ? {
                garbageCollector: this._garbageCollector,
                collectionInterval: this.garbageCollectorConfig.textureCollectInterval
              }
            : null,
          handleContextLost: options.handleContextLost ?? this._handleWebGLContextLost,
          handleContextRestored: options.handleContextRestored
        });
      } catch (e) {
        this._logger.warn(
          `Excalibur could not load webgl for some reason (${(e as Error).message}) and loaded a Canvas 2D fallback. ` +
            `Some features of Excalibur will not work in this mode. \n\n` +
            'Read more about this issue at https://excaliburjs.com/docs/performance'
        );
        // fallback to canvas in case of failure
        useCanvasGraphicsContext = true;
      }
    }

    if (useCanvasGraphicsContext) {
      this.graphicsContext = new ExcaliburGraphicsContext2DCanvas({
        canvasElement: this.canvas,
        enableTransparency: this.enableCanvasTransparency,
        antialiasing: nativeContextAntialiasing,
        backgroundColor: options.backgroundColor,
        snapToPixel: options.snapToPixel,
        useDrawSorting: options.useDrawSorting
      });
    }

    this.screen = new Screen({
      canvas: this.canvas,
      context: this.graphicsContext,
      antialiasing: nativeContextAntialiasing,
      canvasImageRendering: canvasImageRendering,
      browser: this.browser,
      viewport: options.viewport ?? (options.width && options.height ? { width: options.width, height: options.height } : Resolution.SVGA),
      resolution: options.resolution,
      displayMode,
      pixelRatio: options.suppressHiDPIScaling ? 1 : (options.pixelRatio ?? null)
    });

    // TODO REMOVE STATIC!!!
    // Set default filtering based on antialiasing
    TextureLoader.filtering = filtering;

    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor.clone();
    }

    this.maxFps = options.maxFps ?? this.maxFps;

    this.fixedUpdateTimestep = options.fixedUpdateTimestep ?? this.fixedUpdateTimestep;
    this.fixedUpdateFps = options.fixedUpdateFps ?? this.fixedUpdateFps;
    this.fixedUpdateTimestep = this.fixedUpdateTimestep || 1000 / this.fixedUpdateFps;

    this.clock = new StandardClock({
      maxFps: this.maxFps,
      tick: this._mainloop.bind(this),
      onFatalException: (e) => this.onFatalException(e)
    });

    this.enableCanvasTransparency = options.enableCanvasTransparency;

    if (typeof options.physics === 'boolean') {
      this.physics = {
        ...getDefaultPhysicsConfig(),
        enabled: options.physics
      };
    } else {
      this.physics = {
        ...getDefaultPhysicsConfig()
      };
      mergeDeep(this.physics, options.physics);
    }

    this.debug = new DebugConfig(this);

    this.director = new Director(this, options.scenes);
    this.director.events.pipe(this.events);

    this._initialize(options);

    (window as any).___EXCALIBUR_DEVTOOL = this;
    Engine.InstanceCount++;
  }

  private _handleWebGLContextLost = (e: Event) => {
    e.preventDefault();
    this.clock.stop();
    this._logger.fatalOnce('WebGL Graphics Lost', e);
    const container = document.createElement('div');
    container.id = 'ex-webgl-graphics-context-lost';
    container.style.position = 'absolute';
    container.style.zIndex = '99';
    container.style.left = '50%';
    container.style.top = '50%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.backgroundColor = 'white';
    container.style.padding = '10px';
    container.style.borderStyle = 'solid 1px';

    const div = document.createElement('div');
    div.innerHTML = `
      <h1>There was an issue rendering, please refresh the page.</h1>
      <div>
        <p>WebGL Graphics Context Lost</p>

        <button id="ex-webgl-graphics-reload">Refresh Page</button>

        <p>There are a few reasons this might happen:</p>
        <ul>
          <li>Two or more pages are placing a high demand on the GPU</li>
          <li>Another page or operation has stalled the GPU and the browser has decided to reset the GPU</li>
          <li>The computer has multiple GPUs and the user has switched between them</li>
          <li>Graphics driver has crashed or restarted</li>
          <li>Graphics driver was updated</li>
        </ul>
      </div>
    `;
    container.appendChild(div);
    if (this.canvas?.parentElement) {
      this.canvas.parentElement.appendChild(container);
      const button = div.querySelector('#ex-webgl-graphics-reload');
      button?.addEventListener('click', () => location.reload());
    }
  };

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
              "this might mean your browser doesn't have webgl enabled or hardware acceleration is unavailable.\n\n" +
              'If in Chrome:\n' +
              '  * Visit Settings > Advanced > System, and ensure "Use Hardware Acceleration" is checked.\n' +
              '  * Visit chrome://flags/#ignore-gpu-blocklist and ensure "Override software rendering list" is "enabled"\n' +
              'If in Firefox, visit about:config\n' +
              '  * Ensure webgl.disabled = false\n' +
              '  * Ensure webgl.force-enabled = true\n' +
              '  * Ensure layers.acceleration.force-enabled = true\n\n' +
              'Read more about this issue at https://excaliburjs.com/docs/performance'
          );

          if (showPlayerMessage) {
            this._toaster.toast(
              'Excalibur is encountering performance issues. ' +
                "It's possible that your browser doesn't have hardware acceleration enabled. " +
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

    const options = { ...this._originalOptions, antialiasing: this.screen.antialiasing };
    const displayMode = this._originalDisplayMode;

    // New graphics context
    this.graphicsContext = new ExcaliburGraphicsContext2DCanvas({
      canvasElement: this.canvas,
      enableTransparency: this.enableCanvasTransparency,
      antialiasing: options.antialiasing,
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

  private _disposed = false;
  /**
   * Attempts to completely clean up excalibur resources, including removing the canvas from the dom.
   *
   * To start again you will need to new up an Engine.
   */
  public dispose() {
    if (!this._disposed) {
      this._disposed = true;
      this.stop();
      this._garbageCollector.forceCollectAll();
      this.input.toggleEnabled(false);
      if (this._hasCreatedCanvas) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
      this.canvas = null;
      this.screen.dispose();
      this.graphicsContext.dispose();
      this.graphicsContext = null;
      Engine.InstanceCount--;
    }
  }

  public isDisposed() {
    return this._disposed;
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
    if (value < 0) {
      Logger.getInstance().warnOnce('engine.timescale to a value less than 0 are ignored');
      return;
    }

    this._timescale = value;
  }

  /**
   * Adds a {@apilink Timer} to the {@apilink currentScene}.
   * @param timer  The timer to add to the {@apilink currentScene}.
   */
  public addTimer(timer: Timer): Timer {
    return this.currentScene.addTimer(timer);
  }

  /**
   * Removes a {@apilink Timer} from the {@apilink currentScene}.
   * @param timer  The timer to remove to the {@apilink currentScene}.
   */
  public removeTimer(timer: Timer): Timer {
    return this.currentScene.removeTimer(timer);
  }

  /**
   * Adds a {@apilink Scene} to the engine, think of scenes in Excalibur as you
   * would levels or menus.
   * @param key  The name of the scene, must be unique
   * @param scene The scene to add to the engine
   */
  public addScene<TScene extends string>(key: TScene, scene: Scene | SceneConstructor | SceneWithOptions): Engine<TKnownScenes | TScene> {
    this.director.add(key, scene);
    return this as Engine<TKnownScenes | TScene>;
  }

  /**
   * Removes a {@apilink Scene} instance from the engine
   * @param scene  The scene to remove
   */
  public removeScene(scene: Scene | SceneConstructor): void;
  /**
   * Removes a scene from the engine by key
   * @param key  The scene key to remove
   */
  public removeScene(key: string): void;
  /**
   * @internal
   */
  public removeScene(entity: any): void {
    this.director.remove(entity);
  }

  /**
   * Adds a {@apilink Scene} to the engine, think of scenes in Excalibur as you
   * would levels or menus.
   * @param sceneKey  The key of the scene, must be unique
   * @param scene     The scene to add to the engine
   */
  public add(sceneKey: string, scene: Scene | SceneConstructor | SceneWithOptions): void;
  /**
   * Adds a {@apilink Timer} to the {@apilink currentScene}.
   * @param timer  The timer to add to the {@apilink currentScene}.
   */
  public add(timer: Timer): void;
  /**
   * Adds a {@apilink TileMap} to the {@apilink currentScene}, once this is done the TileMap
   * will be drawn and updated.
   */
  public add(tileMap: TileMap): void;
  /**
   * Adds an actor to the {@apilink currentScene} of the game. This is synonymous
   * to calling `engine.currentScene.add(actor)`.
   *
   * Actors can only be drawn if they are a member of a scene, and only
   * the {@apilink currentScene} may be drawn or updated.
   * @param actor  The actor to add to the {@apilink currentScene}
   */
  public add(actor: Actor): void;

  public add(entity: Entity): void;

  /**
   * Adds a {@apilink ScreenElement} to the {@apilink currentScene} of the game,
   * ScreenElements do not participate in collisions, instead the
   * remain in the same place on the screen.
   * @param screenElement  The ScreenElement to add to the {@apilink currentScene}
   */
  public add(screenElement: ScreenElement): void;
  public add(entity: any): void {
    if (arguments.length === 2) {
      this.director.add(<string>arguments[0], <Scene | SceneConstructor | SceneWithOptions>arguments[1]);
      return;
    }
    const maybeDeferred = this.director.getDeferredScene();
    if (maybeDeferred instanceof Scene) {
      maybeDeferred.add(entity);
    } else {
      this.currentScene.add(entity);
    }
  }

  /**
   * Removes a scene instance from the engine
   * @param scene  The scene to remove
   */
  public remove(scene: Scene | SceneConstructor): void;
  /**
   * Removes a scene from the engine by key
   * @param sceneKey  The scene to remove
   */
  public remove(sceneKey: string): void;
  /**
   * Removes a {@apilink Timer} from the {@apilink currentScene}.
   * @param timer  The timer to remove to the {@apilink currentScene}.
   */
  public remove(timer: Timer): void;
  /**
   * Removes a {@apilink TileMap} from the {@apilink currentScene}, it will no longer be drawn or updated.
   */
  public remove(tileMap: TileMap): void;
  /**
   * Removes an actor from the {@apilink currentScene} of the game. This is synonymous
   * to calling `engine.currentScene.removeChild(actor)`.
   * Actors that are removed from a scene will no longer be drawn or updated.
   * @param actor  The actor to remove from the {@apilink currentScene}.
   */
  public remove(actor: Actor): void;
  /**
   * Removes a {@apilink ScreenElement} to the scene, it will no longer be drawn or updated
   * @param screenElement  The ScreenElement to remove from the {@apilink currentScene}
   */
  public remove(screenElement: ScreenElement): void;
  public remove(entity: any): void {
    if (entity instanceof Entity) {
      this.currentScene.remove(entity);
    }

    if (entity instanceof Scene || isSceneConstructor(entity)) {
      this.removeScene(entity);
    }

    if (typeof entity === 'string') {
      this.removeScene(entity);
    }
  }

  /**
   * Changes the current scene with optionally supplied:
   * * Activation data
   * * Transitions
   * * Loaders
   *
   * Example:
   * ```typescript
   * game.goToScene('myScene', {
   *   sceneActivationData: {any: 'thing at all'},
   *   destinationIn: new FadeInOut({duration: 1000, direction: 'in'}),
   *   sourceOut: new FadeInOut({duration: 1000, direction: 'out'}),
   *   loader: MyLoader
   * });
   * ```
   *
   * Scenes are defined in the Engine constructor
   * ```typescript
   * const engine = new ex.Engine({
      scenes: {...}
    });
   * ```
   * Or by adding dynamically
   *
   * ```typescript
   * engine.addScene('myScene', new ex.Scene());
   * ```
   * @param destinationScene
   * @param options
   */
  public async goToScene<TData = undefined>(destinationScene: WithRoot<TKnownScenes>, options?: GoToOptions<TData>): Promise<void> {
    await this.scope(async () => {
      await this.director.goToScene(destinationScene, options);
    });
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
    const grabWindowFocus = this._originalOptions?.grabWindowFocus ?? true;
    this.input = new InputHost({
      global: this.global,
      pointerTarget,
      grabWindowFocus,
      engine: this
    });
    this.inputMapper = this.input.inputMapper;

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

  public toggleInputEnabled(enabled: boolean) {
    this._inputEnabled = enabled;
    this.input.toggleEnabled(this._inputEnabled);
  }

  public onInitialize(engine: Engine) {
    // Override me
  }

  /**
   * Gets whether the actor is Initialized
   */
  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  private async _overrideInitialize(engine: Engine) {
    if (!this.isInitialized) {
      await this.director.onInitialize();
      await this.onInitialize(engine);
      this.events.emit('initialize', new InitializeEvent(engine, this));
      this._isInitialized = true;
    }
  }

  /**
   * Updates the entire state of the game
   * @param elapsed  Number of milliseconds elapsed since the last update.
   */
  private _update(elapsed: number) {
    if (this._isLoading) {
      // suspend updates until loading is finished
      this._loader?.onUpdate(this, elapsed);
      // Update input listeners
      this.input.update();
      return;
    }

    // Publish preupdate events
    this.clock.__runScheduledCbs('preupdate');
    this._preupdate(elapsed);

    // process engine level events
    this.currentScene.update(this, elapsed);

    // Update graphics postprocessors
    this.graphicsContext.updatePostProcessors(elapsed);

    // Publish update event
    this.clock.__runScheduledCbs('postupdate');
    this._postupdate(elapsed);

    // Update input listeners
    this.input.update();
  }

  /**
   * @internal
   */
  public _preupdate(elapsed: number) {
    this.emit('preupdate', new PreUpdateEvent(this, elapsed, this));
    this.onPreUpdate(this, elapsed);
  }

  /**
   * Safe to override method
   * @param engine The reference to the current game engine
   * @param elapsed  The time elapsed since the last update in milliseconds
   */
  public onPreUpdate(engine: Engine, elapsed: number) {
    // Override me
  }

  /**
   * @internal
   */
  public _postupdate(elapsed: number) {
    this.emit('postupdate', new PostUpdateEvent(this, elapsed, this));
    this.onPostUpdate(this, elapsed);
  }

  /**
   * Safe to override method
   * @param engine The reference to the current game engine
   * @param elapsed  The time elapsed since the last update in milliseconds
   */
  public onPostUpdate(engine: Engine, elapsed: number) {
    // Override me
  }

  /**
   * Draws the entire game
   * @param elapsed  Number of milliseconds elapsed since the last draw.
   */
  private _draw(elapsed: number) {
    // Use scene background color if present, fallback to engine
    this.graphicsContext.backgroundColor = this.currentScene.backgroundColor ?? this.backgroundColor;
    this.graphicsContext.beginDrawLifecycle();
    this.graphicsContext.clear();
    this.clock.__runScheduledCbs('predraw');
    this._predraw(this.graphicsContext, elapsed);

    // Drawing nothing else while loading
    if (this._isLoading) {
      if (!this._hideLoader) {
        this._loader?.canvas.draw(this.graphicsContext, 0, 0);
        this.clock.__runScheduledCbs('postdraw');
        this.graphicsContext.flush();
        this.graphicsContext.endDrawLifecycle();
      }
      return;
    }

    this.currentScene.draw(this.graphicsContext, elapsed);

    this.clock.__runScheduledCbs('postdraw');
    this._postdraw(this.graphicsContext, elapsed);

    // Flush any pending drawings
    this.graphicsContext.flush();
    this.graphicsContext.endDrawLifecycle();

    this._checkForScreenShots();
  }

  /**
   * @internal
   */
  public _predraw(ctx: ExcaliburGraphicsContext, elapsed: number) {
    this.emit('predraw', new PreDrawEvent(ctx, elapsed, this));
    this.onPreDraw(ctx, elapsed);
  }

  /**
   * Safe to override method to hook into pre draw
   * @param ctx {@link ExcaliburGraphicsContext} for drawing
   * @param elapsed  Number of milliseconds elapsed since the last draw.
   */
  public onPreDraw(ctx: ExcaliburGraphicsContext, elapsed: number) {
    // Override me
  }

  /**
   * @internal
   */
  public _postdraw(ctx: ExcaliburGraphicsContext, elapsed: number) {
    this.emit('postdraw', new PostDrawEvent(ctx, elapsed, this));
    this.onPostDraw(ctx, elapsed);
  }

  /**
   * Safe to override method to hook into pre draw
   * @param ctx {@link ExcaliburGraphicsContext} for drawing
   * @param elapsed  Number of milliseconds elapsed since the last draw.
   */
  public onPostDraw(ctx: ExcaliburGraphicsContext, elapsed: number) {
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

  /**
   * Returns true when loading is totally complete and the player has clicked start
   */
  public get loadingComplete() {
    return !this._isLoading;
  }

  private _isLoading = false;
  private _hideLoader = false;
  private _isReadyFuture = new Future<void>();
  public get ready() {
    return this._isReadyFuture.isCompleted;
  }
  public isReady(): Promise<void> {
    return this._isReadyFuture.promise;
  }

  /**
   * Starts the internal game loop for Excalibur after loading
   * any provided assets.
   * @param loader  Optional {@apilink Loader} to use to load resources. The default loader is {@apilink Loader},
   * override to provide your own custom loader.
   *
   * Note: start() only resolves AFTER the user has clicked the play button
   */
  public async start(loader?: DefaultLoader): Promise<void>;
  /**
   * Starts the internal game loop for Excalibur after configuring any routes, loaders, or transitions
   * @param startOptions Optional {@apilink StartOptions} to configure the routes for scenes in Excalibur
   *
   * Note: start() only resolves AFTER the user has clicked the play button
   */
  public async start(sceneName: WithRoot<TKnownScenes>, options?: StartOptions): Promise<void>;
  /**
   * Starts the internal game loop after any loader is finished
   * @param loader
   */
  public async start(loader?: DefaultLoader): Promise<void>;
  public async start(sceneNameOrLoader?: WithRoot<TKnownScenes> | DefaultLoader, options?: StartOptions): Promise<void> {
    await this.scope(async () => {
      if (!this._compatible) {
        throw new Error('Excalibur is incompatible with your browser');
      }
      this._isLoading = true;
      let loader: DefaultLoader;
      if (sceneNameOrLoader instanceof DefaultLoader) {
        loader = sceneNameOrLoader;
      } else if (typeof sceneNameOrLoader === 'string') {
        this.director.configureStart(sceneNameOrLoader, options);
        loader = this.director.mainLoader;
      }

      // Start the excalibur clock which drives the mainloop
      this._logger.debug('Starting game clock...');
      this.browser.resume();
      this.clock.start();
      if (this.garbageCollectorConfig) {
        this._garbageCollector.start();
      }
      this._logger.debug('Game clock started');

      await this.load(loader ?? new Loader());

      // Initialize before ready
      await this._overrideInitialize(this);

      this._isReadyFuture.resolve();
      this.emit('start', new GameStartEvent(this));
      return this._isReadyFuture.promise;
    });
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
    this.scope(() => {
      this.emit('preframe', new PreFrameEvent(this, this.stats.prevFrame));
      const elapsedMs = elapsed * this.timescale;
      this.currentFrameElapsedMs = elapsedMs;

      // reset frame stats (reuse existing instances)
      const frameId = this.stats.prevFrame.id + 1;
      this.stats.currFrame.reset();
      this.stats.currFrame.id = frameId;
      this.stats.currFrame.elapsedMs = elapsedMs;
      this.stats.currFrame.fps = this.clock.fpsSampler.fps;
      GraphicsDiagnostics.clear();

      const beforeUpdate = this.clock.now();
      const fixedTimestepMs = this.fixedUpdateTimestep;
      if (this.fixedUpdateTimestep) {
        this._lagMs += elapsedMs;
        while (this._lagMs >= fixedTimestepMs) {
          this._update(fixedTimestepMs);
          this._lagMs -= fixedTimestepMs;
        }
      } else {
        this._update(elapsedMs);
      }
      const afterUpdate = this.clock.now();
      this.currentFrameLagMs = this._lagMs;
      this._draw(elapsedMs);
      const afterDraw = this.clock.now();

      this.stats.currFrame.duration.update = afterUpdate - beforeUpdate;
      this.stats.currFrame.duration.draw = afterDraw - afterUpdate;
      this.stats.currFrame.graphics.drawnImages = GraphicsDiagnostics.DrawnImagesCount;
      this.stats.currFrame.graphics.drawCalls = GraphicsDiagnostics.DrawCallCount;

      this.emit('postframe', new PostFrameEvent(this, this.stats.currFrame));
      this.stats.prevFrame.reset(this.stats.currFrame);

      this._monitorPerformanceThresholdAndTriggerFallback();
    });
  }

  /**
   * Stops Excalibur's main loop, useful for pausing the game.
   */
  public stop() {
    if (this.clock.isRunning()) {
      this.emit('stop', new GameStopEvent(this));
      this.browser.pause();
      this.clock.stop();
      this._garbageCollector.stop();
      this._logger.debug('Game stopped');
    }
  }

  /**
   * Returns the Engine's running status, Useful for checking whether engine is running or paused.
   */
  public isRunning() {
    return this.clock.isRunning();
  }

  private _screenShotRequests: { preserveHiDPIResolution: boolean; resolve: (image: HTMLImageElement) => void }[] = [];
  /**
   * Takes a screen shot of the current viewport and returns it as an
   * HTML Image Element.
   * @param preserveHiDPIResolution in the case of HiDPI return the full scaled backing image, by default false
   */
  public screenshot(preserveHiDPIResolution = false): Promise<HTMLImageElement> {
    const screenShotPromise = new Promise<HTMLImageElement>((resolve) => {
      this._screenShotRequests.push({ preserveHiDPIResolution, resolve });
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
      result.onload = () => {
        request.resolve(result);
      };
      result.src = raw;
    }
    // Reset state
    this._screenShotRequests.length = 0;
  }

  /**
   * Another option available to you to load resources into the game.
   * Immediately after calling this the game will pause and the loading screen
   * will appear.
   * @param loader  Some {@apilink Loadable} such as a {@apilink Loader} collection, {@apilink Sound}, or {@apilink Texture}.
   */
  public async load(loader: DefaultLoader, hideLoader = false): Promise<void> {
    await this.scope(async () => {
      try {
        // early exit if loaded
        if (loader.isLoaded()) {
          return;
        }
        this._loader = loader;
        this._isLoading = true;
        this._hideLoader = hideLoader;

        if (loader instanceof Loader) {
          loader.suppressPlayButton = loader.suppressPlayButton || this._suppressPlayButton;
        }
        this._loader.onInitialize(this);

        await loader.load();
      } catch (e) {
        this._logger.error('Error loading resources, things may not behave properly', e);
        await Promise.resolve();
      } finally {
        this._isLoading = false;
        this._hideLoader = false;
        this._loader = null;
      }
    });
  }
}
