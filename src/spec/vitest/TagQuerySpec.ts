import * as ex from '@excalibur';

describe('A tag query', () => {
  it('should exist', () => {
    expect(ex.TagQuery).toBeDefined();
  });

  it('can be created', () => {
    expect(new ex.TagQuery(['A', 'B'])).not.toBeNull();
  });

  it('has an id', () => {
    const query = new ex.TagQuery(['A', 'B']);
    expect(query.id).toEqual('A-B');
  });

  it('can match with entities', () => {
    const queryAB = new ex.TagQuery(['A', 'B']);
    const entity1 = new ex.Entity();
    entity1.addTag('A');
    entity1.addTag('B');

    const entity2 = new ex.Entity();
    entity2.addTag('A');

    expect(entity1.hasAllTags(queryAB.requiredTags), 'entity1 should match has both components A, B').toBe(true);
    expect(entity2.hasAllTags(queryAB.requiredTags), 'entity2 should not match, only has 1 component A').toBe(false);
  });

  it('can only add entities that match', () => {
    const queryAB = new ex.TagQuery(['A', 'B']);
    const entity1 = new ex.Entity();
    entity1.addTag('A');
    entity1.addTag('B');

    const entity2 = new ex.Entity();
    entity2.addTag('A');

    queryAB.checkAndAdd(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.checkAndAdd(entity2);
    expect(queryAB.getEntities()).toEqual([entity1]);
  });

  it('can remove entities', () => {
    const queryAB = new ex.TagQuery(['A', 'B']);
    const entity1 = new ex.Entity();
    entity1.addTag('A');
    entity1.addTag('B');

    const entity2 = new ex.Entity();
    entity2.addTag('A');

    queryAB.checkAndAdd(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.removeEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.removeEntity(entity1);
    expect(queryAB.getEntities()).toEqual([]);
  });

  it('notifies observers of when something is added to the query', () =>
    new Promise<void>((done) => {
      const queryAB = new ex.TagQuery(['A', 'B']);
      const entity1 = new ex.Entity();
      entity1.addTag('A');
      entity1.addTag('B');

      queryAB.entityAdded$.subscribe((e) => {
        expect(e).toBe(entity1);
        done();
      });

      queryAB.checkAndAdd(entity1);
    }));

  it('notifies observers of when something is added to the query', () =>
    new Promise<void>((done) => {
      const queryAB = new ex.TagQuery(['A', 'B']);
      const entity1 = new ex.Entity();
      entity1.addTag('A');
      entity1.addTag('B');
      queryAB.checkAndAdd(entity1);

      queryAB.entityRemoved$.subscribe((e) => {
        expect(e).toBe(entity1);
        done();
      });

      queryAB.removeEntity(entity1);
    }));
});
