import { Engine } from "../Engine";
import { Loader } from "../Loader";
import { Scene } from "../Scene";
import { BaseLoader } from "./BaseLoader";
import { Transition } from "./Transition";


export interface Route {
  scene: Scene;
  in?: Transition;
  out?: Transition;
  loader?: string;
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
  loader?: string
}

export interface RouterOptions {
  /**
   * Starting route
   */
  start: string; // TODO keyof RouteMap
  loader?: Loader,
  routes: RouteMap;
  loaders?: LoaderMap;
}

export class Router {
  currentSceneName: string;
  currentScene: Scene;
  currentTransition: Transition;
  routes: RouteMap;
  startScene: string;
  loaders: LoaderMap;

  constructor(private engine: Engine, options: RouterOptions) {
    this.routes = options.routes;
    this.startScene = options.start;
    this.loaders = options.loaders;
    for (let sceneKey in this.routes) {
      const sceneOrRoute = this.routes[sceneKey];
      if (sceneOrRoute instanceof Scene) {
        this.engine.addScene(sceneKey, sceneOrRoute);
      } else {
        const { scene } = sceneOrRoute;
        this.engine.addScene(sceneKey, scene);
      }
    }
    this.engine.goToScene(this.startScene);
    this.currentSceneName = this.startScene;
  }

  // private getLoader(sceneName: string) {
  //   const sceneOrRoute = this.routes[sceneName];
  //   if (sceneOrRoute instanceof Scene) {
  //     return null;
  //   }
  //   if (sceneOrRoute.loader) {
  //     return this.loaders[sceneOrRoute.loader];
  //   }
  //   return null;
  // }

  private getInTransition(sceneName: string) {
    const sceneOrRoute = this.routes[sceneName];
    if (sceneOrRoute instanceof Scene) {
      return null;
    }
    return sceneOrRoute.in
  }

  private getOutTransition(sceneName: string) {
    const sceneOrRoute = this.routes[sceneName];
    if (sceneOrRoute instanceof Scene) {
      return null;
    }
    return sceneOrRoute.out;
  }

  async goto(destinationScene: string, options?: GoToOptions) {
    if (destinationScene === this.currentSceneName) return;

    options = {
      ...this.getOutTransition(this.currentSceneName),
      ...this.getInTransition(destinationScene),
      ...options };

    const { sourceOut, destinationIn, sceneActivationData } = options;

    const outTransition = sourceOut ?? this.getOutTransition(this.currentSceneName);
    const inTransition = destinationIn ?? this.getInTransition(destinationScene);

    if (outTransition) {
      this.currentTransition = outTransition;
      this.engine.currentScene.add(this.currentTransition);
      await this.currentTransition.done;
    }

    // TODO need to know if the scene has been loaded before attempting
    // TODO loaders are special types of scenes?
    // TODO engine renders the loaders?
    // const loader = this.currentScene.onLoad();
    // TODO Default loader?
    // const maybeLoader = this.getLoader(destinationScene);
    const sceneToLoad = this.engine.scenes[destinationScene];
    const loader = new Loader();
    sceneToLoad.onLoad(loader);
    await this.engine.load(loader);

    await this.engine.goToScene(destinationScene, sceneActivationData);
    this.currentScene = this.engine.currentScene;
    this.currentSceneName = destinationScene;

    this.currentTransition?.kill();
    this.currentTransition?.reset();

    if (inTransition) {
      this.currentTransition = inTransition;
      this.engine.currentScene.add(this.currentTransition);
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


