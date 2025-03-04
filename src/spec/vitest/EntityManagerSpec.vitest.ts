import * as ex from '@excalibur';

class FakeComponent extends ex.Component {
  constructor(public type: string) {
    super();
  }
}

describe('An EntityManager', () => {
  it('exists', () => {
    expect(ex.EntityManager).toBeDefined();
  });

  it('can be created', () => {
    const entityManager = new ex.EntityManager(new ex.World(null));
    expect(entityManager).not.toBeNull();
  });

  it('can have entities added and removed from it', () => {
    const entityManager = new ex.EntityManager(new ex.World(null));
    const entity = new ex.Entity();
    expect(entityManager.entities).toEqual([]);

    entityManager.addEntity(entity);

    expect(entityManager.entities).toEqual([entity]);
    expect(entityManager.getById(entity.id)).toBe(entity);

    // Remove by entity
    entityManager.removeEntity(entity, false);

    expect(entityManager.entities).toEqual([]);
    expect(entityManager.getById(entity.id)).toBeUndefined();

    // Remove by id
    entityManager.addEntity(entity);
    expect(entityManager.entities).toEqual([entity]);
    entityManager.removeEntity(entity.id, false);
    expect(entityManager.entities).toEqual([]);
  });

  it('can find entities by name', () => {
    const entityManager = new ex.EntityManager(new ex.World(null));
    const entity = new ex.Entity([], 'some-e');
    const entity2 = new ex.Entity();
    entityManager.addEntity(entity);
    entityManager.addEntity(entity2);
    expect(entityManager.getByName('some-e')).toEqual([entity]);
    expect(entityManager.getByName(entity2.name)).toEqual([entity2]);
  });

  it('can clear entities', () => {
    const entityManager = new ex.EntityManager(new ex.World(null));
    const entity = new ex.Entity([], 'some-e');
    const entity2 = new ex.Entity();
    entityManager.addEntity(entity);
    entityManager.addEntity(entity2);

    expect(entityManager.entities.length).toBe(2);
    entityManager.clear();
    expect((entityManager as any)._entitiesToRemove.length).toBe(2);
    expect(entityManager.entities.length).toBe(2);
    entityManager.processEntityRemovals();
    expect(entityManager.entities.length).toBe(0);
    expect((entityManager as any)._entitiesToRemove.length).toBe(0);
  });

  it('should only remove the handlers that the manager added on removal', () => {
    const entityManager = new ex.EntityManager(new ex.World(null));
    const entity = new ex.Entity([new ex.TransformComponent()], 'some-e');
    // Transform component listens to child add/remove
    const entity2 = new ex.Entity();
    entityManager.addEntity(entity);
    entityManager.addEntity(entity2);

    expect(entity.childrenAdded$.subscriptions.length).toBe(2);
    expect(entity2.childrenAdded$.subscriptions.length).toBe(1);

    entityManager.removeEntity(entity, false);
    entityManager.removeEntity(entity2, false);
    expect(entity.childrenAdded$.subscriptions.length).toBe(1);
    expect(entity2.childrenAdded$.subscriptions.length).toBe(0);
  });
});
