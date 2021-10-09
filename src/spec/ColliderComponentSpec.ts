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

  it('can handle composite components', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10)]);

    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    const comp2 = new ex.ColliderComponent(compCollider);
    const contacts = comp.collide(comp2);

    expect(contacts.length).toBe(2);
  });

  it('wires up collision events to the owner onAdd', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    spyOn(comp.events, 'on');

    const e = new ex.Entity();
    e.addComponent(comp);

    expect(comp.events.on).toHaveBeenCalledWith('precollision', jasmine.anything());
    expect(comp.events.on).toHaveBeenCalledWith('postcollision', jasmine.anything());
    expect(comp.events.on).toHaveBeenCalledWith('collisionstart', jasmine.anything());
    expect(comp.events.on).toHaveBeenCalledWith('collisionend', jasmine.anything());
  });

  it('clears out collision events on the owner onRemove', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    spyOn(comp.events, 'clear');

    const e = new ex.Entity();
    e.addComponent(comp);
    e.removeComponent(comp, true);

    expect(comp.events.clear).toHaveBeenCalled();
  });

  it('clear a collider', () => {
    const collider = ex.Shape.Circle(50);
    const comp = new ex.ColliderComponent(collider);
    spyOn(comp.events, 'unwire');
    spyOn(comp.$colliderRemoved, 'notifyAll');
    const e = new ex.Entity();
    e.addComponent(comp);
    expect(collider.owner).not.toBeNull();

    comp.clear();

    expect(comp.get()).toBeNull();
    expect(comp.events.unwire).toHaveBeenCalled();
    expect(comp.$colliderRemoved.notifyAll).toHaveBeenCalled();
    expect(collider.owner).toBeNull();
  });
});
