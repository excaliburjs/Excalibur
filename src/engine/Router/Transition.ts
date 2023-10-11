import { Engine, Future, Scene } from '..';
import { Entity, TransformComponent } from '../EntityComponentSystem';
import { GraphicsComponent } from '../Graphics';
import { CoordPlane } from '../Math/coord-plane';
import { Vector } from '../Math/vector';
import { clamp } from '../Math/util';
import { EasingFunction, EasingFunctions } from '../Util/EasingFunctions';

export interface TransitionOptions {
  /**
   * Duration in milliseconds
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
   * Optionally blocks input during a transition
   *
   * Default false
   */
  blockInput?: boolean;

  /**
   * Optionally specify a easing function, by default linear
   */
  easingFunction?: EasingFunction;
  /**
   * Optionally specify a transition direction, by default 'up'
   *
   * * For 'down' direction transitions start at 1 and complete is at 0
   * * For 'up' direction transitions start at 0 and complete is at 1
   */
  direction?: 'up' | 'down';
}

export class Transition extends Entity {
  transform = new TransformComponent();
  graphics = new GraphicsComponent();
  readonly hideLoader: boolean;
  readonly blockInput: boolean;
  readonly duration: number;
  readonly easing: EasingFunction;
  readonly direction: 'up' | 'down';
  private _completeFuture = new Future<void>();

  // State needs to be reset between uses
  public started = false;
  private _currentDistance: number = 0;
  private _currentProgress: number = 0;

  public done = this._completeFuture.promise;

  /**
   * Returns a number between [0, 1] indicating what state the transition is in.
   *
   * * For 'out' direction transitions complete is at 0
   * * For 'in' direction transitions complete is at 1
   */
  get progress(): number {
    return this._currentProgress;
  }

  get complete(): boolean {
    if (this.direction === 'up') {
      return this.progress >= 1;
    } else {
      return this.progress <= 0;
    }
  }

  constructor(options: TransitionOptions) {
    super();
    this.name = `Transition#${this.id}`;
    this.duration = options.duration;
    this.easing = options.easingFunction ?? EasingFunctions.Linear;
    this.direction = options.direction ?? 'up';
    this.hideLoader = options.hideLoader ?? false;
    this.blockInput = options.blockInput ?? false;
    this.transform.coordPlane = CoordPlane.Screen;
    this.transform.pos = Vector.Zero;
    this.transform.z = Infinity; // Transitions sit on top of everything
    this.graphics.anchor = Vector.Zero;
    this.addComponent(this.transform);
    this.addComponent(this.graphics);

    if (this.direction === 'up') {
      this._currentProgress = 0;
    } else {
      this._currentProgress = 1;
    }
  }

  public override onPreUpdate(_engine: Engine, delta: number): void {
    if (this.complete) {
      return;
    }

    this._currentDistance += clamp(delta / this.duration, 0, 1);
    if (this._currentDistance >= 1) {
      this._currentDistance = 1;
    }

    if (this.direction === 'up') {
      this._currentProgress = clamp(this.easing(this._currentDistance, 0, 1, 1), 0, 1);
    } else {
      this._currentProgress = clamp(this.easing(this._currentDistance, 1, 0, 1), 0, 1);
    }
  }

  async onPreviousSceneDeactivate(_scene: Scene) {
    // override me
  }

  /**
   * Called once at the beginning of the transition
   * @param _progress
   */
  onStart(_progress: number) {
    // override me
  }

  /**
   * Called every frame of the transition
   * @param _progress
   */
  onUpdate(_progress: number) {
    // override me
  }

  /**
   * Called at the end of the transition
   * @param _progress
   */
  onEnd(_progress: number) {
    // override me
  }

  /**
   * Called when the transition is reset
   */
  onReset() {
    // override me
  }

  reset() {
    this.started = false;
    this._completeFuture = new Future<void>();
    this.done = this._completeFuture.promise;
    this._currentDistance = 0;
    if (this.direction === 'up') {
      this._currentProgress = 0;
    } else {
      this._currentProgress = 1;
    }
    this.onReset();
  }

  execute() {
    if (!this.isInitialized) {
      return;
    }

    if (!this.started) {
      this.started = true;
      this.onStart(this.progress);
    }

    this.onUpdate(this.progress);

    if (this.complete) {
      this.onEnd(this.progress);
      this._completeFuture.resolve();
    }
  }
}