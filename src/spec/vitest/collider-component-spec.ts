import * as ex from '@excalibur';

describe('A ColliderComponent', () => {
  it('exists', () => {
    expect(ex.ColliderComponent).toBeDefined();
  });

  it('can be built with a collider', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    expect(comp).toBeDefined();
  });

  it('can collide with other components', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    const comp2 = new ex.ColliderComponent(ex.Shape.Circle(50));
    const contacts = comp.collide(comp2);

    expect(contacts.length).toBe(1);
  });

  it('can be cloned', () => {
    const collider = new ex.ColliderComponent(ex.Shape.Circle(50));
    const owner = new ex.Entity([collider]);

    const originalCollisionHandler = vi.fn();
    owner.on('collisionstart', originalCollisionHandler);

    const clone = owner.clone();

    const cloneCollisionHandler = vi.fn();
    clone.on('collisionstart', cloneCollisionHandler);

    const sut = clone.get(ex.ColliderComponent);

    // Should be same value
    expect(sut.get().bounds).toEqual(collider.get().bounds);
    expect(sut.bounds).toEqual(collider.bounds);

    // Should be new refs
    expect(sut).not.toBe(collider);

    // Should have a new owner
    expect(sut.owner).toBe(clone);

    // Original handler should fire not the clone
    collider
      .get()
      .events.emit('collisionstart', new ex.CollisionStartEvent<ex.Collider>(ex.Shape.Circle(50), ex.Shape.Circle(50), null, null));

    expect(originalCollisionHandler).toHaveBeenCalledTimes(1);
    expect(cloneCollisionHandler).not.toHaveBeenCalled();
  });

  it('can handle composite components', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10)]);

    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    const comp2 = new ex.ColliderComponent(compCollider);
    const contacts = comp.collide(comp2);

    expect(contacts.length).toBe(2);
  });

  it('wires up collision events to the owner onAdd', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    vi.spyOn(comp.events, 'on');

    const e = new ex.Entity();
    e.addComponent(comp);

    expect(comp.events.on).toHaveBeenCalledWith('precollision', expect.anything());
    expect(comp.events.on).toHaveBeenCalledWith('postcollision', expect.anything());
    expect(comp.events.on).toHaveBeenCalledWith('collisionstart', expect.anything());
    expect(comp.events.on).toHaveBeenCalledWith('collisionend', expect.anything());
  });

  it('clears out collision events on the owner onRemove', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    vi.spyOn(comp.events, 'clear');

    const e = new ex.Entity();
    e.addComponent(comp);
    e.removeComponent(ex.ColliderComponent, true);

    expect(comp.events.clear).toHaveBeenCalled();
  });

  it('clear a collider', () => {
    const collider = ex.Shape.Circle(50);
    const comp = new ex.ColliderComponent(collider);
    vi.spyOn(collider.events, 'unpipe');
    vi.spyOn(comp.$colliderRemoved, 'notifyAll');
    const e = new ex.Entity();
    e.addComponent(comp);
    expect(collider.owner).not.toBeNull();

    comp.clear();
    comp.processColliderRemoval();

    expect(comp.get()).toBeNull();
    expect(collider.events.unpipe).toHaveBeenCalled();
    expect(comp.$colliderRemoved.notifyAll).toHaveBeenCalled();
    expect(collider.owner).toBeNull();
  });
});
