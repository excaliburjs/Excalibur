import { Engine } from '../Engine';
import { Loader } from './Loader';
import { Scene } from '../Scene';
import { BaseLoader } from './BaseLoader';
import { Transition } from './Transition';
import { BootLoader } from './BootLoader';


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
export type RouteMap = Record<string,
Scene |
Route>;

export type LoaderMap = Record<string, BaseLoader>;

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

export class Router {
  currentSceneName: string;
  currentScene: Scene;
  currentTransition: Transition;

  routes: RouteMap;
  startScene: string;
  mainLoader: Loader;
  sceneToLoader = new Map<string, Loader>();
  sceneToTransition = new Map<string, {in: Transition, out: Transition }>();

  constructor(private _engine: Engine) {}

  configure(options: RouterOptions) {
    this.routes = options.routes;
    this.mainLoader = options.loader ?? new BootLoader();
    this.startScene = options.start;
    for (const sceneKey in this.routes) {
      const sceneOrRoute = this.routes[sceneKey];
      if (sceneOrRoute instanceof Scene) {
        this._engine.addScene(sceneKey, sceneOrRoute);
      } else {
        const { scene, loader, in: inTransition, out: outTransition } = sceneOrRoute;
        this._engine.addScene(sceneKey, scene);
        this.sceneToTransition.set(sceneKey, {in: inTransition, out: outTransition});
        this.sceneToLoader.set(sceneKey, loader);
      }
    }
    this._engine.goToScene(this.startScene);
    this.currentSceneName = this.startScene;
  }

  private _getLoader(sceneName: string) {
    return this.sceneToLoader.get(sceneName);
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
    const loader = this._getLoader(destinationScene) ?? this.mainLoader;
    const sceneToLoad = this._engine.scenes[destinationScene];
    sceneToLoad.onLoad(loader);
    await this._engine.load(loader);

    // Transition to the new scene
    this._engine.goToSceneSync(destinationScene, sceneActivationData);
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

  update(_elapsedMilliseconds: number) {
    if (this.currentTransition) {
      this.currentTransition.execute();
    }
  }
}


