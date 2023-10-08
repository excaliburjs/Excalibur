import { Engine } from '../Engine';
import { Loader } from './Loader';
import { Scene } from '../Scene';
import { Transition } from './Transition';
import { BootLoader } from './BootLoader';
import { Logger } from '../Util/Log';
import { ActivateEvent, DeactivateEvent } from '../Events';


export interface Route {
  /**
   * Scene associated with this route
   */
  scene: Scene;
  /**
   * Optionally specify a transition when going "in" to this scene
   */
  in?: Transition;
  /**
   * Optionally specify a transition when going "out" of this scene
   */
  out?: Transition;
  /**
   * Optionally specify a loader for the scene
   */
  loader?: Loader;
}

// TODO do we want to support lazy loading routes?
export type RouteMap = Record<string, Scene | Route>;

export interface GoToOptions {
  sceneActivationData?: any,
  destinationIn?: Transition,
  sourceOut?: Transition,
  loader?: Loader
}

export interface RouterOptions {
  /**
   * Starting route
   */
  start: string; // TODO keyof RouteMap
  /**
   * Main loader
   */
  loader?: Loader,
  routes: RouteMap;
}

/**
 * The Router is responsible for managing scenes and changing scenes in Excalibur
 *
 * It deals with transitions, scene loaders, switching scenes
 */
export class Router {
  private _logger = Logger.getInstance();
  private _deferredGoto: string;
  private _initialized = false;

  currentSceneName: string;
  currentScene: Scene;
  currentTransition: Transition;

  routes: RouteMap;

  startScene: string;
  mainLoader: Loader;

  /**
   * The default [[Scene]] of the game, use [[Engine.goto]] to transition to different scenes.
   */
  public readonly rootScene: Scene;

  /**
   * Contains all the scenes currently registered with Excalibur
   */
  public readonly scenes: { [sceneName: string]: Scene } = {};

  private _sceneToLoader = new Map<string, Loader>();
  private _sceneToTransition = new Map<string, {in: Transition, out: Transition }>();
  private _loadedScenes = new Set<Scene>();

  constructor(private _engine: Engine) {
    this.rootScene = this.currentScene = new Scene();
    this.add('root', this.rootScene);
  }

  async onInitialize() {
    if (!this._initialized) {
      this._initialized = true;
      if (this._deferredGoto) {
        const deferredScene = this._deferredGoto;
        this._deferredGoto = null;
        await this.swapScene(deferredScene);
      } else {
        await this.swapScene('root');
      }
    }
  }

  get isInitialized() {
    return this._initialized;
  }

  /**
   * Configures the routes that the router knows about
   * 
   * Typically this is called at the beginning of the game to configure the scene route and never again.
   * @param options 
   */
  configure(options: RouterOptions) {
    this.routes = options.routes;
    this.mainLoader = options.loader ?? new BootLoader();
    this.startScene = options.start;
    for (const sceneKey in this.routes) {
      const sceneOrRoute = this.routes[sceneKey];
      this.add(sceneKey, sceneOrRoute);
    }
    this.swapScene(this.startScene);
    this.currentSceneName = this.startScene;
  }

  private _getLoader(sceneName: string) {
    return this._sceneToLoader.get(sceneName);
  }

  private _getInTransition(sceneName: string) {
    const sceneOrRoute = this.routes[sceneName];
    if (sceneOrRoute instanceof Scene) {
      return null;
    }
    return sceneOrRoute.in;
  }

  private _getOutTransition(sceneName: string) {
    const sceneOrRoute = this.routes[sceneName];
    if (sceneOrRoute instanceof Scene) {
      return null;
    }
    return sceneOrRoute.out;
  }

  getDeferredScene() {
    if (this._deferredGoto && this.scenes[this._deferredGoto]) {
      return this.scenes[this._deferredGoto];
    }
    return null;
  }

  /**
   * Adds additional Scenes to the game!
   * @param name 
   * @param sceneOrRoute 
   */
  add(name: string, sceneOrRoute: Scene | Route) {
    let parsedScene: Scene;
    let parsedRoute: Route;
    if (sceneOrRoute instanceof Scene) {
      parsedScene = sceneOrRoute;
      parsedRoute = { scene: sceneOrRoute };
    } else {
      parsedScene = sceneOrRoute.scene;
      parsedRoute = sceneOrRoute;
      const { loader, in: inTransition, out: outTransition } = parsedRoute;
      this._sceneToTransition.set(name, {in: inTransition, out: outTransition});
      this._sceneToLoader.set(name, loader);
    }

    if (this.scenes[name]) {
      this._logger.warn('Scene', name, 'already exists overwriting');
    }
    this.scenes[name] = parsedScene;
  }

  remove(scene: Scene): void;
  remove(name: string): void;
  remove(nameOrScene: string | Scene) {
    if (nameOrScene instanceof Scene) {
      // remove scene
      for (const key in this.scenes) {
        if (this.scenes.hasOwnProperty(key)) {
          if (this.scenes[key] === nameOrScene) {
            this._sceneToTransition.delete(key);
            this._sceneToLoader.delete(key);
            delete this.scenes[key];
          }
        }
      }
    }
    if (typeof nameOrScene === 'string') {
      // remove scene
      this._sceneToTransition.delete(nameOrScene);
      this._sceneToLoader.delete(nameOrScene);
      delete this.scenes[nameOrScene];
    }
  }

  async goto(destinationScene: string, options?: GoToOptions) {
    if (destinationScene === this.currentSceneName) {
      return;
    }

    options = {
      ...this._getOutTransition(this.currentSceneName),
      ...this._getInTransition(destinationScene),
      ...options };

    const { sourceOut, destinationIn, sceneActivationData } = options;

    const outTransition = sourceOut ?? this._getOutTransition(this.currentSceneName);
    const inTransition = destinationIn ?? this._getInTransition(destinationScene);

    // Run the out transition on the current scene if present
    if (outTransition) {
      this.currentTransition = outTransition;
      this._engine.currentScene.add(this.currentTransition);
      await this.currentTransition.done;
    }

    // Run the loader if present
    const loader = this._getLoader(destinationScene) ?? new BootLoader();
    const sceneToLoad = this._engine.scenes[destinationScene];
    if (!this._loadedScenes.has(sceneToLoad)) {
      sceneToLoad.onLoad(loader);
      await this._engine.load(loader);
      this._loadedScenes.add(sceneToLoad);
    }

    // Transition to the new scene
    await this.swapScene(destinationScene, sceneActivationData);
    this.currentScene = this._engine.currentScene;
    this.currentSceneName = destinationScene;

    this.currentTransition?.kill();
    this.currentTransition?.reset();

    // Run the in transition on the new scene if present
    if (inTransition) {
      this.currentTransition = inTransition;
      this._engine.currentScene.add(this.currentTransition);
      await this.currentTransition.done;
    }
    this.currentTransition?.kill();
    this.currentTransition?.reset();

    this.currentTransition = null;
  }

  async swapScene<TData = undefined>(destinationScene: string, data?: TData): Promise<void> {
    const engine = this._engine;
    // if not yet initialized defer goToScene
    if (!this.isInitialized) {
      this._deferredGoto = destinationScene;
      return;
    }

    if (this.scenes[destinationScene]) {
      const previousScene = this.currentScene;
      const nextScene = this.scenes[destinationScene];

      this._logger.debug('Going to scene:', destinationScene);

      // only deactivate when initialized
      if (this.currentScene.isInitialized) {
        const context = { engine, previousScene, nextScene };
        await this.currentScene._deactivate(context);
        this.currentScene.events.emit('deactivate', new DeactivateEvent(context, this.currentScene));
      }

      // set current scene to new one
      this.currentScene = nextScene;
      this.currentSceneName = destinationScene;
      engine.screen.setCurrentCamera(nextScene.camera);

      // initialize the current scene if has not been already
      await this.currentScene._initialize(engine);

      const context = { engine, previousScene, nextScene, data };
      await this.currentScene._activate(context);
      this.currentScene.events.emit('activate', new ActivateEvent(context, this.currentScene));
    } else {
      this._logger.error('Scene', destinationScene, 'does not exist!');
    }
  }

  update(_elapsedMilliseconds: number) {
    if (this.currentTransition) {
      this.currentTransition.execute();
    }
  }
}


