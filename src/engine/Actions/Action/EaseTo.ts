import { Actor } from '../../Actor';
import { vec, Vector } from '../../Algebra';
import { Action } from '../Action';

export class EaseTo implements Action {
  private _currentLerpTime: number = 0;
  private _lerpDuration: number = 1 * 1000; // 1 second
  private _lerpStart: Vector = new Vector(0, 0);
  private _lerpEnd: Vector = new Vector(0, 0);
  private _initialized: boolean = false;
  private _stopped: boolean = false;
  private _distance: number = 0;
  constructor(
    public actor: Actor,
    x: number,
    y: number,
    duration: number,
    public easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number
  ) {
    this._lerpDuration = duration;
    this._lerpEnd = new Vector(x, y);
  }
  private _initialize() {
    this._lerpStart = new Vector(this.actor.pos.x, this.actor.pos.y);
    this._currentLerpTime = 0;
    this._distance = this._lerpStart.distance(this._lerpEnd);
  }

  public update(delta: number): void {
    if (!this._initialized) {
      this._initialize();
      this._initialized = true;
    }

    // Need to update lerp time first, otherwise the first update will always be zero
    this._currentLerpTime += delta;
    let newX = this.actor.pos.x;
    let newY = this.actor.pos.y;
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
      this.actor.vel = vec((newX - this.actor.pos.x) / (delta / 1000), (newY - this.actor.pos.y) / (delta / 1000));
    } else {
      this.actor.pos = vec(this._lerpEnd.x, this._lerpEnd.y);
      this.actor.vel = Vector.Zero;
    }
  }
  public isComplete(actor: Actor): boolean {
    return this._stopped || new Vector(actor.pos.x, actor.pos.y).distance(this._lerpStart) >= this._distance;
  }

  public reset(): void {
    this._initialized = false;
  }
  public stop(): void {
    this.actor.vel = vec(0, 0);
    this._stopped = true;
  }
}
