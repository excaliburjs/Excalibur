import { Engine } from '../Engine';
import { Scene } from '../Scene';
import { Future } from '../Util/Future';
import { Entity, TransformComponent } from '../EntityComponentSystem';
import { GraphicsComponent } from '../Graphics';
import { CoordPlane } from '../Math/coord-plane';
import { Vector } from '../Math/vector';
import { clamp } from '../Math/util';
import { EasingFunction, EasingFunctions } from '../Util/EasingFunctions';
import { coroutine } from '../Util/Coroutine';
import { Logger } from '../Util/Log';

export interface TransitionOptions {
  /**
   * Transition duration in milliseconds
   */
  duration: number;

  /**
   * Optionally hides the loader during the transition
   *
   * If either the out or in transition have this set to true, then the loader will be hidden.
   *
   * Default false
   */
  hideLoader?: boolean;

  /**
   * Optionally blocks user input during a transition
   *
   * Default false
   */
  blockInput?: boolean;

  /**
   * Optionally specify a easing function, by default linear
   */
  easing?: EasingFunction;
  /**
   * Optionally specify a transition direction, by default 'out'
   *
   * * For 'in' direction transitions start at 1 and complete is at 0
   * * For 'out' direction transitions start at 0 and complete is at 1
   */
  direction?: 'out' | 'in';
}

/**
 * Base Transition that can be extended to provide custom scene transitions in Excalibur.
 */
export class Transition extends Entity {
  private _logger: Logger = Logger.getInstance();
  transform = new TransformComponent();
  graphics = new GraphicsComponent();
  readonly hideLoader: boolean;
  readonly blockInput: boolean;
  readonly duration: number;
  readonly easing: EasingFunction;
  readonly direction: 'out' | 'in';
  private _completeFuture = new Future<void>();

  // State needs to be reset between uses
  public started = false;
  private _currentDistance: number = 0;
  private _currentProgress: number = 0;

  public done = this._completeFuture.promise;

  /**
   * Returns a number between [0, 1] indicating what state the transition is in.
   *
   * * For 'out' direction transitions start at 0 and end at 1
   * * For 'in' direction transitions start at 1 and end at 0
   */
  get progress(): number {
    return this._currentProgress;
  }

  get complete(): boolean {
    if (this.direction === 'out') {
      return this.progress >= 1;
    } else {
      return this.progress <= 0;
    }
  }

  constructor(options: TransitionOptions) {
    super();
    this.name = `Transition#${this.id}`;
    this.duration = options.duration;
    this.easing = options.easing ?? EasingFunctions.Linear;
    this.direction = options.direction ?? 'out';
    this.hideLoader = options.hideLoader ?? false;
    this.blockInput = options.blockInput ?? false;
    this.transform.coordPlane = CoordPlane.Screen;
    this.transform.pos = Vector.Zero;
    this.transform.z = Infinity; // Transitions sit on top of everything
    this.graphics.anchor = Vector.Zero;
    this.addComponent(this.transform);
    this.addComponent(this.graphics);

    if (this.direction === 'out') {
      this._currentProgress = 0;
    } else {
      this._currentProgress = 1;
    }
  }

  /**
   * Overridable lifecycle method, called before each update.
   *
   * **WARNING BE SURE** to call `super.updateTransition()` if overriding in your own custom implementation
   * @param engine
   * @param delta
   */
  public updateTransition(engine: Engine, delta: number): void {
    if (this.complete) {
      return;
    }

    this._currentDistance += clamp(delta / this.duration, 0, 1);
    if (this._currentDistance >= 1) {
      this._currentDistance = 1;
    }

    if (this.direction === 'out') {
      this._currentProgress = clamp(this.easing(this._currentDistance, 0, 1, 1), 0, 1);
    } else {
      this._currentProgress = clamp(this.easing(this._currentDistance, 1, 0, 1), 0, 1);
    }
  }

  /**
   * Overridable lifecycle method, called right before the previous scene has deactivated.
   *
   * This gives incoming transition a chance to grab info from previous scene if desired
   * @param scene
   */
  async onPreviousSceneDeactivate(scene: Scene) {
    // override me
  }

  /**
   * Overridable lifecycle method, called once at the beginning of the transition
   *
   * `progress` is given between 0 and 1
   * @param progress
   */
  onStart(progress: number) {
    // override me
  }

  /**
   * Overridable lifecycle method, called every frame of the transition
   *
   * `progress` is given between 0 and 1
   * @param progress
   */
  onUpdate(progress: number) {
    // override me
  }

  /**
   * Overridable lifecycle method, called at the end of the transition,
   *
   * `progress` is given between 0 and 1
   * @param progress
   */
  onEnd(progress: number) {
    // override me
  }

  /**
   * Overridable lifecycle method, called when the transition is reset
   *
   * Use this to override and provide your own reset logic for internal state in custom transition implementations
   */
  onReset() {
    // override me
  }

  /**
   * reset() is called by the engine to reset transitions
   */
  reset() {
    this.started = false;
    this._completeFuture = new Future<void>();
    this.done = this._completeFuture.promise;
    this._currentDistance = 0;
    if (this.direction === 'out') {
      this._currentProgress = 0;
    } else {
      this._currentProgress = 1;
    }
    this.onReset();
  }

  play(engine: Engine, targetScene?: Scene) {
    if (this.started) {
      this.reset();
      this._logger.warn(`Attempted to play a transition ${this.name} that is already playing, reset transition.`);
    }

    const currentScene = targetScene ?? engine.currentScene;
    currentScene.add(this);
    const self = this;
    return coroutine(engine, function * () {
      while (!self.complete) {
        const elapsed = yield; // per frame
        self.updateTransition(engine, elapsed);
        self.execute();
      }
    });
  }

  /**
   * execute() is called by the engine every frame to update the Transition lifecycle onStart/onUpdate/onEnd
   */
  execute() {
    if (!this.isInitialized) {
      return;
    }

    if (!this.started) {
      this.started = true;
      this.onStart(this.progress);
    }

    this.onUpdate(this.progress);

    if (this.complete && !this._completeFuture.isCompleted) {
      this.onEnd(this.progress);
      this._completeFuture.resolve();
    }
  }
}