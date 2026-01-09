import type { Entity } from '../../entity-component-system/entity';
import type { Action } from '../action';
import { nextActionId } from '../action';
import { ActionsComponent } from '../actions-component';

export class Die implements Action {
  id = nextActionId();
  private _entity: Entity;
  private _stopped = false;

  constructor(entity: Entity) {
    this._entity = entity;
  }

  public update(elapsed: number): void {
    this._entity.get(ActionsComponent).clearActions();
    this._entity.kill();
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
