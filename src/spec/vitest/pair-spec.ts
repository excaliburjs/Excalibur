import * as ex from '@excalibur';

describe('A Collision Pair', () => {
  it('exists', () => {
    expect(ex.Pair).toBeDefined();
  });

  it('can be created with colliders', () => {
    const actor1 = new ex.Actor({
      width: 10,
      height: 10
    });

    const actor2 = new ex.Actor({
      width: 20,
      height: 20
    });

    const sut = new ex.Pair(actor1.collider.get(), actor2.collider.get());

    expect(sut.id).toBe(`#${actor1.collider.get().id.value}+${actor2.collider.get().id.value}`);
  });

  it('cannot collide without a body', () => {
    const actor1 = new ex.Actor({
      width: 10,
      height: 10
    });

    const actor2 = new ex.Actor({
      width: 20,
      height: 20
    });
    actor2.removeComponent(ex.BodyComponent, true);

    const sut = ex.Pair.canCollide(actor1.collider.get(), actor2.collider.get());

    expect(sut).toBe(false);
  });

  it('cannot collide with the same collider', () => {
    const actor1 = new ex.Actor({
      width: 10,
      height: 10
    });

    const sut = ex.Pair.canCollide(actor1.collider.get(), actor1.collider.get());

    expect(sut).toBe(false);
  });

  it('cannot collide with the same colliders with the same owner', () => {
    const actor1 = new ex.Actor();
    const collider1 = ex.Shape.Circle(50);
    const collider2 = ex.Shape.Box(100, 100);
    actor1.collider.useCompositeCollider([collider1, collider2]);

    const sut = ex.Pair.canCollide(collider1, collider2);

    expect(sut).toBe(false);
  });

  it('cannot collide with zero dimension colliders', () => {
    const actor1 = new ex.Actor({
      width: 10,
      height: 10
    });

    const actor2 = new ex.Actor();
    actor2.collider.useBoxCollider(0, 0);

    const sut = ex.Pair.canCollide(actor1.collider.get(), actor2.collider.get());

    expect(sut).toBe(false);
  });

  it('cannot collide with same collision group', () => {
    const group = new ex.CollisionGroup('group', 1, ~1);
    const actor1 = new ex.Actor({
      width: 10,
      height: 10
    });
    actor1.body.group = group;

    const actor2 = new ex.Actor({
      width: 100,
      height: 100
    });
    actor2.body.group = group;

    const sut = ex.Pair.canCollide(actor1.collider.get(), actor2.collider.get());

    expect(sut).toBe(false);
  });
});
