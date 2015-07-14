/// <reference path="MonkeyPatch.ts" />
/// <reference path="Events.ts" />
/// <reference path="EventDispatcher.ts" />
/// <reference path="Class.ts" />
/// <reference path="Drawing/Color.ts" />
/// <reference path="Util/Log.ts" />
/// <reference path="Collision/Side.ts" />
/// <reference path="Scene.ts" />
/// <reference path="Actor.ts" />
/// <reference path="UIActor.ts" />
/// <reference path="Trigger.ts" />
/// <reference path="Particles.ts" />
/// <reference path="Drawing/Animation.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Sound.ts" />
/// <reference path="Loader.ts" />
/// <reference path="Promises.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="Binding.ts" />
/// <reference path="TileMap.ts" />
/// <reference path="Label.ts" />
/// <reference path="PostProcessing/IPostProcessor.ts"/>
/// <reference path="Input/IEngineInput.ts"/>
/// <reference path="Input/Pointer.ts"/>
/// <reference path="Input/Keyboard.ts"/>
/// <reference path="Input/Gamepad.ts"/>

/**
 * # Welcome to the Excalibur API
 *
 * This documentation is automatically generated from the Excalibur
 * source code on [GitHub](http://github.com/excaliburjs/Excalibur).
 *
 * If you're just starting out, we recommend reading the tutorials and guides
 * on [Excaliburjs.com](http://excaliburjs.com/docs). If you have questions,
 * feel free to get help on the [Excalibur.js mailing list](https://groups.google.com/forum/#!forum/excaliburjs).
 *
 * If you're looking for a specific method or property, you can search the documentation
 * using the search icon at the top or just start typing.
 *
 * ## Where to Start
 *
 * These are the core concepts of Excalibur that you should be
 * familiar with.
 *
 * - [[Engine|Intro to the Engine]]
 *   - [[EventDispatcher|Eventing]]
 * - [[Scene|Working with Scenes]]
 *   - [[BaseCamera|Working with Cameras]]
 * - [[Actor|Working with Actors]]
 *   - [[Label|Labels]]
 *   - [[Trigger|Triggers]]
 *   - [[UIActor|UI Actors (HUD)]]
 *   - [[ActionContext|Action API]]
 *   - [[Group|Groups]]
 *
 * ## Working with Resources
 *
 * Excalibur provides easy ways of loading assets, from images to JSON files.
 *
 * - [[Loader|Working with the Loader]]
 * - [[Texture|Loading Textures]]
 * - [[Sound|Loading Sounds]]
 * - [[Resource|Loading Generic Resources]]
 *
 * ## Working with Input
 *
 * Excalibur comes built-in with support for mouse, keyboard, touch, and controllers.
 *
 * - [[Pointers|Mouse and Touch]]
 * - [[Keyboard]]
 * - [[Gamepads|Controller Support]]
 * 
 * ## Working with Media
 *
 * Add sounds, images, and animations to your game.
 *
 * - [[Sprite|Working with Sprites]]
 * - [[Sound|Working with Sounds]]
 * - [[SpriteSheet|Working with SpriteSheets]]
 * - [[Animation|Working with Animations]]
 *
 * ## Effects and Particles
 *
 * Every game needs an explosion or two. Add sprite effects such as lighten,
 * darken, and colorize.
 *
 * - [[Effects|Sprite Effects]]
 * - [[ParticleEmitter|Particle Emitters]]
 *
 * ## Math
 *
 * These classes provide the basics for math & algebra operations.
 *
 * - [[Point]]
 * - [[Vector]]
 * - [[Ray]]
 * - [[Line]]
 * - [[Projection]]
 *
 * ## Utilities
 *
 * - [[Util|Utility Functions]] 
 * - [[Promise|Promises and Async]]
 * - [[Logger|Logging]]
 * - [[Color|Colors]]
 * - [[Timer|Timers]]
 */
module ex {

   /**
    * Defines the available options to configure the Excalibur engine at constructor time.
    */
   export interface IEngineOptions {
      /**
       * Configures the width of the game optionlaly.
       */
      width?: number;

      /**
       * Configures the height of the game optionally.
       */
      height?: number;

      /**
       * Configures the canvas element Id to use optionally.
       */
      canvasElementId?: string;

      /**
       * Configures the display mode.
       */
      displayMode?: ex.DisplayMode;

      /**
       * Configures the pointer scope. Pointers scoped to the 'Canvas' can only fire events within the canvas viewport; whereas, 'Document'
       * (default) scoped will fire anywhere on the page.
       */
      pointerScope?: ex.Input.PointerScope;
   }

   /**
    * The Excalibur Engine
    *
    * The [[Engine]] is the main driver for a game. It is responsible for 
    * starting/stopping the game, maintaining state, transmitting events, 
    * loading resources, and managing the scene.
    *
    * Excalibur uses the HTML5 Canvas API for drawing your game to the screen.
    * The canvas is available to all `draw` functions for raw manipulation,
    * but Excalibur is meant to simplify or completely remove the need to use
    * the canvas directly.
    *
    * ## Creating a Game
    *
    * To create a new game, create a new instance of [[Engine]] and pass in
    * the configuration ([[IEngineOptions]]). Excalibur only supports a single
    * instance of a game at a time, so it is safe to use globally.
    *
    * You can then call [[start]] which starts the game and optionally accepts
    * a [[Loader]] which you can use to pre-load assets.
    *
    * ```js
    * var game = new ex.Engine({ width: 800, height: 600 });
    *
    * // call game.start, which is a Promise
    * game.start().then(function () {
    *   // ready, set, go!
    * });
    * ```
    *
    * ## The Main Loop
    *
    * The Excalibur engine uses a simple main loop. The engine updates and renders
    * the "scene graph" which is the [[Scene|scenes]] and the tree of [[Actor|actors]] within that
    * scene. Only one [[Scene]] can be active at once, the engine does not update/draw any other
    * scene, which means any actors will not be updated/drawn if they are part of a deactivated scene.
    *
    * **Scene Graph**
    *
    * ```
    * Engine
    *   |_ Scene 1 (activated)
    *     |_ Actor 1
    *       |_ Child Actor 1
    *     |_ Actor 2
    *   |_ Scene 2 (deactiveated)
    *   |_ Scene 3 (deactiveated)
    * ```
    *
    * The engine splits the game into two primary responsibilities: updating and drawing. This is
    * to keep your game smart about splitting duties so that you aren't drawing when doing
    * logic or performing logic as you draw.
    *
    * ### Update Loop
    *
    * The first operation run is the [[Engine.update|update]] loop. [[Actor]] and [[Scene]] both implement
    * an overridable/extendable `update` method. Use it to perform any logic-based operations
    * in your game for a particular class.
    *
    * ### Draw Loop
    *
    * The next step is the [[Engine.draw|draw]] loop. A [[Scene]] loops through its child [[Actor|actors]] and
    * draws each one. You can override the `draw` method on an actor to customize its drawing.
    * You should **not** perform any logic in a draw call, it should only relate to drawing.
    *
    * ## Working with Scenes
    *
    * The engine automatically creates a "root" [[Scene]]. You can use this for whatever you want.
    * You can manipulate scenes using [[Engine.add|add]], [[Engine.remove|remove]], 
    * and [[Engine.goToScene|goToScene]]. You can overwrite or remove the `root` scene if 
    * you want. There always has to be at least one scene and only **one** scene can be 
    * active at any one time.
    *
    * Learn more about the [[Scene|scene lifecycle]].
    *
    * ### Adding a scene
    *
    * ```js
    * var game = new ex.Engine();
    *
    * // create a new level
    * var level1 = new ex.Scene();
    *
    * // add level 1 to the game
    * game.add("level1", level1);
    *
    * // in response to user input, go to level 1
    * game.goToScene("level1");
    *
    * // go back to main menu
    * game.goToScene("root");
    * ```
    *
    * ### Accessing the current scene
    * 
    * To add actors and other entities to the current [[Scene]], you can use [[Engine.add|add]]. Alternatively,
    * you can use [[Engine.currentScene]] to directly access the current scene.
    *
    * ## Managing the Viewport
    *
    * Excalibur supports multiple [[DisplayMode|display modes]] for a game. Pass in a `displayMode`
    * option when creating a game to customize the viewport.    
    *
    * ## Extending the Engine
    *
    * For complex games, any entity that inherits [[Class]] can be extended to override built-in
    * functionality. This is recommended for [[Actor|actors]] and [[Scene|scenes]], especially.
    *
    * You can customize the options or provide more for your game by extending [[Engine]].
    *
    * **TypeScript**
    *
    * ```ts
    * class Game extends ex.Engine {
    * 
    *   constructor() {
    *     super({ width: 800, height: 600, displayMode: DisplayMode.FullScreen });
    *   }
    * 
    *   public start() {
    *     // add custom scenes
    *     this.add("mainmenu", new MainMenu());
    *
    *     return super.start(myLoader).then(() => {
    *
    *       this.goToScene("mainmenu");
    *
    *       // custom start-up
    *     });
    *   }
    * }
    *
    * var game = new Game();
    * game.start();
    * ```
    *
    * **Javascript**
    *
    * ```js
    * var Game = ex.Engine.extend({
    * 
    *   constructor: function () {
    *     Engine.call(this, { width: 800, height: 600, displayMode: DisplayMode.FullScreen });
    *   }
    * 
    *   start: function() {
    *     // add custom scenes
    *     this.add("mainmenu", new MainMenu());
    *
    *     var _this = this;
    *     return Engine.prototype.start.call(this, myLoader).then(function() {
    *
    *       _this.goToScene("mainmenu");
    *
    *       // custom start-up
    *     });
    *   }
    * });
    *
    * var game = new Game();
    * game.start();
    * ```
    */
   export class Engine extends ex.Class {

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
      public input: ex.Input.IEngineInput;

      /**
       * Gets or sets the [[CollisionStrategy]] for Excalibur actors
       */
      public collisionStrategy: CollisionStrategy = CollisionStrategy.DynamicAABBTree;

      private _hasStarted: boolean = false;

      /**
       * Current FPS
       */
      public fps: number = 0;
      
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
      public scenes: {[key: string]: Scene; } = {};
      
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

      // loading
      private _loader: ILoadable;
      private _isLoading: boolean = false;
      private _progress: number = 0;
      private _total: number = 1;
      private _loadingDraw: (ctx: CanvasRenderingContext2D, loaded: number, total: number) => void;

      /**
       * Creates a new game using the given [[IEngineOptions]]
       */
      constructor(options: IEngineOptions);
      /**
       * Creates a new game with the given options
       * @param width            The width in pixels of the Excalibur game viewport
       * @param height           The height in pixels of the Excalibur game viewport
       * @param canvasElementId  If this is not specified, then a new canvas will be created and inserted into the body.
       * @param displayMode      If this is not specified, then it will fall back to fixed if a height and width are specified, else the 
       * display mode will be FullScreen.
       * @obsolete Use [[Engine.constructor]] with [[IEngineOptions]]
       */
      constructor(width?: number, height?: number, canvasElementId?: string, displayMode?: DisplayMode);
      /**
       * @internal
       */
      constructor(args: any) {

         super();
         var width: number;
         var height: number;
         var canvasElementId: string;
         var displayMode: DisplayMode;
         var options: IEngineOptions = null;

         if (typeof arguments[0] === 'number') {
            width = <number>arguments[0];
            height = <number>arguments[1];
            canvasElementId = <string>arguments[2];
            displayMode = <DisplayMode>arguments[3];
         } else {
            options = <IEngineOptions>arguments[0] || {width: 0, height: 0, canvasElementId: '', displayMode: DisplayMode.FullScreen};
            width = options.width;
            height = options.height;
            canvasElementId = options.canvasElementId;
            displayMode = options.displayMode;
         }
         
         this._logger = Logger.getInstance();

         this._logger.info('Powered by Excalibur.js visit", "http://excaliburjs.com", "for more information.');
         
         this._logger.debug('Building engine...');

         this.canvasElementId = canvasElementId;

         if (canvasElementId) {
            this._logger.debug('Using Canvas element specified: ' + canvasElementId);
            this.canvas = <HTMLCanvasElement>document.getElementById(canvasElementId);
         } else {
            this._logger.debug('Using generated canvas element');
            this.canvas = <HTMLCanvasElement>document.createElement('canvas');
         }
         if (width && height) {
            if (displayMode === undefined) {
               this.displayMode = DisplayMode.Fixed;
            }
            this._logger.debug('Engine viewport is size ' + width + ' x ' + height);
            this.width = width; 
            this.canvas.width = width;
            this.height = height; 
            this.canvas.height = height;

         } else if (!displayMode) {
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
       * Adds an actor to the [[currentScene]] of the game. This is synonymous
       * to calling `engine.currentScene.addChild(actor)`.
       *
       * Actors can only be drawn if they are a member of a scene, and only
       * the [[currentScene]] may be drawn or updated.
       *
       * @param actor  The actor to add to the [[currentScene]]
       */
      public addChild(actor: Actor) {
         this.currentScene.addChild(actor);
      }

      /**
       * Removes an actor from the [[currentScene]] of the game. This is synonymous
       * to calling `engine.currentScene.removeChild(actor)`.
       * Actors that are removed from a scene will no longer be drawn or updated.
       *
       * @param actor  The actor to remove from the [[currentScene]].      
       */
      public removeChild(actor: Actor) {
         this.currentScene.removeChild(actor);
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
       * to calling `engine.currentScene.addChild(actor)`.
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
            this.addChild(entity);
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
            this.removeChild(entity);
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
               this.currentScene.eventDispatcher.publish('deactivate', new DeactivateEvent(newScene));
            }

            // set current scene to new one
            this.currentScene = newScene;

            if (!this.currentScene.isInitialized) {
               this.currentScene.onInitialize.call(this.currentScene, this);
               this.currentScene.eventDispatcher.publish('initialize', new InitializeEvent(this));
               this.currentScene.isInitialized = true;
            }

            this.currentScene.onActivate.call(this.currentScene);
            this.currentScene.eventDispatcher.publish('activate', new ActivateEvent(oldScene));
         } else {
            this._logger.error('Scene', key, 'does not exist!');
         }
      }

      /**
       * Returns the width of the engine's drawing surface in pixels.
       */
      public getWidth(): number {
         if(this.currentScene && this.currentScene.camera) {
            return this.width / this.currentScene.camera.getZoom();
         }
         return this.width;
      }

      /**
       * Returns the height of the engine's drawing surface in pixels.
       */
      public getHeight(): number {
         if(this.currentScene && this.currentScene.camera) {
            return this.height / this.currentScene.camera.getZoom();
         }
         return this.height;
      }

      /**
       * Transforms the current x, y from screen coordinates to world coordinates
       * @param point  Screen coordinate to convert
       */
      public screenToWorldCoordinates(point: Point): Point {
         // todo set these back this.canvas.clientWidth
         var newX = point.x;
         var newY = point.y;

         if(this.currentScene && this.currentScene.camera) {
            var focus = this.currentScene.camera.getFocus();
            newX = focus.x + (point.x - (this.getWidth() / 2));
            newY = focus.y + (point.y - (this.getHeight() / 2));
         }

         newX = Math.floor((newX / this.canvas.clientWidth) * this.getWidth());
         newY = Math.floor((newY / this.canvas.clientHeight) * this.getHeight());
         return new Point(newX, newY);
      }

      /**
       * Transforms a world coordinate, to a screen coordinate
       * @param point  World coordinate to convert
       */
      public worldToScreenCoordinates(point: Point): Point {
         // todo set these back this.canvas.clientWidth
         // this isn't correct on zoom
         var screenX = point.x;
         var screenY = point.y;

         if(this.currentScene && this.currentScene.camera) {
            var focus = this.currentScene.camera.getFocus();
            
            screenX = (point.x - focus.x) + (this.getWidth() / 2);
            screenY = (point.y - focus.y) + (this.getHeight() / 2);
         }

         screenX = Math.floor((screenX / this.getWidth()) * this.canvas.clientWidth);
         screenY = Math.floor((screenY / this.getHeight()) * this.canvas.clientHeight);

         return new Point(screenX, screenY);
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
            keyboard: new ex.Input.Keyboard(this),
            pointers: new ex.Input.Pointers(this),
            gamepads: new ex.Input.Gamepads(this)
         };
         this.input.keyboard.init();
         this.input.pointers.init(options ? options.pointerScope : ex.Input.PointerScope.Document);
         this.input.gamepads.init();
         

         // Issue #385 make use of the visibility api
         // https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API
         document.addEventListener('visibilitychange', () => {
            if (document.hidden || document.msHidden) {
               this.eventDispatcher.publish('hidden', new HiddenEvent());
               this._logger.debug('Window hidden');
            } else {
               this.eventDispatcher.publish('visible', new VisibleEvent());
               this._logger.debug('Window visible');
            }
         });

         /*
         // DEPRECATED in favor of visibility api
         window.addEventListener('blur', () => {
            this.eventDispatcher.publish(EventType[EventType.Blur], new BlurEvent());
         });

         window.addEventListener('focus', () => {
            this.eventDispatcher.publish(EventType[EventType.Focus], new FocusEvent());
         });*/
         
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
         (<any>this.ctx).imageSmoothingEnabled = isSmooth;
         (<any>this.ctx).webkitImageSmoothingEnabled = isSmooth;
         (<any>this.ctx).mozImageSmoothingEnabled = isSmooth;
         (<any>this.ctx).msImageSmoothingEnabled = isSmooth;
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
            return;
         }
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
         this.eventDispatcher.publish(EventType[EventType.Update], new UpdateEvent(delta));
      }

      /**
       * Draws the entire game
       * @param draw  Number of milliseconds elapsed since the last draw.
       */
      private _draw(delta: number) {
         var ctx = this.ctx;

         if (this._isLoading) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, this.width, this.height);
            this._drawLoadingBar(ctx, this._progress, this._total);
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

         this.fps = 1.0 / (delta / 1000);

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

         //ctx.drawImage(currentImage, 0, 0, this.width, this.height);

      }

      /**
       * Starts the internal game loop for Excalibur after loading
       * any provided assets. 
       * @param loader  Optional resources to load before starting the main loop. Some [[ILoadable]] such as a [[Loader]] collection, 
       * [[Sound]], or [[Texture]].
       */
      public start(loader?: ILoadable) : Promise<any> {
         var loadingComplete: Promise<any>;
         if (loader) {
            loader.wireEngine(this);
            loadingComplete = this.load(loader);
         } else {
            loadingComplete = Promise.wrap();
         }

         if (!this._hasStarted) {
            this._hasStarted = true;
            this._logger.debug('Starting game...');
            


            // Mainloop
            var lastTime = Date.now();
            var game = this;
            (function mainloop() {
               if (!game._hasStarted) {
                  return;
               }
               try {
                     game._requestId = window.requestAnimationFrame(mainloop);
   
                     // Get the time to calculate time-elapsed
                     var now = Date.now();
                     var elapsed = Math.floor(now - lastTime) || 1;
                     // Resolves issue #138 if the game has been paused, or blurred for 
                     // more than a 200 milliseconds, reset elapsed time to 1. This improves reliability 
                     // and provides more expected behavior when the engine comes back
                     // into focus
                     if(elapsed > 200) {
                        elapsed = 1;
                     }
                     game._update(elapsed);
                     game._draw(elapsed);
   
                     lastTime = now;
               
                  } catch (e) {
                     window.cancelAnimationFrame(game._requestId);
                     game.stop();
                     game.onFatalException(e);
                  }
            })();
            this._logger.debug('Game started');
            
         } else {
            // Game already started;
         }
         return loadingComplete;

      }

      /**
       * Stops Excalibur's main loop, useful for pausing the game.
       */
      public stop() {
         if (this._hasStarted) {
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
       * Draws the Excalibur loading bar
       * @param ctx     The canvas rendering context
       * @param loaded  Number of bytes loaded
       * @param total   Total number of bytes to load
       */
      private _drawLoadingBar(ctx: CanvasRenderingContext2D, loaded: number, total: number) {
         if (this._loadingDraw) {
            this._loadingDraw(ctx, loaded, total);
            return;
         }

         var y = this.canvas.height / 2;
         var width = this.canvas.width / 3;
         var x = width;
         

         // loading image
         var image = new Image();
         /* tslint:disable:max-line-length */
         // 64 bit string encoding of the excalibur logo
         image.src = 'data:image/png;base64,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';

         /* tslint:enable:max-line-length */
         var imageHeight = width * 3 / 8;
         var oldAntialias = this.getAntialiasing();
         this.setAntialiasing(true);
         ctx.drawImage(image, 0, 0, 800, 300, x, y - imageHeight - 20, width, imageHeight);

         // loading box
         ctx.strokeStyle = 'white';
         ctx.lineWidth = 2;
         ctx.strokeRect(x, y, width, 20);

         var progress = width * (loaded / total);
         ctx.fillStyle = 'white';
         var margin = 5;
         var progressWidth = progress - margin * 2;
         var height = 20 - margin * 2;
         ctx.fillRect(x + margin, y + margin, progressWidth > 0 ? progressWidth : 0, height);
         this.setAntialiasing(oldAntialias);
      }

      /**
       * Sets the loading screen draw function if you want to customize the draw
       * @param fcn  Callback to draw the loading screen which is passed a rendering context, the number of bytes loaded, and the total 
       * number of bytes to load.
       */
      public setLoadingDrawFunction(fcn: (ctx: CanvasRenderingContext2D, loaded: number, total: number) => void) {
         this._loadingDraw = fcn;
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

         loader.onprogress = (e) => {
            this._progress = <number>e.loaded;
            this._total = <number>e.total;
            this._logger.debug('Loading ' + (100 * this._progress / this._total).toFixed(0));
         };
         loader.oncomplete = () => {
            setTimeout(() => {
               this._isLoading = false;
               complete.resolve();
            }, 500);
         };
         loader.load();
         
         return complete;
      }

   }

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
    * @internal
    */
   class AnimationNode {
      constructor(public animation: Animation, public x: number, public y: number) { }
   }

}
