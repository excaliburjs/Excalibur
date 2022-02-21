import { Entity } from '../EntityComponentSystem';
import { AddedEntity, isAddedSystemEntity, RemovedEntity, System, SystemType } from '../EntityComponentSystem/System';
import { ActionsComponent } from './ActionsComponent';


export class ActionsSystem extends System<ActionsComponent> {
  public readonly types = ['ex.actions'] as const;
  systemType = SystemType.Update;
  priority = -1;

  private _actions: ActionsComponent[] = [];
  public notify(entityAddedOrRemoved: AddedEntity | RemovedEntity): void {
    if (isAddedSystemEntity(entityAddedOrRemoved)) {
      const action = entityAddedOrRemoved.data.get(ActionsComponent);
      this._actions.push(action);
    } else {
      const action = entityAddedOrRemoved.data.get(ActionsComponent);
      const index = this._actions.indexOf(action);
      if (index > -1) {
        this._actions.splice(index, 1);
      }
    }
  }

  update(_entities: Entity[], delta: number): void {
    for (const actions of this._actions) {
      actions.update(delta);
    }
  }
}