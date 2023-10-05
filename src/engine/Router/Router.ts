import { Engine } from "../Engine";
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

export type LoaderMap = Record<string, typeof BaseLoader>;

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
  routes: RouteMap;
  loaders?: LoaderMap;
}

export class Router {
  currentSceneName: string;
  currentScene: Scene;
  currentTransition: Transition;
  routes: RouteMap;
  startScene: string;

  constructor(private engine: Engine, options: RouterOptions) {
    this.routes = options.routes;
    this.startScene = options.start;
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

    await this.engine.goToScene(destinationScene, sceneActivationData);
    this.currentScene = this.engine.currentScene;
    this.currentSceneName = destinationScene;

    // TODO need to know if the scene has been loaded before attempting
    // TODO loaders are special types of scenes?
    // const loader = this.currentScene.onLoad();

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


