import { Entity } from '../../EntityComponentSystem/Entity';
import { Action } from '../Action';
import { ActionContext } from '../ActionContext';
import { ActionQueue } from '../ActionQueue';

/**
 * RepeatForever Action implementation, it is recommended you use the fluent action
 * context API.
 *
 *
 */
export class RepeatForever implements Action {
  private _actionQueue: ActionQueue;
  private _stopped: boolean = false;
  private _repeatContext: ActionContext;
  private _repeatBuilder: (repeatContext: ActionContext) => any;
  constructor(entity: Entity, repeatBuilder: (repeatContext: ActionContext) => any) {
    this._repeatBuilder = repeatBuilder;
    this._repeatContext = new ActionContext(entity);
    this._actionQueue = this._repeatContext.getQueue();

    this._repeatBuilder(this._repeatContext);
  }

  public update(delta: number): void {
    if (this._stopped) {
      return;
    }

    if (this._actionQueue.isComplete()) {
      this._actionQueue.clearActions();
      this._repeatBuilder(this._repeatContext);
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
