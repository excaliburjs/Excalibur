import * as ex from '@excalibur';

class FakeComponentA extends ex.Component {}
class FakeComponentB extends ex.Component {}
class FakeComponentC extends ex.Component {}

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
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponentA());
    entity1.addComponent(new FakeComponentB());

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponentA());

    world.entityManager.addEntity(entity1);
    world.entityManager.addEntity(entity2);

    // Query for all entities that have type A components
    const queryA = world.query([FakeComponentA]);
    // Query for all entities that have type A & B components
    const queryAB = world.query([FakeComponentA, FakeComponentB]);

    expect(queryA.getEntities(), 'Both entities have component A').toEqual([entity1, entity2]);
    expect(queryAB.getEntities(), 'Only entity1 has both A+B').toEqual([entity1]);

    // Queries update if component change
    entity2.addComponent(new FakeComponentB());
    expect(queryAB.getEntities(), 'Now both entities have A+B').toEqual([entity1, entity2]);

    // Queries update if components change
    entity2.removeComponent(FakeComponentB, true);
    expect(queryAB.getEntities(), 'Component force removed from entity, only entity1 A+B').toEqual([entity1]);

    // Queries are deferred by default, so queries will update after removals
    entity1.removeComponent(FakeComponentB);
    expect(queryAB.getEntities(), 'Deferred removal, component is still part of entity1').toEqual([entity1]);
    entity1.processComponentRemoval();
    expect(queryAB.getEntities(), 'No entities should match').toEqual([]);
  });

  it('can add entities to queries', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponentA());
    entity1.addComponent(new FakeComponentB());

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponentA());
    entity2.addComponent(new FakeComponentB());

    const queryAB = world.query([FakeComponentA, FakeComponentB]);
    expect(queryAB.getEntities()).toEqual([]);

    world.queryManager.addEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    world.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1, entity2]);
  });

  it('can add entities to tag queries', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addTag('A');
    entity1.addTag('B');

    const entity2 = new ex.Entity();
    entity2.addTag('A');
    entity2.addTag('B');

    const queryAB = world.queryTags(['A', 'B']);
    expect(queryAB.getEntities()).toEqual([]);

    world.queryManager.addEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    world.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1, entity2]);
  });

  it('can remove entities from queries', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponentA());
    entity1.addComponent(new FakeComponentB());

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponentA());
    entity2.addComponent(new FakeComponentB());

    const queryAB = world.query([FakeComponentA, FakeComponentB]);
    world.queryManager.addEntity(entity1);
    world.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1, entity2]);

    world.queryManager.removeEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity2]);

    world.queryManager.removeEntity(entity2);
    expect(queryAB.getEntities()).toEqual([]);
  });

  it('can remove entities from queries that have components and not(tags)', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponentA());
    entity1.addComponent(new FakeComponentB());
    entity1.addTag('ex.offscreen');

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponentA());
    entity2.addComponent(new FakeComponentB());

    const queryAB = world.query({
      components: {
        all: [FakeComponentA, FakeComponentB]
      },
      tags: {
        not: ['ex.offscreen']
      }
    });
    world.queryManager.addEntity(entity1);
    world.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity2]);

    entity2.addTag('ex.offscreen');
    world.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([]);

    entity1.removeTag('ex.offscreen');
    world.queryManager.addEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);
  });

  it('can remove entities from queries that have components and not(components)', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponentA());
    entity1.addComponent(new FakeComponentB());
    entity1.addComponent(new FakeComponentC());

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponentA());
    entity2.addComponent(new FakeComponentB());

    const queryAB = world.query({
      components: {
        all: [FakeComponentA, FakeComponentB],
        not: [FakeComponentC]
      }
    });
    world.queryManager.addEntity(entity1);
    world.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity2]);

    entity2.addComponent(new FakeComponentC());
    world.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([]);

    entity1.removeComponent(FakeComponentC, true);
    world.queryManager.addEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);
  });

  it('can add entities queries that have 1 and(component) + or(components)', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponentA());
    entity1.addComponent(new FakeComponentC());

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponentA());
    entity2.addComponent(new FakeComponentB());

    const queryAB = world.query({
      components: {
        all: [FakeComponentA],
        any: [FakeComponentB, FakeComponentC]
      }
    });
    world.queryManager.addEntity(entity1);
    world.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1, entity2]);

    entity1.removeComponent(FakeComponentC, true);
    world.queryManager.addEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity2]);

    entity2.removeComponent(FakeComponentB, true);
    world.queryManager.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([]);
  });

  it('can remove entities from tag queries', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addTag('A');
    entity1.addTag('B');

    const entity2 = new ex.Entity();
    entity2.addTag('A');
    entity2.addTag('B');

    const queryAB = world.queryTags(['A', 'B']);
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
    entity1.addComponent(new FakeComponentA());
    entity1.addComponent(new FakeComponentB());

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponentA());
    entity2.addComponent(new FakeComponentB());

    const queryAB = world.query([FakeComponentA, FakeComponentB]);
    world.queryManager.addEntity(entity1);
    world.queryManager.addEntity(entity2);

    expect(queryAB.getEntities()).toEqual([entity1, entity2]);

    const removed = entity1.get(FakeComponentA);
    entity1.removeComponent(FakeComponentA, true);
    world.queryManager.removeComponent(entity1, removed);

    expect(queryAB.getEntities()).toEqual([entity2]);
  });

  it('can update tag queries when a component is removed', () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addTag('A');
    entity1.addTag('B');

    const entity2 = new ex.Entity();
    entity2.addTag('A');
    entity2.addTag('B');

    const queryAB = world.queryTags(['A', 'B']);
    world.queryManager.addEntity(entity1);
    world.queryManager.addEntity(entity2);

    expect(queryAB.entities).toEqual([entity1, entity2]);

    entity1.removeTag('A');
    world.queryManager.removeTag(entity1, 'A');

    expect(queryAB.entities).toEqual([entity2]);

    entity2.removeTag('B');
    world.queryManager.removeTag(entity2, 'B');
    expect(queryAB.entities).toEqual([]);
  });

  it("removing components unrelated to the query doesn't remove the entity", () => {
    const world = new ex.World(null);
    const entity1 = new ex.Entity();
    entity1.addComponent(new FakeComponentA());
    entity1.addComponent(new FakeComponentB());
    entity1.addComponent(new FakeComponentC());

    const entity2 = new ex.Entity();
    entity2.addComponent(new FakeComponentA());
    entity2.addComponent(new FakeComponentB());

    const queryAB = world.query([FakeComponentA, FakeComponentB]);
    world.queryManager.addEntity(entity1);
    world.queryManager.addEntity(entity2);

    expect(queryAB.getEntities()).toEqual([entity1, entity2]);

    const removed = entity1.get(FakeComponentC);
    entity1.removeComponent(FakeComponentC);
    world.queryManager.removeComponent(entity1, removed);

    expect(queryAB.getEntities()).toEqual([entity1, entity2]);
  });

  it('will be notified when entity components are added', () =>
    new Promise<void>((done) => {
      const world = new ex.World(null);
      const entity = new ex.Entity();
      world.add(entity);

      const componentA = new FakeComponentA();
      const query = world.query([FakeComponentA]);
      query.entityAdded$.subscribe((e) => {
        expect(e).toBe(entity);
        expect(e.get(FakeComponentA)).toBe(componentA);
        done();
      });

      entity.addComponent(componentA);
    }));

  it('will be notified when entity components are removed', () =>
    new Promise<void>((done) => {
      const world = new ex.World(null);
      const entity = new ex.Entity();
      world.add(entity);
      const componentA = new FakeComponentA();
      entity.addComponent(componentA);

      const query = world.query([FakeComponentA]);
      query.entityRemoved$.subscribe((e) => {
        expect(e).toBe(entity);
        expect(e.get(FakeComponentA)).toBe(componentA);
        done();
      });

      entity.removeComponent(FakeComponentA);
      entity.processComponentRemoval();
    }));
});
