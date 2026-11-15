import { Scene, System, SystemType } from '../engine';
import type { Engine, EngineOptions, SceneWithOptions } from '../engine';

class ExampleSystem extends System {
  readonly systemType = SystemType.Update;
  update(_elapsed: number): void {
    return;
  }
}

export function configure(engine: Engine): EngineOptions {
  engine.addDefaultSystem(ExampleSystem);
  engine.removeDefaultSystem(ExampleSystem);
  const route: SceneWithOptions = {
    scene: new Scene(),
    world: { systems: [ExampleSystem], excludeEngineSystems: [ExampleSystem], removeDefaultSystems: false }
  };
  return { world: { systems: [ExampleSystem], removeDefaultSystems: true }, scenes: { route } };
}
