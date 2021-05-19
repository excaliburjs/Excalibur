import { Actor } from '../../Actor';
import { Action } from '../Action';

export class Delay implements Action {
  public x: number;
  public y: number;
  private _actor: Actor;
  private _elapsedTime: number = 0;
  private _delay: number;
  private _started: boolean = false;
  private _stopped = false;
  constructor(actor: Actor, delay: number) {
    this._actor = actor;
    this._delay = delay;
  }

  public update(delta: number): void {
    if (!this._started) {
      this._started = true;
    }

    this.x = this._actor.pos.x;
    this.y = this._actor.pos.y;

    this._elapsedTime += delta;
  }

  isComplete(): boolean {
    return this._stopped || this._elapsedTime >= this._delay;
  }

  public stop(): void {
    this._stopped = true;
  }

  reset(): void {
    this._elapsedTime = 0;
    this._started = false;
  }
}
