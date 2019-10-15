import * as ex from '../../build/dist/excalibur';
import { SystemManager } from '../../build/dist/excalibur';

class FakeComponent<T extends ex.ComponentType> implements ex.Component<T> {
  constructor(public type: T) {}
  clone() {
    return new FakeComponent(this.type);
  }
}

class FakeSystem extends ex.System {
  constructor(public priority: number, public name: string, public types: string[]) {
    super();
  }
  update(entities: ex.Entity[], delta: number): void {}
}

describe('A SystemManager', () => {
  it('exists', () => {
    expect(ex.SystemManager).toBeDefined();
  });

  it('can be created', () => {
    const sm = new ex.SystemManager(null);
  });

  it('can add systems', () => {
    const sm = new ex.Scene(null).systemManager;

    // Lower priority
    const s3 = new FakeSystem(2, 'System3', ['C']);
    sm.addSystem(s3);
    // Systems of equal priority should preserve order
    const s1 = new FakeSystem(1, 'System1', ['A']);
    const s2 = new FakeSystem(1, 'System2', ['C', 'B']);
    sm.addSystem(s1);
    sm.addSystem(s2);

    expect(sm.systems).toEqual([s1, s2, s3]);
  });

  it('can remove systems', () => {
    const sm = new ex.Scene(null).systemManager;

    // Lower priority
    const s3 = new FakeSystem(2, 'System3', ['C']);
    sm.addSystem(s3);
    // Systems of equal priority should preserve order
    const s1 = new FakeSystem(1, 'System1', ['A']);
    const s2 = new FakeSystem(1, 'System2', ['C', 'B']);
    sm.addSystem(s1);
    sm.addSystem(s2);

    expect(sm.systems).toEqual([s1, s2, s3]);
    sm.removeSystem(s3);
    sm.removeSystem(s1);
    expect(sm.systems).toEqual([s2]);
  });

  it('can update systems', () => {
    const sm = new ex.Scene(null).systemManager;
    const system = new FakeSystem(2, 'System3', ['C']);
    system.preupdate = () => {};
    system.postupdate = () => {};
    spyOn(system, 'preupdate');
    spyOn(system, 'postupdate');
    spyOn(system, 'update');
    sm.addSystem(system);
    sm.updateSystems(null, 10);
    expect(system.preupdate).toHaveBeenCalledTimes(1);
    expect(system.update).toHaveBeenCalledTimes(1);
    expect(system.postupdate).toHaveBeenCalledTimes(1);
  });

  it('can update systems with the correct entities', () => {
    const scene = new ex.Scene(null);
    const sm = scene.systemManager;
    const qm = scene.queryManager;
    const em = scene.entityManager;
    const system = new FakeSystem(2, 'System3', ['A', 'C']);
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
    expect(query.entities).toEqual([e1, e3]);

    sm.updateSystems(null, 10);

    expect(system.update).toHaveBeenCalledWith([e1, e3], 10);
  });

  it('should throw on invalid system', () => {
    const sm = new ex.Scene(null).systemManager;
    expect(() => {
      sm.addSystem(new FakeSystem(0, 'ErrorSystem', []));
    }).toThrow(new Error('Attempted to add a System without any types'));
  });
});
