import type { SystemType } from './System';
import { System } from './System';
import type { Scene } from '../Scene';
import type { World } from './World';
import { removeItemFromArray } from '../Util/Util';

export interface SystemCtor<T extends System> {
  new (...args: any[]): T;
}

/**
 *
 */
export function isSystemConstructor(x: any): x is SystemCtor<System> {
  return !!x?.prototype && !!x?.prototype?.constructor?.name;
}

/**
 * The SystemManager is responsible for keeping track of all systems in a scene.
 * Systems are scene specific
 */
export class SystemManager {
  /**
   * List of systems, to add a new system call {@apilink SystemManager.addSystem}
   */
  public systems: System[] = [];
  public initialized = false;
  constructor(private _world: World) {}

  /**
   * Get a system registered in the manager by type
   * @param systemType
   */
  public get<T extends System>(systemType: SystemCtor<T>): T | null {
    return this.systems.find((s) => s instanceof systemType) as unknown as T;
  }

  /**
   * Adds a system to the manager, it will now be updated every frame
   * @param systemOrCtor
   */
  public addSystem(systemOrCtor: SystemCtor<System> | System): void {
    let system: System;
    if (systemOrCtor instanceof System) {
      system = systemOrCtor;
    } else {
      system = new systemOrCtor(this._world);
    }

    this.systems.push(system);
    this.systems.sort((a, b) => (a.constructor as typeof System).priority - (b.constructor as typeof System).priority);
    // If systems are added and the manager has already been init'd
    // then immediately init the system
    if (this.initialized && system.initialize) {
      system.initialize(this._world, this._world.scene);
    }
  }

  /**
   * Removes a system from the manager, it will no longer be updated
   * @param system
   */
  public removeSystem(system: System) {
    removeItemFromArray(system, this.systems);
  }

  /**
   * Initialize all systems in the manager
   *
   * Systems added after initialize() will be initialized on add
   */
  public initialize() {
    if (!this.initialized) {
      this.initialized = true;
      for (const s of this.systems) {
        if (s.initialize) {
          s.initialize(this._world, this._world.scene);
        }
      }
    }
  }

  /**
   * Updates all systems
   * @param type whether this is an update or draw system
   * @param scene context reference
   * @param elapsed time in milliseconds
   */
  public updateSystems(type: SystemType, scene: Scene, elapsed: number) {
    const systems = this.systems.filter((s) => s.systemType === type);
    const stats = scene?.engine?.stats?.currFrame ?? ({} as any);
    let startTime: number;
    let endTime: number;
    const systemsLength = systems.length;

    for (let i = 0; i < systemsLength; i++) {
      if (systems[i].preupdate) {
        startTime = performance.now();
        systems[i].preupdate!(scene, elapsed);
        endTime = performance.now();
        stats.systemDuration[`${type}:${systems[i].constructor.name}.preupdate`] = endTime - startTime;
      }
    }

    for (let i = 0; i < systemsLength; i++) {
      startTime = performance.now();
      systems[i].update(elapsed);
      endTime = performance.now();
      stats.systemDuration[`${type}:${systems[i].constructor.name}.update`] = endTime - startTime;
    }

    for (let i = 0; i < systemsLength; i++) {
      if (systems[i].postupdate) {
        startTime = performance.now();
        systems[i].postupdate!(scene, elapsed);
        endTime = performance.now();
        stats.systemDuration[`${type}:${systems[i].constructor.name}.postupdate`] = endTime - startTime;
      }
    }
  }

  public clear(): void {
    for (let i = this.systems.length - 1; i >= 0; i--) {
      this.removeSystem(this.systems[i]);
    }
  }
}
