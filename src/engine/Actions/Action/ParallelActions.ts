import { Entity } from '../../EntityComponentSystem';
import { Action } from '../Action';


/**
 * Action that can run multiple [[Action]]s or [[ActionSequence]]s at the same time
 */
export class ParallelActions implements Action {
  private _actions: Action[];

  constructor(parallelActions: Action[]) {
    this._actions = parallelActions;
  }

  update(delta: number): void {
    for (let i = 0; i < this._actions.length; i++) {
      this._actions[i].update(delta);
    }
  }
  isComplete(entity: Entity): boolean {
    return this._actions.every(a => a.isComplete(entity));
  }
  reset(): void {
    this._actions.forEach(a => a.reset());
  }
  stop(): void {
    this._actions.forEach(a => a.stop());
  }
}