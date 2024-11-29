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
    expect(query.id).toEqual('FakeComponentA-FakeComponentB');
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

    expect(entity1.hasAll(queryAB.requiredComponents)).toBe(true, 'entity1 should match has both components A, B');
    expect(entity2.hasAll(queryAB.requiredComponents)).toBe(false, 'entity2 should not match, only has 1 component A');
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

    queryAB.checkAndAdd(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.checkAndAdd(entity2);
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

    queryAB.checkAndAdd(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.removeEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.removeEntity(entity1);
    expect(queryAB.getEntities()).toEqual([]);
  });

  it('notifies observers of when something is added to the query', (done) => {
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

    queryAB.checkAndAdd(entity1);
  });

  it('notifies observers of when something is added to the query', (done) => {
    const queryAB = new ex.Query([FakeComponentA, FakeComponentB]);
    const compA = new FakeComponentA();
    const compB = new FakeComponentB();
    const entity1 = new ex.Entity();
    entity1.addComponent(compA);
    entity1.addComponent(compB);
    queryAB.checkAndAdd(entity1);

    queryAB.entityRemoved$.subscribe((e) => {
      expect(e).toBe(entity1);
      done();
    });

    queryAB.removeEntity(entity1);
  });
});
