import { Entity } from '../../EntityComponentSystem/Entity';
import { Action } from '../Action';
import { ActionContext } from '../ActionContext';
import { ActionQueue } from '../ActionQueue';

export class Repeat implements Action {
  private _actionQueue: ActionQueue;
  private _repeat: number;
  private _originalRepeat: number;
  private _stopped: boolean = false;
  private _repeatContext: ActionContext;
  private _repeatBuilder: (repeatContext: ActionContext) => any;
  constructor(entity: Entity, repeatBuilder: (repeatContext: ActionContext) => any, repeat: number) {
    this._repeatBuilder = repeatBuilder;
    this._repeatContext = new ActionContext(entity);
    this._actionQueue = this._repeatContext.getQueue();

    this._repeat = repeat;
    this._originalRepeat = repeat;

    this._repeatBuilder(this._repeatContext);
    this._repeat--; // current execution is the first repeat
  }

  public update(delta: number): void {
    if (this._actionQueue.isComplete()) {
      this._actionQueue.clearActions();
      this._repeatBuilder(this._repeatContext);
      this._repeat--;
    }
    this._actionQueue.update(delta);
  }

  public isComplete(): boolean {
    return this._stopped || (this._repeat <= 0 && this._actionQueue.isComplete());
  }

  public stop(): void {
    this._stopped = true;
  }

  public reset(): void {
    this._repeat = this._originalRepeat;
  }
}
