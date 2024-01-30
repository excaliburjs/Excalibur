import { Query, SystemPriority, World } from '../EntityComponentSystem';
import { System, SystemType } from '../EntityComponentSystem/System';
import { ActionsComponent } from './ActionsComponent';

export class ActionsSystem extends System {
  systemType = SystemType.Update;
  priority = SystemPriority.Higher;
  private _actions: ActionsComponent[] = [];
  query: Query<typeof ActionsComponent>;

  constructor(public world: World) {
    super();
    this.query = this.world.query([ActionsComponent]);

    this.query.entityAdded$.subscribe(e => this._actions.push(e.get(ActionsComponent)));
    this.query.entityRemoved$.subscribe(e => {
      const action = e.get(ActionsComponent);
      const index = this._actions.indexOf(action);
      if (index > -1) {
        this._actions.splice(index, 1);
      }
    });
  }
  update(delta: number): void {
    for (const actions of this._actions) {
      actions.update(delta);
    }
  }
}