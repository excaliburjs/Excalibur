import { Actor } from '../../Actor';
import { vec } from '../../Math/vector';
import { MotionComponent } from '../../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../../EntityComponentSystem/Components/TransformComponent';
import { Action } from '../Action';

export class ScaleTo implements Action {
  private _actor: Actor;
  public x: number;
  public y: number;
  private _startX: number;
  private _startY: number;
  private _endX: number;
  private _endY: number;
  private _speedX: number;
  private _speedY: number;
  private _distanceX: number;
  private _distanceY: number;
  private _started = false;
  private _stopped = false;
  constructor(actor: Actor, scaleX: number, scaleY: number, speedX: number, speedY: number) {
    this._actor = actor;
    this._endX = scaleX;
    this._endY = scaleY;
    this._speedX = speedX;
    this._speedY = speedY;
  }

  public update(_delta: number): void {
    const transform = this._actor.get(TransformComponent);
    const motion = this._actor.get(MotionComponent);
    if (!this._started) {
      this._started = true;
      this._startX = transform.scale.x;
      this._startY = transform.scale.y;
      this._distanceX = Math.abs(this._endX - this._startX);
      this._distanceY = Math.abs(this._endY - this._startY);
    }

    if (!(Math.abs(transform.scale.x - this._startX) >= this._distanceX)) {
      const directionX = this._endY < this._startY ? -1 : 1;
      motion.scaleFactor.x = this._speedX * directionX;
    } else {
      motion.scaleFactor.x = 0;
    }

    if (!(Math.abs(transform.scale.y - this._startY) >= this._distanceY)) {
      const directionY = this._endY < this._startY ? -1 : 1;
      motion.scaleFactor.y = this._speedY * directionY;
    } else {
      motion.scaleFactor.y = 0;
    }

    if (this.isComplete()) {
      this._actor.scale = vec(this._endX, this._endY);
      motion.scaleFactor.x = 0;
      motion.scaleFactor.y = 0;
    }
  }

  public isComplete(): boolean {
    return (
      this._stopped ||
      (Math.abs(this._actor.scale.y - this._startX) >= this._distanceX && Math.abs(this._actor.scale.y - this._startY) >= this._distanceY)
    );
  }

  public stop(): void {
    const motion = this._actor.get(MotionComponent);
    motion.scaleFactor.x = 0;
    motion.scaleFactor.y = 0;
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}
