import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '../../build/dist/excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';

describe('A game actor', () => {
  let actor: ex.Actor;

  let engine: ex.Engine;
  let scene: ex.Scene;
  const mock = new Mocks.Mocker();

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine({ width: 100, height: 100 });
    actor = new ex.Actor();
    actor.collisionType = ex.CollisionType.Active;
    scene = new ex.Scene(engine);
    engine.currentScene = scene;

    spyOn(scene, 'draw').and.callThrough();
    spyOn(scene, 'debugDraw').and.callThrough();

    spyOn(actor, 'draw');
    spyOn(actor, 'debugDraw');

    ex.Physics.useBoxPhysics();
    ex.Physics.acc.setTo(0, 0);
  });

  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('should be loaded', () => {
    expect(ex.Actor).toBeTruthy();
  });

  it('should have a position', () => {
    actor.pos.setTo(10, 10);

    expect(actor.pos.x).toBe(10);
    expect(actor.pos.y).toBe(10);
  });

  it('should have props set by constructor', () => {
    const actor = new ex.Actor({
      pos: new ex.Vector(2, 3),
      scene: scene,
      width: 100,
      height: 200,
      vel: new ex.Vector(30, 40),
      acc: new ex.Vector(50, 60),
      rotation: 2,
      rx: 0.1,
      z: 10,
      restitution: 2,
      color: ex.Color.Red,
      visible: false,
      collisionType: ex.CollisionType.Fixed
    });

    const actor2 = new ex.Actor({
      x: 4,
      y: 5
    });

    expect(actor.x).toBe(2);
    expect(actor.y).toBe(3);
    expect(actor.getWidth()).toBe(100);
    expect(actor.getHeight()).toBe(200);
    expect(actor.vel.x).toBe(30);
    expect(actor.vel.y).toBe(40);
    expect(actor.acc.x).toBe(50);
    expect(actor.acc.y).toBe(60);
    expect(actor.rotation).toBe(2);
    expect(actor.rx).toBe(0.1);
    expect(actor.z).toBe(10);
    expect(actor.color.toString()).toBe(ex.Color.Red.toString());
    expect(actor.visible).toBe(false);
    expect(actor.restitution).toBe(2);
    expect(actor.collisionType).toBe(ex.CollisionType.Fixed);
    expect(actor2.x).toBe(4);
    expect(actor2.y).toBe(5);
  });

  it('should have default properties set', () => {
    const actor = new ex.Actor();

    expect(actor.anchor).toEqual(ex.Actor.defaults.anchor);
  });

  it('should create actor with valid default options', () => {
    const actor = new ex.Actor();
    expect(actor.anchor.toString()).toEqual('(0.5, 0.5)');

    ex.Actor.defaults.anchor.setTo(0, 0);

    const actor2 = new ex.Actor();
    expect(actor2.anchor.toString()).toEqual('(0, 0)');

    // revert changes back
    ex.Actor.defaults.anchor.setTo(0.5, 0.5);
  });

  it('should have an old position after an update', () => {
    actor.pos.setTo(10, 10);
    actor.vel.setTo(10, 10);

    actor.update(engine, 1000);

    expect(actor.oldPos.x).toBe(10);
    expect(actor.oldPos.y).toBe(10);
    expect(actor.pos.x).toBe(20);
    expect(actor.pos.y).toBe(20);
  });

  it('actors should generate pair hashes in the correct order', () => {
    const actor = new ex.Actor();
    actor.id = 20;
    const actor2 = new ex.Actor();
    actor2.id = 40;

    const hash = ex.Pair.calculatePairHash(actor.body.collider, actor2.body.collider);
    const hash2 = ex.Pair.calculatePairHash(actor2.body.collider, actor.body.collider);
    expect(hash).toBe('#20+40');
    expect(hash2).toBe('#20+40');
  });

  it('can change positions when it has velocity', () => {
    expect(actor.pos.y).toBe(0);
    expect(actor.pos.x).toBe(0);

    actor.vel.y = 10;
    actor.vel.x = -10;
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);

    actor.update(engine, 1000);
    expect(actor.pos.x).toBe(-10);
    expect(actor.pos.y).toBe(10);

    actor.update(engine, 1000);
    expect(actor.pos.x).toBe(-20);
    expect(actor.pos.y).toBe(20);
  });

  it('should have an old velocity after an update', () => {
    actor.pos.setTo(0, 0);
    actor.vel.setTo(10, 10);
    actor.acc.setTo(10, 10);

    actor.update(engine, 1000);

    expect(actor.oldVel.x).toBe(10);
    expect(actor.oldVel.y).toBe(10);
    expect(actor.vel.x).toBe(20);
    expect(actor.vel.y).toBe(20);
  });

  it('can have its height and width scaled', () => {
    expect(actor.getWidth()).toBe(0);
    expect(actor.getHeight()).toBe(0);

    actor.setWidth(20);
    actor.setHeight(20);

    expect(actor.getWidth()).toBe(20);
    expect(actor.getHeight()).toBe(20);

    actor.scale.x = 2;
    actor.scale.y = 3;

    expect(actor.getWidth()).toBe(40);
    expect(actor.getHeight()).toBe(60);

    actor.scale.x = 0.5;
    actor.scale.y = 0.1;

    expect(actor.getWidth()).toBe(10);
    expect(actor.getHeight()).toBe(2);
  });

  it('can have its height and width scaled by parent', () => {
    actor.scale.setTo(2, 2);

    const child = new ex.Actor(0, 0, 50, 50);

    actor.add(child);

    expect(child.getWidth()).toBe(100);
    expect(child.getHeight()).toBe(100);

    actor.scale.setTo(0.5, 0.5);

    expect(child.getWidth()).toBe(25);
    expect(child.getHeight()).toBe(25);
  });

  it('can have a center point', () => {
    actor.setHeight(100);
    actor.setWidth(50);

    let center = actor.getCenter();
    expect(center.x).toBe(0);
    expect(center.y).toBe(0);

    actor.pos.x = 100;
    actor.pos.y = 100;

    center = actor.getCenter();
    expect(center.x).toBe(100);
    expect(center.y).toBe(100);

    // changing the anchor
    actor.anchor = new ex.Vector(0, 0);
    actor.pos.x = 0;
    actor.pos.y = 0;

    center = actor.getCenter();
    expect(center.x).toBe(25);
    expect(center.y).toBe(50);

    actor.pos.x = 100;
    actor.pos.y = 100;

    center = actor.getCenter();
    expect(center.x).toBe(125);
    expect(center.y).toBe(150);
  });

  it('has a left, right, top, and bottom', () => {
    actor.pos.x = 0;
    actor.pos.y = 0;
    actor.anchor = new ex.Vector(0.5, 0.5);
    actor.setWidth(100);
    actor.setHeight(100);

    expect(actor.getLeft()).toBe(-50);
    expect(actor.getRight()).toBe(50);
    expect(actor.getTop()).toBe(-50);
    expect(actor.getBottom()).toBe(50);
  });

  it('should have correct bounds when scaled', () => {
    actor.pos.x = 0;
    actor.pos.y = 0;
    actor.setWidth(100);
    actor.setHeight(100);
    actor.scale.setTo(2, 2);
    actor.anchor = new ex.Vector(0.5, 0.5);

    expect(actor.getLeft()).toBe(-100);
    expect(actor.getRight()).toBe(100);
    expect(actor.getTop()).toBe(-100);
    expect(actor.getBottom()).toBe(100);
  });

  it('should have correct bounds when parent is scaled', () => {
    actor.pos.x = 0;
    actor.pos.y = 0;
    actor.setWidth(100);
    actor.setHeight(100);
    actor.scale.setTo(2, 2);
    actor.anchor = new ex.Vector(0.5, 0.5);

    const child = new ex.Actor(0, 0, 50, 50);
    actor.add(child);

    expect(child.getLeft()).toBe(-50);
    expect(child.getRight()).toBe(50);
    expect(child.getTop()).toBe(-50);
    expect(child.getBottom()).toBe(50);
  });

  it('should have the correct bounds when scaled and rotated', () => {
    const actor = new ex.Actor(50, 50, 10, 10);
    // actor is now 20 high
    actor.scale.setTo(1, 2);
    // rotating the actor 90 degrees should make the actor 20 wide
    actor.rotation = Math.PI / 2;
    const bounds = actor.getBounds();
    expect(bounds.getWidth()).toBeCloseTo(20, 0.001);
    expect(bounds.getHeight()).toBeCloseTo(10, 0.001);

    expect(bounds.left).toBeCloseTo(40, 0.001);
    expect(bounds.right).toBeCloseTo(60, 0.001);
    expect(bounds.top).toBeCloseTo(45, 0.001);
    expect(bounds.bottom).toBeCloseTo(55, 0.001);
  });

  it('should have the correct relative bounds when scaled and rotated', () => {
    const actor = new ex.Actor(50, 50, 10, 10);
    // actor is now 20 high
    actor.scale.setTo(1, 2);
    // rotating the actor 90 degrees should make the actor 20 wide
    actor.rotation = Math.PI / 2;
    const bounds = actor.getRelativeBounds();
    expect(bounds.getWidth()).toBeCloseTo(20, 0.001);
    expect(bounds.getHeight()).toBeCloseTo(10, 0.001);

    expect(bounds.left).toBeCloseTo(-10, 0.001);
    expect(bounds.right).toBeCloseTo(10, 0.001);
    expect(bounds.top).toBeCloseTo(-5, 0.001);
    expect(bounds.bottom).toBeCloseTo(5, 0.001);
  });

  it('has a left, right, top, and bottom when the anchor is (0, 0)', () => {
    actor.pos.x = 100;
    actor.pos.y = 100;
    actor.anchor = new ex.Vector(0.0, 0.0);
    actor.setWidth(100);
    actor.setHeight(100);

    expect(actor.getLeft()).toBe(100);
    expect(actor.getRight()).toBe(200);
    expect(actor.getTop()).toBe(100);
    expect(actor.getBottom()).toBe(200);
  });

  it('should have the correct world geometry if rotated and scaled', () => {
    const actor = new ex.Actor({ pos: new ex.Vector(50, 50), width: 10, height: 10 });
    actor.scale.setTo(2, 2);
    actor.rotation = Math.PI / 2;

    const geom = actor.getGeometry();
    expect(geom.length).toBe(4);
    expect(geom[0].equals(new ex.Vector(40, 40))).toBe(true);
    expect(geom[1].equals(new ex.Vector(60, 40))).toBe(true);
    expect(geom[2].equals(new ex.Vector(60, 60))).toBe(true);
    expect(geom[3].equals(new ex.Vector(40, 60))).toBe(true);
  });

  it('should have the correct relative geometry if rotated and scaled', () => {
    const actor = new ex.Actor({ pos: new ex.Vector(50, 50), width: 10, height: 10 });
    actor.scale.setTo(2, 2);
    actor.rotation = Math.PI / 2;

    const geom = actor.getRelativeGeometry();
    expect(geom.length).toBe(4);
    expect(geom[0].equals(new ex.Vector(-10, -10))).toBe(true);
    expect(geom[1].equals(new ex.Vector(10, -10))).toBe(true);
    expect(geom[2].equals(new ex.Vector(10, 10))).toBe(true);
    expect(geom[3].equals(new ex.Vector(-10, 10))).toBe(true);
  });

  it('can contain points', () => {
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);
    actor.setWidth(20);
    actor.setHeight(20);

    expect(actor.anchor.x).toBe(0.5);
    expect(actor.anchor.y).toBe(0.5);

    actor.anchor = new ex.Vector(0, 0);

    expect(actor.contains(10, 10)).toBe(true);

    expect(actor.contains(21, 20)).toBe(false);
    expect(actor.contains(20, 21)).toBe(false);

    expect(actor.contains(0, -1)).toBe(false);
    expect(actor.contains(-1, 0)).toBe(false);
  });

  it('can collide with other actors', () => {
    const actor = new ex.Actor(0, 0, 10, 10);
    const other = new ex.Actor(10, 10, 10, 10);

    // Actors are adjacent and not overlapping should not collide
    expect(actor.bounds.intersectWithSide(other.bounds)).toBe(ex.Side.None);
    expect(other.bounds.intersectWithSide(actor.bounds)).toBe(ex.Side.None);

    // move other actor into collision range from the right side
    other.pos.x = 9;
    other.pos.y = 0;
    expect(actor.bounds.intersectWithSide(other.bounds)).toBe(ex.Side.Right);
    expect(other.bounds.intersectWithSide(actor.bounds)).toBe(ex.Side.Left);

    // move other actor into collision range from the left side
    other.pos.x = -9;
    other.pos.y = 0;
    expect(actor.bounds.intersectWithSide(other.bounds)).toBe(ex.Side.Left);
    expect(other.bounds.intersectWithSide(actor.bounds)).toBe(ex.Side.Right);

    // move other actor into collision range from the top
    other.pos.x = 0;
    other.pos.y = -9;
    expect(actor.bounds.intersectWithSide(other.bounds)).toBe(ex.Side.Top);
    expect(other.bounds.intersectWithSide(actor.bounds)).toBe(ex.Side.Bottom);

    // move other actor into collision range from the bottom
    other.pos.x = 0;
    other.pos.y = 9;
    expect(actor.bounds.intersectWithSide(other.bounds)).toBe(ex.Side.Bottom);
    expect(other.bounds.intersectWithSide(actor.bounds)).toBe(ex.Side.Top);
  });

  it('participates with another in a collision', () => {
    const actor = new ex.Actor(0, 0, 10, 10);
    actor.collisionType = ex.CollisionType.Active;
    const other = new ex.Actor(8, 0, 10, 10);
    other.collisionType = ex.CollisionType.Active;
    let actorCalled = 'false';
    let otherCalled = 'false';

    actor.on('precollision', function() {
      actorCalled = 'actor';
    });

    other.on('precollision', function() {
      otherCalled = 'other';
    });

    scene.add(actor);
    scene.add(other);
    scene.update(engine, 20);
    scene.update(engine, 20);

    expect(actorCalled).toBe('actor');
    expect(otherCalled).toBe('other');
  });

  it('is rotated along with its parent', () => {
    const rotation = ex.Util.toRadians(90);

    actor.pos.setTo(10, 10);
    actor.rotation = rotation;

    const child = new ex.Actor(10, 0, 10, 10); // (20, 10)

    actor.add(child);
    actor.update(engine, 100);

    expect(child.getWorldPos().x).toBeCloseTo(10, 0.001);
    expect(child.getWorldPos().y).toBeCloseTo(20, 0.001);
  });

  it('is rotated along with its grandparent', () => {
    const rotation = ex.Util.toRadians(90);

    actor.pos.setTo(10, 10);
    actor.rotation = rotation;

    const child = new ex.Actor(10, 0, 10, 10); // (20, 10)
    const grandchild = new ex.Actor(10, 0, 10, 10); // (30, 10)

    actor.add(child);
    child.add(grandchild);
    actor.update(engine, 100);

    expect(grandchild.getWorldRotation()).toBe(rotation);
    expect(grandchild.getWorldPos().x).toBeCloseTo(10, 0.001);
    expect(grandchild.getWorldPos().y).toBeCloseTo(30, 0.001);
  });

  it('is scaled along with its parent', () => {
    actor.anchor.setTo(0, 0);
    actor.pos.setTo(10, 10);
    actor.scale.setTo(2, 2);

    const child = new ex.Actor(10, 10, 10, 10);

    actor.add(child);
    actor.update(engine, 100);

    expect(child.getWorldPos().x).toBe(30);
    expect(child.getWorldPos().y).toBe(30);
  });

  it('is scaled along with its grandparent', () => {
    actor.anchor.setTo(0, 0);
    actor.pos.setTo(10, 10);
    actor.scale.setTo(2, 2);

    const child = new ex.Actor(10, 10, 10, 10);
    const grandchild = new ex.Actor(10, 10, 10, 10);

    actor.add(child);
    child.add(grandchild);
    actor.update(engine, 100);

    // Logic:
    // p = (10, 10)
    // c = (10 * 2 + 10, 10 * 2 + 10) = (30, 30)
    // gc = (10 * 2 + 30, 10 * 2 + 30) = (50, 50)
    expect(grandchild.getWorldPos().x).toBe(50);
    expect(grandchild.getWorldPos().y).toBe(50);
  });

  it('is rotated and scaled along with its parent', () => {
    const rotation = ex.Util.toRadians(90);

    actor.pos.setTo(10, 10);
    actor.scale.setTo(2, 2);
    actor.rotation = rotation;

    const child = new ex.Actor(10, 0, 10, 10); // (30, 10)

    actor.add(child);
    actor.update(engine, 100);

    expect(child.getWorldPos().x).toBeCloseTo(10, 0.001);
    expect(child.getWorldPos().y).toBeCloseTo(30, 0.001);
  });

  it('is rotated and scaled along with its grandparent', () => {
    const rotation = ex.Util.toRadians(90);

    actor.pos.setTo(10, 10);
    actor.scale.setTo(2, 2);
    actor.rotation = rotation;

    const child = new ex.Actor(10, 0, 10, 10); // (30, 10)
    const grandchild = new ex.Actor(10, 0, 10, 10); // (50, 10)

    actor.add(child);
    child.add(grandchild);
    actor.update(engine, 100);

    expect(grandchild.getWorldPos().x).toBeCloseTo(10, 0.001);
    expect(grandchild.getWorldPos().y).toBeCloseTo(50, 0.001);
  });

  it('can find its global coordinates if it has a parent', () => {
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);

    const childActor = new ex.Actor(50, 50);
    expect(childActor.pos.x).toBe(50);
    expect(childActor.pos.y).toBe(50);

    actor.add(childActor);

    actor.actions.moveBy(10, 15, 1000);
    actor.update(engine, 1000);

    expect(childActor.getWorldPos().x).toBe(60);
    expect(childActor.getWorldPos().y).toBe(65);
  });

  it('can find its global coordinates if it has multiple parents', () => {
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);

    const childActor = new ex.Actor(50, 50);
    const grandChildActor = new ex.Actor(10, 10);

    actor.add(childActor);
    childActor.add(grandChildActor);

    actor.actions.moveBy(10, 15, 1000);
    actor.update(engine, 1000);

    expect(grandChildActor.getWorldPos().x).toBe(70);
    expect(grandChildActor.getWorldPos().y).toBe(75);
  });

  it('can find its global coordinates if it doesnt have a parent', () => {
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);

    actor.actions.moveBy(10, 15, 1000);
    actor.update(engine, 1000);

    expect(actor.getWorldPos().x).toBe(10);
    expect(actor.getWorldPos().y).toBe(15);
  });

  it('can be removed from the scene', () => {
    scene.add(actor);
    expect(scene.actors.length).toBe(1);
    actor.kill();
    scene.update(engine, 100);
    expect(scene.actors.length).toBe(0);
  });

  it('once killed is not drawn', () => {
    scene.add(actor);
    actor.kill();
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);
    expect(actor.draw).not.toHaveBeenCalled();
  });

  it('does not incure pointer overhead until an event is registered', () => {
    expect(actor.enableCapturePointer).toBeFalsy();
    expect(actor.capturePointer.captureMoveEvents).toBeFalsy();
    actor.on('pointerdown', () => {
      /*do nothing*/
    });
    expect(actor.capturePointer.captureMoveEvents).toBeFalsy();
    expect(actor.enableCapturePointer).toBeTruthy();
    actor.on('pointermove', () => {
      /*do nothing*/
    });
    expect(actor.capturePointer.captureMoveEvents).toBeTruthy();
    expect(actor.enableCapturePointer).toBeTruthy();
  });

  it('changes opacity on color', () => {
    actor.color = ex.Color.Black.clone();
    expect(actor.color.a).toBe(1);
    expect(actor.color.r).toBe(0);
    expect(actor.color.g).toBe(0);
    expect(actor.color.b).toBe(0);

    expect(actor.opacity).toBe(1.0);
    actor.opacity = 0.5;

    actor.update(engine, 100);
    expect(actor.color.a).toBe(0.5);
    expect(actor.color.r).toBe(0);
    expect(actor.color.g).toBe(0);
    expect(actor.color.b).toBe(0);
  });

  it('can detect containment off of child actors', () => {
    const parent = new ex.Actor(600, 100, 100, 100);
    const child = new ex.Actor(0, 0, 100, 100);
    const child2 = new ex.Actor(-600, -100, 100, 100);

    parent.add(child);
    child.add(child2);

    // check reality
    expect(parent.contains(550, 50)).toBeTruthy();
    expect(parent.contains(650, 150)).toBeTruthy();

    // in world coordinates this should be false
    expect(child.contains(50, 50)).toBeFalsy();

    // in world coordinates this should be true
    expect(child.contains(550, 50)).toBeTruthy();
    expect(child.contains(650, 150)).toBeTruthy();

    // second order child shifted to the origin
    expect(child2.contains(-50, -50)).toBeTruthy();
    expect(child2.contains(50, 50)).toBeTruthy();
  });

  it('can recursively check containment', () => {
    const parent = new ex.Actor(0, 0, 100, 100);
    const child = new ex.Actor(100, 100, 100, 100);
    const child2 = new ex.Actor(100, 100, 100, 100);
    parent.add(child);

    expect(parent.contains(150, 150)).toBeFalsy();
    expect(child.contains(150, 150)).toBeTruthy();
    expect(parent.contains(150, 150, true)).toBeTruthy();
    expect(parent.contains(200, 200, true)).toBeFalsy();

    child.add(child2);
    expect(parent.contains(250, 250, true)).toBeTruthy();
  });

  it('with an active collision type can be placed on a fixed type', () => {
    ex.Physics.useBoxPhysics();
    const scene = new ex.Scene(engine);

    const active = new ex.Actor(0, -50, 100, 100);
    active.collisionType = ex.CollisionType.Active;
    active.vel.y = 10;
    active.acc.y = 1000;

    const fixed = new ex.Actor(-100, 50, 1000, 100);
    fixed.collisionType = ex.CollisionType.Fixed;

    scene.add(active);
    scene.add(fixed);

    expect(active.pos.x).toBe(0);
    expect(active.pos.y).toBe(-50);

    expect(fixed.pos.x).toBe(-100);
    expect(fixed.pos.y).toBe(50);

    // update many times for safety
    for (let i = 0; i < 40; i++) {
      scene.update(engine, 100);
    }

    expect(active.pos.x).toBeCloseTo(0, 0.0001);
    expect(active.pos.y).toBeCloseTo(-50, 0.0001);

    expect(fixed.pos.x).toBe(-100);
    expect(fixed.pos.y).toBe(50);
  });

  it('with an active collision type can jump on a fixed type', () => {
    const scene = new ex.Scene(engine);
    const active = new ex.Actor(0, -50, 100, 100);
    active.collisionType = ex.CollisionType.Active;
    active.vel.y = -100;
    ex.Physics.acc.setTo(0, 0);

    const fixed = new ex.Actor(-100, 50, 1000, 100);
    fixed.collisionType = ex.CollisionType.Fixed;

    scene.add(active);
    scene.add(fixed);

    expect(active.pos.x).toBe(0);
    expect(active.pos.y).toBe(-50);

    expect(fixed.pos.x).toBe(-100);
    expect(fixed.pos.y).toBe(50);

    const iterations = 1;
    // update many times for safety
    for (let i = 0; i < iterations; i++) {
      scene.update(engine, 1000);
    }

    expect(ex.Physics.acc.y).toBe(0);
    expect(active.pos.x).toBeCloseTo(0, 0.0001);
    expect(active.pos.y).toBeCloseTo(-100 * iterations + -50 /* original y is -50 */, 0.0001);

    expect(fixed.pos.x).toBe(-100);
    expect(fixed.pos.y).toBe(50);
  });

  it('updates child actors', () => {
    const parentActor = new ex.Actor();
    const childActor = new ex.Actor();
    scene.add(parentActor);
    parentActor.add(childActor);

    spyOn(childActor, 'update');

    scene.update(engine, 100);

    expect(childActor.update).toHaveBeenCalled();
  });

  it('draws visible child actors', () => {
    const parentActor = new ex.Actor();
    const childActor = new ex.Actor();
    scene.add(parentActor);
    parentActor.add(childActor);

    spyOn(childActor, 'draw');

    childActor.visible = true;
    scene.draw(engine.ctx, 100);
    expect(childActor.draw).toHaveBeenCalled();
  });

  it('does not draw invisible child actors', () => {
    const parentActor = new ex.Actor();
    const childActor = new ex.Actor();
    scene.add(parentActor);
    parentActor.add(childActor);

    spyOn(childActor, 'draw');

    childActor.visible = false;
    scene.draw(engine.ctx, 100);
    expect(childActor.draw).not.toHaveBeenCalled();
  });

  it('fires a killed event when killed', () => {
    const actor = new ex.Actor();
    scene.add(actor);
    let killed = false;
    actor.on('kill', (evt: ex.KillEvent) => {
      killed = true;
    });
    actor.kill();

    expect(killed).toBe(true);
  });

  it('is no longer killed when re-added to the game', () => {
    const actor = new ex.Actor();
    scene.add(actor);
    expect(actor.isKilled()).toBeFalsy();
    actor.kill();
    scene.update(engine, 100);
    expect(actor.isKilled()).toBeTruthy();
    scene.add(actor);
    expect(actor.isKilled()).toBeFalsy();
  });

  it('fires intialize event when before the first update', (done) => {
    const actor = new ex.Actor();
    actor.on('initialize', () => {
      expect(true).toBe(true);
      done();
    });

    scene.add(actor);
    scene.update(engine, 100);
    scene.update(engine, 100);
  });

  it('fires preupdate event before update then postupdate', (done) => {
    const actor = new ex.Actor();
    let preupdateFired = false;

    actor.on('preupdate', () => {
      preupdateFired = true;
    });
    actor.on('postupdate', () => {
      expect(preupdateFired).toBe(true);
      done();
    });

    scene.add(actor);
    scene.update(engine, 100);
  });

  it('can only be initialized once', () => {
    const actor = new ex.Actor();
    let initializeCount = 0;

    actor.on('initialize', () => {
      initializeCount++;
    });
    actor._initialize(engine);
    actor._initialize(engine);
    actor._initialize(engine);

    expect(initializeCount).toBe(1, 'Actors can only be initialized once');
  });

  it('can initialize child actors', () => {
    const actor = new ex.Actor();
    const child = new ex.Actor();
    const grandchild = new ex.Actor();
    let initializeCount = 0;
    actor.add(child);
    child.add(grandchild);
    actor.on('initialize', () => {
      initializeCount++;
    });
    child.on('initialize', () => {
      initializeCount++;
    });
    grandchild.on('initialize', () => {
      initializeCount++;
    });

    actor._initialize(engine);
    actor._initialize(engine);

    expect(initializeCount).toBe(3, 'All child actors should be initialized');
  });

  it('fires predraw event before draw then postdraw', (done) => {
    const actor = new ex.Actor({
      pos: new ex.Vector(50, 50),
      width: 10,
      height: 10
    });
    let predrawedFired = false;

    actor.on('predraw', () => {
      predrawedFired = true;
    });
    actor.on('postdraw', () => {
      expect(predrawedFired).toBe(true);
      done();
    });

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);
  });

  it('should opt into pointer capture when pointerdown', () => {
    const actor = new ex.Actor(0, 0, 100, 100);

    expect(actor.enableCapturePointer).toBe(false, 'Actors start without pointer capture enabled');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not start with capturing move events');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not start with capturing drag events');

    actor.on('pointerdown', () => {
      /* doesn't matter; */
    });

    expect(actor.enableCapturePointer).toBe(true, 'Actors should have pointer capture enabled after pointerdown');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not capture move events after pointerdown');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not capture drag events after pointerdown');
  });

  it('should opt into pointer capture when pointerup', () => {
    const actor = new ex.Actor(0, 0, 100, 100);

    expect(actor.enableCapturePointer).toBe(false, 'Actors start without pointer capture enabled');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not start with capturing move events');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not start with capturing drag events');

    actor.on('pointerup', () => {
      /* doesn't matter; */
    });

    expect(actor.enableCapturePointer).toBe(true, 'Actors should have pointer capture enabled after pointerup');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not capture move events after pointerdown');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not capture drag events after pointerdown');
  });

  it('should opt into pointer capture when pointermove', () => {
    const actor = new ex.Actor(0, 0, 100, 100);

    expect(actor.enableCapturePointer).toBe(false, 'Actors start without pointer capture enabled');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not start with capturing move events');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not start with capturing drag events');

    actor.on('pointermove', () => {
      /* doesn't matter; */
    });

    expect(actor.enableCapturePointer).toBe(true, 'Actors should have pointer capture enabled after pointermove');
    expect(actor.capturePointer.captureMoveEvents).toBe(true, 'Actor should capture move events after pointermove');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not capture drag events after pointermove');
  });

  it('should opt into pointer capture when pointerenter', () => {
    const actor = new ex.Actor(0, 0, 100, 100);

    expect(actor.enableCapturePointer).toBe(false, 'Actors start without pointer capture enabled');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not start with capturing move events');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not start with capturing drag events');

    actor.on('pointerenter', () => {
      /* doesn't matter; */
    });

    expect(actor.enableCapturePointer).toBe(true, 'Actors should have pointer capture enabled after pointerenter');
    expect(actor.capturePointer.captureMoveEvents).toBe(true, 'Actor should capture move events after pointerenter');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not capture drag events after pointerenter');
  });

  it('should opt into pointer capture when pointerleave', () => {
    const actor = new ex.Actor(0, 0, 100, 100);

    expect(actor.enableCapturePointer).toBe(false, 'Actors start without pointer capture enabled');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not start with capturing move events');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not start with capturing drag events');

    actor.on('pointerleave', () => {
      /* doesn't matter; */
    });

    expect(actor.enableCapturePointer).toBe(true, 'Actors should have pointer capture enabled after pointerleave');
    expect(actor.capturePointer.captureMoveEvents).toBe(true, 'Actor should capture move events after pointerleave');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not capture drag events after pointerleave');
  });

  it('should opt into pointer capture when pointerdragstart', () => {
    const actor = new ex.Actor(0, 0, 100, 100);

    expect(actor.enableCapturePointer).toBe(false, 'Actors start without pointer capture enabled');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not start with capturing move events');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not start with capturing drag events');

    actor.on('pointerdragstart', () => {
      /* doesn't matter; */
    });

    expect(actor.enableCapturePointer).toBe(true, 'Actors should have pointer capture enabled after pointerdragstart');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should capture move events after pointerdragstart');
    expect(actor.capturePointer.captureDragEvents).toBe(true, 'Actors should capture drag events after pointerdragstart');
  });

  it('should opt into pointer capture when pointerdragend', () => {
    const actor = new ex.Actor(0, 0, 100, 100);

    expect(actor.enableCapturePointer).toBe(false, 'Actors start without pointer capture enabled');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not start with capturing move events');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not start with capturing drag events');

    actor.on('pointerdragend', () => {
      /* doesn't matter; */
    });

    expect(actor.enableCapturePointer).toBe(true, 'Actors should have pointer capture enabled after pointerdragend');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should capture move events after pointerdragend');
    expect(actor.capturePointer.captureDragEvents).toBe(true, 'Actors should capture drag events after pointerdragend');
  });

  it('should opt into pointer capture when pointerdragmove', () => {
    const actor = new ex.Actor(0, 0, 100, 100);

    expect(actor.enableCapturePointer).toBe(false, 'Actors start without pointer capture enabled');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not start with capturing move events');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not start with capturing drag events');

    actor.on('pointerdragmove', () => {
      /* doesn't matter; */
    });

    expect(actor.enableCapturePointer).toBe(true, 'Actors should have pointer capture enabled after pointerdragmove');
    expect(actor.capturePointer.captureMoveEvents).toBe(true, 'Actors should capture move events after pointerdragmove');
    expect(actor.capturePointer.captureDragEvents).toBe(true, 'Actors should capture drag events after pointerdragmove');
  });

  it('should opt into pointer capture when pointerdragenter', () => {
    const actor = new ex.Actor(0, 0, 100, 100);

    expect(actor.enableCapturePointer).toBe(false, 'Actors start without pointer capture enabled');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not start with capturing move events');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not start with capturing drag events');

    actor.on('pointerdragenter', () => {
      /* doesn't matter; */
    });

    expect(actor.enableCapturePointer).toBe(true, 'Actors should have pointer capture enabled after pointerdragenter');
    expect(actor.capturePointer.captureMoveEvents).toBe(true, 'Actors should capture move events after pointerdragenter');
    expect(actor.capturePointer.captureDragEvents).toBe(true, 'Actors should capture drag events after pointerdragenter');
  });

  it('should opt into pointer capture when pointerdragleave', () => {
    const actor = new ex.Actor(0, 0, 100, 100);

    expect(actor.enableCapturePointer).toBe(false, 'Actors start without pointer capture enabled');
    expect(actor.capturePointer.captureMoveEvents).toBe(false, 'Actors should not start with capturing move events');
    expect(actor.capturePointer.captureDragEvents).toBe(false, 'Actors should not start with capturing drag events');

    actor.on('pointerdragleave', () => {
      /* doesn't matter; */
    });

    expect(actor.enableCapturePointer).toBe(true, 'Actors should have pointer capture enabled after pointerdragleave');
    expect(actor.capturePointer.captureMoveEvents).toBe(true, 'Actors should capture move events after pointerdragleave');
    expect(actor.capturePointer.captureDragEvents).toBe(true, 'Actors should capture drag events after pointerdragleave');
  });

  describe('should detect assigned events and', () => {
    it('should capture pointer move event', () => {
      const actor = new ex.Actor(0, 0, 20, 20);
      const callables = {
        move: (pe: any) => {
          /* doesn't matter; */
        }
      };
      const moveSpy = spyOn(callables, 'move').and.callThrough();

      actor.on('pointermove', callables.move);
      scene.add(actor);

      const pointerEvent: any = mock.pointerEvent('move');
      pointerEvent._path = [actor];
      (<any>engine.input.pointers)._pointerMove.push(pointerEvent);

      scene.update(engine, 100);

      expect(moveSpy).toHaveBeenCalledTimes(1);
      expect(pointerEvent.pointer.lastWorldPos.x).toEqual(0, 'pointer event should contain correct world position x');
      expect(pointerEvent.pointer.lastWorldPos.y).toEqual(0, 'pointer event should contain correct world position y');
    });

    it('should capture pointer enter event', () => {
      const actor = new ex.Actor(0, 0, 20, 20);
      const callables = {
        enter: (pe: any) => {
          /* doesn't matter */
        }
      };
      const enterSpy = spyOn(callables, 'enter').and.callThrough();

      actor.on('pointerenter', callables.enter);
      scene.add(actor);

      const pointerEvent: any = mock.pointerEvent('move');
      pointerEvent._path = [actor];
      pointerEvent.pointer.lastWorldPos = new ex.Vector(0, 0);
      (<any>engine.input.pointers)._pointerMove.push(pointerEvent);

      scene.update(engine, 100);

      expect(enterSpy).toHaveBeenCalledTimes(1);
      expect(pointerEvent.pointer.lastWorldPos.x).toEqual(0, 'pointer event should contain correct world position x');
      expect(pointerEvent.pointer.lastWorldPos.y).toEqual(0, 'pointer event should contain correct world position y');
    });

    it('should capture pointer leave event', () => {
      const actor = new ex.Actor(0, 0, 20, 20);
      const callables = {
        leave: (pe: any) => {
          /* doesn't matter */
        }
      };
      const leaveSpy = spyOn(callables, 'leave').and.callThrough();

      actor.on('pointerleave', callables.leave);
      scene.add(actor);

      const pointerEvent: any = mock.pointerEvent('move');
      pointerEvent._path = [];
      pointerEvent.pointer.lastWorldPos = new ex.Vector(30, 30);
      pointerEvent.pointer.addActorUnderPointer(actor);
      (<any>engine.input.pointers)._pointerMove.push(pointerEvent);

      scene.update(engine, 100);

      expect(leaveSpy).toHaveBeenCalledTimes(1);
      expect(pointerEvent.pointer.lastWorldPos.x).toEqual(30, 'pointer event should contain correct world position x');
      expect(pointerEvent.pointer.lastWorldPos.y).toEqual(30, 'pointer event should contain correct world position y');
    });

    it('should capture pointer drag start event', () => {
      const actor = new ex.Actor(0, 0, 20, 20);
      const callables = {
        dragStart: (pe: any) => {
          /* doesn't matter */
        }
      };
      const dragStartSpy = spyOn(callables, 'dragStart').and.callThrough();

      actor.on('pointerdragstart', callables.dragStart);
      scene.add(actor);

      const pointerEvent: any = mock.pointerEvent('down');
      pointerEvent._path = [actor];
      pointerEvent.pointer.lastWorldPos = new ex.Vector(0, 0);
      spyOnProperty(pointerEvent.pointer, 'isDragStart', 'get').and.returnValue(true);

      (<any>engine.input.pointers)._pointerDown.push(pointerEvent);

      scene.update(engine, 100);

      expect(dragStartSpy).toHaveBeenCalledTimes(1);
      expect(pointerEvent.pointer.lastWorldPos.x).toEqual(0, 'pointer event should contain correct world position x');
      expect(pointerEvent.pointer.lastWorldPos.y).toEqual(0, 'pointer event should contain correct world position y');
    });

    it('should capture pointer drag end event', () => {
      const actor = new ex.Actor(0, 0, 20, 20);
      const callables = {
        dragEnd: (pe: any) => {
          /* doesn't matter */
        }
      };
      const dragEndSpy = spyOn(callables, 'dragEnd').and.callThrough();

      actor.on('pointerdragend', callables.dragEnd);
      scene.add(actor);

      const pointerEvent: any = mock.pointerEvent('up');
      pointerEvent._path = [actor];
      pointerEvent.pointer.lastWorldPos = new ex.Vector(0, 0);
      pointerEvent.pointer.addActorUnderPointer(actor);
      spyOnProperty(pointerEvent.pointer, 'isDragEnd', 'get').and.returnValue(true);
      (<any>engine.input.pointers)._pointerUp.push(pointerEvent);

      scene.update(engine, 100);

      expect(dragEndSpy).toHaveBeenCalledTimes(1);
      expect(pointerEvent.pointer.lastWorldPos.x).toEqual(0, 'pointer event should contain correct world position x');
      expect(pointerEvent.pointer.lastWorldPos.y).toEqual(0, 'pointer event should contain correct world position y');
    });

    it('should capture pointer drag move event', () => {
      const actor = new ex.Actor(0, 0, 20, 20);
      const callables = {
        dragMove: (pe: any) => {
          /* doesn't matter */
        }
      };
      const dragMoveSpy = spyOn(callables, 'dragMove').and.callThrough();

      actor.on('pointerdragmove', callables.dragMove);
      scene.add(actor);

      const pointerEvent: any = mock.pointerEvent('move');
      pointerEvent._path = [actor];
      pointerEvent.pointer.lastWorldPos = new ex.Vector(0, 0);
      pointerEvent.pointer.addActorUnderPointer(actor);
      spyOnProperty(pointerEvent.pointer, 'isDragging', 'get').and.returnValue(true);
      (<any>engine.input.pointers)._pointerMove.push(pointerEvent);

      scene.update(engine, 100);

      expect(dragMoveSpy).toHaveBeenCalledTimes(1);
      expect(pointerEvent.pointer.lastWorldPos.x).toEqual(0, 'pointer event should contain correct world position x');
      expect(pointerEvent.pointer.lastWorldPos.y).toEqual(0, 'pointer event should contain correct world position y');
    });

    it('should capture pointer drag enter event', () => {
      const actor = new ex.Actor(0, 0, 20, 20);
      const callables = {
        dragEnter: (pe: any) => {
          /* doesn't matter */
        }
      };
      const dragEnterSpy = spyOn(callables, 'dragEnter').and.callThrough();

      actor.on('pointerdragenter', callables.dragEnter);
      scene.add(actor);

      const pointerEvent: any = mock.pointerEvent('move');
      pointerEvent._path = [actor];
      pointerEvent.pointer.lastWorldPos = new ex.Vector(0, 0);
      spyOnProperty(pointerEvent.pointer, 'isDragging', 'get').and.returnValue(true);
      (<any>engine.input.pointers)._pointerMove.push(pointerEvent);

      scene.update(engine, 100);

      expect(dragEnterSpy).toHaveBeenCalledTimes(1);
      expect(pointerEvent.pointer.lastWorldPos.x).toEqual(0, 'pointer event should contain correct world position x');
      expect(pointerEvent.pointer.lastWorldPos.y).toEqual(0, 'pointer event should contain correct world position y');
    });

    it('should capture pointer drag leave event', () => {
      const actor = new ex.Actor(0, 0, 20, 20);
      const callables = {
        dragLeave: (pe: any) => {
          /* doesn't matter */
        }
      };
      const dragLeaveSpy = spyOn(callables, 'dragLeave').and.callThrough();

      actor.on('pointerdragleave', callables.dragLeave);
      scene.add(actor);

      const pointerEvent: any = mock.pointerEvent('move');
      pointerEvent._path = [];
      pointerEvent.pointer.lastWorldPos = new ex.Vector(30, 30);
      pointerEvent.pointer.addActorUnderPointer(actor);
      spyOnProperty(pointerEvent.pointer, 'isDragging', 'get').and.returnValue(true);
      (<any>engine.input.pointers)._pointerMove.push(pointerEvent);

      scene.update(engine, 100);

      expect(dragLeaveSpy).toHaveBeenCalledTimes(1);
      expect(pointerEvent.pointer.lastWorldPos.x).toEqual(30, 'pointer event should contain correct world position x');
      expect(pointerEvent.pointer.lastWorldPos.y).toEqual(30, 'pointer event should contain correct world position y');
    });

    it('can prevent pointer events from bubbling', () => {
      const actor = new ex.Actor(0, 0, 100, 100);
      const child = new ex.Actor(0, 0, 100, 100);
      const callables = {
        pointerDown: (pe: any) => {
          /* doesn't matter */
        }
      };
      const bubblingSpy = spyOn(callables, 'pointerDown').and.callThrough();

      actor.on('pointerdown', callables.pointerDown);
      child.on('pointerdown', callables.pointerDown);
      scene.add(actor);

      const pointerEvent: any = mock.pointerEvent('down');
      pointerEvent.bubbles = false;
      pointerEvent._path = [actor, child];
      pointerEvent.pointer.lastWorldPos = new ex.Vector(0, 0);
      (<any>engine.input.pointers)._pointerDown.push(pointerEvent);

      scene.update(engine, 100);

      expect(bubblingSpy).toHaveBeenCalledTimes(1);
      expect(pointerEvent.pointer.lastWorldPos.x).toEqual(0, 'pointer event should contain correct world position x');
      expect(pointerEvent.pointer.lastWorldPos.y).toEqual(0, 'pointer event should contain correct world position y');
    });

    it('only has pointer events happen once per frame', () => {
      const actor = new ex.Actor(0, 0, 100, 100);
      const propSpy = spyOn(engine.input.pointers, 'propagate').and.callThrough();
      let numPointerUps = 0;

      const pointerEvent: any = mock.pointerEvent('up');
      pointerEvent._path = [actor];
      pointerEvent.pointer.lastWorldPos = new ex.Vector(0, 0);
      (<any>engine.input.pointers)._pointerUp.push(pointerEvent);

      actor.on('pointerup', () => {
        numPointerUps++;
      });

      scene.add(actor);
      scene.update(engine, 100);

      expect(numPointerUps).toBe(1, 'Pointer up should be triggered once');
      expect(propSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should not corrupt shared sprite ctxs', (done) => {
    engine = TestUtils.engine({
      width: 62,
      height: 64,
      suppressHiDPIScaling: true
    });

    const texture = new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const actor = new ex.Actor({
        x: engine.halfCanvasWidth,
        y: engine.halfCanvasHeight,
        width: 10,
        height: 10,
        rotation: Math.PI / 4
      });

      engine.add(actor);
      const s = texture.asSprite();
      s.scale.setTo(1, 1);
      actor.addDrawing(s);

      const a1 = new ex.Actor({ scale: new ex.Vector(3, 3) });
      a1.scale.setTo(3, 3);
      a1.addDrawing(texture);

      const a2 = new ex.Actor({ scale: new ex.Vector(3, 3) });
      a1.scale.setTo(3, 3);
      a2.addDrawing(texture);

      a1.draw(engine.ctx, 100);
      a2.draw(engine.ctx, 100);
      actor.draw(engine.ctx, 100);
      engine.ctx.fillRect(0, 0, 200, 200);

      a1.draw(engine.ctx, 100);
      a2.draw(engine.ctx, 100);
      actor.draw(engine.ctx, 100);
      engine.ctx.fillRect(0, 0, 200, 200);

      a1.draw(engine.ctx, 100);
      a2.draw(engine.ctx, 100);

      engine.ctx.clearRect(0, 0, 200, 200);
      actor.draw(engine.ctx, 100);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/iconrotate.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image, 0.995);
        done();
      });
    });
  });

  it('when killed should not be killed again by the scene removing it', () => {
    spyOn(actor, 'kill').and.callThrough();

    scene.add(actor);
    actor.kill();

    expect(actor.kill).toHaveBeenCalledTimes(1);
  });

  it('when killed should be removed from the scene', () => {
    spyOn(scene, 'remove').and.callThrough();

    scene.add(actor);
    actor.kill();

    expect(scene.remove).toHaveBeenCalledWith(actor);
  });

  it('can be offscreen', () => {
    const actor = new ex.Actor({
      x: 0,
      y: 0,
      width: 10,
      height: 10
    });

    scene.add(actor);
    scene.update(engine, 100);

    expect(actor.isOffScreen).toBe(false, 'Actor should be onscreen');

    actor.x = 106;
    scene.update(engine, 100);

    expect(actor.isOffScreen).toBe(true, 'Actor should be offscreen');
  });

  describe('lifecycle overrides', () => {
    let actor: ex.Actor = null;

    beforeEach(() => {
      actor = new ex.Actor({
        pos: new ex.Vector(10, 10),
        width: 200,
        height: 200
      });
    });

    it('can have onInitialize overriden safely', () => {
      let initCalled = false;
      actor.on('initialize', () => {
        initCalled = true;
      });
      actor.onInitialize = (engine) => {
        expect(engine).not.toBe(null);
      };

      spyOn(actor, 'onInitialize').and.callThrough();
      spyOn(actor, '_initialize').and.callThrough();

      actor.update(engine, 100);
      actor.update(engine, 100);
      expect(actor._initialize).toHaveBeenCalledTimes(2);
      expect(actor.onInitialize).toHaveBeenCalledTimes(1);
      expect(initCalled).toBe(true);
      expect(actor.isInitialized).toBe(true);
    });

    it('can have onPostUpdate overriden safely', () => {
      actor.onPostUpdate = (engine, delta) => {
        expect(engine).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(actor, 'onPostUpdate').and.callThrough();
      spyOn(actor, '_postupdate').and.callThrough();

      actor.update(engine, 100);
      actor.update(engine, 100);
      expect(actor._postupdate).toHaveBeenCalledTimes(2);
      expect(actor.onPostUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreUpdate overriden safely', () => {
      actor.onPreUpdate = (engine, delta) => {
        expect(engine).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(actor, 'onPreUpdate').and.callThrough();
      spyOn(actor, '_preupdate').and.callThrough();

      actor.update(engine, 100);
      actor.update(engine, 100);
      expect(actor._preupdate).toHaveBeenCalledTimes(2);
      expect(actor.onPreUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreDraw overriden safely', () => {
      actor.onPreDraw = (ctx, delta) => {
        expect(<any>ctx).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(actor, 'onPreDraw').and.callThrough();
      spyOn(actor, '_predraw').and.callThrough();

      actor.draw(engine.ctx, 100);
      actor.draw(engine.ctx, 100);
      expect(actor._predraw).toHaveBeenCalledTimes(2);
      expect(actor.onPreDraw).toHaveBeenCalledTimes(2);
    });

    it('can have onPostDraw overriden safely', () => {
      actor.onPostDraw = (ctx, delta) => {
        expect(<any>ctx).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(actor, 'onPostDraw').and.callThrough();
      spyOn(actor, '_postdraw').and.callThrough();

      actor.draw(engine.ctx, 100);
      actor.draw(engine.ctx, 100);
      expect(actor._postdraw).toHaveBeenCalledTimes(2);
      expect(actor.onPostDraw).toHaveBeenCalledTimes(2);
    });

    it('can have onPreKill overriden safely', () => {
      engine.add(actor);
      actor.onPreKill = (scene) => {
        expect(scene).not.toBe(null);
      };

      spyOn(actor, '_prekill').and.callThrough();
      spyOn(actor, 'onPreKill').and.callThrough();

      actor.kill();
      expect(actor._prekill).toHaveBeenCalledTimes(1);
      expect(actor.onPreKill).toHaveBeenCalledTimes(1);
    });

    it('can have onPostKill overriden safely', () => {
      engine.add(actor);
      actor.onPreKill = (scene) => {
        expect(scene).not.toBe(null);
      };

      spyOn(actor, '_postkill').and.callThrough();
      spyOn(actor, 'onPostKill').and.callThrough();

      actor.kill();
      expect(actor._postkill).toHaveBeenCalledTimes(1);
      expect(actor.onPostKill).toHaveBeenCalledTimes(1);
    });
  });
});
