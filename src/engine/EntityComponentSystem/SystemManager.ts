import { System } from './System';
import { Query } from './Query';
import { buildEntityTypeKey } from './Util';
import { Engine } from '../Engine';
import { Util, Component } from '..';
import { Scene } from '../Scene';

export class SystemManager {
  // system key -> query key -> query
  // register systems
  // order systems

  public systems: System<any>[] = [];
  public _keyToQuery: { [key: string]: Query };
  public _keyToSystem: { [key: string]: System };
  constructor(private _scene: Scene) {}

  public addSystem<T extends Component = Component>(system: System<T>): void {
    const query = this._scene.queryManager.createQuery<T>(system.types);
    this.systems.push(system);
    query.register(system);
  }

  public removeSystem(system: System) {
    Util.removeItemFromArray(system, this.systems);
    this._scene.queryManager.maybeRemoveQueryBySystem(system);
  }

  public updateSystems(engine: Engine, delta: number) {
    for (const s of this.systems) {
      if (s.preupdate) {
        s.preupdate(engine, delta);
      }
    }

    for (const s of this.systems) {
      const entities = this._keyToQuery[buildEntityTypeKey(s.types)].entities;
      s.update(entities, delta);
    }

    for (const s of this.systems) {
      if (s.postupdate) {
        s.postupdate(engine, delta);
      }
    }
  }
}
