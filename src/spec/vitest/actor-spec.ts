import * as ex from '@excalibur';

import { PhysicsWorld } from '../../engine/collision/physics-world';
import { TestUtils } from '../__util__/test-utils';

describe('A game actor', () => {
  let actor: ex.Actor;

  let engine: ex.Engine;
  let scene: ex.Scene;
  let motionSystem: ex.MotionSystem;
  let collisionSystem: ex.CollisionSystem;
  let actionSystem: ex.ActionsSystem;

  beforeEach(async () => {
    engine = TestUtils.engine({
      width: 100,
      height: 100,
      physics: {
        solver: ex.SolverStrategy.Arcade,
        gravity: ex.vec(0, 0)
      }
    });
    actor = new ex.Actor({ name: 'Default' });
    actor.body.collisionType = ex.CollisionType.Active;
    scene = new ex.Scene();
    const physicsWorld = new PhysicsWorld(engine.physics);
    motionSystem = new ex.MotionSystem(scene.world, physicsWorld);
    collisionSystem = new ex.CollisionSystem(scene.world, physicsWorld);
    actionSystem = new ex.ActionsSystem(scene.world);
    scene.add(actor);
    engine.addScene('test', scene);
    await engine.goToScene('test');

    vi.spyOn(scene, 'draw');
    vi.spyOn(scene, 'debugDraw');

    await engine.start();
    const clock = engine.clock as ex.TestClock;
    clock.step(1);
    collisionSystem.initialize(scene.world, scene);
    scene.world.systemManager.get(ex.PointerSystem).initialize(scene.world, scene);
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    actor = null;
    engine = null;
  });

  it('should be loaded', () => {
    expect(ex.Actor).toBeTruthy();
  });

  it('should have a position', () => {
    actor.pos = ex.vec(10, 10);

    expect(actor.pos.x).toBe(10);
    expect(actor.pos.y).toBe(10);
  });

  it('can be constructed with a coord plane', () => {
    const sut = new ex.Actor({
      coordPlane: ex.CoordPlane.Screen
    });
    const sut2 = new ex.Actor(); // default is world
    expect(sut.transform.coordPlane).toBe(ex.CoordPlane.Screen);
    expect(sut2.transform.coordPlane).toBe(ex.CoordPlane.World);
  });

  it('should have props set by constructor', () => {
    const actor = new ex.Actor({
      pos: new ex.Vector(2, 3),
      width: 100,
      height: 200,
      vel: new ex.Vector(30, 40),
      acc: new ex.Vector(50, 60),
      rotation: 2,
      angularVelocity: 0.1,
      z: 10,
      color: ex.Color.Red,
      visible: false
    });

    const actor2 = new ex.Actor({
      pos: new ex.Vector(4, 5)
    });

    expect(actor.pos.x).toBe(2);
    expect(actor.pos.y).toBe(3);
    expect(actor.width).toBeCloseTo(100);
    expect(actor.height).toBeCloseTo(200);
    expect(actor.vel.x).toBe(30);
    expect(actor.vel.y).toBe(40);
    expect(actor.acc.x).toBe(50);
    expect(actor.acc.y).toBe(60);
    expect(actor.rotation).toBeCloseTo(2);
    expect(actor.angularVelocity).toBe(0.1);
    expect(actor.z).toBe(10);
    expect(actor.color.toString()).toBe(ex.Color.Red.toString());
    expect(actor2.pos.x).toBe(4);
    expect(actor2.pos.y).toBe(5);
  });

  it('can be cloned', () => {
    const original = new ex.Actor({
      width: 10,
      height: 100,
      anchor: ex.vec(0, 1),
      color: ex.Color.Azure
    });
    original.pos = ex.vec(10, 20);
    original.vel = ex.vec(30, 30);

    const sut = original.clone();

    expect(sut.get(ex.TransformComponent)).not.toBe(original.get(ex.TransformComponent));
    expect(sut.get(ex.MotionComponent)).not.toBe(original.get(ex.MotionComponent));
    expect(sut.get(ex.ActionsComponent)).not.toBe(original.get(ex.ActionsComponent));
    expect(sut.get(ex.PointerComponent)).not.toBe(original.get(ex.PointerComponent));
    expect(sut.get(ex.BodyComponent)).not.toBe(original.get(ex.BodyComponent));
    expect(sut.get(ex.ColliderComponent)).not.toBe(original.get(ex.ColliderComponent));
    expect(sut.get(ex.GraphicsComponent)).not.toBe(original.get(ex.GraphicsComponent));

    // New refs
    expect(sut).not.toBe(original);
    expect(sut.id).not.toBe(original.id);
    expect(sut.color).not.toBe(original.color);
    expect(sut.anchor).not.toBe(original.anchor);

    // Same values
    expect(sut.pos).toBeVector(original.pos);
    expect(sut.vel).toBeVector(original.vel);
    expect(sut.width).toBe(original.width);
    expect(sut.height).toBe(original.height);
    expect(sut.anchor).toEqual(original.anchor);
    expect(sut.color).toEqual(original.color);
  });

  it('can be cloned with null collider', () => {
    const original = new ex.Actor({
      width: 10,
      height: 100,
      anchor: ex.vec(0, 1),
      color: ex.Color.Azure
    });
    original.pos = ex.vec(10, 20);
    original.vel = ex.vec(30, 30);

    original.collider.clear();
    const sut = original.clone();

    expect(sut.get(ex.TransformComponent)).not.toBe(original.get(ex.TransformComponent));
    expect(sut.get(ex.MotionComponent)).not.toBe(original.get(ex.MotionComponent));
    expect(sut.get(ex.ActionsComponent)).not.toBe(original.get(ex.ActionsComponent));
    expect(sut.get(ex.PointerComponent)).not.toBe(original.get(ex.PointerComponent));
    expect(sut.get(ex.BodyComponent)).not.toBe(original.get(ex.BodyComponent));
    expect(sut.get(ex.ColliderComponent)).not.toBe(original.get(ex.ColliderComponent));
    expect(sut.get(ex.GraphicsComponent)).not.toBe(original.get(ex.GraphicsComponent));

    // New refs
    expect(sut).not.toBe(original);
    expect(sut.id).not.toBe(original.id);
    expect(sut.color).not.toBe(original.color);
    expect(sut.anchor).not.toBe(original.anchor);

    // Same values
    expect(sut.pos).toBeVector(original.pos);
    expect(sut.vel).toBeVector(original.vel);
    expect(sut.width).toBe(original.width);
    expect(sut.height).toBe(original.height);
    expect(sut.anchor).toEqual(original.anchor);
    expect(sut.color).toEqual(original.color);
  });

  it('should have default properties set', () => {
    const actor = new ex.Actor();

    expect(actor.anchor).toEqual(ex.Actor.defaults.anchor);
  });

  it('should have constructor anchor set on graphics component', () => {
    const actor = new ex.Actor({ anchor: ex.vec(0.7, 0.7) });

    expect(actor.anchor).toBeVector(ex.vec(0.7, 0.7));
    expect(actor.graphics.anchor).toBeVector(ex.vec(0.7, 0.7));

    actor.anchor = ex.vec(0, 0);
    expect(actor.graphics.anchor).toBeVector(ex.vec(0, 0));
  });

  it("can have it's color changed after construction", () => {
    const actor = new ex.Actor({ color: ex.Color.Blue, width: 50, height: 50 });
    const current = actor.graphics.current;
    expect(current).toBeInstanceOf(ex.Raster);
    if (current instanceof ex.Raster) {
      expect(current.color).toStrictEqual(ex.Color.Blue);

      actor.color = ex.Color.Black;

      expect(current.color).toStrictEqual(ex.Color.Black);
    }
  });

  it('will inherit the scene from the parent entity after being added', () => {
    const parent = new ex.Actor();
    const child = new ex.Actor();

    const engine = TestUtils.engine();

    engine.add(parent);

    expect(parent.scene).toBe(engine.currentScene);

    parent.addChild(child);

    expect(child.scene).toBe(engine.currentScene);
    engine.dispose();
  });

  it('should create actor with valid default options', () => {
    const actor = new ex.Actor();
    expect(actor.anchor.toString()).toEqual('(0.5, 0.5)');

    ex.Actor.defaults.anchor = ex.vec(0, 0);

    const actor2 = new ex.Actor();
    expect(actor2.anchor.toString()).toEqual('(0, 0)');

    // revert changes back
    ex.Actor.defaults.anchor = ex.vec(0.5, 0.5);
  });

  it('can be created with a radius with default circle collider and graphic', () => {
    const actor = new ex.Actor({ x: 50, y: 50, color: ex.Color.Red, radius: 10 });
    expect(actor.graphics.current).toBeInstanceOf(ex.Circle);
    expect((actor.graphics.current as ex.Circle).radius).toBe(10);
    expect((actor.graphics.current as ex.Circle).color).toEqual(ex.Color.Red);
    expect(actor.collider.get()).toBeInstanceOf(ex.CircleCollider);
    expect(actor.collider.get().offset).toBeVector(ex.vec(0, 0));
  });

  it('can be created with a width/height with default rectangle collider and graphic', () => {
    const actor = new ex.Actor({ x: 50, y: 50, color: ex.Color.Red, width: 10, height: 10 });
    expect(actor.graphics.current).toBeInstanceOf(ex.Rectangle);
    expect((actor.graphics.current as ex.Rectangle).width).toBe(10);
    expect((actor.graphics.current as ex.Rectangle).height).toBe(10);
    expect((actor.graphics.current as ex.Rectangle).color).toEqual(ex.Color.Red);
    expect(actor.collider.get()).toBeInstanceOf(ex.PolygonCollider);
  });

  it('can be created with a custom collider', () => {
    const actor = new ex.Actor({
      pos: ex.vec(10, 10),
      collider: ex.Shape.Circle(10)
    });

    expect(actor.collider.bounds).toEqual(ex.BoundingBox.fromDimension(20, 20, ex.Vector.Half).translate(ex.vec(10, 10)));
    expect(actor.collider.localBounds).toEqual(ex.BoundingBox.fromDimension(20, 20, ex.Vector.Half));
  });

  it('should have an old position after an update', () => {
    actor.pos = ex.vec(10, 10);
    actor.vel = ex.vec(10, 10);

    motionSystem.update(1000);

    expect(actor.oldPos.x).toBe(10);
    expect(actor.oldPos.y).toBe(10);
    expect(actor.pos.x).toBe(20);
    expect(actor.pos.y).toBe(20);
  });

  it('should have an old global position after an update', () => {
    const parent = new ex.Actor({ pos: ex.vec(10, 10) });
    const child = new ex.Actor({ name: 'child', pos: ex.vec(10, 10) });
    scene.add(parent);
    parent.addChild(child);

    parent.vel = ex.vec(10, 10);

    expect(child.globalPos.x).toBe(20);
    expect(child.globalPos.y).toBe(20);

    motionSystem.update(1000);

    expect(child.oldGlobalPos.x).toBe(20);
    expect(child.oldGlobalPos.y).toBe(20);
    expect(child.globalPos.x).toBe(30);
    expect(child.globalPos.y).toBe(30);
  });

  it('actors should generate pair hashes in the correct order', () => {
    const id1 = ex.createId('collider', 20);
    const id2 = ex.createId('collider', 40);
    const hash = ex.Pair.calculatePairHash(id1, id2);
    const hash2 = ex.Pair.calculatePairHash(id2, id1);
    expect(hash).toBe('#20+40');
    expect(hash2).toBe('#20+40');
  });

  it('can change positions when it has velocity', () => {
    expect(actor.pos.y).toBe(0);
    expect(actor.pos.x).toBe(0);

    actor.vel = ex.vec(-10, 10);
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);

    motionSystem.update(1000);
    expect(actor.pos.x).toBe(-10);
    expect(actor.pos.y).toBe(10);

    motionSystem.update(1000);
    expect(actor.pos.x).toBe(-20);
    expect(actor.pos.y).toBe(20);
  });

  it('should have an old velocity after an update', () => {
    actor.pos = ex.vec(0, 0);
    actor.vel = ex.vec(10, 10);
    actor.acc = ex.vec(10, 10);

    motionSystem.update(1000);

    expect(actor.oldVel.x).toBe(10);
    expect(actor.oldVel.y).toBe(10);
    expect(actor.vel.x).toBe(20);
    expect(actor.vel.y).toBe(20);
  });

  it('can have its height and width scaled', () => {
    const actor = new ex.Actor({
      width: 20,
      height: 20
    });

    expect(actor.width).toBe(20);
    expect(actor.height).toBe(20);

    actor.scale = ex.vec(2, 3);

    expect(actor.width).toBe(40);
    expect(actor.height).toBe(60);

    actor.scale = ex.vec(0.5, 0.1);

    expect(actor.width).toBeCloseTo(10);
    expect(actor.height).toBeCloseTo(2);
  });

  it('can have its height and width scaled by parent', () => {
    actor.scale = ex.vec(2, 2);

    const child = new ex.Actor({ width: 50, height: 50 });

    actor.addChild(child);

    expect(child.width).toBe(100);
    expect(child.height).toBe(100);

    actor.scale = ex.vec(0.5, 0.5);

    expect(child.width).toBe(25);
    expect(child.height).toBe(25);
  });

  it('can have a center point', () => {
    const actor = new ex.Actor({
      width: 50,
      height: 100
    });

    let center = actor.center;
    expect(center.x).toBe(0);
    expect(center.y).toBe(0);

    actor.pos = ex.vec(100, 100);

    center = actor.center;
    expect(center.x).toBe(100);
    expect(center.y).toBe(100);

    // changing the anchor
    actor.anchor = new ex.Vector(0, 0);
    actor.pos = ex.vec(0, 0);

    center = actor.center;
    expect(center.x).toBe(25);
    expect(center.y).toBe(50);

    actor.pos = ex.vec(100, 100);

    center = actor.center;
    expect(center.x).toBe(125);
    expect(center.y).toBe(150);
  });

  it('can have a center when parented', () => {
    const parent = new ex.Actor({
      x: 100,
      y: 100
    });

    const child = new ex.Actor({
      x: 50,
      y: 50
    });

    const grandChild = new ex.Actor({
      x: 25,
      y: 25
    });

    parent.addChild(child);
    child.addChild(grandChild);

    expect(parent.center).toBeVector(ex.vec(100, 100));
    expect(parent.localCenter).toBeVector(ex.vec(100, 100));

    expect(child.center).toBeVector(ex.vec(150, 150));
    expect(child.localCenter).toBeVector(ex.vec(50, 50));

    expect(grandChild.center).toBeVector(ex.vec(175, 175));
    expect(grandChild.localCenter).toBeVector(ex.vec(25, 25));
  });

  it('has a left, right, top, and bottom', () => {
    const actor = new ex.Actor({
      x: 0,
      y: 0,
      anchor: ex.Vector.Half,
      width: 100,
      height: 100
    });

    expect(actor.collider.bounds.left).toBe(-50);
    expect(actor.collider.bounds.right).toBe(50);
    expect(actor.collider.bounds.top).toBe(-50);
    expect(actor.collider.bounds.bottom).toBe(50);
  });

  it('should have correct bounds when scaled', () => {
    const actor = new ex.Actor({
      x: 0,
      y: 0,
      anchor: ex.Vector.Half,
      width: 100,
      height: 100
    });
    actor.scale.setTo(2, 2);

    actor.collider.update();

    expect(actor.collider.bounds.left).toBe(-100);
    expect(actor.collider.bounds.right).toBe(100);
    expect(actor.collider.bounds.top).toBe(-100);
    expect(actor.collider.bounds.bottom).toBe(100);
  });

  it('can collide with other actors', () => {
    const actor = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
    const other = new ex.Actor({ x: 10, y: 10, width: 10, height: 10 });

    // Actors are adjacent and not overlapping should not collide
    expect(actor.collider.bounds.intersectWithSide(other.collider.bounds)).toBe(ex.Side.None);
    expect(other.collider.bounds.intersectWithSide(actor.collider.bounds)).toBe(ex.Side.None);

    // move other actor into collision range from the right side
    other.pos.x = 9;
    other.pos.y = 0;
    actor.collider.update();
    other.collider.update();
    expect(actor.collider.bounds.intersectWithSide(other.collider.bounds)).toBe(ex.Side.Right);
    expect(other.collider.bounds.intersectWithSide(actor.collider.bounds)).toBe(ex.Side.Left);

    // move other actor into collision range from the left side
    other.pos.x = -9;
    other.pos.y = 0;
    actor.collider.update();
    other.collider.update();
    expect(actor.collider.bounds.intersectWithSide(other.collider.bounds)).toBe(ex.Side.Left);
    expect(other.collider.bounds.intersectWithSide(actor.collider.bounds)).toBe(ex.Side.Right);

    // move other actor into collision range from the top
    other.pos.x = 0;
    other.pos.y = -9;
    actor.collider.update();
    other.collider.update();
    expect(actor.collider.bounds.intersectWithSide(other.collider.bounds)).toBe(ex.Side.Top);
    expect(other.collider.bounds.intersectWithSide(actor.collider.bounds)).toBe(ex.Side.Bottom);

    // move other actor into collision range from the bottom
    other.pos.x = 0;
    other.pos.y = 9;
    actor.collider.update();
    other.collider.update();
    expect(actor.collider.bounds.intersectWithSide(other.collider.bounds)).toBe(ex.Side.Bottom);
    expect(other.collider.bounds.intersectWithSide(actor.collider.bounds)).toBe(ex.Side.Top);
  });

  it('participates with another in a collision', () => {
    const actor = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
    actor.body.collisionType = ex.CollisionType.Active;
    const other = new ex.Actor({ x: 8, y: 0, width: 10, height: 10 });
    other.body.collisionType = ex.CollisionType.Active;
    let actorCalled = 'false';
    let otherCalled = 'false';

    actor.on('precollision', function () {
      actorCalled = 'actor';
    });

    other.on('precollision', function () {
      otherCalled = 'other';
    });

    scene.add(actor);
    scene.add(other);
    collisionSystem.update(20);
    collisionSystem.update(20);
    scene.update(engine, 20);
    scene.update(engine, 20);

    expect(actorCalled).toBe('actor');
    expect(otherCalled).toBe('other');
  });

  it('is rotated along with its parent', () => {
    const rotation = ex.toRadians(90);

    actor.pos = ex.vec(10, 10);
    actor.rotation = rotation;

    const child = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (20, 10)

    actor.addChild(child);
    motionSystem.update(100);

    expect(child.globalPos.x).toBeCloseTo(10, 0.001);
    expect(child.globalPos.y).toBeCloseTo(20, 0.001);
  });

  it('is rotated along with its grandparent', () => {
    const rotation = ex.toRadians(90);

    actor.pos = ex.vec(10, 10);
    actor.rotation = rotation;

    const child = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (20, 10)
    const grandchild = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (30, 10)

    actor.addChild(child);
    child.addChild(grandchild);
    motionSystem.update(100);

    expect(grandchild.globalRotation).toBe(rotation);
    expect(grandchild.globalPos.x).toBeCloseTo(10, 0.001);
    expect(grandchild.globalPos.y).toBeCloseTo(30, 0.001);
  });

  it('is scaled along with its parent', () => {
    actor.anchor = ex.vec(0, 0);
    actor.pos = ex.vec(10, 10);
    actor.scale = ex.vec(2, 2);

    const child = new ex.Actor({ x: 10, y: 10, width: 10, height: 10 });

    actor.addChild(child);
    motionSystem.update(100);

    expect(child.globalPos.x).toBe(30);
    expect(child.globalPos.y).toBe(30);
  });

  it('is scaled along with its grandparent', () => {
    actor.anchor = ex.vec(0, 0);
    actor.pos = ex.vec(10, 10);
    actor.scale = ex.vec(2, 2);

    const child = new ex.Actor({ x: 10, y: 10, width: 10, height: 10 });
    const grandchild = new ex.Actor({ x: 10, y: 10, width: 10, height: 10 });

    actor.addChild(child);
    child.addChild(grandchild);
    motionSystem.update(100);

    // Logic:
    // p = (10, 10)
    // c = (10 * 2 + 10, 10 * 2 + 10) = (30, 30)
    // gc = (10 * 2 + 30, 10 * 2 + 30) = (50, 50)
    expect(grandchild.globalPos.x).toBe(50);
    expect(grandchild.globalPos.y).toBe(50);
  });

  it('is rotated and scaled along with its parent', () => {
    const rotation = ex.toRadians(90);

    actor.pos = ex.vec(10, 10);
    actor.scale = ex.vec(2, 2);
    actor.rotation = rotation;

    const child = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (30, 10)

    actor.addChild(child);
    motionSystem.update(100);

    expect(child.globalPos.x).toBeCloseTo(10, 0.001);
    expect(child.globalPos.y).toBeCloseTo(30, 0.001);
  });

  it('is rotated and scaled along with its grandparent', () => {
    const rotation = ex.toRadians(90);

    actor.pos = ex.vec(10, 10);
    actor.scale = ex.vec(2, 2);
    actor.rotation = rotation;

    const child = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (30, 10)
    const grandchild = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (50, 10)

    actor.addChild(child);
    child.addChild(grandchild);
    motionSystem.update(100);

    expect(grandchild.globalPos.x).toBeCloseTo(10, 0.001);
    expect(grandchild.globalPos.y).toBeCloseTo(50, 0.001);
  });

  it('can find its global coordinates if it has a parent', () => {
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);

    const childActor = new ex.Actor({ x: 50, y: 50 });
    expect(childActor.pos.x).toBe(50);
    expect(childActor.pos.y).toBe(50);

    actor.addChild(childActor);
    actionSystem.query.checkAndModify(actor);

    actor.actions.moveTo(10, 15, 1000);
    actionSystem.update(1000);
    motionSystem.update(1000);
    actionSystem.update(1);
    motionSystem.update(1);

    expect(childActor.globalPos.x).toBe(60);
    expect(childActor.globalPos.y).toBe(65);
  });

  it('can find its global coordinates if it has multiple parents', () => {
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);

    const childActor = new ex.Actor({ x: 50, y: 50 });
    const grandChildActor = new ex.Actor({ x: 10, y: 10 });

    actor.addChild(childActor);
    childActor.addChild(grandChildActor);

    actor.actions.moveBy(10, 15, 1000);
    actor.update(engine, 1000);
    scene.update(engine, 1000);
    actor.update(engine, 1);
    scene.update(engine, 1);

    expect(grandChildActor.globalPos.x).toBe(70);
    expect(grandChildActor.globalPos.y).toBe(75);
  });

  it("can find its global coordinates if it doesn't have a parent", () => {
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);

    actor.actions.moveBy(10, 15, 1000);
    actor.update(engine, 1000);
    scene.update(engine, 1000);
    actor.update(engine, 1);
    scene.update(engine, 1);

    expect(actor.globalPos.x).toBe(10);
    expect(actor.globalPos.y).toBe(15);
  });

  it('can be removed from the scene', () => {
    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warn');
    // attempt removing before adding
    new ex.Actor({ name: 'not-in-scene' }).kill();
    expect(logger.warn).toHaveBeenCalledWith('Cannot kill actor named "not-in-scene", it was never added to the Scene');

    // remove actor in a scene
    scene.add(actor);
    expect(scene.actors.length).toBe(1);
    actor.kill();
    scene.update(engine, 100);
    expect(scene.actors.length).toBe(0);
  });

  it('once killed is not drawn', async () => {
    engine.stop();
    engine.dispose();
    engine = null;
    engine = TestUtils.engine({ width: 100, height: 100 });
    await TestUtils.runToReady(engine);
    actor = new ex.Actor();
    actor.body.collisionType = ex.CollisionType.Active;
    const physicsWorld = new PhysicsWorld(engine.physics);
    motionSystem = new ex.MotionSystem(engine.currentScene.world, physicsWorld);
    collisionSystem = new ex.CollisionSystem(engine.currentScene.world, physicsWorld);
    scene = new ex.Scene();
    scene.add(actor);
    engine.addScene('test', scene);
    await engine.goToScene('test');
    engine.screen.setCurrentCamera(engine.currentScene.camera);

    vi.spyOn(scene, 'draw');
    vi.spyOn(scene, 'debugDraw');

    actor.graphics.onPostDraw = vi.fn();

    scene.add(actor);
    actor.kill();
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);
    expect(actor.graphics.onPostDraw).not.toHaveBeenCalled();
  });

  it('does not change opacity on color', () => {
    actor.color = ex.Color.Black.clone();
    expect(actor.color.a).toBe(1);
    expect(actor.color.r).toBe(0);
    expect(actor.color.g).toBe(0);
    expect(actor.color.b).toBe(0);
    expect(actor.graphics.opacity).toBe(1.0);

    actor.graphics.opacity = 0.5;
    actor.update(engine, 100);
    expect(actor.color.a).toBe(1.0);
    expect(actor.color.r).toBe(0);
    expect(actor.color.g).toBe(0);
    expect(actor.color.b).toBe(0);
    expect(actor.graphics.opacity).toBe(0.5);
  });

  it('is drawn on opacity 0', () => {
    scene.clear(false);
    const invisibleActor = new ex.Actor({ name: 'Invisible', pos: ex.vec(50, 50), width: 100, height: 100 });
    invisibleActor.graphics.onPostDraw = vi.fn();
    invisibleActor.graphics.opacity = 0;
    scene.add(invisibleActor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(invisibleActor.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('@visual can be drawn with a z-index', async () => {
    engine.stop();
    engine.dispose();
    engine = null;

    engine = TestUtils.engine({
      width: 100,
      height: 100,
      suppressHiDPIScaling: true,
      backgroundColor: ex.Color.Transparent
    });

    scene = new ex.Scene();
    engine.addScene('test', scene);
    await engine.goToScene('test');
    await engine.start();
    const clock = engine.clock as ex.TestClock;
    clock.step(1);

    const green = new ex.Actor({ x: 35, y: 35, width: 50, height: 50, color: ex.Color.Green });
    const blue = new ex.Actor({ x: 65, y: 65, width: 50, height: 50, color: ex.Color.Blue });

    green.z = 1;
    blue.z = 2;

    // Actors currently need to be in a scene for z to work
    scene.add(blue);
    scene.add(green);

    scene.draw(engine.graphicsContext, 100);
    engine.graphicsContext.flush();

    await expect(engine.canvas).toEqualImage('/src/spec/assets/images/actor-spec/zindex-blue-top.png');

    green.z = 2;
    blue.z = 1;
    scene.draw(engine.graphicsContext, 100);
    engine.graphicsContext.flush();

    await expect(engine.canvas).toEqualImage('/src/spec/assets/images/actor-spec/zindex-green-top.png');
  });

  it('@visual can have a graphic drawn at an opacity', async () => {
    engine.stop();
    engine.dispose();
    engine = null;

    engine = TestUtils.engine({
      width: 62,
      height: 64,
      suppressHiDPIScaling: true
    });
    scene = new ex.Scene();
    engine.addScene('test', scene);
    await engine.goToScene('test');
    await engine.start();
    const clock = engine.clock as ex.TestClock;
    clock.step(1);

    const image = new ex.ImageSource('/src/spec/assets/images/sprite-spec/icon.png');

    await image.load();
    const sprite = new ex.Sprite({
      image,
      width: 62,
      height: 64,
      rotation: 0,
      scale: new ex.Vector(1, 1),
      flipVertical: false,
      flipHorizontal: false,
      opacity: 0.1
    });

    const actor = new ex.Actor({
      pos: new ex.Vector(engine.halfCanvasWidth, engine.halfCanvasHeight),
      width: 10,
      height: 10
    });

    actor.graphics.use(sprite);

    scene.add(actor);
    scene.draw(engine.graphicsContext, 100);
    engine.graphicsContext.flush();

    await expect(engine.canvas).toEqualImage('/src/spec/assets/images/sprite-spec/opacity.png');
  });

  it('will tick animations on update', async () => {
    scene.clear();
    const texture = new ex.ImageSource('/src/spec/assets/images/sprite-spec/icon.png');
    await texture.load();
    const sprite = new ex.Sprite({
      image: texture,
      width: 62,
      height: 64,
      rotation: 0,
      scale: new ex.Vector(1, 1),
      flipVertical: false,
      flipHorizontal: false
    });
    const animation = new ex.Animation({
      frames: [{ graphic: sprite }, { graphic: sprite }],
      frameDuration: 200,
      strategy: ex.AnimationStrategy.Loop,
      rotation: Math.PI,
      scale: new ex.Vector(2, 2),
      flipVertical: true,
      flipHorizontal: true,
      width: 100,
      height: 200
    });

    vi.spyOn(animation, 'tick');

    const actor = new ex.Actor({
      name: 'Animation',
      pos: new ex.Vector(engine.halfCanvasWidth, engine.halfCanvasHeight)
    });
    actor.graphics.use(animation);

    scene.add(actor);
    scene.draw(engine.graphicsContext, 100);

    expect(animation.tick).toHaveBeenCalledWith(100, 2);
  });

  it('will receive predraw/postdraw', () => {
    const predraw = vi.fn();
    const postdraw = vi.fn();

    const actor = new ex.Actor({
      name: 'events',
      pos: ex.vec(100, 100),
      width: 100,
      height: 100,
      color: ex.Color.Red
    });

    actor.events.on('predraw', predraw);
    actor.events.on('postdraw', postdraw);

    scene.add(actor);
    scene.draw(engine.graphicsContext, 100);

    expect(predraw).toHaveBeenCalledExactlyOnceWith(new ex.PreDrawEvent(engine.graphicsContext, 100, actor));
    expect(postdraw).toHaveBeenCalledExactlyOnceWith(new ex.PostDrawEvent(engine.graphicsContext, 100, actor));
  });

  it('can detect containment off of child actors', () => {
    const parent = new ex.Actor({ x: 600, y: 100, width: 100, height: 100 });
    const child = new ex.Actor({ x: 0, y: 0, width: 100, height: 100 });
    const child2 = new ex.Actor({ x: -600, y: -100, width: 100, height: 100 });

    parent.addChild(child);
    child.addChild(child2);

    // check reality
    expect(parent.contains(550.01, 50.01), '(550.1, 50.1) is top-left of parent should be contained').toBeTruthy();
    expect(parent.contains(650, 150), '(650, 150) is bottom-right of parent should be contained').toBeTruthy();

    // in world coordinates this should be false
    expect(child.contains(50, 50), '(50, 50) world coords is outside child world pos').toBeFalsy();

    // in world coordinates this should be true
    expect(child.contains(550.01, 50.01), '(550.1, 50.1) world should be top-left of of child').toBeTruthy();
    expect(child.contains(650, 150), '(650, 150) world should be bottom-right of child').toBeTruthy();

    // second order child shifted to the origin
    expect(child2.contains(-49.99, -49.99), '(-50, -50) world should be top left of second order child').toBeTruthy();
    expect(child2.contains(50, 50), '(50, 50) world should be bottom right of second order child').toBeTruthy();
  });

  it('can recursively check containment', () => {
    const parent = new ex.Actor({ x: 0, y: 0, width: 100, height: 100 });
    const child = new ex.Actor({ x: 100, y: 100, width: 100, height: 100 });
    const grandChild = new ex.Actor({ x: 100, y: 100, width: 100, height: 100 });
    parent.addChild(child);

    expect(parent.contains(150, 150)).toBeFalsy();
    expect(child.contains(150, 150)).toBeTruthy();
    expect(parent.contains(150, 150, true)).toBeTruthy();
    expect(parent.contains(200, 200, true)).toBeFalsy();

    child.addChild(grandChild);
    expect(parent.contains(250, 250, true)).toBeTruthy();
  });

  it('with an active collision type can be placed on a fixed type', async () => {
    const scene = new ex.Scene();
    engine.add('somescene', scene);
    await engine.goToScene('somescene');
    engine.currentScene.physics.config.solver = ex.SolverStrategy.Arcade;

    const active = new ex.Actor({ x: 0, y: -50, width: 100, height: 100 });
    active.body.collisionType = ex.CollisionType.Active;
    active.vel.y = 10;
    active.acc.y = 1000;

    const fixed = new ex.Actor({ x: -100, y: 50, width: 1000, height: 100 });
    fixed.body.collisionType = ex.CollisionType.Fixed;

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

  it('with an active collision type can jump on a fixed type', async () => {
    const scene = new ex.Scene();
    await scene._initialize(engine);
    const active = new ex.Actor({ x: 0, y: -50, width: 100, height: 100 });
    active.body.collisionType = ex.CollisionType.Active;
    active.vel.y = -100;

    const fixed = new ex.Actor({ x: -100, y: 50, width: 1000, height: 100 });
    fixed.body.collisionType = ex.CollisionType.Fixed;

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

    expect(active.pos.x).toBeCloseTo(0, 0.0001);
    expect(active.pos.y).toBeCloseTo(-100 * iterations + -50 /* original y is -50 */, 0.0001);

    expect(fixed.pos.x).toBe(-100);
    expect(fixed.pos.y).toBe(50);
  });

  it('updates child actors', () => {
    const parentActor = new ex.Actor();
    const childActor = new ex.Actor();
    scene.add(parentActor);
    parentActor.addChild(childActor);

    vi.spyOn(childActor, 'update');

    scene.update(engine, 100);

    expect(childActor.update).toHaveBeenCalled();
  });

  it('draws visible child actors', () => {
    const parentActor = new ex.Actor({ name: 'Parent' });
    const childActor = new ex.Actor({ name: 'Child' });
    scene.add(parentActor);
    parentActor.addChild(childActor);

    childActor.graphics.onPostDraw = vi.fn();

    childActor.graphics.isVisible = true;
    scene.draw(engine.graphicsContext, 100);
    expect(childActor.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('does not draw invisible child actors', () => {
    const parentActor = new ex.Actor();
    const childActor = new ex.Actor();
    scene.add(parentActor);
    parentActor.addChild(childActor);

    childActor.graphics.onPostDraw = vi.fn();

    childActor.graphics.isVisible = false;
    scene.draw(engine.graphicsContext, 100);
    expect(childActor.graphics.onPostDraw).not.toHaveBeenCalled();
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

  it('fires initialize event when before the first update', () =>
    new Promise<void>((done) => {
      const actor = new ex.Actor();
      actor.on('initialize', () => {
        expect(true).toBe(true);
        done();
      });

      scene.add(actor);
      scene.update(engine, 100);
      scene.update(engine, 100);
    }));

  it('fires preupdate event before update then postupdate', () =>
    new Promise<void>((done) => {
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
    }));

  it('can only be initialized once', async () => {
    const actor = new ex.Actor();

    const initializeSpy = vi.fn();

    actor.on('initialize', initializeSpy);
    await actor._initialize(engine);
    await actor._initialize(engine);
    await actor._initialize(engine);

    expect(initializeSpy).toHaveBeenCalledTimes(1);
  });

  it('can initialize child actors', async () => {
    const actor = new ex.Actor();
    const child = new ex.Actor();
    const grandchild = new ex.Actor();
    let initializeCount = 0;
    actor.addChild(child);
    child.addChild(grandchild);
    actor.on('initialize', () => {
      initializeCount++;
    });
    child.on('initialize', () => {
      initializeCount++;
    });
    grandchild.on('initialize', () => {
      initializeCount++;
    });

    await actor._initialize(engine);
    await actor._initialize(engine);

    expect(initializeCount, 'All child actors should be initialized').toBe(3);
  });

  describe('should detect assigned events and', () => {
    it('should capture pointer move event', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const callables = {
        move: (pe: any) => {
          /* doesn't matter; */
        }
      };
      const moveSpy = vi.spyOn(callables, 'move');

      actor.on('pointermove', callables.move);
      scene.add(actor);

      engine.input.pointers.triggerEvent('move', new ex.Vector(0, 0));

      expect(moveSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0), 0.001);
    });

    it('should capture pointer enter event', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const callables = {
        enter: (pe: any) => {
          /* doesn't matter */
        }
      };
      const enterSpy = vi.spyOn(callables, 'enter');

      actor.on('pointerenter', callables.enter);
      scene.add(actor);

      engine.input.pointers.triggerEvent('move', new ex.Vector(30, 30));
      engine.input.pointers.triggerEvent('move', new ex.Vector(0, 0));

      expect(enterSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0), 0.001);
    });

    it('should capture pointer leave event', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });

      const leaveSpy = vi.fn();
      actor.on('pointerleave', leaveSpy);
      scene.add(actor);

      engine.input.pointers.triggerEvent('move', new ex.Vector(0, 0));
      engine.input.pointers.triggerEvent('move', new ex.Vector(30, 30));

      expect(leaveSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(30, 30), 0.001);
    });

    it('should capture pointer drag start event', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const callables = {
        dragStart: (pe: any) => {
          /* doesn't matter */
        }
      };
      const dragStartSpy = vi.spyOn(callables, 'dragStart');

      actor.on('pointerdragstart', callables.dragStart);
      scene.add(actor);

      actor.update(engine, 100);
      engine.input.pointers.triggerEvent('down', new ex.Vector(0, 0));

      expect(dragStartSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0));
    });

    it('should capture pointer drag end event', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const callables = {
        dragEnd: (pe: any) => {
          /* doesn't matter */
        }
      };
      const dragEndSpy = vi.spyOn(callables, 'dragEnd');

      actor.on('pointerdragend', callables.dragEnd);
      scene.add(actor);

      engine.input.pointers.triggerEvent('down', new ex.Vector(0, 0));
      engine.input.pointers.triggerEvent('up', new ex.Vector(0, 0));

      expect(dragEndSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0));
    });

    it('should capture pointer drag move event', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const callables = {
        dragMove: (pe: any) => {
          /* doesn't matter */
        }
      };
      const dragMoveSpy = vi.spyOn(callables, 'dragMove');

      actor.on('pointerdragmove', callables.dragMove);
      scene.add(actor);

      engine.input.pointers.triggerEvent('down', new ex.Vector(0, 0));
      engine.input.pointers.triggerEvent('move', new ex.Vector(0, 0));
      engine.input.pointers.triggerEvent('up', new ex.Vector(0, 0));

      expect(dragMoveSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0));
    });

    it('should capture pointer drag enter event', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const dragEnterSpy = vi.fn();

      actor.on('pointerdragenter', dragEnterSpy);
      scene.add(actor);

      engine.input.pointers.triggerEvent('down', new ex.Vector(-20, -20));
      engine.input.pointers.triggerEvent('move', new ex.Vector(0, 0));

      // Process pointer events
      scene.update(engine, 0);

      expect(dragEnterSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0));
    });

    it('should capture pointer drag leave event', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const dragLeaveSpy = vi.fn();

      actor.on('pointerdragleave', dragLeaveSpy);
      scene.add(actor);

      engine.input.pointers.triggerEvent('down', new ex.Vector(0, 0));
      engine.input.pointers.triggerEvent('move', new ex.Vector(30, 30));

      // Process pointer events
      scene.update(engine, 0);

      expect(dragLeaveSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(30, 30));
    });

    it('can prevent pointer events from bubbling', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 100, height: 100 });
      const child = new ex.Actor({ x: 0, y: 0, width: 100, height: 100 });
      const callables = {
        pointerDown: (pe: any) => {
          /* doesn't matter */
        }
      };
      const bubblingSpy = vi.spyOn(callables, 'pointerDown');

      actor.on('pointerdown', callables.pointerDown);
      child.on('pointerdown', callables.pointerDown);
      scene.add(actor);

      engine.input.pointers.triggerEvent('down', new ex.Vector(0, 0));

      expect(bubblingSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0));
    });

    it('only has pointer events happen once per frame', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 100, height: 100 });
      let numPointerUps = 0;

      scene.add(actor);
      actor.on('pointerup', () => {
        numPointerUps++;
      });

      engine.input.pointers.triggerEvent('down', new ex.Vector(0, 0));
      engine.input.pointers.triggerEvent('up', new ex.Vector(0, 0));

      scene.update(engine, 100);

      expect(numPointerUps, 'Pointer up should be triggered once').toBe(1);
    });
  });

  it('when killed should not be killed again by the scene removing it', () => {
    vi.spyOn(actor, 'kill');

    scene.add(actor);
    actor.kill();

    expect(actor.kill).toHaveBeenCalledTimes(1);
  });

  it('when killed should be removed from the scene eventually', () => {
    scene.add(actor);

    actor.kill();
    scene.update(engine, 100);

    expect(scene.actors).not.toContain(actor);
  });

  it('can be offscreen', () => {
    const actor = new ex.Actor({
      pos: ex.Vector.Zero,
      width: 10,
      height: 10
    });

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen, 'Actor should be onscreen').toBe(false);

    actor.pos.x = 106;
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen, 'Actor should be offscreen').toBe(true);
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

    it('can have onInitialize overridden safely', () => {
      let initCalled = false;
      actor.on('initialize', () => {
        initCalled = true;
      });
      actor.onInitialize = (engine) => {
        expect(engine).not.toBe(null);
      };

      vi.spyOn(actor, 'onInitialize');
      vi.spyOn(actor, '_initialize');

      actor.update(engine, 100);
      actor.update(engine, 100);
      expect(actor._initialize).toHaveBeenCalledTimes(2);
      expect(actor.onInitialize).toHaveBeenCalledTimes(1);
      expect(initCalled).toBe(true);
      expect(actor.isInitialized).toBe(true);
    });

    it('can have onPostUpdate overridden safely', () => {
      actor.onPostUpdate = (engine, elapsedMs) => {
        expect(engine).not.toBe(null);
        expect(elapsedMs).toBe(100);
      };

      vi.spyOn(actor, 'onPostUpdate');
      vi.spyOn(actor, '_postupdate');

      actor.update(engine, 100);
      actor.update(engine, 100);
      expect(actor._postupdate).toHaveBeenCalledTimes(2);
      expect(actor.onPostUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreUpdate overridden safely', () => {
      actor.onPreUpdate = (engine, elapsedMs) => {
        expect(engine).not.toBe(null);
        expect(elapsedMs).toBe(100);
      };

      vi.spyOn(actor, 'onPreUpdate');
      vi.spyOn(actor, '_preupdate');

      actor.update(engine, 100);
      actor.update(engine, 100);
      expect(actor._preupdate).toHaveBeenCalledTimes(2);
      expect(actor.onPreUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreKill overridden safely', () => {
      engine.add(actor);
      actor.onPreKill = (scene) => {
        expect(scene).not.toBe(null);
      };

      vi.spyOn(actor, '_prekill');
      vi.spyOn(actor, 'onPreKill');

      actor.kill();
      expect(actor._prekill).toHaveBeenCalledTimes(1);
      expect(actor.onPreKill).toHaveBeenCalledTimes(1);
    });

    it('can have onPostKill overridden safely', () => {
      engine.add(actor);
      actor.onPreKill = (scene) => {
        expect(scene).not.toBe(null);
      };

      vi.spyOn(actor, '_postkill');
      vi.spyOn(actor, 'onPostKill');

      actor.kill();
      expect(actor._postkill).toHaveBeenCalledTimes(1);
      expect(actor.onPostKill).toHaveBeenCalledTimes(1);
    });

    it('can run onAdd and onRemove', () => {
      actor.onRemove = (engine: ex.Engine) => {
        expect(engine).not.toBe(null);
      };

      actor.onAdd = (engine: ex.Engine) => {
        expect(engine).not.toBe(null);
      };

      vi.spyOn(actor, 'onAdd');
      vi.spyOn(actor, 'onRemove');
      engine.add(actor);
      engine.currentScene.update(engine, 100);
      engine.remove(actor);
      engine.currentScene.update(engine, 100);
      expect(actor.onAdd).toHaveBeenCalledTimes(1);
      expect(actor.onRemove).toHaveBeenCalledTimes(1);
      engine.add(actor);
      engine.currentScene.update(engine, 100);
      expect(actor.onAdd).toHaveBeenCalledTimes(2);
      expect(actor.onRemove).toHaveBeenCalledTimes(1);
    });
  });
});
