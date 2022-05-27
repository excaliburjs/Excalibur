import { Action } from '../Action';

export class Delay implements Action {
  private _elapsedTime: number = 0;
  private _delay: number;
  private _started: boolean = false;
  private _stopped = false;
  constructor(delay: number) {
    this._delay = delay;
  }

  public update(delta: number): void {
    if (!this._started) {
      this._started = true;
    }

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
    this._stopped = false;
  }
}
