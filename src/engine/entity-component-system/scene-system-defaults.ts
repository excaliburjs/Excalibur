import type { Scene } from '../scene';
import type { System } from './system';
import type { SystemCtor } from './system-manager';

export interface EngineWorldOptions {
  systems?: SystemCtor<System>[];
  removeDefaultSystems?: boolean;
}

export interface SceneWorldOptions extends EngineWorldOptions {
  excludeEngineSystems?: SystemCtor<System>[];
}

/**
 * Keeps engine-provided systems separate from systems installed by a scene.
 * Each scene owns the instances that run in its world.
 * @internal
 */
export class SceneSystemDefaults {
  private _types = new Set<SystemCtor<System>>();
  private _installed = new WeakMap<Scene, Map<SystemCtor<System>, System>>();
  private _sceneSystems = new WeakMap<Scene, Map<SystemCtor<System>, System>>();
  private _sceneOptions = new WeakMap<Scene, SceneWorldOptions>();
  private _constructing = new WeakMap<Scene, Set<SystemCtor<System>>>();

  constructor(
    systems: readonly SystemCtor<System>[] = [],
    private _removeBuiltIns = false
  ) {
    for (const type of systems) {
      this._types.add(type);
    }
  }

  configure(scene: Scene, options: SceneWorldOptions = {}): void {
    this._sceneOptions.set(scene, options);
    this._apply(scene);
  }

  private _apply(scene: Scene): void {
    const sceneOptions = this._sceneOptions.get(scene);

    scene._setDefaultSystemsRemoved(sceneOptions?.removeDefaultSystems ?? this._removeBuiltIns);

    let installed = this._installed.get(scene);
    if (!installed) {
      installed = new Map();
      this._installed.set(scene, installed);
    }

    for (const [type, system] of installed) {
      if (!this._types.has(type) || sceneOptions?.excludeEngineSystems?.includes(type)) {
        installed.delete(type);
        scene.world.remove(system);
      }
    }

    let sceneSystems = this._sceneSystems.get(scene);
    if (!sceneSystems) {
      sceneSystems = new Map();
      this._sceneSystems.set(scene, sceneSystems);
    }
    for (const type of sceneOptions?.systems ?? []) {
      if (sceneSystems.has(type)) {
        continue;
      }
      const existingDefault = installed.get(type);
      if (existingDefault) {
        installed.delete(type);
        sceneSystems.set(type, existingDefault);
        continue;
      }
      if (this._hasExactSystem(scene, type)) {
        continue;
      }
      const system = this._construct(scene, type);
      if (system) {
        sceneSystems.set(type, system);
        scene.world.add(system);
      }
    }

    for (const type of this._types) {
      if (sceneOptions?.excludeEngineSystems?.includes(type)) {
        continue;
      }
      if (installed.has(type)) {
        continue;
      }
      // A scene may have supplied the same system itself. It remains the owner
      // of that instance if the engine's default is later removed.
      if (this._hasExactSystem(scene, type)) {
        continue;
      }
      const system = this._construct(scene, type);
      if (system && this._types.has(type) && !this._sceneOptions.get(scene)?.excludeEngineSystems?.includes(type)) {
        installed.set(type, system);
        scene.world.add(system);
      }
    }
  }

  private _construct(scene: Scene, type: SystemCtor<System>): System | undefined {
    let constructing = this._constructing.get(scene);
    if (!constructing) {
      constructing = new Set();
      this._constructing.set(scene, constructing);
    }
    if (constructing.has(type)) {
      return;
    }
    constructing.add(type);
    try {
      return new type(scene.world);
    } finally {
      constructing.delete(type);
    }
  }

  private _hasExactSystem(scene: Scene, type: SystemCtor<System>): boolean {
    return scene.world.systemManager.systems.some((system) => system.constructor === type);
  }

  owns(scene: Scene, system: System): boolean {
    return this._installed.get(scene)?.get(system.constructor as SystemCtor<System>) === system;
  }

  add(type: SystemCtor<System>, scenes: Iterable<Scene>): void {
    if (this._types.has(type)) {
      return;
    }
    this._types.add(type);
    for (const scene of scenes) {
      this._apply(scene);
    }
  }

  remove(type: SystemCtor<System>, scenes: Iterable<Scene>): void {
    if (!this._types.delete(type)) {
      return;
    }
    for (const scene of scenes) {
      // A dispose callback may register this default again for every scene.
      if (this._types.has(type)) {
        break;
      }
      const installed = this._installed.get(scene);
      const system = installed?.get(type);
      if (system) {
        installed!.delete(type);
        scene.world.remove(system);
      }
    }
  }
}
