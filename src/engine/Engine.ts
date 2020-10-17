import { EX_VERSION } from './';
import { Flags } from './Flags';
import { polyfill } from './Polyfill';
polyfill();
import { CanUpdate, CanDraw, CanInitialize } from './Interfaces/LifecycleEvents';
import { Loadable } from './Interfaces/Loadable';
import { Promise } from './Promises';
import { Vector } from './Algebra';
import { Screen, DisplayMode, AbsolutePosition, ScreenDimension } from './Screen';
import { ScreenElement } from './ScreenElement';
import { Actor } from './Actor';
import { Timer } from './Timer';
import { TileMap } from './TileMap';
import { Animation } from './Drawing/Animation';
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
  GameEvent,
  DeactivateEvent,
  ActivateEvent,
  PreDrawEvent,
  PostDrawEvent,
  InitializeEvent
} from './Events';
import { CanLoad } from './Interfaces/Loader';
import { Logger, LogLevel } from './Util/Log';
import { Color } from './Drawing/Color';
import { Scene } from './Scene';
import { PostProcessor } from './PostProcessing/PostProcessor';
import { Debug, DebugStats } from './Debug';
import { Class } from './Class';
import * as Input from './Input/Index';
import * as Events from './Events';
import { BrowserEvents } from './Util/Browser';

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
   */
  antialiasing?: boolean;

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
   * The [[DisplayMode]] of the game. Depending on this value, [[width]] and [[height]] may be ignored.
   */
  displayMode?: DisplayMode;

  /**
   * Configures the pointer scope. Pointers scoped to the 'Canvas' can only fire events within the canvas viewport; whereas, 'Document'
   * (default) scoped will fire anywhere on the page.
   */
  pointerScope?: Input.PointerScope;

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
   * Specify how the game window is to be positioned when the [[DisplayMode.Position]] is chosen. This option MUST be specified
   * if the DisplayMode is set as [[DisplayMode.Position]]. The position can be either a string or an [[AbsolutePosition]].
   * String must be in the format of css style background-position. The vertical position must precede the horizontal position in strings.
   *
   * Valid String examples: "top left", "top", "bottom", "middle", "middle center", "bottom right"
   * Valid [[AbsolutePosition]] examples: `{top: 5, right: 10%}`, `{bottom: 49em, left: 10px}`, `{left: 10, bottom: 40}`
   */
  position?: string | AbsolutePosition;

  /**
   * Scroll prevention method.
   */
  scrollPreventionMode?: ScrollPreventionMode;

  /**
   * Optionally set the background color
   */
  backgroundColor?: Color;
}

/**
 * The Excalibur Engine
 *
 * The [[Engine]] is the main driver for a game. It is responsible for
 * starting/stopping the game, maintaining state, transmitting events,
 * loading resources, and managing the scene.
 */
export class Engine extends Class implements CanInitialize, CanUpdate, CanDraw {
  /**
   *
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
   * Direct access to the engine's 2D rendering context
   */
  public ctx: CanvasRenderingContext2D;

  /**
   * Direct access to the canvas element ID, if an ID exists
   */
  public canvasElementId: string;

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
  public input: Input.EngineInput;

  private _hasStarted: boolean = false;

  /**
   * Access Excalibur debugging functionality.
   */
  public debug: Debug;

  /**
   * Access [[stats]] that holds frame statistics.
   */
  public get stats(): DebugStats {
    return this.debug.stats;
  }

  /**
   * Gets or sets the list of post processors to apply at the end of drawing a frame (such as [[ColorBlindCorrector]])
   */
  public postProcessors: PostProcessor[] = [];

  /**
   * The current [[Scene]] being drawn and updated on screen
   */
  public currentScene: Scene;

  /**
   * The default [[Scene]] of the game, use [[Engine.goToScene]] to transition to different scenes.
   */
  public rootScene: Scene;

  /**
   * Contains all the scenes currently registered with Excalibur
   */
  public scenes: { [key: string]: Scene } = {};

  private _animations: AnimationNode[] = [];

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
   * Indicates the current position of the engine. Valid only when DisplayMode is DisplayMode.Position
   */
  public position: string | AbsolutePosition;
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
  public debugColor: Color = new Color(255, 255, 255);
  /**
   * Sets the background color for the engine.
   */
  public backgroundColor: Color;

  /**
   * Sets the Transparency for the engine.
   */
  public enableCanvasTransparency: boolean = true;

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

  // this is a reference to the current requestAnimationFrame return value
  private _requestId: number;

  // this determines whether excalibur is compatible with your browser
  private _compatible: boolean;

  private _timescale: number = 1.0;

  // loading
  private _loader: CanLoad;
  private _isLoading: boolean = false;

  private _isInitialized: boolean = false;

  public on(eventName: Events.initialize, handler: (event: Events.InitializeEvent<Engine>) => void): void;
  public on(eventName: Events.visible, handler: (event: VisibleEvent) => void): void;
  public on(eventName: Events.hidden, handler: (event: HiddenEvent) => void): void;
  public on(eventName: Events.start, handler: (event: GameStartEvent) => void): void;
  public on(eventName: Events.stop, handler: (event: GameStopEvent) => void): void;
  public on(eventName: Events.preupdate, handler: (event: PreUpdateEvent<Engine>) => void): void;
  public on(eventName: Events.postupdate, handler: (event: PostUpdateEvent<Engine>) => void): void;
  public on(eventName: Events.preframe, handler: (event: PreFrameEvent) => void): void;
  public on(eventName: Events.postframe, handler: (event: PostFrameEvent) => void): void;
  public on(eventName: Events.predraw, handler: (event: PreDrawEvent) => void): void;
  public on(eventName: Events.postdraw, handler: (event: PostDrawEvent) => void): void;
  public on(eventName: string, handler: (event: GameEvent<any>) => void): void;
  public on(eventName: string, handler: (event: any) => void): void {
    super.on(eventName, handler);
  }

  public once(eventName: Events.initialize, handler: (event: Events.InitializeEvent<Engine>) => void): void;
  public once(eventName: Events.visible, handler: (event: VisibleEvent) => void): void;
  public once(eventName: Events.hidden, handler: (event: HiddenEvent) => void): void;
  public once(eventName: Events.start, handler: (event: GameStartEvent) => void): void;
  public once(eventName: Events.stop, handler: (event: GameStopEvent) => void): void;
  public once(eventName: Events.preupdate, handler: (event: PreUpdateEvent<Engine>) => void): void;
  public once(eventName: Events.postupdate, handler: (event: PostUpdateEvent<Engine>) => void): void;
  public once(eventName: Events.preframe, handler: (event: PreFrameEvent) => void): void;
  public once(eventName: Events.postframe, handler: (event: PostFrameEvent) => void): void;
  public once(eventName: Events.predraw, handler: (event: PreDrawEvent) => void): void;
  public once(eventName: Events.postdraw, handler: (event: PostDrawEvent) => void): void;
  public once(eventName: string, handler: (event: GameEvent<any>) => void): void;
  public once(eventName: string, handler: (event: any) => void): void {
    super.once(eventName, handler);
  }

  public off(eventName: Events.initialize, handler?: (event: Events.InitializeEvent<Engine>) => void): void;
  public off(eventName: Events.visible, handler?: (event: VisibleEvent) => void): void;
  public off(eventName: Events.hidden, handler?: (event: HiddenEvent) => void): void;
  public off(eventName: Events.start, handler?: (event: GameStartEvent) => void): void;
  public off(eventName: Events.stop, handler?: (event: GameStopEvent) => void): void;
  public off(eventName: Events.preupdate, handler?: (event: PreUpdateEvent<Engine>) => void): void;
  public off(eventName: Events.postupdate, handler?: (event: PostUpdateEvent<Engine>) => void): void;
  public off(eventName: Events.preframe, handler?: (event: PreFrameEvent) => void): void;
  public off(eventName: Events.postframe, handler?: (event: PostFrameEvent) => void): void;
  public off(eventName: Events.predraw, handler?: (event: PreDrawEvent) => void): void;
  public off(eventName: Events.postdraw, handler?: (event: PostDrawEvent) => void): void;
  public off(eventName: string, handler?: (event: GameEvent<any>) => void): void;
  public off(eventName: string, handler?: (event: any) => void): void {
    super.off(eventName, handler);
  }

  /**
   * Default [[EngineOptions]]
   */
  private static _DEFAULT_ENGINE_OPTIONS: EngineOptions = {
    width: 0,
    height: 0,
    enableCanvasTransparency: true,
    canvasElementId: '',
    canvasElement: undefined,
    pointerScope: Input.PointerScope.Document,
    suppressConsoleBootMessage: null,
    suppressMinimumBrowserFeatureDetection: null,
    suppressHiDPIScaling: null,
    suppressPlayButton: null,
    scrollPreventionMode: ScrollPreventionMode.Canvas,
    backgroundColor: Color.fromHex('#2185d0') // Excalibur blue
  };

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
   *   pointerScope: ex.Input.PointerScope.Document, // the scope of capturing pointer (mouse/touch) events
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
    super();

    options = { ...Engine._DEFAULT_ENGINE_OPTIONS, ...options };

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
      this._logger.debug('Engine viewport is fullscreen');
      displayMode = DisplayMode.FullScreen;
    }

    // eslint-disable-next-line
    this.ctx = this.canvas.getContext('2d', { alpha: this.enableCanvasTransparency });

    this.screen = new Screen({
      canvas: this.canvas,
      context: this.ctx,
      antialiasing: options.antialiasing ?? true,
      browser: this.browser,
      viewport: options.viewport ?? { width: options.width, height: options.height },
      resolution: options.resolution,
      displayMode,
      position: options.position,
      pixelRatio: options.suppressHiDPIScaling ? 1 : null
    });

    this.screen.applyResolutionAndViewport();

    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor.clone();
    }

    this.enableCanvasTransparency = options.enableCanvasTransparency;

    this._loader = new Loader();
    this.debug = new Debug(this);

    this._initialize(options);

    this.rootScene = this.currentScene = new Scene(this);

    this.addScene('root', this.rootScene);
    this.goToScene('root');
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
   * Plays a sprite animation on the screen at the specified `x` and `y`
   * (in game coordinates, not screen pixels). These animations play
   * independent of actors, and will be cleaned up internally as soon
   * as they are complete. Note animations that loop will never be
   * cleaned up.
   *
   * @param animation  Animation to play
   * @param x          x game coordinate to play the animation
   * @param y          y game coordinate to play the animation
   */
  public playAnimation(animation: Animation, x: number, y: number) {
    this._animations.push(new AnimationNode(animation, x, y));
  }

  /**
   * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
   * will be drawn and updated.
   */
  public addTileMap(tileMap: TileMap) {
    this.currentScene.addTileMap(tileMap);
  }

  /**
   * Removes a [[TileMap]] from the [[currentScene]], it will no longer be drawn or updated.
   */
  public removeTileMap(tileMap: TileMap) {
    this.currentScene.removeTileMap(tileMap);
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
   *
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
   *
   * @param actor  The actor to add to the [[currentScene]]
   */
  public add(actor: Actor): void;

  /**
   * Adds a [[ScreenElement]] to the [[currentScene]] of the game,
   * ScreenElements do not participate in collisions, instead the
   * remain in the same place on the screen.
   * @param screenElement  The ScreenElement to add to the [[currentScene]]
   */
  public add(screenElement: ScreenElement): void;
  public add(entity: any): void {
    if (entity instanceof ScreenElement) {
      this.currentScene.addScreenElement(entity);
      return;
    }
    if (entity instanceof Actor) {
      this._addChild(entity);
    }
    if (entity instanceof Timer) {
      this.addTimer(entity);
    }

    if (entity instanceof TileMap) {
      this.addTileMap(entity);
    }

    if (arguments.length === 2) {
      this.addScene(<string>arguments[0], <Scene>arguments[1]);
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
   *
   * @param actor  The actor to remove from the [[currentScene]].
   */
  public remove(actor: Actor): void;
  /**
   * Removes a [[ScreenElement]] to the scene, it will no longer be drawn or updated
   * @param screenElement  The ScreenElement to remove from the [[currentScene]]
   */
  public remove(screenElement: ScreenElement): void;
  public remove(entity: any): void {
    if (entity instanceof ScreenElement) {
      this.currentScene.removeScreenElement(entity);
      return;
    }
    if (entity instanceof Actor) {
      this._removeChild(entity);
    }
    if (entity instanceof Timer) {
      this.removeTimer(entity);
    }

    if (entity instanceof TileMap) {
      this.removeTileMap(entity);
    }

    if (entity instanceof Scene) {
      this.removeScene(entity);
    }

    if (typeof entity === 'string') {
      this.removeScene(entity);
    }
  }

  /**
   * Adds an actor to the [[currentScene]] of the game. This is synonymous
   * to calling `engine.currentScene.add(actor)`.
   *
   * Actors can only be drawn if they are a member of a scene, and only
   * the [[currentScene]] may be drawn or updated.
   *
   * @param actor  The actor to add to the [[currentScene]]
   */
  protected _addChild(actor: Actor) {
    this.currentScene.add(actor);
  }

  /**
   * Removes an actor from the [[currentScene]] of the game. This is synonymous
   * to calling `engine.currentScene.remove(actor)`.
   * Actors that are removed from a scene will no longer be drawn or updated.
   *
   * @param actor  The actor to remove from the [[currentScene]].
   */
  protected _removeChild(actor: Actor) {
    this.currentScene.remove(actor);
  }

  /**
   * Changes the currently updating and drawing scene to a different,
   * named scene. Calls the [[Scene]] lifecycle events.
   * @param key  The key of the scene to transition to.
   */
  public goToScene(key: string) {
    if (this.scenes[key]) {
      const oldScene = this.currentScene;
      const newScene = this.scenes[key];

      this._logger.debug('Going to scene:', key);

      // only deactivate when initialized
      if (this.currentScene.isInitialized) {
        this.currentScene._deactivate.call(this.currentScene, [oldScene, newScene]);
        this.currentScene.eventDispatcher.emit('deactivate', new DeactivateEvent(newScene, this.currentScene));
      }

      // set current scene to new one
      this.currentScene = newScene;
      this.screen.setCurrentCamera(newScene.camera);

      // initialize the current scene if has not been already
      this.currentScene._initialize(this);

      this.currentScene._activate.call(this.currentScene, [oldScene, newScene]);
      this.currentScene.eventDispatcher.emit('activate', new ActivateEvent(oldScene, this.currentScene));
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
    this.input = {
      keyboard: new Input.Keyboard(),
      pointers: new Input.Pointers(this),
      gamepads: new Input.Gamepads()
    };
    this.input.keyboard.init();
    this.input.pointers.init(options && options.pointerScope === Input.PointerScope.Document ? document : this.canvas);
    this.input.gamepads.init();

    // Issue #385 make use of the visibility api
    // https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API

    let hidden: keyof HTMLDocument, visibilityChange: string;
    if (typeof document.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if ('msHidden' in document) {
      hidden = <keyof HTMLDocument>'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if ('webkitHidden' in document) {
      hidden = <keyof HTMLDocument>'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    this.browser.document.on(visibilityChange, () => {
      if (document[hidden]) {
        this.eventDispatcher.emit('hidden', new HiddenEvent(this));
        this._logger.debug('Window hidden');
      } else {
        this.eventDispatcher.emit('visible', new VisibleEvent(this));
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
      super.emit('initialize', new InitializeEvent(engine, this));
      this._isInitialized = true;
    }
  }

  /**
   * Updates the entire state of the game
   * @param delta  Number of milliseconds elapsed since the last update.
   */
  private _update(delta: number) {
    if (this._isLoading) {
      // suspend updates until loading is finished
      this._loader.update(this, delta);
      // Update input listeners
      this.input.keyboard.update();
      this.input.pointers.update();
      this.input.gamepads.update();
      return;
    }
    this._overrideInitialize(this);
    // Publish preupdate events
    this._preupdate(delta);

    // process engine level events
    this.currentScene.update(this, delta);

    // update animations
    // TODO remove
    this._animations = this._animations.filter(function (a) {
      return !a.animation.isDone();
    });

    // Update input listeners
    this.input.keyboard.update();
    this.input.pointers.update();
    this.input.gamepads.update();

    // Publish update event
    this._postupdate(delta);
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
    const ctx = this.ctx;
    this._predraw(ctx, delta);

    if (this._isLoading) {
      this._loader.draw(ctx, delta);
      // Drawing nothing else while loading
      return;
    }

    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    ctx.fillStyle = this.backgroundColor.toString();
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.currentScene.draw(this.ctx, delta);

    // todo needs to be a better way of doing this
    let a = 0;
    const len = this._animations.length;
    for (a; a < len; a++) {
      this._animations[a].animation.draw(ctx, this._animations[a].x, this._animations[a].y);
    }

    // Draw debug information
    if (this.isDebug) {
      this.ctx.font = 'Consolas';
      this.ctx.fillStyle = this.debugColor.toString();
      const keys = this.input.keyboard.getKeys();
      for (let j = 0; j < keys.length; j++) {
        this.ctx.fillText(keys[j].toString() + ' : ' + (Input.Keys[keys[j]] ? Input.Keys[keys[j]] : 'Not Mapped'), 100, 10 * j + 10);
      }

      this.ctx.fillText('FPS:' + this.stats.currFrame.fps.toFixed(2).toString(), 10, 10);
    }

    // Post processing
    for (let i = 0; i < this.postProcessors.length; i++) {
      this.postProcessors[i].process(this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight), this.ctx);
    }

    this._postdraw(ctx, delta);
  }

  /**
   * @internal
   */
  public _predraw(_ctx: CanvasRenderingContext2D, delta: number) {
    this.emit('predraw', new PreDrawEvent(_ctx, delta, this));
    this.onPreDraw(_ctx, delta);
  }

  public onPreDraw(_ctx: CanvasRenderingContext2D, _delta: number) {
    // Override me
  }

  /**
   * @internal
   */
  public _postdraw(_ctx: CanvasRenderingContext2D, delta: number) {
    this.emit('postdraw', new PostDrawEvent(_ctx, delta, this));
    this.onPostDraw(_ctx, delta);
  }

  public onPostDraw(_ctx: CanvasRenderingContext2D, _delta: number) {
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
   * Starts the internal game loop for Excalibur after loading
   * any provided assets.
   * @param loader  Optional [[Loader]] to use to load resources. The default loader is [[Loader]], override to provide your own
   * custom loader.
   */
  public start(loader?: CanLoad): Promise<any> {
    if (!this._compatible) {
      const promise = new Promise();
      return promise.reject('Excalibur is incompatible with your browser');
    }
    // Changing resolution invalidates context state, so we need to capture it before applying
    this.screen.pushResolutionAndViewport();
    this.screen.resolution = this.screen.viewport;
    this.screen.applyResolutionAndViewport();

    let loadingComplete: Promise<any>;
    if (loader) {
      this._loader = loader;
      this._loader.suppressPlayButton = this._suppressPlayButton || this._loader.suppressPlayButton;
      this._loader.wireEngine(this);
      loadingComplete = this.load(this._loader);
    } else {
      loadingComplete = Promise.resolve();
    }

    loadingComplete.then(() => {
      this.screen.popResolutionAndViewport();
      this.screen.applyResolutionAndViewport();
      this.emit('start', new GameStartEvent(this));
    });

    if (!this._hasStarted) {
      this._hasStarted = true;
      this._logger.debug('Starting game...');
      this.browser.resume();
      Engine.createMainLoop(this, window.requestAnimationFrame, Date.now)();

      this._logger.debug('Game started');
    } else {
      // Game already started;
    }
    return loadingComplete;
  }

  public static createMainLoop(game: Engine, raf: (func: Function) => number, nowFn: () => number) {
    let lastTime = nowFn();

    return function mainloop() {
      if (!game._hasStarted) {
        return;
      }
      try {
        game._requestId = raf(mainloop);
        game.emit('preframe', new PreFrameEvent(game, game.stats.prevFrame));

        // Get the time to calculate time-elapsed
        const now = nowFn();
        let elapsed = Math.floor(now - lastTime) || 1;
        // Resolves issue #138 if the game has been paused, or blurred for
        // more than a 200 milliseconds, reset elapsed time to 1. This improves reliability
        // and provides more expected behavior when the engine comes back
        // into focus
        if (elapsed > 200) {
          elapsed = 1;
        }
        const delta = elapsed * game.timescale;

        // reset frame stats (reuse existing instances)
        const frameId = game.stats.prevFrame.id + 1;
        game.stats.currFrame.reset();
        game.stats.currFrame.id = frameId;
        game.stats.currFrame.delta = delta;
        game.stats.currFrame.fps = 1.0 / (delta / 1000);

        const beforeUpdate = nowFn();
        game._update(delta);
        const afterUpdate = nowFn();
        game._draw(delta);
        const afterDraw = nowFn();

        game.stats.currFrame.duration.update = afterUpdate - beforeUpdate;
        game.stats.currFrame.duration.draw = afterDraw - afterUpdate;

        lastTime = now;

        game.emit('postframe', new PostFrameEvent(game, game.stats.currFrame));
        game.stats.prevFrame.reset(game.stats.currFrame);
      } catch (e) {
        window.cancelAnimationFrame(game._requestId);
        game.stop();
        game.onFatalException(e);
      }
    };
  }

  /**
   * Stops Excalibur's main loop, useful for pausing the game.
   */
  public stop() {
    if (this._hasStarted) {
      this.emit('stop', new GameStopEvent(this));
      this.browser.pause();
      this._hasStarted = false;
      this._logger.debug('Game stopped');
    }
  }

  /**
   * Returns the Engine's Running status, Useful for checking whether engine is running or paused.
   */
  public isPaused(): boolean {
    return !this._hasStarted;
  }

  /**
   * Takes a screen shot of the current viewport and returns it as an
   * HTML Image Element.
   */
  public screenshot(): HTMLImageElement {
    const result = new Image();
    const raw = this.canvas.toDataURL('image/png');
    result.src = raw;
    return result;
  }

  /**
   * Another option available to you to load resources into the game.
   * Immediately after calling this the game will pause and the loading screen
   * will appear.
   * @param loader  Some [[Loadable]] such as a [[Loader]] collection, [[Sound]], or [[Texture]].
   */
  public load(loader: Loadable): Promise<any> {
    const complete = new Promise<any>();

    this._isLoading = true;

    loader.load().then(() => {
      if (this._suppressPlayButton) {
        setTimeout(() => {
          this._isLoading = false;
          complete.resolve();
          // Delay is to give the logo a chance to show, otherwise don't delay
        }, 500);
      } else {
        this._isLoading = false;
        complete.resolve();
      }
    });

    return complete;
  }
}

/**
 * @internal
 */
class AnimationNode {
  constructor(public animation: Animation, public x: number, public y: number) {}
}
