import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

class CounterSystem extends ex.System {
  readonly systemType = ex.SystemType.Update;
  static initialized: ex.World[] = [];
  static disposed: ex.World[] = [];
  static disposedInstances: CounterSystem[] = [];
  static order: string[] = [];
  ticks = 0;

  constructor(public world: ex.World) {
    super();
  }

  initialize(world: ex.World) {
    CounterSystem.initialized.push(world);
  }

  dispose(world: ex.World) {
    CounterSystem.disposed.push(world);
    CounterSystem.disposedInstances.push(this);
  }

  update() {
    CounterSystem.order.push('counter');
    this.ticks++;
  }
}

class OtherSystem extends ex.System {
  readonly systemType = ex.SystemType.Update;
  static priority = -10;
  constructor(public world: ex.World) {
    super();
  }
  update() {
    CounterSystem.order.push('other');
  }
}

class DrawSystem extends ex.System {
  readonly systemType = ex.SystemType.Draw;
  draws = 0;
  constructor(public world: ex.World) {
    super();
  }
  update() {
    this.draws++;
  }
}

describe('Engine scene system defaults', () => {
  const engines: ex.Engine[] = [];

  function game(options: ex.EngineOptions = {}) {
    const engine = TestUtils.engine(options);
    engines.push(engine);
    return engine;
  }

  async function ready(engine: ex.Engine) {
    await TestUtils.runToReady(engine);
    return engine;
  }

  beforeEach(() => {
    CounterSystem.initialized = [];
    CounterSystem.disposed = [];
    CounterSystem.disposedInstances = [];
    CounterSystem.order = [];
  });

  afterEach(() => {
    for (const engine of engines.splice(0)) {
      engine.stop();
      engine.dispose();
    }
  });

  it('installs configured systems in the root scene before its initialization', async () => {
    const engine = game({ world: { systems: [CounterSystem, DrawSystem, OtherSystem] } });
    await ready(engine);

    const root = engine.currentScene;
    const counter = root.world.get(CounterSystem)!;
    const drawing = root.world.get(DrawSystem)!;
    expect(counter.world).toBe(root.world);
    expect(drawing.world).toBe(root.world);
    expect(CounterSystem.initialized).toEqual([root.world]);

    const ticks = counter.ticks;
    CounterSystem.order = [];
    root.update(engine, 16);
    expect(counter.ticks).toBe(ticks + 1);
    expect(CounterSystem.order).toEqual(['other', 'counter']);
    const draws = drawing.draws;
    root.draw(engine.graphicsContext, 16);
    expect(drawing.draws).toBe(draws + 1);
  });

  it('gives supplied and constructed scenes independent system instances', async () => {
    class Level extends ex.Scene {
      sawDefault = false;
      onInitialize() {
        this.sawDefault = !!this.world.get(CounterSystem);
      }
    }
    const supplied = new Level();
    const engine = game({ world: { systems: [CounterSystem] }, scenes: { supplied, level: Level } });
    await ready(engine);
    await engine.goToScene('supplied');
    const first = supplied.world.get(CounterSystem)!;
    await engine.goToScene('level');
    const level = engine.currentScene as Level;
    const second = level.world.get(CounterSystem)!;
    expect.soft(supplied.sawDefault).toBe(true);
    expect.soft(level.sawDefault).toBe(true);

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first).not.toBe(second);
    expect(first.world).toBe(supplied.world);
    expect(second.world).toBe(level.world);
    expect(CounterSystem.initialized).toContain(supplied.world);
    expect(CounterSystem.initialized).toContain(level.world);
  });

  it('keeps the original scene systems unless built-ins are explicitly disabled', async () => {
    const engine = game({ world: { systems: [CounterSystem] } });
    await ready(engine);
    const root = engine.currentScene;

    expect(root.world.get(CounterSystem)).toBeDefined();
    expect(root.world.get(ex.GraphicsSystem)).toBeDefined();
    expect(root.world.get(ex.MotionSystem)).toBeDefined();
  });

  it('can omit built-ins without removing systems a scene added itself', async () => {
    class OwnScene extends ex.Scene {
      constructor() {
        super();
        this.world.add(OtherSystem);
      }
    }
    const own = new OwnScene();
    const builtIns = own.world.systemManager.systems.filter((system) => !(system instanceof OtherSystem));
    const engine = game({ lighting: true, world: { systems: [CounterSystem], removeDefaultSystems: true }, scenes: { own } });
    await ready(engine);
    await engine.goToScene('own');

    expect(own.world.get(CounterSystem)).toBeDefined();
    expect(own.world.get(OtherSystem)).toBeDefined();
    for (const builtIn of builtIns) {
      expect(own.world.systemManager.systems.some((system) => system.constructor === builtIn.constructor)).toBe(false);
    }
    expect(own.world.get(ex.GraphicsSystem)).toBeFalsy();
    expect(own.world.get(ex.MotionSystem)).toBeFalsy();
    expect(own.world.get(ex.LightingSystem)).toBeFalsy();
    expect(own.world.get(ex.FlickerSystem)).toBeFalsy();
    engine.lighting.enabled = false;
    own.update(engine, 16);
    engine.lighting.enabled = true;
    own.update(engine, 16);
    expect(own.world.get(ex.LightingSystem)).toBeFalsy();
    expect(own.world.get(ex.FlickerSystem)).toBeFalsy();
    expect(engine.director.rootScene.world.get(ex.GraphicsSystem)).toBeFalsy();
  });

  it('installs and explicitly removes engine-supplied lighting subclasses', async () => {
    class CustomFlicker extends ex.FlickerSystem {}
    class CustomLighting extends ex.LightingSystem {}

    for (const configureInitially of [true, false]) {
      const engine = game({
        lighting: true,
        world: { systems: configureInitially ? [CustomFlicker, CustomLighting] : [] }
      });
      await ready(engine);
      if (!configureInitially) {
        engine.addDefaultSystem(CustomFlicker);
        engine.addDefaultSystem(CustomLighting);
      }
      const scene = engine.currentScene;
      expect(scene.world.get(CustomFlicker)).toBeInstanceOf(CustomFlicker);
      expect(scene.world.get(CustomLighting)).toBeInstanceOf(CustomLighting);

      engine.removeDefaultSystem(CustomFlicker);
      engine.removeDefaultSystem(CustomLighting);
      expect(scene.world.get(CustomFlicker)).toBeFalsy();
      expect(scene.world.get(CustomLighting)).toBeFalsy();
    }
  });

  it('adds a default system to current and later scenes after the game starts', async () => {
    const engine = game();
    await ready(engine);
    engine.addDefaultSystem(CounterSystem);

    const root = engine.currentScene;
    const rootSystem = root.world.get(CounterSystem)!;
    expect(rootSystem).toBeDefined();
    expect(CounterSystem.initialized).toContain(root.world);

    class Later extends ex.Scene {}
    engine.addScene('later', Later);
    await engine.goToScene('later');
    const later = engine.currentScene;
    expect(later.world.get(CounterSystem)).toBeDefined();
    expect(later.world.get(CounterSystem)).not.toBe(rootSystem);
    expect(CounterSystem.initialized).toContain(later.world);
  });

  it('uses current defaults when a previously registered constructor scene initializes', async () => {
    class Level extends ex.Scene {
      sawDefault = false;
      onInitialize() {
        this.sawDefault = !!this.world.get(CounterSystem);
      }
    }
    const engine = game({ scenes: { level: Level } });
    await ready(engine);
    engine.addDefaultSystem(CounterSystem);
    await engine.goToScene('level');
    const level = engine.currentScene as Level;
    expect(level.sawDefault).toBe(true);
    const system = level.world.get(CounterSystem)!;
    const ticks = system.ticks;
    level.update(engine, 16);
    expect(system.ticks).toBe(ticks + 1);
    engine.removeDefaultSystem(CounterSystem);
    expect(level.world.get(CounterSystem)).toBeFalsy();
  });

  it('updates supplied inactive scenes without waiting for navigation', async () => {
    const inactive = new ex.Scene();
    const engine = game({ scenes: { inactive } });
    await ready(engine);

    engine.addDefaultSystem(CounterSystem);
    const instance = inactive.world.get(CounterSystem);
    expect(instance).toBeDefined();
    expect(instance?.world).toBe(inactive.world);
    engine.removeDefaultSystem(CounterSystem);
    expect(inactive.world.get(CounterSystem)).toBeFalsy();
  });

  it('does not duplicate defaults when added twice or a scene is revisited', async () => {
    const engine = game({ world: { systems: [CounterSystem] } });
    const independent = game();
    await ready(engine);
    await ready(independent);
    const root = engine.currentScene;
    const original = root.world.get(CounterSystem);
    engine.addDefaultSystem(CounterSystem);
    engine.addScene('other', new ex.Scene());
    await engine.goToScene('other');
    await engine.goToScene('root');

    expect(root.world.get(CounterSystem)).toBe(original);
    expect(root.world.systemManager.systems.filter((system) => system instanceof CounterSystem)).toHaveLength(1);
    expect(CounterSystem.initialized.filter((world) => world === root.world)).toHaveLength(1);
    expect(independent.currentScene.world.get(CounterSystem)).toBeFalsy();
  });

  it('removes and disposes only systems installed by the Engine', async () => {
    class OwnScene extends ex.Scene {
      constructor() {
        super();
        this.world.add(CounterSystem);
      }
    }
    const own = new OwnScene();
    const engine = game({ scenes: { own } });
    await ready(engine);
    engine.addDefaultSystem(CounterSystem);
    await engine.goToScene('own');
    const owned = own.world.get(CounterSystem);
    const root = engine.director.rootScene;
    expect(root.world.get(CounterSystem)).toBeDefined();
    engine.removeDefaultSystem(CounterSystem);

    expect(root.world.get(CounterSystem)).toBeFalsy();
    expect(own.world.get(CounterSystem)).toBe(owned);
    expect(CounterSystem.disposed).toContain(root.world);
    expect(CounterSystem.disposedInstances).not.toContain(owned);
    class Future extends ex.Scene {}
    engine.addScene('future', Future);
    await engine.goToScene('future');
    expect(engine.currentScene.world.get(CounterSystem)).toBeFalsy();
  });

  it('initializes and disposes re-added defaults through the usual lifecycle', async () => {
    const engine = game();
    await ready(engine);
    engine.addDefaultSystem(CounterSystem);
    const root = engine.currentScene;
    const first = root.world.get(CounterSystem);
    engine.removeDefaultSystem(CounterSystem);
    engine.addDefaultSystem(CounterSystem);
    const second = root.world.get(CounterSystem);

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(CounterSystem.initialized.filter((world) => world === root.world)).toHaveLength(2);
    expect(CounterSystem.disposed.filter((world) => world === root.world)).toHaveLength(1);
  });

  it('honors a scene route that excludes an engine default and adds its own system', async () => {
    const excluded = new ex.Scene();
    const normal = new ex.Scene();
    const engine = game({
      world: { systems: [CounterSystem] },
      scenes: {
        excluded: {
          scene: excluded,
          world: { systems: [OtherSystem], excludeEngineSystems: [CounterSystem], removeDefaultSystems: true }
        },
        normal
      }
    });
    await ready(engine);

    await engine.goToScene('excluded');
    expect(excluded.world.get(CounterSystem)).toBeFalsy();
    expect(excluded.world.get(OtherSystem)).toBeDefined();
    expect(excluded.world.get(ex.GraphicsSystem)).toBeFalsy();
    await engine.goToScene('normal');
    expect(normal.world.get(CounterSystem)).toBeDefined();
    expect(normal.world.get(OtherSystem)).toBeFalsy();
    expect(normal.world.get(ex.GraphicsSystem)).toBeDefined();
    engine.removeDefaultSystem(CounterSystem);
    engine.addDefaultSystem(CounterSystem);
    expect(excluded.world.get(CounterSystem)).toBeFalsy();
    expect(normal.world.get(CounterSystem)).toBeDefined();
  });

  it('lets a scene retain built-ins and its own system when engine defaults are removed', async () => {
    const own = new ex.Scene();
    const engine = game({
      world: { systems: [CounterSystem], removeDefaultSystems: true },
      scenes: { own: { scene: own, world: { systems: [CounterSystem], removeDefaultSystems: false } } }
    });
    await ready(engine);
    await engine.goToScene('own');
    const before = own.world.systemManager.systems.filter((system) => system instanceof CounterSystem);
    expect(before.length).toBeGreaterThan(0);
    expect(own.world.get(ex.GraphicsSystem)).toBeDefined();
    expect(engine.director.rootScene.world.get(ex.GraphicsSystem)).toBeFalsy();

    engine.removeDefaultSystem(CounterSystem);
    const local = own.world.get(CounterSystem);
    expect(local).toBeDefined();
    expect(before).toContain(local);
    expect(CounterSystem.disposedInstances).not.toContain(local);
    expect(own.world.systemManager.systems.filter((system) => system instanceof CounterSystem)).toHaveLength(1);
    expect(engine.director.rootScene.world.get(CounterSystem)).toBeFalsy();
  });

  it('uses caller-provided root scenes with defaults available during initialization', async () => {
    class RootScene extends ex.Scene {
      sawDefault = false;
      onInitialize() {
        this.sawDefault = !!this.world.get(CounterSystem);
      }
    }
    for (const definition of [new RootScene(), RootScene]) {
      const engine = game({ world: { systems: [CounterSystem] }, scenes: { root: definition } });
      await ready(engine);
      const root = engine.currentScene as RootScene;
      expect(root).toBeInstanceOf(RootScene);
      if (definition instanceof ex.Scene) {
        expect(root).toBe(definition);
      }
      expect(root.sawDefault).toBe(true);
      expect(CounterSystem.initialized.filter((world) => world === root.world)).toHaveLength(1);
    }
  });

  it('removes obsolete engine systems when a scene is registered again', async () => {
    for (const removeByInstance of [false, true]) {
      const level = new ex.Scene();
      const engine = game({ world: { systems: [CounterSystem] }, scenes: { level } });
      await ready(engine);
      await engine.goToScene('level');
      const original = level.world.get(CounterSystem)!;
      await engine.goToScene('root');
      if (removeByInstance) {
        engine.removeScene(level);
      } else {
        engine.removeScene('level');
      }
      engine.removeDefaultSystem(CounterSystem);
      engine.addScene('level', level);
      await engine.goToScene('level');
      const ticks = original.ticks;
      level.update(engine, 16);
      expect.soft(level.world.get(CounterSystem)).toBeFalsy();
      expect.soft(original.ticks).toBe(ticks);
      expect.soft(CounterSystem.disposedInstances.filter((system) => system === original)).toHaveLength(1);
    }
  });

  it('honors default removal from a system initialization callback', async () => {
    const engine = game();
    await ready(engine);
    let instance: SelfRemoving | undefined;
    class SelfRemoving extends CounterSystem {
      initialize(world: ex.World) {
        super.initialize(world);
        instance = this;
        world.scene.engine.removeDefaultSystem(SelfRemoving);
      }
    }
    engine.addDefaultSystem(SelfRemoving);
    expect(instance).toBeDefined();
    const ticks = instance!.ticks;
    engine.currentScene.update(engine, 16);
    expect.soft(engine.currentScene.world.get(SelfRemoving)).toBeFalsy();
    expect.soft(instance!.ticks).toBe(ticks);
    expect.soft(CounterSystem.disposedInstances.filter((system) => system === instance)).toHaveLength(1);
    engine.addScene('later', new ex.Scene());
    expect(engine.director.getSceneInstance('later')!.world.get(SelfRemoving)).toBeFalsy();
  });

  it('keeps re-registered defaults in existing and future scenes after disposal', async () => {
    let readd = true;
    class Restarting extends CounterSystem {
      dispose(world: ex.World) {
        super.dispose(world);
        if (readd) {
          readd = false;
          world.scene.engine.addDefaultSystem(Restarting);
        }
      }
    }
    const other = new ex.Scene();
    const engine = game({ world: { systems: [Restarting] }, scenes: { other } });
    await ready(engine);
    const root = engine.currentScene;
    await engine.goToScene('other');
    await engine.goToScene('root');
    engine.removeDefaultSystem(Restarting);
    for (const scene of [root, other]) {
      const system = scene.world.get(Restarting);
      expect.soft(system).toBeTruthy();
      if (system) {
        const ticks = system.ticks;
        scene.update(engine, 16);
        expect.soft(system.ticks).toBe(ticks + 1);
      }
    }
    engine.addScene('later', new ex.Scene());
    expect(engine.director.getSceneInstance('later')!.world.get(Restarting)).toBeTruthy();
  });

  it('replaces old route options on registration but retains them during default additions', async () => {
    const excluded = new ex.Scene();
    const retained = new ex.Scene();
    const engine = game({
      world: { systems: [CounterSystem], removeDefaultSystems: true },
      scenes: {
        excluded: { scene: excluded, world: { excludeEngineSystems: [CounterSystem] } },
        retained: { scene: retained, world: { removeDefaultSystems: false } }
      }
    });
    await ready(engine);
    engine.addDefaultSystem(OtherSystem);
    expect(excluded.world.get(CounterSystem)).toBeFalsy();
    expect(retained.world.get(ex.GraphicsSystem)).toBeTruthy();
    engine.removeScene('excluded');
    engine.removeScene('retained');
    engine.addScene('excluded', excluded);
    engine.addScene('retained', retained);
    expect.soft(excluded.world.get(CounterSystem)).toBeTruthy();
    expect.soft(excluded.world.get(OtherSystem)).toBeTruthy();
    expect.soft(retained.world.get(ex.GraphicsSystem)).toBeFalsy();
  });

  it('removes lighting defaults from reused scenes while retaining scene-owned lighting', async () => {
    for (const initiallyEnabled of [true, false]) {
      const level = new ex.Scene();
      const own = new ex.Scene();
      const localFlicker = new ex.FlickerSystem();
      const localLighting = new ex.LightingSystem();
      own.world.add(localFlicker);
      own.world.add(localLighting);
      const engine = game({ lighting: initiallyEnabled, scenes: { level, own } });
      await ready(engine);
      await engine.goToScene('level');
      if (!initiallyEnabled) {
        engine.lighting.enabled = true;
        level.update(engine, 16);
      }
      expect(level.world.get(ex.FlickerSystem)).toBeTruthy();
      expect(level.world.get(ex.LightingSystem)).toBeTruthy();
      await engine.goToScene('own');
      await engine.goToScene('root');
      for (const [name, scene] of [
        ['level', level],
        ['own', own]
      ] as const) {
        engine.removeScene(name);
        engine.addScene(name, { scene, world: { removeDefaultSystems: true } });
      }
      expect.soft(level.world.get(ex.FlickerSystem)).toBeFalsy();
      expect.soft(level.world.get(ex.LightingSystem)).toBeFalsy();
      expect.soft(own.world.get(ex.FlickerSystem)).toBe(localFlicker);
      expect.soft(own.world.get(ex.LightingSystem)).toBe(localLighting);
      engine.lighting.enabled = false;
      level.update(engine, 16);
      engine.lighting.enabled = true;
      level.update(engine, 16);
      expect.soft(level.world.get(ex.FlickerSystem)).toBeFalsy();
      expect.soft(level.world.get(ex.LightingSystem)).toBeFalsy();
    }
  });

  it('honors self-removal during startup while another default remains registered', async () => {
    class SelfRemoving extends CounterSystem {
      static priority = -20;
      initialize(world: ex.World) {
        super.initialize(world);
        world.scene.engine.removeDefaultSystem(SelfRemoving);
      }
    }
    class Following extends CounterSystem {
      static priority = -19;
    }
    const engine = game({ world: { systems: [SelfRemoving, Following], removeDefaultSystems: true } });
    const removed = engine.currentScene.world.get(SelfRemoving)!;
    await ready(engine);
    const following = engine.currentScene.world.get(Following)!;
    expect.soft(engine.currentScene.world.get(SelfRemoving)).toBeFalsy();
    expect.soft(CounterSystem.disposedInstances.filter((system) => system === removed)).toHaveLength(1);
    const ticks = following.ticks;
    engine.currentScene.update(engine, 16);
    expect.soft(following.ticks).toBe(ticks + 1);
    expect.soft(removed.ticks).toBe(0);
  });

  it('uses world options after plugins finish pre-configuration', async () => {
    for (const world of [undefined, { systems: [CounterSystem], removeDefaultSystems: false }]) {
      const plugin = new ex.Plugin();
      plugin.name = 'scene-defaults';
      plugin.onEnginePreConfig = (_engine, options) => {
        options.world ??= {};
        options.world.systems = [OtherSystem];
        options.world.removeDefaultSystems = true;
      };
      const supplied = new ex.Scene();
      const engine = game({ world, plugins: [plugin], scenes: { supplied } });
      await ready(engine);
      engine.addScene('later', new ex.Scene());
      for (const scene of [engine.currentScene, supplied, engine.director.getSceneInstance('later')!]) {
        expect.soft(scene.world.get(OtherSystem)).toBeTruthy();
        expect.soft(scene.world.get(CounterSystem)).toBeFalsy();
        expect.soft(scene.world.get(ex.GraphicsSystem)).toBeFalsy();
      }
    }
  });
  it('registers dependencies from a default initialization callback', async () => {
    const engine = game();
    await ready(engine);
    class Dependent extends CounterSystem {
      initialize(world: ex.World) {
        super.initialize(world);
        engine.addDefaultSystem(OtherSystem);
      }
    }
    engine.addDefaultSystem(Dependent);
    const root = engine.currentScene;
    const dependent = root.world.get(Dependent)!;
    expect(root.world.get(OtherSystem)).toBeDefined();
    CounterSystem.order = [];
    root.update(engine, 16);
    expect(CounterSystem.order.filter((name) => name === 'counter')).toHaveLength(1);
    expect(dependent.ticks).toBeGreaterThan(0);
    engine.removeDefaultSystem(Dependent);
    expect(root.world.get(Dependent)).toBeFalsy();
    expect(CounterSystem.disposedInstances).toContain(dependent);
  });

  it('restores built-ins when a reused scene overrides their removal', async () => {
    const level = new ex.Scene();
    const builtInTypes = level.world.systemManager.systems.map((system) => system.constructor);
    const local = new CounterSystem(level.world);
    level.world.add(local);
    const engine = game({
      lighting: true,
      world: { removeDefaultSystems: true },
      scenes: { level }
    });
    await ready(engine);
    await engine.goToScene('level');
    expect(level.world.get(ex.GraphicsSystem)).toBeFalsy();
    const actor = new ex.Actor({ x: 10, y: 10, width: 8, height: 8, color: ex.Color.Red });
    const draw = vi.fn();
    actor.graphics.onPostDraw = draw;
    level.add(actor);
    await engine.goToScene('root');
    engine.removeScene('level');
    engine.addScene('level', { scene: level, world: { removeDefaultSystems: false } });
    await engine.goToScene('level');
    const ticks = local.ticks;
    level.update(engine, 16);
    for (const type of builtInTypes) {
      expect.soft(level.world.systemManager.systems.some((system) => system.constructor === type)).toBe(true);
    }
    expect.soft(level.world.get(ex.LightingSystem)).toBeDefined();
    expect.soft(level.world.get(ex.FlickerSystem)).toBeDefined();
    expect(level.world.get(CounterSystem)).toBe(local);
    expect(local.ticks).toBe(ticks + 1);
    level.draw(engine.graphicsContext, 16);
    expect(draw).toHaveBeenCalled();
    await engine.goToScene('root');
    engine.removeScene('level');
    engine.addScene('level', level);
    await engine.goToScene('level');
    level.update(engine, 16);
    for (const type of builtInTypes) {
      expect(level.world.systemManager.systems.some((system) => system.constructor === type)).toBe(false);
    }
    expect(level.world.get(ex.LightingSystem)).toBeFalsy();
    expect(level.world.get(ex.FlickerSystem)).toBeFalsy();
    expect(level.world.get(CounterSystem)).toBe(local);
  });

  it('keeps scene-local updates stable when initialization registers an engine default', async () => {
    const engine = game();
    await ready(engine);
    let localUpdates = 0;
    class Shared extends ex.System {
      readonly systemType = ex.SystemType.Update;
      update() {
        return;
      }
    }
    class Local extends ex.System {
      readonly systemType = ex.SystemType.Update;
      initialize() {
        engine.addDefaultSystem(Shared);
      }
      update() {
        localUpdates++;
      }
    }

    const level = new ex.Scene();
    engine.addScene('level', { scene: level, world: { systems: [Local] } });
    await engine.goToScene('level');
    expect(level.world.get(Shared)).toBeDefined();
    expect(engine.director.rootScene.world.get(Shared)).toBeDefined();
    expect(engine.director.rootScene.world.get(Local)).toBeFalsy();
    const before = localUpdates;
    level.update(engine, 16);
    expect.soft(localUpdates - before).toBe(1);

    engine.removeDefaultSystem(Shared);
    expect(level.world.get(Shared)).toBeFalsy();
    const afterRemoval = localUpdates;
    level.update(engine, 16);
    expect.soft(localUpdates - afterRemoval).toBe(1);
    await engine.goToScene('root');
    await engine.goToScene('level');
    const afterRevisit = localUpdates;
    level.update(engine, 16);
    expect.soft(localUpdates - afterRevisit).toBe(1);
  });

  it('retains a scene-local request added over an existing engine default on re-registration', async () => {
    const level = new ex.Scene();
    const engine = game({ world: { systems: [CounterSystem] }, scenes: { level } });
    await ready(engine);
    await engine.goToScene('level');
    await engine.goToScene('root');
    engine.removeScene('level');
    engine.addScene('level', { scene: level, world: { systems: [CounterSystem] } });
    engine.removeDefaultSystem(CounterSystem);
    await engine.goToScene('level');
    expect(level.world.get(CounterSystem)).toBeTruthy();
    CounterSystem.order = [];
    level.update(engine, 16);
    expect(CounterSystem.order.filter((name) => name === 'counter')).toHaveLength(1);
    expect(engine.rootScene.world.get(CounterSystem)).toBeFalsy();
  });

  it('resumes ordinary lighting after it changed while built-ins were suppressed', async () => {
    const level = new ex.Scene();
    const engine = game({ lighting: true, world: { removeDefaultSystems: true }, scenes: { level } });
    await ready(engine);
    await engine.goToScene('level');
    expect(level.world.get(ex.LightingSystem)).toBeFalsy();
    expect(level.world.get(ex.FlickerSystem)).toBeFalsy();
    engine.lighting.enabled = false;
    level.update(engine, 16);
    await engine.goToScene('root');
    engine.removeScene('level');
    engine.addScene('level', { scene: level, world: { removeDefaultSystems: false } });
    await engine.goToScene('level');
    expect(level.world.get(ex.LightingSystem)).toBeFalsy();
    expect(level.world.get(ex.FlickerSystem)).toBeFalsy();
    engine.lighting.enabled = true;
    level.update(engine, 16);
    expect(level.world.get(ex.LightingSystem)).toBeTruthy();
    expect(level.world.get(ex.FlickerSystem)).toBeTruthy();
  });
});
