import { Entity } from '../EntityComponentSystem/Entity';
import { Action } from './Action';

/**
 * Action Queues represent an ordered sequence of actions
 *
 * Action queues are part of the [[ActionContext|Action API]] and
 * store the list of actions to be executed for an [[Actor]].
 *
 * Actors implement [[Actor.actions]] which can be manipulated by
 * advanced users to adjust the actions currently being executed in the
 * queue.
 */
export class ActionQueue {
  private _entity: Entity;
  private _actions: Action[] = [];
  private _currentAction: Action;
  private _completedActions: Action[] = [];
  constructor(entity: Entity) {
    this._entity = entity;
  }

  /**
   * Add an action to the sequence
   * @param action
   */
  public add(action: Action) {
    this._actions.push(action);
  }

  /**
   * Remove an action by reference from the sequence
   * @param action
   */
  public remove(action: Action) {
    const index = this._actions.indexOf(action);
    this._actions.splice(index, 1);
  }

  /**
   * Removes all actions from this sequence
   */
  public clearActions(): void {
    this._actions.length = 0;
    this._completedActions.length = 0;
    if (this._currentAction) {
      this._currentAction.stop();
    }
  }

  /**
   *
   * @returns The total list of actions in this sequence complete or not
   */
  public getActions(): Action[] {
    return this._actions.concat(this._completedActions);
  }

  /**
   *
   * @returns `true` if there are more actions to process in the sequence
   */
  public hasNext(): boolean {
    return this._actions.length > 0;
  }

  /**
   * @returns `true` if the current sequence of actions is done
   */
  public isComplete(): boolean {
    return this._actions.length === 0;
  }

  /**
   * Resets the sequence of actions, this is used to restart a sequence from the beginning
   */
  public reset(): void {
    this._actions = this.getActions();

    const len = this._actions.length;
    for (let i = 0; i < len; i++) {
      this._actions[i].reset();
    }
    this._completedActions = [];
  }

  /**
   * Update the queue which updates actions and handles completing actions
   * @param elapsedMs
   */
  public update(elapsedMs: number) {
    if (this._actions.length > 0) {
      this._currentAction = this._actions[0];
      this._currentAction.update(elapsedMs);

      if (this._currentAction.isComplete(this._entity)) {
        this._completedActions.push(this._actions.shift());
      }
    }
  }
}
