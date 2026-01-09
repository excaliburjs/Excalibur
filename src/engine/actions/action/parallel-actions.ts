import type { Entity } from '../../entity-component-system';
import type { Action } from '../action';
import { nextActionId } from '../action';

/**
 * Action that can run multiple {@apilink Action}s or {@apilink ActionSequence}s at the same time
 */
export class ParallelActions implements Action {
  id = nextActionId();
  private _actions: Action[];

  constructor(parallelActions: Action[]) {
    this._actions = parallelActions;
  }

  update(elapsed: number): void {
    for (let i = 0; i < this._actions.length; i++) {
      this._actions[i].update(elapsed);
    }
  }
  isComplete(entity: Entity): boolean {
    return this._actions.every((a) => a.isComplete(entity));
  }
  reset(): void {
    this._actions.forEach((a) => a.reset());
  }
  stop(): void {
    this._actions.forEach((a) => a.stop());
  }
}
