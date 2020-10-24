import { System, SystemType } from './System';
import { Util } from '..';
import { World } from './World';

/**
 * The SystemManager is responsible for keeping track of all systems in a scene.
 * Systems are scene specific
 */
export class SystemManager<ContextType> {
  /**
   * List of systems, to add a new system call [[SystemManager.addSystem]]
   */
  public systems: System<any, ContextType>[] = [];
  public _keyToSystem: { [key: string]: System<any, ContextType> };
  constructor(private _world: World<ContextType>) {}

  /**
   * Adds a system to the manager, it will now be updated every frame
   * @param system
   */
  public addSystem(system: System<any, ContextType>): void {
    // validate system has types
    if (!system.types || system.types.length === 0) {
      throw new Error(`Attempted to add a System without any types`);
    }

    const query = this._world.queryManager.createQuery(system.types);
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
    query.register(system);
    if (system.initialize) {
      system.initialize(this._world.context);
    }
  }

  /**
   * Removes a system from the manager, it will no longer be updated
   * @param system
   */
  public removeSystem(system: System<any, ContextType>) {
    Util.removeItemFromArray(system, this.systems);
    const query = this._world.queryManager.getQuery(system.types);
    if (query) {
      query.unregister(system);
      this._world.queryManager.maybeRemoveQuery(query);
    }
  }

  /**
   * Updates all systems
   * @param type whether this is an update or draw system
   * @param engine engine reference
   * @param delta time in milliseconds
   */
  public updateSystems(type: SystemType, engine: ContextType, delta: number) {
    const systems = this.systems.filter((s) => s.systemType === type);
    for (const s of systems) {
      if (s.preupdate) {
        s.preupdate(engine, delta);
      }
    }

    for (const s of systems) {
      const entities = this._world.queryManager.getQuery(s.types).getEntities(s.sort);
      s.update(entities, delta);
    }

    for (const s of systems) {
      if (s.postupdate) {
        s.postupdate(engine, delta);
      }
    }
  }

  public clear(): void {
    for (const system of this.systems) {
      this.removeSystem(system);
    }
  }
}
