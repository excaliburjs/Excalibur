import { Actor } from '../../Actor';
import { Action } from '../Action';

export class Blink implements Action {
  private _timeVisible: number = 0;
  private _timeNotVisible: number = 0;
  private _elapsedTime: number = 0;
  private _totalTime: number = 0;
  private _actor: Actor;
  private _duration: number;
  private _stopped: boolean = false;
  private _started: boolean = false;
  constructor(actor: Actor, timeVisible: number, timeNotVisible: number, numBlinks: number = 1) {
    this._actor = actor;
    this._timeVisible = timeVisible;
    this._timeNotVisible = timeNotVisible;
    this._duration = (timeVisible + timeNotVisible) * numBlinks;
  }

  public update(delta: number): void {
    if (!this._started) {
      this._started = true;
    }

    this._elapsedTime += delta;
    this._totalTime += delta;
    if (this._actor.visible && this._elapsedTime >= this._timeVisible) {
      this._actor.visible = false;
      this._elapsedTime = 0;
    }

    if (!this._actor.visible && this._elapsedTime >= this._timeNotVisible) {
      this._actor.visible = true;
      this._elapsedTime = 0;
    }

    if (this.isComplete()) {
      this._actor.visible = true;
    }
  }

  public isComplete(): boolean {
    return this._stopped || this._totalTime >= this._duration;
  }

  public stop(): void {
    this._actor.visible = true;
    this._stopped = true;
  }

  public reset() {
    this._started = false;
    this._elapsedTime = 0;
    this._totalTime = 0;
  }
}
