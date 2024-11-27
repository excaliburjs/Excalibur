import { Action, nextActionId } from '../Action';

export class Delay implements Action {
  id = nextActionId();
  private _elapsedTime: number = 0;
  private _delay: number;
  private _started: boolean = false;
  private _stopped = false;
  constructor(durationMs: number) {
    this._delay = durationMs;
  }

  public update(elapsedMs: number): void {
    if (!this._started) {
      this._started = true;
    }

    this._elapsedTime += elapsedMs;
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
