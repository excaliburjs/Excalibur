import * as ex from '@excalibur';
import { SystemType } from '@excalibur';

class FakeComponent extends ex.Component<'A'> {
  public readonly type = 'A';
}
class FakeSystem extends ex.System<FakeComponent> {
  public readonly types = ['A'] as const;
  public systemType = ex.SystemType.Update;
  public update(entities) {
    // nothing
  }
}

describe('A World', () => {
  it('should exist', () => {
    expect(ex.World).toBeDefined();
  });

  it('can be created', () => {
    const world = new ex.World(null);
    expect(world).not.toBe(null);
  });

  it('can add entities', () => {
    const world = new ex.World(null);
    world.entityManager = jasmine.createSpyObj('EntityManager', ['addEntity']);

    const entity = new ex.Entity();

    world.add(entity);
    expect(world.entityManager.addEntity).toHaveBeenCalledWith(entity);
  });

  it('can remove entities', () => {
    const world = new ex.World(null);
    world.entityManager = jasmine.createSpyObj('EntityManager', ['addEntity', 'removeEntity']);

    const entity = new ex.Entity();

    world.add(entity);
    world.remove(entity);
    expect(world.entityManager.removeEntity).toHaveBeenCalledWith(entity as any);
  });

  it('can add systems', () => {
    const world = new ex.World(null);
    world.systemManager = jasmine.createSpyObj('SystemManager', ['addSystem']);

    const system = new FakeSystem();

    world.add(system);
    expect(world.systemManager.addSystem).toHaveBeenCalledWith(system);
  });

  it('can remove systems', () => {
    const world = new ex.World(null);
    world.systemManager = jasmine.createSpyObj('SystemManager', ['addSystem', 'removeSystem']);

    const system = new FakeSystem();

    world.add(system);
    world.remove(system);
    expect(world.systemManager.removeSystem).toHaveBeenCalledWith(system);
  });

  it('can clear entities and systems', () => {
    const world = new ex.World(null);
    world.entityManager = jasmine.createSpyObj('EntityManager', ['clear']);
    world.systemManager = jasmine.createSpyObj('SystemManager', ['clear']);

    world.clearSystems();
    world.clearEntities();

    expect(world.systemManager.clear).toHaveBeenCalled();
    expect(world.entityManager.clear).toHaveBeenCalled();
  });

  it('can update', () => {
    const world = new ex.World('context');
    world.entityManager = jasmine.createSpyObj('EntityManager', ['processComponentRemovals']);
    world.systemManager = jasmine.createSpyObj('SystemManager', ['updateSystems']);

    world.update(SystemType.Update, 100);

    expect(world.systemManager.updateSystems).toHaveBeenCalledWith(SystemType.Update, 'context', 100);
    expect(world.entityManager.processComponentRemovals).toHaveBeenCalled();
  });
});
