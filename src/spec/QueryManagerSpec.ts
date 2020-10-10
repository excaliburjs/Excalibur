import * as ex from '@excalibur';

class FakeComponent<T extends string> extends ex.Component<T> {
  constructor(public type: T) {
    super();
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
    const scene = new ex.Scene(null);
    const entity1 = new ex.Entity<FakeComponent<'A'> | FakeComponent<'B'>>();
    entity1.addComponent(new FakeComponent('A'));
    entity1.addComponent(new FakeComponent('B'));

    const entity2 = new ex.Entity<FakeComponent<'A'>>();
    entity2.addComponent(new FakeComponent('A'));

    scene.entityManager.addEntity(entity1);
    scene.entityManager.addEntity(entity2);

    // Query for all entities that have type A components
    const queryA = scene.queryManager.createQuery<FakeComponent<'A'>>(['A']);
    // Query for all entities that have type A & B components
    const queryAB = scene.queryManager.createQuery<FakeComponent<'A'> | FakeComponent<'B'>>(['A', 'B']);

    expect(queryA.getEntities()).toEqual([entity1, entity2]);
    expect(queryAB.getEntities()).toEqual([entity1]);

    // Queries update if component change
    entity2.addComponent(new FakeComponent('B'));
    expect(queryAB.getEntities()).toEqual([entity1, entity2 as ex.Entity<FakeComponent<'A'> | FakeComponent<'B'>>]);

    // Queries update if components change
    entity2.removeComponent('B', true);
    expect(queryAB.getEntities()).toEqual([entity1]);

    // Queries are deferred by default, so queries will update after removals
    entity1.removeComponent('B');
    expect(queryAB.getEntities()).toEqual([entity1]);
    entity1.processRemoval();
    expect(queryAB.getEntities()).toEqual([]);
  });

  it('can remove queries', () => {
    const scene = new ex.Scene(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponent('A'));
    entity1.addComponent(new FakeComponent('B'));

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponent('A'));
    entity2.addComponent(new FakeComponent('B'));

    scene.entityManager.addEntity(entity1);
    scene.entityManager.addEntity(entity2);

    // Query for all entities that have type A components
    const queryA = scene.queryManager.createQuery(['A', 'B']);

    queryA.register({
      notify: () => {} // eslint-disable-line @typescript-eslint/no-empty-function
    });

    expect(scene.queryManager.getQuery(['A', 'B'])).toBe(queryA);

    // Query will not be removed if there are observers
    scene.queryManager.maybeRemoveQuery(queryA);
    expect(scene.queryManager.getQuery(['A', 'B'])).toBe(queryA);

    // Query will be removed if no observers
    queryA.clear();
    scene.queryManager.maybeRemoveQuery(queryA);
    expect(scene.queryManager.getQuery(['A', 'B'])).toBe(null);
  });

  it('can add entities to queries', () => {
    const scene = new ex.Scene(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponent('A'));
    entity1.addComponent(new FakeComponent('B'));

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponent('A'));
    entity2.addComponent(new FakeComponent('B'));

    const queryAB = scene.queryManager.createQuery(['A', 'B']);
    expect(queryAB.getEntities()).toEqual([]);

    scene.queryManager.addEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    scene.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1, entity2]);
  });

  it('can remove entities from queries', () => {
    const scene = new ex.Scene(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponent('A'));
    entity1.addComponent(new FakeComponent('B'));

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponent('A'));
    entity2.addComponent(new FakeComponent('B'));

    const queryAB = scene.queryManager.createQuery(['A', 'B']);
    scene.queryManager.addEntity(entity1);
    scene.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1, entity2]);

    scene.queryManager.removeEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity2]);

    scene.queryManager.removeEntity(entity2);
    expect(queryAB.getEntities()).toEqual([]);
  });

  it('can update queries when a component is removed', () => {
    const scene = new ex.Scene(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponent('A'));
    entity1.addComponent(new FakeComponent('B'));

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponent('A'));
    entity2.addComponent(new FakeComponent('B'));

    const queryAB = scene.queryManager.createQuery(['A', 'B']);
    scene.queryManager.addEntity(entity1);
    scene.queryManager.addEntity(entity2);

    expect(queryAB.getEntities()).toEqual([entity1, entity2]);

    const removed = entity1.components.A;
    entity1.removeComponent('A');
    scene.queryManager.removeComponent(entity1, removed);

    expect(queryAB.getEntities()).toEqual([entity2]);
  });
});
