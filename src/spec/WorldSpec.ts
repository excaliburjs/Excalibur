import * as ex from '@excalibur';
import { SystemType } from '@excalibur';

class FakeComponent extends ex.Component {}
class FakeSystem extends ex.System {
  public systemType = ex.SystemType.Update;
  query: ex.Query<typeof FakeComponent>;
  constructor(public world: ex.World) {
    super();
    this.query = world.query([FakeComponent]);
  }
  public update() {
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
    world.remove(entity, false);
    expect(world.entityManager.removeEntity).toHaveBeenCalledWith(entity as any, false);
  });

  it('can add systems', () => {
    const world = new ex.World(null);
    world.systemManager = jasmine.createSpyObj('SystemManager', ['addSystem']);

    const system = new FakeSystem(world);

    world.add(system);
    expect(world.systemManager.addSystem).toHaveBeenCalledWith(system);
  });

  it('can remove systems', () => {
    const world = new ex.World(null);
    world.systemManager = jasmine.createSpyObj('SystemManager', ['addSystem', 'removeSystem']);

    const system = new FakeSystem(world);

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
    const scene = new ex.Scene();
    const world = new ex.World(scene);
    world.entityManager = jasmine.createSpyObj('EntityManager', [
      'processEntityRemovals',
      'findEntitiesForRemoval',
      'processComponentRemovals',
      'updateEntities'
    ]);
    world.systemManager = jasmine.createSpyObj('SystemManager', ['updateSystems']);

    world.update(SystemType.Update, 100);

    expect(world.systemManager.updateSystems).toHaveBeenCalledWith(SystemType.Update, scene, 100);
    expect(world.entityManager.processComponentRemovals).toHaveBeenCalled();
    expect(world.entityManager.processEntityRemovals).toHaveBeenCalled();
  });
});
