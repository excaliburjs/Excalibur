import { Actor } from '../Actor';
import { Action } from './Action';

/**
 * Action Queues
 *
 * Action queues are part of the [[ActionContext|Action API]] and
 * store the list of actions to be executed for an [[Actor]].
 *
 * Actors implement [[Actor.actions]] which can be manipulated by
 * advanced users to adjust the actions currently being executed in the
 * queue.
 */
export class ActionQueue {
  private _actor: Actor;
  private _actions: Action[] = [];
  private _currentAction: Action;
  private _completedActions: Action[] = [];
  constructor(actor: Actor) {
    this._actor = actor;
  }

  public add(action: Action) {
    this._actions.push(action);
  }

  public remove(action: Action) {
    const index = this._actions.indexOf(action);
    this._actions.splice(index, 1);
  }

  public clearActions(): void {
    this._actions.length = 0;
    this._completedActions.length = 0;
    if (this._currentAction) {
      this._currentAction.stop();
    }
  }

  public getActions(): Action[] {
    return this._actions.concat(this._completedActions);
  }

  public hasNext(): boolean {
    return this._actions.length > 0;
  }

  public isComplete(): boolean {
    return this._actions.length === 0;
  }

  public reset(): void {
    this._actions = this.getActions();

    const len = this._actions.length;
    for (let i = 0; i < len; i++) {
      this._actions[i].reset();
    }
    this._completedActions = [];
  }

  public update(delta: number) {
    if (this._actions.length > 0) {
      this._currentAction = this._actions[0];
      this._currentAction.update(delta);

      if (this._currentAction.isComplete(this._actor)) {
        this._completedActions.push(this._actions.shift());
      }
    }
  }
}
