import { Actor } from '../../Actor';
import { Action } from '../Action';

export class Die implements Action {
  public x: number;
  public y: number;

  private _actor: Actor;
  private _stopped = false;

  constructor(actor: Actor) {
    this._actor = actor;
  }

  public update(_delta: number): void {
    this._actor.actions.clearActions();
    this._actor.kill();
    this._stopped = true;
  }

  public isComplete(): boolean {
    return this._stopped;
  }

  public stop(): void {
    return;
  }

  public reset(): void {
    return;
  }
}
