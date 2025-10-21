import * as ex from '@excalibur';

class FakeComponentA extends ex.Component {}
class FakeComponentB extends ex.Component {}

describe('A query', () => {
  it('should exist', () => {
    expect(ex.Query).toBeDefined();
  });

  it('can be created', () => {
    expect(new ex.Query([FakeComponentA, FakeComponentB])).not.toBeNull();
  });

  it('has an id', () => {
    const query = new ex.Query([FakeComponentA, FakeComponentB]);
    expect(query.id).toEqual('all_c_FakeComponentA-c_FakeComponentB');
  });

  it('can match with entities', () => {
    const queryAB = new ex.Query([FakeComponentA, FakeComponentB]);
    const compA = new FakeComponentA();
    const compB = new FakeComponentB();
    const entity1 = new ex.Entity();
    entity1.addComponent(compA);
    entity1.addComponent(compB);

    const entity2 = new ex.Entity();
    entity2.addComponent(compA);

    expect(queryAB.matches(entity1)).toBe(true, 'entity1 should match has both components A, B');
    expect(queryAB.matches(entity2)).toBe(false, 'entity2 should not match, only has 1 component A');
  });

  it('can only add entities that match', () => {
    const queryAB = new ex.Query([FakeComponentA, FakeComponentB]);
    const compA = new FakeComponentA();
    const compB = new FakeComponentB();
    const entity1 = new ex.Entity();
    entity1.addComponent(compA);
    entity1.addComponent(compB);

    const entity2 = new ex.Entity();
    entity2.addComponent(compA);

    queryAB.checkAndModify(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.checkAndModify(entity2);
    expect(queryAB.getEntities()).toEqual([entity1]);
  });

  it('can add entity that match filter.components.any', () => {
    const queryAB = new ex.Query({
      components: {
        any: [FakeComponentA, FakeComponentB]
      }
    });
    const compA = new FakeComponentA();
    const compB = new FakeComponentB();
    const entity1 = new ex.Entity();
    entity1.addComponent(compA);

    const entity2 = new ex.Entity();
    entity2.addComponent(compB);

    queryAB.checkAndModify(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.checkAndModify(entity2);
    expect(queryAB.getEntities()).toEqual([entity1, entity2]);
  });

  it('can add entity that match filter.tags.any', () => {
    const queryAB = new ex.Query({
      tags: {
        any: ['tag']
      }
    });
    const compA = new FakeComponentA();
    const compB = new FakeComponentB();
    const entity1 = new ex.Entity();
    entity1.addComponent(compA);
    entity1.addTag('tag');

    const entity2 = new ex.Entity();
    entity2.addComponent(compB);
    entity2.addTag('tag');

    queryAB.checkAndModify(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.checkAndModify(entity2);
    expect(queryAB.getEntities()).toEqual([entity1, entity2]);
  });

  it('does not add entity with component in filter.components.not', () => {
    const queryAB = new ex.Query({
      components: {
        all: [FakeComponentA],
        not: [FakeComponentB]
      }
    });
    const compA = new FakeComponentA();
    const compB = new FakeComponentB();
    const entity1 = new ex.Entity();
    entity1.addComponent(compA);

    const entity2 = new ex.Entity();
    entity2.addComponent(compA);
    entity2.addComponent(compB);

    queryAB.checkAndModify(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.checkAndModify(entity2);
    expect(queryAB.getEntities()).toEqual([entity1]);
  });

  it('does not add entity with component in filter.tags.not', () => {
    const queryAB = new ex.Query({
      components: {
        all: [FakeComponentA]
      },
      tags: {
        not: ['tag']
      }
    });
    const compA = new FakeComponentA();
    const entity1 = new ex.Entity();
    entity1.addComponent(compA);

    const entity2 = new ex.Entity();
    entity2.addComponent(compA);
    entity2.addTag('tag');

    queryAB.checkAndModify(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.checkAndModify(entity2);
    expect(queryAB.getEntities()).toEqual([entity1]);
  });

  it('can remove entities', () => {
    const queryAB = new ex.Query([FakeComponentA, FakeComponentB]);
    const compA = new FakeComponentA();
    const compB = new FakeComponentB();
    const entity1 = new ex.Entity();
    entity1.addComponent(compA);
    entity1.addComponent(compB);

    const entity2 = new ex.Entity();
    entity2.addComponent(compA);

    queryAB.checkAndModify(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.removeEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.removeEntity(entity1);
    expect(queryAB.getEntities()).toEqual([]);
  });

  it('notifies observers of when something is added to the query', () =>
    new Promise<void>((done) => {
      const queryAB = new ex.Query([FakeComponentA, FakeComponentB]);
      const compA = new FakeComponentA();
      const compB = new FakeComponentB();
      const entity1 = new ex.Entity();
      entity1.addComponent(compA);
      entity1.addComponent(compB);

      queryAB.entityAdded$.subscribe((e) => {
        expect(e).toBe(entity1);
        done();
      });

      queryAB.checkAndModify(entity1);
    }));

  it('notifies observers of when something is added to the query', () =>
    new Promise<void>((done) => {
      const queryAB = new ex.Query([FakeComponentA, FakeComponentB]);
      const compA = new FakeComponentA();
      const compB = new FakeComponentB();
      const entity1 = new ex.Entity();
      entity1.addComponent(compA);
      entity1.addComponent(compB);
      queryAB.checkAndModify(entity1);

      queryAB.entityRemoved$.subscribe((e) => {
        expect(e).toBe(entity1);
        done();
      });

      queryAB.removeEntity(entity1);
    }));
});
