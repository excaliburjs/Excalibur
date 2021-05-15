import { Actor } from '../Actor';
import { Action } from './Action';
import { ActionContext } from './ActionContext';
import { ActionQueue } from './ActionQueue';

export class RepeatForever implements Action {
  private _actionQueue: ActionQueue;
  private _stopped: boolean = false;
  private _repeatContext: ActionContext;
  private _repeatBuilder: (repeatContext: ActionContext) => any;
  constructor(actor: Actor, repeatBuilder: (repeatContext: ActionContext) => any) {
    this._repeatBuilder = repeatBuilder;
    this._repeatContext = new ActionContext(actor);
    this._actionQueue = this._repeatContext.getQueue();

    this._repeatBuilder(this._repeatContext);
  }

  public update(delta: number): void {
    if (this._stopped) {
      return;
    }

    if (this._actionQueue.isComplete()) {
      this._actionQueue.reset();
    }

    this._actionQueue.update(delta);
  }

  public isComplete(): boolean {
    return this._stopped;
  }

  public stop(): void {
    this._stopped = true;
    this._actionQueue.clearActions();
  }

  public reset(): void {
    return;
  }
}
