import { System } from './System';
import { QueryManager } from './QueryManager';
import { Query } from './Query';
import { buildEntityComponentKey } from './Util';
import { Engine } from '../Engine';
import { Util } from '..';

export class SystemManager {
  // system key -> query key -> query
  // register systems
  // order systems

  public systems: System[] = [];
  public _keyToQuery: { [key: string]: Query };
  public _keyToSystem: { [key: string]: System };
  constructor(private queryManager: QueryManager) {}

  public addSystem(system: System) {
    const query = new Query(system.types);
    this.queryManager.addQuery(query);
    // todo what if systems share a query
    this._keyToQuery[buildEntityComponentKey(system.types)] = query;
    this._keyToSystem[buildEntityComponentKey(system.types)] = system;
    query.register(system);
  }

  public removeSystem(system: System) {
    const key = buildEntityComponentKey(system.types);
    const query = this._keyToQuery[key];
    Util.removeItemFromArray(system, this.systems);
    delete this._keyToQuery[key];
    delete this._keyToSystem[key];
    query.unregister(system);
  }

  public updateSystems(engine: Engine, delta: number) {
    for (const s of this.systems) {
      if (s.preupdate) {
        s.preupdate(engine, delta);
      }
    }

    for (const s of this.systems) {
      const entities = this._keyToQuery[buildEntityComponentKey(s.types)].entities;
      s.update(entities, delta);
    }

    for (const s of this.systems) {
      if (s.postupdate) {
        s.postupdate(engine, delta);
      }
    }
  }
}
