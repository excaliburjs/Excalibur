import { Entity } from '../../EntityComponentSystem/Entity';
import { Action, nextActionId } from '../Action';
import { ActionsComponent } from '../ActionsComponent';

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
