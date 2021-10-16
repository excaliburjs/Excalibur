import { Entity } from '../EntityComponentSystem';
import { System, SystemType } from '../EntityComponentSystem/System';
import { ActionsComponent } from './ActionsComponent';


export class ActionsSystem extends System<ActionsComponent> {
  public readonly types = ['ex.actions'] as const;
  systemType = SystemType.Update;
  priority = -1;

  update(entities: Entity[], delta: number): void {
    let actions: ActionsComponent;
    for (const entity of entities) {
      actions = entity.get(ActionsComponent);
      actions.update(delta);
    }
  }
}