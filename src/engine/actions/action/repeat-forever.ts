import type { Entity } from '../../entity-component-system/entity';
import type { Action } from '../action';
import { nextActionId } from '../action';
import { ActionContext } from '../action-context';
import type { ActionQueue } from '../action-queue';

/**
 * RepeatForever Action implementation, it is recommended you use the fluent action
 * context API.
 *
 *
 */
export class RepeatForever implements Action {
  id = nextActionId();
  private _actionQueue: ActionQueue;
  private _stopped: boolean = false;
  private _isUpdating = false;
  private _resetRequested = false;
  private _repeatContext: ActionContext;
  private _repeatBuilder: (repeatContext: ActionContext) => any;
  constructor(entity: Entity, repeatBuilder: (repeatContext: ActionContext) => any) {
    this._repeatBuilder = repeatBuilder;
    this._repeatContext = new ActionContext(entity);
    this._actionQueue = this._repeatContext.getQueue();

    this._repeatBuilder(this._repeatContext);
  }

  public update(elapsed: number): void {
    if (this._stopped) {
      return;
    }

    if (this._actionQueue.isComplete()) {
      this._actionQueue.clearActions();
      this._repeatBuilder(this._repeatContext);
    }

    this._isUpdating = true;
    try {
      this._actionQueue.update(elapsed);
    } finally {
      this._isUpdating = false;
      if (this._resetRequested) {
        this._resetRequested = false;
        this.reset();
      }
    }
  }

  public isComplete(): boolean {
    return this._stopped;
  }

  public stop(): void {
    this._resetRequested = false;
    this._stopped = true;
    this._actionQueue.clearActions();
  }

  /**
   * Restarts the repeat by stopping the current action and rebuilding the sequence.
   * The builder is called again, including when runAction resets this action.
   * Actions start from the entity's current state; its position is not restored.
   * During a child action's update, rebuilding is deferred until that update completes.
   */
  public reset(): void {
    if (this._isUpdating) {
      this._resetRequested = true;
      return;
    }
    this._stopped = false;
    this._actionQueue.clearActions();
    this._repeatBuilder(this._repeatContext);
  }
}
