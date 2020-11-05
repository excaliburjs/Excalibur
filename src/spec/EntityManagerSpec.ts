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
    entityManager.removeEntity(entity);

    expect(entityManager.entities).toEqual([]);
    expect(entityManager.getById(entity.id)).toBeUndefined();

    // Remove by id
    entityManager.addEntity(entity);
    expect(entityManager.entities).toEqual([entity]);
    entityManager.removeEntity(entity.id);
    expect(entityManager.entities).toEqual([]);
  });

  it('will be notified when entity components are added', (done) => {
    const entityManager = new ex.EntityManager(new ex.World(null));
    const entity = new ex.Entity();
    const componentA = new FakeComponent('A');
    entityManager.addEntity(entity);

    entityManager.notify = (message) => {
      expect(message.type).toBe('Component Added');
      expect(message.data.entity).toBe(entity);
      expect(message.data.component).toBe(componentA);
      done();
    };

    entity.addComponent(componentA);
  });

  it('will be notified when entity components are removed', (done) => {
    const entityManager = new ex.EntityManager(new ex.World(null));
    const entity = new ex.Entity();
    const componentA = new FakeComponent('A');
    entity.addComponent(componentA);
    entityManager.addEntity(entity);

    entityManager.notify = (message) => {
      expect(message.type).toBe('Component Removed');
      expect(message.data.entity).toBe(entity);
      expect(message.data.component).toBe(componentA);
      done();
    };

    entity.removeComponent(componentA);
    entity.processComponentRemoval();
  });
});
