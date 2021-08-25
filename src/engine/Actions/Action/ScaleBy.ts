import { Actor } from '../../Actor';
import { Vector } from '../../Algebra';
import { TransformComponent } from '../../EntityComponentSystem';
import { MotionComponent } from '../../EntityComponentSystem/Components/MotionComponent';
import { Action } from '../Action';

export class ScaleBy implements Action {
  private _actor: Actor;
  public x: number;
  public y: number;
  private _startScale: Vector;
  private _endScale: Vector;
  private _offset: Vector;
  private _distanceX: number;
  private _distanceY: number;
  private _directionX: number;
  private _directionY: number;
  private _started = false;
  private _stopped = false;
  private _speedX: number;
  private _speedY: number;
  constructor(actor: Actor, scaleOffsetX: number, scaleOffsetY: number, speed: number) {
    this._actor = actor;
    this._offset = new Vector(scaleOffsetX, scaleOffsetY);
    this._speedX = this._speedY = speed;
  }

  public update(_delta: number): void {
    const transform = this._actor.get(TransformComponent);
    const motion = this._actor.get(MotionComponent);
    if (!this._started) {
      this._started = true;
      this._startScale = transform.scale.clone();
      this._endScale = this._startScale.add(this._offset);
      this._distanceX = Math.abs(this._endScale.x - this._startScale.x);
      this._distanceY = Math.abs(this._endScale.y - this._startScale.y);
      this._directionX = this._endScale.x < this._startScale.x ? -1 : 1;
      this._directionY = this._endScale.y < this._startScale.y ? -1 : 1;
    }

    motion.scaleFactor.x = this._speedX * this._directionX;
    motion.scaleFactor.y = this._speedY * this._directionY;

    if (this.isComplete()) {
      transform.scale = this._endScale;
      motion.scaleFactor.x = 0;
      motion.scaleFactor.y = 0;
    }
  }

  public isComplete(): boolean {
    return (
      this._stopped ||
      (Math.abs(this._actor.scale.x - this._startScale.x) >= this._distanceX &&
        Math.abs(this._actor.scale.y - this._startScale.y) >= this._distanceY)
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
