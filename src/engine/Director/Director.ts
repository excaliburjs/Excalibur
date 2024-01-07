import { Engine } from '../Engine';
import { BaseLoader } from './BaseLoader';
import { Scene } from '../Scene';
import { Transition } from './Transition';
import { Loader } from './Loader';
import { Logger } from '../Util/Log';
import { ActivateEvent, DeactivateEvent } from '../Events';
import { EventEmitter } from '../EventEmitter';

export interface DirectorNavigationEvent {
  sourceName: string;
  sourceScene: Scene;
  destinationName: string;
  destinationScene: Scene;
}

export type DirectorEvents = {
  navigationstart: DirectorNavigationEvent,
  navigation: DirectorNavigationEvent,
  navigationend: DirectorNavigationEvent,
}

export const DirectorEvents = {
  NavigationStart: 'navigationstart',
  Navigation: 'navigation',
  NavigationEnd: 'navigationend'
};

export interface SceneWithOptions {
  /**
   * Scene associated with this route
   */
  scene: Scene; // TODO lazy load scene
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
  loader?: BaseLoader;
}

export type WithRoot<TScenes> = TScenes | 'root';

// TODO do we want to support lazy loading scenes?
export type SceneMap<TKnownScenes extends string> = Record<TKnownScenes, Scene | SceneWithOptions>;

export type StartScene<TKnownScenes extends string> = TKnownScenes | { name: TKnownScenes, in: Transition };

export interface StartOptions<TKnownScenes extends string> {
  /**
   * Starting scene name with optional transition
   */
  start: StartScene<WithRoot<TKnownScenes>>;
  /**
   * Optionally provide a main loader to run before the game starts
   */
  loader?: BaseLoader
}


/**
 * Provide scene activation data and override any existing configured route transitions or loaders
 */
export interface GoToOptions {
  /**
   * Optionally supply scene activation data passed to Scene.onActivate
   */
  sceneActivationData?: any,
  /**
   * Optionally supply destination scene "in" transition
   */
  destinationIn?: Transition,
  /**
   * Optionally supply source scene "out" transition
   */
  sourceOut?: Transition,
  /**
   * Optionally supply a different loader for the destination scene
   */
  loader?: BaseLoader
}

/**
 * The Director is responsible for managing scenes and changing scenes in Excalibur
 *
 * It deals with transitions, scene loaders, switching scenes
 */
export class Director<TKnownScenes extends string = any> {
  public events = new EventEmitter<DirectorEvents>();
  private _logger = Logger.getInstance();
  private _deferredGoto: string;
  private _initialized = false;

  /**
   * Current scene's name
   */
  currentSceneName: string;
  /**
   * Current scene playing in excalibur
   */
  currentScene: Scene;
  /**
   * Current transition if any
   */
  currentTransition: Transition | null;

  /**
   * All registered scenes in Excalibur
   */
  public readonly scenes: SceneMap<WithRoot<TKnownScenes>> = {} as SceneMap<WithRoot<TKnownScenes>>;

  startScene: string;
  mainLoader: BaseLoader;

  /**
   * The default [[Scene]] of the game, use [[Engine.goto]] to transition to different scenes.
   */
  public readonly rootScene: Scene;

  private _sceneToLoader = new Map<string, BaseLoader>();
  private _sceneToTransition = new Map<string, {in: Transition, out: Transition }>();
  /**
   * Used to keep track of scenes that have already been loaded so we don't load multiple times
   */
  private _loadedScenes = new Set<Scene>();

  private _isTransitioning = false;

  /**
   * Gets whether the director currently transitioning between scenes
   *
   * Useful if you need to block behavior during transition
   */
  public get isTransitioning() {
    return this._isTransitioning;
  }

  constructor(private _engine: Engine, scenes: SceneMap<TKnownScenes>) {
    this.rootScene = this.currentScene = new Scene();
    this.add('root', this.rootScene);
    for (const sceneKey in scenes) {
      const sceneOrOptions = scenes[sceneKey];
      this.add(sceneKey, sceneOrOptions);
    }
  }

  /**
   * Initialize the director's internal state
   */
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
   * Configures the start scene and loader for the director
   *
   * Typically this is called at the beginning of the game to the start scene and transition and never again.
   * @param options
   */
  start(options: StartOptions<WithRoot<TKnownScenes>>) {
    this.mainLoader = options.loader ?? new Loader();

    let startScene: string;
    let maybeStartTransition: Transition;

    if (typeof options.start === 'string') {
      startScene = options.start;
    } else {
      const { name, in: inTransition } = options.start;
      startScene = name;
      maybeStartTransition = inTransition;
    }

    this.startScene = startScene;

    if (maybeStartTransition) {
      this.swapScene(this.startScene);
      this.playTransition(maybeStartTransition);
    } else {
      this.swapScene(this.startScene);
    }

    this.currentSceneName = this.startScene;
  }

  private _getLoader(sceneName: string) {
    return this._sceneToLoader.get(sceneName);
  }

  private _getInTransition(sceneName: string) {
    const sceneOrRoute = this.scenes[sceneName as TKnownScenes];
    if (sceneOrRoute instanceof Scene) {
      return null;
    }
    return sceneOrRoute?.in;
  }

  private _getOutTransition(sceneName: string) {
    const sceneOrRoute = this.scenes[sceneName as TKnownScenes];
    if (sceneOrRoute instanceof Scene) {
      return null;
    }
    return sceneOrRoute?.out;
  }

  getDeferredScene() {
    const maybeDeferred = this.getScene(this._deferredGoto);
    if (this._deferredGoto && maybeDeferred) {
      return maybeDeferred;
    }
    return null;
  }

  /**
   * Returns a scene by name if it exists
   * @param name
   */
  getScene(name: string): Scene | undefined {
    const maybeScene = this.scenes[name as TKnownScenes];
    if (maybeScene instanceof Scene) {
      return maybeScene;
    } else if (maybeScene) {
      return maybeScene.scene;
    }
    return undefined;
  }

  /**
   * Returns the same Director, but asserts a scene DOES exist to the type system
   * @param name
   */
  assert<TScene extends string>(name: TScene): Director<TKnownScenes | TScene> {
    return this as Director<TKnownScenes | TScene>;
  }

  /**
   * Adds additional Scenes to the game!
   * @param name
   * @param sceneOrRoute
   */
  add(name: string, sceneOrRoute: Scene | SceneWithOptions) { // TODO return a director with the scene map type
    if (!(sceneOrRoute instanceof Scene)) {
      const { loader, in: inTransition, out: outTransition } = sceneOrRoute;
      this._sceneToTransition.set(name, {in: inTransition, out: outTransition});
      this._sceneToLoader.set(name, loader);
    }

    if (this.scenes[name as TKnownScenes]) {
      this._logger.warn('Scene', name, 'already exists overwriting');
    }
    this.scenes[name as TKnownScenes] = sceneOrRoute;
  }

  remove(scene: Scene): void;
  remove(name: TKnownScenes): void;
  remove(nameOrScene: TKnownScenes | Scene | string) { // TODO return a director with the scene map type
    if (nameOrScene instanceof Scene) {
      // remove scene
      for (const key in this.scenes) {
        if (this.scenes.hasOwnProperty(key)) {
          const potentialSceneOrOptions = this.scenes[key as TKnownScenes];
          let scene: Scene;
          if (potentialSceneOrOptions instanceof Scene) {
            scene = potentialSceneOrOptions;
          } else {
            scene = potentialSceneOrOptions.scene;
          }

          if (scene === nameOrScene) {
            this._sceneToTransition.delete(key);
            this._sceneToLoader.delete(key);
            delete this.scenes[key as TKnownScenes];
          }
        }
      }
    }
    if (typeof nameOrScene === 'string') {
      // remove scene
      this._sceneToTransition.delete(nameOrScene);
      this._sceneToLoader.delete(nameOrScene);
      delete this.scenes[nameOrScene as TKnownScenes];
    }
  }

  /**
   * Go to a specific scene, and optionally override loaders and transitions
   * @param destinationScene
   * @param options
   */
  async goto(destinationScene: TKnownScenes | string, options?: GoToOptions) {
    if (destinationScene === this.currentSceneName) {
      return;
    }

    const maybeDest = this.getScene(destinationScene);
    if (!maybeDest) {
      this._logger.warn(`Scene ${destinationScene} does not exist! Check the name, are you sure you added it?`);
      return;
    }

    if (this._isTransitioning) {
      // ? is this going to suck? I remember flux would block actions if one was already running and it made me sad
      this._logger.warn('Cannot transition while a transition is in progress');
      return;
    }

    const sourceScene = this.currentSceneName;
    this._isTransitioning = true;

    options = {
      ...this._getOutTransition(this.currentSceneName),
      ...this._getInTransition(destinationScene),
      ...options };

    const { sourceOut, destinationIn, sceneActivationData } = options;

    const outTransition = sourceOut ?? this._getOutTransition(this.currentSceneName);
    const inTransition = destinationIn ?? this._getInTransition(destinationScene);

    const hideLoader = outTransition?.hideLoader || inTransition?.hideLoader;
    if (hideLoader) {
      // Start hidden loader early and take advantage of the transition
      // Don't await and block on a hidden loader
      this.maybeLoadScene(destinationScene, hideLoader);
    }

    this._emitEvent('navigationstart', sourceScene, destinationScene);

    // Run the out transition on the current scene if present
    await this.playTransition(outTransition);

    // Run the loader if present
    await this.maybeLoadScene(destinationScene, hideLoader);

    // Give incoming transition a chance to grab info from previous
    await inTransition?.onPreviousSceneDeactivate(this.currentScene);

    // Swap to the new scene
    // TODO should we detect if a scene init is sync/async and run it accordingly?
    await this.swapScene(destinationScene, sceneActivationData);
    this._emitEvent('navigation', sourceScene, destinationScene);

    // Run the in transition on the new scene if present
    await this.playTransition(inTransition);
    this._emitEvent('navigationend', sourceScene, destinationScene);

    this._isTransitioning = false;
  }

  /**
   * Triggers scene loading if has not already been loaded
   * @param scene
   * @param hideLoader
   */
  async maybeLoadScene(scene: string, hideLoader = false) {
    const loader = this._getLoader(scene) ?? new Loader();
    const sceneToLoad = this.getScene(scene);
    if (sceneToLoad && !this._loadedScenes.has(sceneToLoad)) {
      sceneToLoad.onPreLoad(loader);
      sceneToLoad.events.emit('preload', { loader });
      if (hideLoader) {
        // Don't await a hidden loader
        this._engine.load(loader, hideLoader);
      } else {
        await this._engine.load(loader);
      }
      this._loadedScenes.add(sceneToLoad);
    }
  }

  /**
   * Plays a transition in the current scene
   * @param transition
   */
  async playTransition(transition: Transition) {
    if (transition) {
      this.currentTransition = transition;
      this._engine.add(this.currentTransition);
      await this.currentTransition.done;
    }
    this.currentTransition?.kill();
    this.currentTransition?.reset();
    this.currentTransition = null;
  }

  /**
   * Swaps the current and destination scene after performing required lifecycle events
   * @param destinationScene
   * @param data
   */
  async swapScene<TData = undefined>(destinationScene: string, data?: TData): Promise<void> {
    const engine = this._engine;
    // if not yet initialized defer goToScene
    if (!this.isInitialized) {
      this._deferredGoto = destinationScene;
      return;
    }

    const maybeDest = this.getScene(destinationScene);

    if (maybeDest) {
      const previousScene = this.currentScene;
      const nextScene = maybeDest;

      this._logger.debug('Going to scene:', destinationScene);

      // only deactivate when initialized
      if (this.currentScene.isInitialized) {
        const context = { engine, previousScene, nextScene };
        await this.currentScene._deactivate(context);
        this.currentScene.events.emit('deactivate', new DeactivateEvent(context, this.currentScene));
      }

      // wait for the scene to be loaded if needed
      const destLoader = this._sceneToLoader.get(destinationScene);
      await destLoader?.areResourcesLoaded();

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

  private _emitEvent(eventName: keyof DirectorEvents, sourceScene: string, destinationScene: string) {
    const source = this.getScene(sourceScene)!;
    const dest = this.getScene(destinationScene)!;
    this.events.emit(eventName, {
      sourceScene: source,
      sourceName: sourceScene,
      destinationScene: dest,
      destinationName: destinationScene
    } as DirectorNavigationEvent);
  }

  /**
   * Updates internal transitions
   */
  update() {
    if (this.currentTransition) {
      this.currentTransition.execute();
    }
  }
}


