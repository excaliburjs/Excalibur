import { vec } from '../../Math/vector';
import { MotionComponent } from '../../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../../EntityComponentSystem/Components/TransformComponent';
import { Action } from '../Action';
import { Entity } from '../../EntityComponentSystem/Entity';

export class ScaleTo implements Action {
  private _tx: TransformComponent;
  private _motion: MotionComponent;
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
  constructor(entity: Entity, scaleX: number, scaleY: number, speedX: number, speedY: number) {
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    this._endX = scaleX;
    this._endY = scaleY;
    this._speedX = speedX;
    this._speedY = speedY;
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._startX = this._tx.scale.x;
      this._startY = this._tx.scale.y;
      this._distanceX = Math.abs(this._endX - this._startX);
      this._distanceY = Math.abs(this._endY - this._startY);
    }

    if (!(Math.abs(this._tx.scale.x - this._startX) >= this._distanceX)) {
      const directionX = this._endY < this._startY ? -1 : 1;
      this._motion.scaleFactor.x = this._speedX * directionX;
    } else {
      this._motion.scaleFactor.x = 0;
    }

    if (!(Math.abs(this._tx.scale.y - this._startY) >= this._distanceY)) {
      const directionY = this._endY < this._startY ? -1 : 1;
      this._motion.scaleFactor.y = this._speedY * directionY;
    } else {
      this._motion.scaleFactor.y = 0;
    }

    if (this.isComplete()) {
      this._tx.scale = vec(this._endX, this._endY);
      this._motion.scaleFactor.x = 0;
      this._motion.scaleFactor.y = 0;
    }
  }

  public isComplete(): boolean {
    return (
      this._stopped ||
      (Math.abs(this._tx.scale.y - this._startX) >= (this._distanceX - 0.01) &&
        Math.abs(this._tx.scale.y - this._startY) >= (this._distanceY - 0.01))
    );
  }

  public stop(): void {
    this._motion.scaleFactor.x = 0;
    this._motion.scaleFactor.y = 0;
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
    this._stopped = false;
  }
}
