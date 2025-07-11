import type { Entity } from '../../EntityComponentSystem/Entity';
import { TransformComponent } from '../../EntityComponentSystem/Components/TransformComponent';
import { MotionComponent } from '../../EntityComponentSystem/Components/MotionComponent';
import { vec, Vector } from '../../Math/vector';
import type { Action } from '../Action';
import { nextActionId } from '../Action';

/**
 * @deprecated use moveTo({pos: Vector, duration: number, easing: EasingFunction})
 */
export class EaseTo implements Action {
  id = nextActionId();
  private _tx: TransformComponent;
  private _motion: MotionComponent;
  private _currentLerpTime: number = 0;
  private _lerpDuration: number = 1 * 1000; // 1 second
  private _lerpStart: Vector = new Vector(0, 0);
  private _lerpEnd: Vector = new Vector(0, 0);
  private _initialized: boolean = false;
  private _stopped: boolean = false;
  constructor(
    entity: Entity,
    x: number,
    y: number,
    duration: number,
    public easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number
  ) {
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    this._lerpDuration = duration;
    this._lerpEnd = new Vector(x, y);
  }
  private _initialize() {
    this._lerpStart = new Vector(this._tx.pos.x, this._tx.pos.y);
    this._currentLerpTime = 0;
  }

  public update(elapsed: number): void {
    if (!this._initialized) {
      this._initialize();
      this._initialized = true;
    }

    // Need to update lerp time first, otherwise the first update will always be zero
    this._currentLerpTime += elapsed;
    let newX = this._tx.pos.x;
    let newY = this._tx.pos.y;
    if (this._currentLerpTime < this._lerpDuration) {
      if (this._lerpEnd.x < this._lerpStart.x) {
        newX =
          this._lerpStart.x -
          (this.easingFcn(this._currentLerpTime, this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
      } else {
        newX = this.easingFcn(this._currentLerpTime, this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
      }

      if (this._lerpEnd.y < this._lerpStart.y) {
        newY =
          this._lerpStart.y -
          (this.easingFcn(this._currentLerpTime, this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
      } else {
        newY = this.easingFcn(this._currentLerpTime, this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
      }
      // Given the lerp position figure out the velocity in pixels per second
      const seconds = elapsed / 1000;
      this._motion.vel = vec(seconds === 0 ? 0 : (newX - this._tx.pos.x) / seconds, seconds === 0 ? 0 : (newY - this._tx.pos.y) / seconds);
    } else {
      this._tx.pos = vec(this._lerpEnd.x, this._lerpEnd.y);
      this._motion.vel = Vector.Zero;
    }
  }
  public isComplete(): boolean {
    return this._stopped || this._currentLerpTime >= this._lerpDuration;
  }

  public reset(): void {
    this._initialized = false;
    this._stopped = false;
    this._currentLerpTime = 0;
  }
  public stop(): void {
    this._motion.vel = vec(0, 0);
    this._stopped = true;
  }
}
