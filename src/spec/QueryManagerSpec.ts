import * as ex from '../../build/dist/excalibur';

class FakeComponent<T extends ex.ComponentType> implements ex.Component<T> {
  constructor(public type: T) {}
  clone() {
    return new FakeComponent(this.type);
  }
}

describe('A QueryManager', () => {
  it('exists', () => {
    expect(ex.QueryManager).toBeDefined();
  });

  it('can be created', () => {
    const queryManager = new ex.QueryManager(new ex.Scene(null));
    expect(queryManager).not.toBeNull();
  });

  it('can create queries for entities', () => {
    const scene = new ex.Scene();
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponent('A'));
    entity1.addComponent(new FakeComponent('B'));

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponent('A'));

    scene.entityManager.addEntity(entity1);
    scene.entityManager.addEntity(entity2);

    // Query for all entities that have type A components
    const queryA = scene.queryManager.createQuery<FakeComponent<'A'>>(['A']);
    // Query for all entities that have type A & B components
    const queryAB = scene.queryManager.createQuery<FakeComponent<'A'> | FakeComponent<'B'>>(['A', 'B']);

    expect(queryA.entities).toEqual([entity1, entity2]);
    expect(queryAB.entities).toEqual([entity1]);

    // Queries update if component change
    entity2.addComponent(new FakeComponent('B'));
    expect(queryAB.entities).toEqual([entity1, entity2]);

    // Queries update if components change
    entity2.removeComponent('B');
    expect(queryAB.entities).toEqual([entity1]);
  });
});
