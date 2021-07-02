import { Actor } from '../../Actor';
import { vec } from '../../Algebra';
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
    if (!this._started) {
      this._started = true;
      this._startX = this._actor.scale.x;
      this._startY = this._actor.scale.y;
      this._distanceX = Math.abs(this._endX - this._startX);
      this._distanceY = Math.abs(this._endY - this._startY);
    }

    if (!(Math.abs(this._actor.scale.x - this._startX) >= this._distanceX)) {
      const directionX = this._endY < this._startY ? -1 : 1;
      this._actor.sx = this._speedX * directionX;
    } else {
      this._actor.sx = 0;
    }

    if (!(Math.abs(this._actor.scale.y - this._startY) >= this._distanceY)) {
      const directionY = this._endY < this._startY ? -1 : 1;
      this._actor.sy = this._speedY * directionY;
    } else {
      this._actor.sy = 0;
    }

    if (this.isComplete()) {
      this._actor.scale = vec(this._endX, this._endY);
      this._actor.sx = 0;
      this._actor.sy = 0;
    }
  }

  public isComplete(): boolean {
    return (
      this._stopped ||
      (Math.abs(this._actor.scale.y - this._startX) >= this._distanceX && Math.abs(this._actor.scale.y - this._startY) >= this._distanceY)
    );
  }

  public stop(): void {
    this._actor.sx = 0;
    this._actor.sy = 0;
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}
