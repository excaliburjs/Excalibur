import { ILoadable } from './Interfaces/ILoadable';
import { Promise } from './Promises';
import { Vector } from './Algebra';
import { UIActor } from './UIActor';
import { Actor } from './Actor';
import { Timer } from './Timer';
import { TileMap } from './TileMap';
import { Animation } from './Drawing/Animation';
import { Loader } from './Loader';
import { Detector } from './Util/Detector';
import { VisibleEvent, HiddenEvent, GameStartEvent, GameStopEvent, PreUpdateEvent, 
   PostUpdateEvent, PreFrameEvent, PostFrameEvent, GameEvent, DeactivateEvent, ActivateEvent, PreDrawEvent, PostDrawEvent } from './Events';
import { ILoader } from './Interfaces/ILoader';
import { Logger, LogLevel } from './Util/Log';
import { Color } from './Drawing/Color';
import { Scene } from './Scene';
import { IPostProcessor } from './PostProcessing/IPostProcessor';
import { Debug } from './Debug';
import { Class } from './Class';
import * as Input from './Input/Index';
import { obsolete } from './Util/Decorators';
import * as Util from './Util/Util';

declare var EX_VERSION: string;

/**
 * Enum representing the different display modes available to Excalibur
 */
export enum DisplayMode {
   /** 
    * Show the game as full screen 
    */
   FullScreen,
   /** 
    * Scale the game to the parent DOM container 
    */
   Container,
   /** 
    * Show the game as a fixed size 
    */
   Fixed
}

/**
 * Defines the available options to configure the Excalibur engine at constructor time.
 */
export interface IEngineOptions {
   /**
    * Optionally configure the native canvas width of the game
    */
   width?: number;

   /**
    * Optionally configure the native canvas height of the game
    */
   height?: number;

   /**
    * Optionally specify the target canvas DOM element to render the game in
    */
   canvasElementId?: string;

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
}

/**
 * The Excalibur Engine
 *
 * The [[Engine]] is the main driver for a game. It is responsible for 
 * starting/stopping the game, maintaining state, transmitting events, 
 * loading resources, and managing the scene.
 *
 * [[include:Engine.md]]
 */
export class Engine extends Class {

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
    * The width of the game canvas in pixels
    */
   public width: number;
   /**
    * The height of the game canvas in pixels
    */
   public height: number;

   /**
    * Access engine input like pointer, keyboard, or gamepad
    */
   public input: Input.IEngineInput;


   private _hasStarted: boolean = false;

   /**
    * Current FPS
    * @obsolete Use [[ex.FrameStats.fps|ex.Engine.stats.fps]]. Will be deprecated in future versions.
    */
   @obsolete({ alternateMethod: 'ex.Engine.stats.currFrame.fps' })
   public get fps(): number {
      return this.stats.currFrame.fps;
   }

   /**
    * Access Excalibur debugging functionality.
    */
   public debug = new Debug(this);

   /**
    * Access [[stats]] that holds frame statistics.
    */
   public get stats() {
      return this.debug.stats;
   }

   /**
    * Gets or sets the list of post processors to apply at the end of drawing a frame (such as [[ColorBlindCorrector]])
    */
   public postProcessors: IPostProcessor[] = [];

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
   public scenes: { [key: string]: Scene; } = {};

   private _animations: AnimationNode[] = [];

   /**
    * Indicates whether the engine is set to fullscreen or not
    */
   public isFullscreen: boolean = false;

   /**
    * Indicates the current [[DisplayMode]] of the engine.
    */
   public displayMode: DisplayMode = DisplayMode.FullScreen;

   /**
    * Indicates whether audio should be paused when the game is no longer visible.
    */
   public pauseAudioWhenHidden: boolean = true;

   /**
    * Indicates whether the engine should draw with debug information
    */
   public isDebug: boolean = false;
   public debugColor: Color = new Color(255, 255, 255);
   /**
    * Sets the background color for the engine.
    */
   public backgroundColor: Color = new Color(0, 0, 100);

   /**
    * The action to take when a fatal exception is thrown
    */
   public onFatalException = (e) => { Logger.getInstance().fatal(e); };

   private _logger: Logger;
   private _isSmoothingEnabled: boolean = true;

   // this is a reference to the current requestAnimationFrame return value
   private _requestId: number;

   // this determines whether excalibur is compatible with your browser
   private _compatible: boolean;

   private _timescale: number = 1.0;

   // loading
   private _loader: ILoader;
   private _isLoading: boolean = false;

   public on(eventName: ex.Events.visible, handler: (event?: VisibleEvent) => void);
   public on(eventName: ex.Events.hidden, handler: (event?: HiddenEvent) => void);
   public on(eventName: ex.Events.start, handler: (event?: GameStartEvent) => void);
   public on(eventName: ex.Events.stop, handler: (event?: GameStopEvent) => void);
   public on(eventName: ex.Events.preupdate, handler: (event?: PreUpdateEvent) => void);
   public on(eventName: ex.Events.postupdate, handler: (event?: PostUpdateEvent) => void);
   public on(eventName: ex.Events.preframe, handler: (event?: PreFrameEvent) => void);
   public on(eventName: ex.Events.postframe, handler: (event?: PostFrameEvent) => void);
   public on(eventName: string, handler: (event?: GameEvent) => void);
   public on(eventName: string, handler: (event?: GameEvent) => void) {
      super.on(eventName, handler);
   }

   /**
    * Default [[IEngineOptions]]
    */
   private static _DefaultEngineOptions: IEngineOptions = {
      width: 0,
      height: 0,
      canvasElementId: '',
      pointerScope: Input.PointerScope.Document,
      suppressConsoleBootMessage: null,
      suppressMinimumBrowserFeatureDetection: null
   };

   /**
    * Creates a new game using the given [[IEngineOptions]]. By default, if no options are provided,
    * the game will be rendered full screen (taking up all available browser window space).
    * You can customize the game rendering through [[IEngineOptions]].
    * 
    * Example:
    * 
    * ```js
    * var game = new ex.Engine({ 
    *   width: 0, // the width of the canvas
    *   height: 0, // the height of the canvas
    *   canvasElementId: '', // the DOM canvas element ID, if you are providing your own
    *   displayMode: ex.DisplayMode.FullScreen, // the display mode
    *   pointerScope: ex.Input.PointerScope.Document // the scope of capturing pointer (mouse/touch) events
    * });
    *
    * // call game.start, which is a Promise
    * game.start().then(function () {
    *   // ready, set, go!
    * });
    * ```
    */
   constructor(options?: IEngineOptions) {
      super();

      options = Util.extend({}, Engine._DefaultEngineOptions, options);

      // Check compatibility 
      var detector = new Detector();
      if (!options.suppressMinimumBrowserFeatureDetection && !(this._compatible = detector.test())) {
         var message = document.createElement('div');
         message.innerText = 'Sorry, your browser does not support all the features needed for Excalibur';
         document.body.appendChild(message);

         detector.failedTests.forEach(function (test) {
            var testMessage = document.createElement('div');
            testMessage.innerText = 'Browser feature missing ' + test;
            document.body.appendChild(testMessage);
         });

         if (options.canvasElementId) {
            var canvas = document.getElementById(options.canvasElementId);
            if (canvas) {
               canvas.parentElement.removeChild(canvas);
            }
         }

         return;
      } else {
         this._compatible = true;
      }

      // Use native console API for color fun
      if (console.log && !options.suppressConsoleBootMessage) {
         console.log(`%cPowered by Excalibur.js (v${EX_VERSION})`,
            'background: #176BAA; color: white; border-radius: 5px; padding: 15px; font-size: 1.5em; line-height: 80px;');
         console.log('\n\
      /| ________________\n\
O|===|* >________________>\n\
      \\|');
         console.log('Visit', 'http://excaliburjs.com', 'for more information');
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
      } else {
         this._logger.debug('Using generated canvas element');
         this.canvas = <HTMLCanvasElement>document.createElement('canvas');
      }
      if (options.width && options.height) {
         if (options.displayMode === undefined) {
            this.displayMode = DisplayMode.Fixed;
         }
         this._logger.debug('Engine viewport is size ' + options.width + ' x ' + options.height);
         this.width = options.width;
         this.canvas.width = options.width;
         this.height = options.height;
         this.canvas.height = options.height;

      } else if (!options.displayMode) {
         this._logger.debug('Engine viewport is fullscreen');
         this.displayMode = DisplayMode.FullScreen;
      }


      this._loader = new Loader();

      this._initialize(options);

      this.rootScene = this.currentScene = new Scene(this);

      this.addScene('root', this.rootScene);
      this.goToScene('root');
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
      scene.engine = this;
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
         for (var key in this.scenes) {
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
    * Adds a [[UIActor]] to the [[currentScene]] of the game, 
    * UIActors do not participate in collisions, instead the 
    * remain in the same place on the screen.
    * @param uiActor  The UIActor to add to the [[currentScene]]
    */
   public add(uiActor: UIActor): void;
   public add(entity: any): void {
      if (entity instanceof UIActor) {
         this.currentScene.addUIActor(entity);
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
         this.addScene((<string>arguments[0]), (<Scene>arguments[1]));
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
    * Removes a [[UIActor]] to the scene, it will no longer be drawn or updated
    * @param uiActor  The UIActor to remove from the [[currentScene]]
    */
   public remove(uiActor: UIActor): void;
   public remove(entity: any): void {
      if (entity instanceof UIActor) {
         this.currentScene.removeUIActor(entity);
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
    * @param key  The key of the scene to trasition to.       
    */
   public goToScene(key: string) {
      if (this.scenes[key]) {
         var oldScene = this.currentScene;
         var newScene = this.scenes[key];

         this._logger.debug('Going to scene:', key);

         // only deactivate when initialized
         if (this.currentScene.isInitialized) {
            this.currentScene.onDeactivate.call(this.currentScene);
            this.currentScene.eventDispatcher.emit('deactivate', new DeactivateEvent(newScene));
         }

         // set current scene to new one
         this.currentScene = newScene;

         // initialize the current scene if has not been already
         this.currentScene._initialize(this);

         this.currentScene.onActivate.call(this.currentScene);
         this.currentScene.eventDispatcher.emit('activate', new ActivateEvent(oldScene));
      } else {
         this._logger.error('Scene', key, 'does not exist!');
      }
   }

   /**
    * Returns the width of the engine's drawing surface in pixels.
    */
   public getWidth(): number {
      if (this.currentScene && this.currentScene.camera) {
         return this.width / this.currentScene.camera.getZoom();
      }
      return this.width;
   }

   /**
    * Returns the height of the engine's drawing surface in pixels.
    */
   public getHeight(): number {
      if (this.currentScene && this.currentScene.camera) {
         return this.height / this.currentScene.camera.getZoom();
      }
      return this.height;
   }

   /**
    * Transforms the current x, y from screen coordinates to world coordinates
    * @param point  Screen coordinate to convert
    */
   public screenToWorldCoordinates(point: Vector): Vector {

      var newX = point.x;
      var newY = point.y;

      // transform back to world space
      newX = (newX / this.canvas.clientWidth) * this.getWidth();
      newY = (newY / this.canvas.clientHeight) * this.getHeight();


      // transform based on zoom
      newX = newX - this.getWidth() / 2;
      newY = newY - this.getHeight() / 2;

      // shift by focus
      if (this.currentScene && this.currentScene.camera) {
         var focus = this.currentScene.camera.getFocus();
         newX += focus.x;
         newY += focus.y;
      }

      return new Vector(Math.floor(newX), Math.floor(newY));
   }

   /**
    * Transforms a world coordinate, to a screen coordinate
    * @param point  World coordinate to convert
    */
   public worldToScreenCoordinates(point: Vector): Vector {

      var screenX = point.x;
      var screenY = point.y;

      // shift by focus
      if (this.currentScene && this.currentScene.camera) {
         var focus = this.currentScene.camera.getFocus();
         screenX -= focus.x;
         screenY -= focus.y;
      }

      // transform back on zoom
      screenX = screenX + this.getWidth() / 2;
      screenY = screenY + this.getHeight() / 2;

      // transform back to screen space
      screenX = (screenX * this.canvas.clientWidth) / this.getWidth();
      screenY = (screenY * this.canvas.clientHeight) / this.getHeight();

      return new Vector(Math.floor(screenX), Math.floor(screenY));
   }

   /**
    * Sets the internal canvas height based on the selected display mode.
    */
   private _setHeightByDisplayMode(parent: any) {
      if (this.displayMode === DisplayMode.Container) {
         this.width = this.canvas.width = parent.clientWidth;
         this.height = this.canvas.height = parent.clientHeight;
      }

      if (this.displayMode === DisplayMode.FullScreen) {
         document.body.style.margin = '0px';
         document.body.style.overflow = 'hidden';
         this.width = this.canvas.width = parent.innerWidth;
         this.height = this.canvas.height = parent.innerHeight;
      }
   }

   /**
    * Initializes the internal canvas, rendering context, displaymode, and native event listeners
    */
   private _initialize(options?: IEngineOptions) {
      if (this.displayMode === DisplayMode.FullScreen || this.displayMode === DisplayMode.Container) {


         var parent = <any>(this.displayMode === DisplayMode.Container ?
            <any>(this.canvas.parentElement || document.body) : <any>window);

         this._setHeightByDisplayMode(parent);

         window.addEventListener('resize', (ev: UIEvent) => {
            this._logger.debug('View port resized');
            this._setHeightByDisplayMode(parent);
            this._logger.info('parent.clientHeight ' + parent.clientHeight);
            this.setAntialiasing(this._isSmoothingEnabled);
         });
      }

      // initialize inputs
      this.input = {
         keyboard: new Input.Keyboard(this),
         pointers: new Input.Pointers(this),
         gamepads: new Input.Gamepads(this)
      };
      this.input.keyboard.init();
      this.input.pointers.init(options ? options.pointerScope : Input.PointerScope.Document);
      this.input.gamepads.init();

      // Issue #385 make use of the visibility api
      // https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API

      var hidden, visibilityChange;
      if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support 
         hidden = 'hidden';
         visibilityChange = 'visibilitychange';
      } else if ('msHidden' in document) {
         hidden = 'msHidden';
         visibilityChange = 'msvisibilitychange';
      } else if ('webkitHidden' in document) {
         hidden = 'webkitHidden';
         visibilityChange = 'webkitvisibilitychange';
      }

      document.addEventListener(visibilityChange, () => {

         if (document[hidden]) {
            this.eventDispatcher.emit('hidden', new HiddenEvent());
            this._logger.debug('Window hidden');
         } else {
            this.eventDispatcher.emit('visible', new VisibleEvent());
            this._logger.debug('Window visible');
         }
      });

      this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
      if (!this.canvasElementId) {
         document.body.appendChild(this.canvas);
      }

   }

   /**
    * If supported by the browser, this will set the antialiasing flag on the
    * canvas. Set this to `false` if you want a 'jagged' pixel art look to your
    * image resources.
    * @param isSmooth  Set smoothing to true or false       
    */
   public setAntialiasing(isSmooth: boolean) {
      this._isSmoothingEnabled = isSmooth;

      var ctx: any = this.ctx;
      ctx.imageSmoothingEnabled = isSmooth;
      for (var smoothing of ['webkitImageSmoothingEnabled', 'mozImageSmoothingEnabled', 'msImageSmoothingEnabled']) {
         if (smoothing in ctx) {
            ctx[smoothing] = isSmooth;
         }
      };
   }

   /**
    * Return the current smoothing status of the canvas
    */
   public getAntialiasing(): boolean {
      return (<any>this.ctx).imageSmoothingEnabled ||
         (<any>this.ctx).webkitImageSmoothingEnabled ||
         (<any>this.ctx).mozImageSmoothingEnabled ||
         (<any>this.ctx).msImageSmoothingEnabled;
   }


   /**
    * Updates the entire state of the game
    * @param delta  Number of milliseconds elapsed since the last update.
    */
   private _update(delta: number) {
      if (this._isLoading) {
         // suspend updates untill loading is finished
         this._loader.update(this, delta);
         // Update input listeners
         this.input.keyboard.update(delta);
         this.input.pointers.update(delta);
         this.input.gamepads.update(delta);
         return;
      }
      this.emit('preupdate', new PreUpdateEvent(this, delta, this));
      // process engine level events
      this.currentScene.update(this, delta);

      // update animations
      this._animations = this._animations.filter(function (a) {
         return !a.animation.isDone();
      });

      // Update input listeners
      this.input.keyboard.update(delta);
      this.input.pointers.update(delta);
      this.input.gamepads.update(delta);

      // Publish update event
      // TODO: Obsolete `update` event on Engine
      this.eventDispatcher.emit('update', new PostUpdateEvent(this, delta, this));
      this.emit('postupdate', new PostUpdateEvent(this, delta, this));
   }

   /**
    * Draws the entire game
    * @param delta  Number of milliseconds elapsed since the last draw.
    */
   private _draw(delta: number) {
      var ctx = this.ctx;
      this.emit('predraw', new PreDrawEvent(ctx, delta, this));
      if (this._isLoading) {
         this._loader.draw(ctx, delta);
         // Drawing nothing else while loading
         return;
      }

      ctx.clearRect(0, 0, this.width, this.height);
      ctx.fillStyle = this.backgroundColor.toString();
      ctx.fillRect(0, 0, this.width, this.height);

      this.currentScene.draw(this.ctx, delta);

      // todo needs to be a better way of doing this
      var a = 0, len = this._animations.length;
      for (a; a < len; a++) {
         this._animations[a].animation.draw(ctx, this._animations[a].x, this._animations[a].y);
      }

      // Draw debug information
      if (this.isDebug) {

         this.ctx.font = 'Consolas';
         this.ctx.fillStyle = this.debugColor.toString();
         var keys = this.input.keyboard.getKeys();
         for (var j = 0; j < keys.length; j++) {
            this.ctx.fillText(keys[j].toString() + ' : ' + (Input.Keys[keys[j]] ? Input.Keys[keys[j]] : 'Not Mapped'), 100, 10 * j + 10);
         }

         this.ctx.fillText('FPS:' + this.fps.toFixed(2).toString(), 10, 10);
      }

      // Post processing
      for (var i = 0; i < this.postProcessors.length; i++) {
         this.postProcessors[i].process(this.ctx.getImageData(0, 0, this.width, this.height), this.ctx);
      }

      this.emit('postdraw', new PostDrawEvent(ctx, delta, this));
   }

   /**
    * Starts the internal game loop for Excalibur after loading
    * any provided assets. 
    * @param loader  Optional [[ILoader]] to use to load resources. The default loader is [[Loader]], override to provide your own
    * custom loader.
    */
   public start(loader?: ILoader): Promise<any> {
      if (!this._compatible) {
         var promise = new Promise();
         return promise.reject('Excalibur is incompatible with your browser');
      }

      var loadingComplete: Promise<any>;
      if (loader) {
         this._loader = loader;
         this._loader.wireEngine(this);
         loadingComplete = this.load(this._loader);
      } else {
         loadingComplete = Promise.resolve();
      }

      loadingComplete.then(() => {
         this.emit('start', new GameStartEvent(this));
      });

      if (!this._hasStarted) {
         this._hasStarted = true;
         this._logger.debug('Starting game...');

         Engine.createMainLoop(this, window.requestAnimationFrame, Date.now)();

         this._logger.debug('Game started');

      } else {
         // Game already started;
      }
      return loadingComplete;

   }

   public static createMainLoop(game: Engine, raf: (Function) => number, nowFn: () => number) {
      var lastTime = nowFn();

      return function mainloop() {
         if (!game._hasStarted) {
            return;
         }
         try {
            game._requestId = raf(mainloop);
            game.emit('preframe', new PreFrameEvent(game, game.stats.prevFrame, game));

            // Get the time to calculate time-elapsed
            var now = nowFn();
            var elapsed = Math.floor(now - lastTime) || 1;
            // Resolves issue #138 if the game has been paused, or blurred for 
            // more than a 200 milliseconds, reset elapsed time to 1. This improves reliability 
            // and provides more expected behavior when the engine comes back
            // into focus
            if (elapsed > 200) {
               elapsed = 1;
            }
            var delta = elapsed * game.timescale;

            // reset frame stats (reuse existing instances)
            var frameId = game.stats.prevFrame.id + 1;
            game.stats.prevFrame.reset(game.stats.currFrame);
            game.stats.currFrame.reset();
            game.stats.currFrame.id = frameId;
            game.stats.currFrame.delta = delta;
            game.stats.currFrame.fps = 1.0 / (delta / 1000);

            var beforeUpdate = nowFn();
            game._update(delta);
            var afterUpdate = nowFn();
            game._draw(delta);
            var afterDraw = nowFn();

            game.stats.currFrame.duration.update = afterUpdate - beforeUpdate;
            game.stats.currFrame.duration.draw = afterDraw - afterUpdate;

            lastTime = now;

            game.emit('postframe', new PostFrameEvent(game, game.stats.currFrame, game));
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
         this._hasStarted = false;
         this._logger.debug('Game stopped');
      }
   }

   /**
    * Takes a screen shot of the current viewport and returns it as an
    * HTML Image Element.
    */
   public screenshot(): HTMLImageElement {
      var result = new Image();
      var raw = this.canvas.toDataURL('image/png');
      result.src = raw;
      return result;
   }

   /**
    * Another option available to you to load resources into the game. 
    * Immediately after calling this the game will pause and the loading screen
    * will appear.
    * @param loader  Some [[ILoadable]] such as a [[Loader]] collection, [[Sound]], or [[Texture]].
    */
   public load(loader: ILoadable): Promise<any> {
      var complete = new Promise<any>();

      this._isLoading = true;

      loader.load().then(() => {
         setTimeout(() => {
            this._isLoading = false;
            complete.resolve();
         }, 500);
      });

      return complete;
   }

}

/**
 * @internal
 */
class AnimationNode {
   constructor(public animation: Animation, public x: number, public y: number) { }
}