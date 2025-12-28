import * as ex from '@excalibur';
import { BoundingBox, GameEvent, LineSegment, Projection, Ray, vec, Vector } from '@excalibur';

import { getDefaultPhysicsConfig } from '../../engine/collision/physics-config';

describe('A CompositeCollider', () => {
  it('exists', () => {
    expect(ex.CompositeCollider).toBeDefined();
  });

  it('can be created from multiple colliders', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10)]);
    const xf = new ex.Transform();
    xf.pos = vec(100, 100);
    compCollider.update(xf);

    expect(compCollider).toBeDefined();
    expect(compCollider.bounds).toEqual(BoundingBox.fromDimension(200, 100, Vector.Half, vec(100, 100)));
    expect(compCollider.localBounds).toEqual(BoundingBox.fromDimension(200, 100, Vector.Half));
  });

  it('can forward events from the individual colliders', () => {
    const circle = ex.Shape.Circle(50);
    const box = ex.Shape.Box(200, 10);
    const precollision = vi.fn();
    const postcollision = vi.fn();
    const collisionstart = vi.fn();
    const collisionend = vi.fn();

    const compCollider = new ex.CompositeCollider([circle, box]);

    compCollider.events.on('precollision', precollision);
    compCollider.events.on('postcollision', postcollision);
    compCollider.events.on('collisionstart', collisionstart);
    compCollider.events.on('collisionend', collisionend);

    circle.events.emit('precollision', new GameEvent());
    circle.events.emit('postcollision', new GameEvent());
    circle.events.emit('collisionstart', new GameEvent());
    circle.events.emit('collisionend', new GameEvent());

    expect(precollision).toHaveBeenCalled();
    expect(postcollision).toHaveBeenCalled();
    expect(collisionstart).toHaveBeenCalled();
    expect(collisionend).toHaveBeenCalled();
  });

  it('can find the furthest point', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);
    const up = compCollider.getFurthestPoint(Vector.Up);
    const down = compCollider.getFurthestPoint(Vector.Down);
    const left = compCollider.getFurthestPoint(Vector.Left);
    const right = compCollider.getFurthestPoint(Vector.Right);
    expect(up, 'Top of the circle is (0, -50)').toBeVector(vec(0, -50));
    expect(down, 'Bottom of the circle is (0, 50)').toBeVector(vec(0, 50));
    expect(left, 'Upper Left of the box is (-100, -5)').toBeVector(vec(-100, -5));
    expect(right, 'Upper Right of the box is (-5, 100)').toBeVector(vec(100, -5));
  });

  it('sums the inertia of the shapes', () => {
    const circle = ex.Shape.Circle(50);
    const box = ex.Shape.Box(200, 10);
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    expect(compCollider.getInertia(100)).toBe(circle.getInertia(100) + box.getInertia(100));
  });

  it('can locate the closest line between colliders', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const circle = ex.Shape.Circle(50);
    const xf = new ex.Transform();

    xf.pos = vec(300, 0);
    circle.update(xf);
    const lineRight = compCollider.getClosestLineBetween(circle);
    expect(lineRight.begin).toEqual(vec(250, 0));
    expect(lineRight.end).toEqual(vec(100, 0));

    xf.pos = vec(0, -300);
    circle.update(xf);
    const lineTop = compCollider.getClosestLineBetween(circle);
    expect(lineTop.begin).toEqual(vec(0, -250));
    expect(lineTop.end).toEqual(vec(0, -50));

    xf.pos = vec(0, 300);
    circle.update(xf);
    const lineBottom = compCollider.getClosestLineBetween(circle);
    expect(lineBottom.begin).toEqual(vec(0, 250));
    expect(lineBottom.end).toEqual(vec(0, 50));

    xf.pos = vec(-300, 0);
    circle.update(xf);
    const lineLeft = compCollider.getClosestLineBetween(circle);
    expect(lineLeft.begin).toEqual(vec(-250, 0));
    expect(lineLeft.end).toEqual(vec(-100, 0));
  });

  it('can get the closest line between other composite colliders', () => {
    const compCollider1 = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const compCollider2 = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const xf = new ex.Transform();
    xf.pos = vec(500, 0);
    compCollider2.update(xf);

    const line = compCollider1.getClosestLineBetween(compCollider2);
    expect(line.begin).toEqual(vec(100, -5));
    expect(line.end).toEqual(vec(400, -5));

    xf.pos = vec(0, 500);
    compCollider2.update(xf);

    const line2 = compCollider1.getClosestLineBetween(compCollider2);
    expect(line2.begin).toEqual(vec(0, 50));
    expect(line2.end).toEqual(vec(0, 450));
  });

  it('can collide with normal colliders', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const circle = ex.Shape.Circle(50);
    const xf = new ex.Transform();
    xf.pos = vec(149, 0);
    circle.update(xf);

    const contactBoxCircle = compCollider.collide(circle);
    expect(contactBoxCircle.length).toBe(1);
    expect(contactBoxCircle[0].points[0], 'Right edge of the box in comp').toEqual(vec(99, 0));

    xf.pos = vec(0, -100);
    circle.update(xf);
    const contactCircleCircle = compCollider.collide(circle);
    expect(contactCircleCircle.length).toBe(1);
    expect(contactCircleCircle[0].points[0], 'Top of the circle in comp').toEqual(vec(0, -50));
  });

  it('creates contacts that have the composite collider id', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const circle = ex.Shape.Circle(50);
    const xf = new ex.Transform();
    xf.pos = vec(149, 0);
    circle.update(xf);

    const contactBoxCircle = compCollider.collide(circle);
    // Composite collisions have a special id that appends the "parent" id to the id to accurately track start/end
    expect(contactBoxCircle[0].id).toBe(
      ex.Pair.calculatePairHash(compCollider.getColliders()[1].id, circle.id) + '|' + ex.Pair.calculatePairHash(compCollider.id, circle.id)
    );
  });

  it("creates contacts that have the don't have composite collider id when in separate mode", () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);
    compCollider.compositeStrategy = 'separate';

    const circle = ex.Shape.Circle(50);
    const xf = new ex.Transform();
    xf.pos = vec(149, 0);
    circle.update(xf);

    const contactBoxCircle = compCollider.collide(circle);
    // Composite collisions have a special id that appends the "parent" id to the id to accurately track start/end
    expect(contactBoxCircle[0].id).toBe(
      ex.Pair.calculatePairHash(compCollider.getColliders()[1].id, circle.id) +
        '|' +
        ex.Pair.calculatePairHash(compCollider.getColliders()[1].id, circle.id)
    );
  });

  it('can collide with other composite colliders', () => {
    const compCollider1 = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const compCollider2 = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const xf = new ex.Transform();
    xf.pos = vec(200, 0);
    compCollider2.update(xf);

    const contacts = compCollider1.collide(compCollider2);
    expect(contacts.length).toBe(1);
    expect(contacts[0].points, 'Right edge of comp1 poly').toEqual([vec(100, 5), vec(100, -5)]);
  });

  it('returns empty on no contacts', () => {
    const compCollider1 = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const circle = ex.Shape.Circle(50);
    const xf = new ex.Transform();
    xf.pos = vec(300, 0);
    circle.update(xf);

    expect(compCollider1.collide(circle)).toEqual([]);
  });

  it('can return all the axes', () => {
    const circle = ex.Shape.Circle(50);
    const box = ex.Shape.Box(200, 10);
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    expect(compCollider.axes).toEqual(circle.axes.concat(box.axes));
  });

  it('can be tested with a raycast', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const rayRight = new Ray(vec(-200, 0), Vector.Right);

    const leftBox = compCollider.rayCast(rayRight).point;
    expect(leftBox).toEqual(vec(-100, 0));

    const rayDown = new Ray(vec(0, -200), Vector.Down);
    const topCircle = compCollider.rayCast(rayDown).point;
    expect(topCircle).toEqual(vec(0, -50));

    const rayUp = new Ray(vec(0, 200), Vector.Up);
    const bottomCircle = compCollider.rayCast(rayUp).point;
    expect(bottomCircle).toEqual(vec(0, 50));

    const rayLeft = new Ray(vec(200, 0), Vector.Left);
    const rightBox = compCollider.rayCast(rayLeft).point;
    expect(rightBox).toEqual(vec(100, 0));

    const hit = compCollider.rayCast(rayLeft);
    expect(hit.normal).toBeVector(Vector.Right);
    expect(hit.distance).toBe(100);
    expect(hit.body).toBe(undefined);
    expect(hit.collider).toBe(compCollider.getColliders()[1]);
  });

  it('can project onto an axis', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const widthProj = compCollider.project(Vector.Right);
    expect(widthProj).toEqual(new Projection(-100, 100));

    const heightProj = compCollider.project(Vector.Up);
    expect(heightProj).toEqual(new Projection(-50, 50));
  });

  it('can test point containment', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    expect(compCollider.contains(vec(0, -50))).toBe(true);
    expect(compCollider.contains(vec(0, -51))).toBe(false);
    expect(compCollider.contains(vec(0, 50))).toBe(true);
    expect(compCollider.contains(vec(0, 51))).toBe(false);
    expect(compCollider.contains(vec(99.9, 0))).toBe(true);
    expect(compCollider.contains(vec(101, 0))).toBe(false);
    expect(compCollider.contains(vec(-99.9, 0))).toBe(true);
    expect(compCollider.contains(vec(-101, 0))).toBe(false);
  });

  it('@visual can be debug drawn', async () => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 300;
    canvasElement.height = 300;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);
    const tx = new ex.Transform();
    tx.pos = ex.vec(150, 150);
    compCollider.update(tx);

    ctx.clear();

    compCollider.debug(ctx, ex.Color.Red);

    ctx.flush();

    await expect(canvasElement).toEqualImage('/src/spec/assets/images/CompositeColliderSpec/composite.png');
  });

  it('is separated into a series of colliders in the dynamic tree', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const dynamicTreeProcessor = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    dynamicTreeProcessor.track(compCollider);

    expect(dynamicTreeProcessor.getColliders().length).toBe(2);
    expect(dynamicTreeProcessor.getColliders()[0] instanceof ex.CompositeCollider).toBe(false);
    expect(dynamicTreeProcessor.getColliders()[1] instanceof ex.CompositeCollider).toBe(false);
  });

  it('removes all colliders in the dynamic tree', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);

    const dynamicTreeProcessor = new ex.DynamicTreeCollisionProcessor({
      ...getDefaultPhysicsConfig()
    });
    dynamicTreeProcessor.track(compCollider);

    expect(dynamicTreeProcessor.getColliders().length).toBe(2);

    dynamicTreeProcessor.untrack(compCollider);
    expect(dynamicTreeProcessor.getColliders().length).toBe(0);
  });

  it('flattens composite colliders inside composite colliders with adjusted offset', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);
    compCollider.offset = ex.vec(50, 100);
    expect(compCollider.getColliders()[0].offset).toBeVector(Vector.Zero);
    expect(compCollider.getColliders()[1].offset).toBeVector(Vector.Zero);

    const sut = new ex.CompositeCollider([]);

    sut.addCollider(compCollider);

    expect(sut.getColliders().length).toBe(2);
    expect(sut.getColliders()[0].offset).toBeVector(compCollider.offset);
    expect(sut.getColliders()[1].offset).toBeVector(compCollider.offset);
  });

  it('has the correct bounds when offset', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10, Vector.Half)]);
    expect(compCollider.bounds).toEqual(new ex.BoundingBox({ left: -100, right: 100, top: -50, bottom: 50 }));
    compCollider.offset = ex.vec(50, 100);
    expect(compCollider.bounds).toEqual(new ex.BoundingBox({ left: -50, right: 150, top: 50, bottom: 150 }));
  });
});
