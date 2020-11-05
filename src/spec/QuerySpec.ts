import * as ex from '@excalibur';

class FakeComponent<T extends string> extends ex.Component<T> {
  constructor(public type: T) {
    super();
  }
}

describe('A query', () => {
  it('should exist', () => {
    expect(ex.Query).toBeDefined();
  });

  it('can be created', () => {
    expect(new ex.Query(['A', 'B'])).not.toBeNull();
  });

  it('has a key', () => {
    const query = new ex.Query(['A', 'B']);
    expect(query.key).toBe('A+B');
  });

  it('can match with entities', () => {
    const queryAB = new ex.Query(['A', 'B']);
    const compA = new FakeComponent('A');
    const compB = new FakeComponent('B');
    const entity1 = new ex.Entity();
    entity1.addComponent(compA);
    entity1.addComponent(compB);

    const entity2 = new ex.Entity();
    entity2.addComponent(compA);

    expect(queryAB.matches(entity1)).toBe(true, 'entity1 should match has both compontents A, B');
    expect(queryAB.matches(['A', 'B'])).toBe(true);
    expect(queryAB.matches(entity2)).toBe(false, 'entity2 should not match, only has 1 component A');
    expect(queryAB.matches(['A'])).toBe(false);
  });

  it('can only add entities that match', () => {
    const queryAB = new ex.Query(['A', 'B']);
    const compA = new FakeComponent('A');
    const compB = new FakeComponent('B');
    const entity1 = new ex.Entity<FakeComponent<'A'> | FakeComponent<'B'>>();
    entity1.addComponent(compA);
    entity1.addComponent(compB);

    const entity2 = new ex.Entity<FakeComponent<'A'>>();
    entity2.addComponent(compA);

    queryAB.addEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.addEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1]);
  });

  it('can remove entities', () => {
    const queryAB = new ex.Query(['A', 'B']);
    const compA = new FakeComponent('A');
    const compB = new FakeComponent('B');
    const entity1 = new ex.Entity<FakeComponent<'A'> | FakeComponent<'B'>>();
    entity1.addComponent(compA);
    entity1.addComponent(compB);

    const entity2 = new ex.Entity<FakeComponent<'A'>>();
    entity2.addComponent(compA);

    queryAB.addEntity(entity1);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.removeEntity(entity2);
    expect(queryAB.getEntities()).toEqual([entity1]);

    queryAB.removeEntity(entity1);
    expect(queryAB.getEntities()).toEqual([]);
  });

  it('notifies obersvers of when something is added to the query', (done) => {
    const queryAB = new ex.Query(['A', 'B']);
    const compA = new FakeComponent('A');
    const compB = new FakeComponent('B');
    const entity1 = new ex.Entity<FakeComponent<'A'> | FakeComponent<'B'>>();
    entity1.addComponent(compA);
    entity1.addComponent(compB);

    queryAB.register({
      notify: (message) => {
        expect(message.type).toBe('Entity Added');
        expect(message.data).toBe(entity1);
        done();
      }
    });

    queryAB.addEntity(entity1);
  });

  it('notifies obersvers of when something is added to the query', (done) => {
    const queryAB = new ex.Query(['A', 'B']);
    const compA = new FakeComponent('A');
    const compB = new FakeComponent('B');
    const entity1 = new ex.Entity<FakeComponent<'A'> | FakeComponent<'B'>>();
    entity1.addComponent(compA);
    entity1.addComponent(compB);
    queryAB.addEntity(entity1);

    queryAB.register({
      notify: (message) => {
        expect(message.type).toBe('Entity Removed');
        expect(message.data).toBe(entity1);
        done();
      }
    });

    queryAB.removeEntity(entity1);
  });

  it('can clear all observers and entities from the query', () => {
    const queryAB = new ex.Query(['A', 'B']);
    const compA = new FakeComponent('A');
    const compB = new FakeComponent('B');
    const entity1 = new ex.Entity<FakeComponent<'A'> | FakeComponent<'B'>>();
    entity1.addComponent(compA);
    entity1.addComponent(compB);

    queryAB.addEntity(entity1);
    queryAB.register({
      notify: () => {} // eslint-disable-line @typescript-eslint/no-empty-function
    });
    expect(queryAB.getEntities()).toEqual([entity1]);
    expect(queryAB.observers.length).toBe(1);
    queryAB.clear();
    expect(queryAB.getEntities()).toEqual([]);
    expect(queryAB.observers.length).toBe(0);
  });
});
