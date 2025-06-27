import * as ex from '@excalibur';
import { SystemType } from '@excalibur';

class FakeComponentA extends ex.Component {}
class FakeComponentB extends ex.Component {}
class FakeComponentC extends ex.Component {}

class FakeSystemPriority1 extends ex.System {
  static priority = 1;
  query: ex.Query<ex.ComponentCtor<ex.Component>>;
  constructor(
    public world: ex.World,
    public name: string,
    public types: ex.ComponentCtor[],
    public systemType: ex.SystemType
  ) {
    super();
    this.query = this.world.query(types);
  }
  update(elapsedMs: number): void {
    // fake
  }
}

class FakeSystemPriority2 extends ex.System {
  static priority = 2;
  query: ex.Query<ex.ComponentCtor<ex.Component>>;
  constructor(
    public world: ex.World,
    public name: string,
    public types: ex.ComponentCtor[],
    public systemType: ex.SystemType
  ) {
    super();
    this.query = this.world.query(types);
  }
  update(elapsedMs: number): void {
    // fake
  }
}

class FakeSystemPriority3 extends ex.System {
  static priority = 3;
  query: ex.Query<ex.ComponentCtor<ex.Component>>;
  constructor(
    public world: ex.World,
    public name: string,
    public types: ex.ComponentCtor[],
    public systemType: ex.SystemType
  ) {
    super();
    this.query = this.world.query(types);
  }
  update(elapsedMs: number): void {
    // fake
  }
}

describe('A SystemManager', () => {
  it('exists', () => {
    expect(ex.SystemManager).toBeDefined();
  });

  it('can be created', () => {
    const sm = new ex.SystemManager(null);
  });

  it('can add systems', () => {
    const world = new ex.World(null);
    const sm = world.systemManager;

    // Lower priority
    const s3 = new FakeSystemPriority2(world, 'System3', [FakeComponentC], SystemType.Update);
    sm.addSystem(s3);
    // Systems of equal priority should preserve order
    const s1 = new FakeSystemPriority1(world, 'System1', [FakeComponentA], SystemType.Update);
    const s2 = new FakeSystemPriority1(world, 'System2', [FakeComponentC, FakeComponentB], SystemType.Update);
    sm.addSystem(s1);
    sm.addSystem(s2);

    expect(sm.systems).toEqual([s1, s2, s3]);
  });

  it('can remove systems', () => {
    const world = new ex.World(null);
    const sm = world.systemManager;

    // Lower priority
    const s3 = new FakeSystemPriority2(world, 'System3', [FakeComponentC], SystemType.Update);
    sm.addSystem(s3);
    // Systems of equal priority should preserve order
    const s1 = new FakeSystemPriority1(world, 'System1', [FakeComponentA], SystemType.Update);
    const s2 = new FakeSystemPriority1(world, 'System2', [FakeComponentC, FakeComponentB], SystemType.Update);
    sm.addSystem(s1);
    sm.addSystem(s2);

    expect(sm.systems).toEqual([s1, s2, s3]);
    sm.removeSystem(s3);
    sm.removeSystem(s1);
    expect(sm.systems).toEqual([s2]);
  });

  it('can update systems', () => {
    const world = new ex.World(null);
    const sm = world.systemManager;
    const system = new FakeSystemPriority2(world, 'System3', [FakeComponentC], SystemType.Update);
    system.preupdate = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
    system.postupdate = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
    vi.spyOn(system, 'preupdate');
    vi.spyOn(system, 'postupdate');
    vi.spyOn(system, 'update');
    sm.addSystem(system);
    sm.updateSystems(SystemType.Update, null, 10);
    expect(system.preupdate).toHaveBeenCalledTimes(1);
    expect(system.update).toHaveBeenCalledTimes(1);
    expect(system.postupdate).toHaveBeenCalledTimes(1);
  });

  it('can update systems with the correct entities', () => {
    const world = new ex.World(null);
    const sm = world.systemManager;
    const qm = world.queryManager;
    const em = world.entityManager;
    const system = new FakeSystemPriority2(world, 'System3', [FakeComponentA, FakeComponentC], SystemType.Update);
    vi.spyOn(system, 'update');
    sm.addSystem(system);

    const e1 = new ex.Entity();
    e1.addComponent(new FakeComponentA());
    e1.addComponent(new FakeComponentC());

    const e2 = new ex.Entity();
    e2.addComponent(new FakeComponentB());

    const e3 = new ex.Entity();
    e3.addComponent(new FakeComponentC());
    e3.addComponent(new FakeComponentA());

    em.addEntity(e1);
    em.addEntity(e2);
    em.addEntity(e3);

    const query = qm.createQuery([FakeComponentA, FakeComponentC]);
    expect(query.getEntities()).toEqual([e1, e3]);

    sm.updateSystems(SystemType.Update, null, 10);

    expect(system.update).toHaveBeenCalledWith(10);
  });

  it('only updates system of the specified system type', () => {
    const world = new ex.World(null);
    const sm = world.systemManager;
    const qm = world.queryManager;
    const em = world.entityManager;
    const system1 = new FakeSystemPriority2(world, 'System1', [FakeComponentA, FakeComponentC], SystemType.Update);
    vi.spyOn(system1, 'update');
    sm.addSystem(system1);
    const system2 = new FakeSystemPriority2(world, 'System1', [FakeComponentA, FakeComponentC], SystemType.Draw);
    vi.spyOn(system2, 'update');
    sm.addSystem(system2);

    sm.updateSystems(SystemType.Draw, null, 10);

    expect(system1.update).not.toHaveBeenCalled();
    expect(system2.update).toHaveBeenCalledWith(10);
  });
});
