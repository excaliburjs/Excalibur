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
    const queryManager = new ex.QueryManager(new ex.World(null));
    expect(queryManager).not.toBeNull();
  });

  it('can create queries for entities', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity<FakeComponent<'A'> | FakeComponent<'B'>>();
    entity1.addComponent(new FakeComponent('A'));
    entity1.addComponent(new FakeComponent('B'));

    const entity2 = new ex.Entity<FakeComponent<'A'>>();
    entity2.addComponent(new FakeComponent('A'));

    world.entityManager.addEntity(entity1);
    world.entityManager.addEntity(entity2);

    // Query for all entities that have type A components
    const queryA = world.queryManager.createQuery<FakeComponent<'A'>>(['A']);
    // Query for all entities that have type A & B components
    const queryAB = world.queryManager.createQuery<FakeComponent<'A'> | FakeComponent<'B'>>(['A', 'B']);

    expect(queryA.getEntities()).toEqual([entity1, entity2], 'Both entities have component A');
    expect(queryAB.getEntities()).toEqual([entity1], 'Only entity1 has both A+B');

    // Queries update if component change
    entity2.addComponent(new FakeComponent('B'));
    expect(queryAB.getEntities()).toEqual(
      [entity1, entity2 as ex.Entity<FakeComponent<'A'> | FakeComponent<'B'>>],
      'Now both entities have A+B'
    );

    // Queries update if components change
    entity2.removeComponent('B', true);
    expect(queryAB.getEntities()).toEqual([entity1], 'Component force removed from entity, only entity1 A+B');

    // Queries are deferred by default, so queries will update after removals
    entity1.removeComponent('B');
    expect(queryAB.getEntities()).toEqual([entity1], 'Deferred removal, component is still part of entity1');
    entity1.processComponentRemoval();
    expect(queryAB.getEntities()).toEqual([], 'No entities should match');
  });

  it('can remove queries', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponent('A'));
    entity1.addComponent(new FakeComponent('B'));

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponent('A'));
    entity2.addComponent(new FakeComponent('B'));

    world.entityManager.addEntity(entity1);
    world.entityManager.addEntity(entity2);

    // Query for all entities that have type A components
    const queryA = world.queryManager.createQuery(['A', 'B']);

    queryA.register({
      notify: () => {} // eslint-disable-line @typescript-eslint/no-empty-function
    });

    expect(world.queryManager.getQuery(['A', 'B'])).toBe(queryA);

    // Query will not be removed if there are observers
    world.queryManager.maybeRemoveQuery(queryA);
    expect(world.queryManager.getQuery(['A', 'B'])).toBe(queryA);

    // Query will be removed if no observers
    queryA.clear();
    world.queryManager.maybeRemoveQuery(queryA);
    expect(world.queryManager.getQuery(['A', 'B'])).toBe(null);
  });

  it('can add entities to queries', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponent('A'));
    entity1.addComponent(new FakeComponent('B'));

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponent('A'));
    entity2.addComponent(new FakeComponent('B'));

    const queryAB = world.queryManager.createQuery(['A', 'B']);
    expect(queryAB.getEntities()).toEqual([]);

    world.queryManager.addEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    world.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1, entity2]);
  });

  it('can remove entities from queries', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponent('A'));
    entity1.addComponent(new FakeComponent('B'));

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponent('A'));
    entity2.addComponent(new FakeComponent('B'));

    const queryAB = world.queryManager.createQuery(['A', 'B']);
    world.queryManager.addEntity(entity1);
    world.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1, entity2]);

    world.queryManager.removeEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity2]);

    world.queryManager.removeEntity(entity2);
    expect(queryAB.getEntities()).toEqual([]);
  });

  it('can update queries when a component is removed', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponent('A'));
    entity1.addComponent(new FakeComponent('B'));

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponent('A'));
    entity2.addComponent(new FakeComponent('B'));

    const queryAB = world.queryManager.createQuery(['A', 'B']);
    world.queryManager.addEntity(entity1);
    world.queryManager.addEntity(entity2);

    expect(queryAB.getEntities()).toEqual([entity1, entity2]);

    const removed = entity1.components.A;
    entity1.removeComponent('A');
    world.queryManager.removeComponent(entity1, removed);

    expect(queryAB.getEntities()).toEqual([entity2]);
  });
});
