import { Actor } from '../../Actor';
import { Logger } from '../../Util/Log';
import { Action } from '../Action';

export class Fade implements Action {
  public x: number;
  public y: number;

  private _actor: Actor;
  private _endOpacity: number;
  private _speed: number;
  private _multiplier: number = 1;
  private _started = false;
  private _stopped = false;

  constructor(actor: Actor, endOpacity: number, speed: number) {
    this._actor = actor;
    this._endOpacity = endOpacity;
    this._speed = speed;
  }

  public update(delta: number): void {
    if (!this._started) {
      this._started = true;

      // determine direction when we start
      if (this._endOpacity < this._actor.opacity) {
        this._multiplier = -1;
      } else {
        this._multiplier = 1;
      }
    }

    if (this._speed > 0) {
      this._actor.opacity += (this._multiplier * (Math.abs(this._actor.opacity - this._endOpacity) * delta)) / this._speed;
    }

    this._speed -= delta;

    if (this.isComplete()) {
      this._actor.opacity = this._endOpacity;
    }

    Logger.getInstance().debug('[Action fade] Actor opacity:', this._actor.opacity);
  }

  public isComplete(): boolean {
    return this._stopped || Math.abs(this._actor.opacity - this._endOpacity) < 0.05;
  }

  public stop(): void {
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}
