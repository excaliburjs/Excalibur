import type { Entity } from '../../EntityComponentSystem';
import type { Action } from '../Action';
import { nextActionId } from '../Action';
import { ActionContext } from '../ActionContext';
import type { ActionQueue } from '../ActionQueue';

/**
 * Action that can represent a sequence of actions, this can be useful in conjunction with
 * {@apilink ParallelActions} to run multiple sequences in parallel.
 */
export class ActionSequence implements Action {
  id = nextActionId();
  private _actionQueue: ActionQueue;
  private _stopped: boolean = false;
  private _sequenceContext: ActionContext;
  private _sequenceBuilder: (actionContext: ActionContext) => any;
  constructor(entity: Entity, actionBuilder: (actionContext: ActionContext) => any) {
    this._sequenceBuilder = actionBuilder;
    this._sequenceContext = new ActionContext(entity);
    this._actionQueue = this._sequenceContext.getQueue();
    this._sequenceBuilder(this._sequenceContext);
  }

  public update(elapsed: number): void {
    this._actionQueue.update(elapsed);
  }

  public isComplete(): boolean {
    return this._stopped || this._actionQueue.isComplete();
  }

  public stop(): void {
    this._stopped = true;
  }

  public reset(): void {
    this._stopped = false;
    this._actionQueue.reset();
  }

  public clone(entity: Entity) {
    return new ActionSequence(entity, this._sequenceBuilder);
  }
}
