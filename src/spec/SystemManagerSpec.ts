import * as ex from '@excalibur';
import { SystemType } from '@excalibur';

class FakeComponent<T extends string> extends ex.Component<T> {
  constructor(public type: T) {
    super();
  }
}

class FakeSystem extends ex.System<null> {
  constructor(public priority: number, public name: string, public types: string[], public systemType: ex.SystemType) {
    super();
  }
  update(entities: ex.Entity[], delta: number): void {
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
    const sm = new ex.World(null).systemManager;

    // Lower priority
    const s3 = new FakeSystem(2, 'System3', ['C'], SystemType.Update);
    sm.addSystem(s3);
    // Systems of equal priority should preserve order
    const s1 = new FakeSystem(1, 'System1', ['A'], SystemType.Update);
    const s2 = new FakeSystem(1, 'System2', ['C', 'B'], SystemType.Update);
    sm.addSystem(s1);
    sm.addSystem(s2);

    expect(sm.systems).toEqual([s1, s2, s3]);
  });

  it('can remove systems', () => {
    const sm = new ex.World(null).systemManager;

    // Lower priority
    const s3 = new FakeSystem(2, 'System3', ['C'], SystemType.Update);
    sm.addSystem(s3);
    // Systems of equal priority should preserve order
    const s1 = new FakeSystem(1, 'System1', ['A'], SystemType.Update);
    const s2 = new FakeSystem(1, 'System2', ['C', 'B'], SystemType.Update);
    sm.addSystem(s1);
    sm.addSystem(s2);

    expect(sm.systems).toEqual([s1, s2, s3]);
    sm.removeSystem(s3);
    sm.removeSystem(s1);
    expect(sm.systems).toEqual([s2]);
  });

  it('can update systems', () => {
    const sm = new ex.World(null).systemManager;
    const system = new FakeSystem(2, 'System3', ['C'], SystemType.Update);
    system.preupdate = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
    system.postupdate = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
    spyOn(system, 'preupdate');
    spyOn(system, 'postupdate');
    spyOn(system, 'update');
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
    const system = new FakeSystem(2, 'System3', ['A', 'C'], SystemType.Update);
    spyOn(system, 'update').and.callThrough();
    sm.addSystem(system);

    const e1 = new ex.Entity();
    e1.addComponent(new FakeComponent('A'));
    e1.addComponent(new FakeComponent('C'));

    const e2 = new ex.Entity();
    e2.addComponent(new FakeComponent('B'));

    const e3 = new ex.Entity();
    e3.addComponent(new FakeComponent('C'));
    e3.addComponent(new FakeComponent('A'));

    em.addEntity(e1);
    em.addEntity(e2);
    em.addEntity(e3);

    const query = qm.getQuery(['A', 'C']);
    expect(query.getEntities()).toEqual([e1, e3]);

    sm.updateSystems(SystemType.Update, null, 10);

    expect(system.update).toHaveBeenCalledWith([e1, e3], 10);
  });

  it('only updates system of the specified system type', () => {
    const world = new ex.World(null);
    const sm = world.systemManager;
    const qm = world.queryManager;
    const em = world.entityManager;
    const system1 = new FakeSystem(2, 'System1', ['A', 'C'], SystemType.Update);
    spyOn(system1, 'update').and.callThrough();
    sm.addSystem(system1);
    const system2 = new FakeSystem(2, 'System1', ['A', 'C'], SystemType.Draw);
    spyOn(system2, 'update').and.callThrough();
    sm.addSystem(system2);

    sm.updateSystems(SystemType.Draw, null, 10);

    expect(system1.update).not.toHaveBeenCalled();
    expect(system2.update).toHaveBeenCalledWith([], 10);
  });

  it('should throw on invalid system', () => {
    const sm = new ex.World(null).systemManager;
    expect(() => {
      sm.addSystem(new FakeSystem(0, 'ErrorSystem', [], SystemType.Update));
    }).toThrow(new Error('Attempted to add a System without any types'));
  });

  it('type guards on messages should work', () => {
    const add = new ex.AddedEntity(new ex.Entity());
    expect(ex.isAddedSystemEntity(add)).toBe(true);
    expect(ex.isRemoveSystemEntity(add)).toBe(false);

    const remove = new ex.RemovedEntity(new ex.Entity());
    expect(ex.isRemoveSystemEntity(remove)).toBe(true);
    expect(ex.isAddedSystemEntity(remove)).toBe(false);
  });
});
