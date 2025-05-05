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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should exist', () => {
    expect(ex.World).toBeDefined();
  });

  it('can be created', () => {
    const world = new ex.World(null);
    expect(world).not.toBe(null);
  });

  it('can add entities', () => {
    const world = new ex.World(null);
    vi.spyOn(world.entityManager, 'addEntity');

    const entity = new ex.Entity();

    world.add(entity);
    expect(world.entityManager.addEntity).toHaveBeenCalledWith(entity);
  });

  it('can remove entities', () => {
    const world = new ex.World(null);
    vi.spyOn(world.entityManager, 'removeEntity');

    const entity = new ex.Entity();

    world.add(entity);
    world.remove(entity, false);
    expect(world.entityManager.removeEntity).toHaveBeenCalledWith(entity as any, false);
  });

  it('can add systems', () => {
    const world = new ex.World(null);
    vi.spyOn(world.systemManager, 'addSystem');

    const system = new FakeSystem(world);

    world.add(system);
    expect(world.systemManager.addSystem).toHaveBeenCalledWith(system);
  });

  it('can remove systems', () => {
    const world = new ex.World(null);
    vi.spyOn(world.systemManager, 'removeSystem');

    const system = new FakeSystem(world);

    world.add(system);
    world.remove(system);
    expect(world.systemManager.removeSystem).toHaveBeenCalledWith(system);
  });

  it('can clear entities and systems', () => {
    const world = new ex.World(null);
    vi.spyOn(world.systemManager, 'clear');
    vi.spyOn(world.entityManager, 'clear');

    world.clearSystems();
    world.clearEntities();

    expect(world.systemManager.clear).toHaveBeenCalled();
    expect(world.entityManager.clear).toHaveBeenCalled();
  });

  it('can update', () => {
    const scene = new ex.Scene();
    const world = new ex.World(scene);
    vi.spyOn(world.systemManager, 'updateSystems');
    vi.spyOn(world.entityManager, 'processComponentRemovals');
    vi.spyOn(world.entityManager, 'processEntityRemovals');
    vi.spyOn(world.entityManager, 'updateEntities');
    vi.spyOn(world.systemManager, 'updateSystems');

    world.update(SystemType.Update, 100);

    expect(world.systemManager.updateSystems).toHaveBeenCalledWith(SystemType.Update, scene, 100);
    expect(world.entityManager.processComponentRemovals).toHaveBeenCalled();
    expect(world.entityManager.processEntityRemovals).toHaveBeenCalled();
  });
});
