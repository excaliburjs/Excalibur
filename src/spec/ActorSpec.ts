import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';
import { TestUtils } from './util/TestUtils';

const drawWithTransform = (ctx: CanvasRenderingContext2D, actor: ex.Actor, delta: number = 1) => {
  ctx.save();
  ctx.translate(actor.pos.x, actor.pos.y);
  ctx.rotate(actor.rotation);
  ctx.scale(actor.scale.x, actor.scale.y);
  actor.draw(ctx, delta);
  ctx.restore();
};

describe('A game actor', () => {
  let actor: ex.Actor;

  let engine: ex.Engine;
  let scene: ex.Scene;
  let motionSystem: ex.MotionSystem;
  let collisionSystem: ex.CollisionSystem;
  let actionSystem: ex.ActionsSystem;

  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  beforeEach(() => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    actor = new ex.Actor();
    actor.body.collisionType = ex.CollisionType.Active;
    motionSystem = new ex.MotionSystem();
    collisionSystem = new ex.CollisionSystem();
    actionSystem = new ex.ActionsSystem();
    scene = new ex.Scene();
    scene.add(actor);
    engine.addScene('test', scene);
    engine.goToScene('test');

    spyOn(scene, 'draw').and.callThrough();
    spyOn(scene, 'debugDraw').and.callThrough();

    spyOn(actor, 'draw');
    spyOn(actor, 'debugDraw');

    engine.start();
    collisionSystem.initialize(scene);
    scene.world.systemManager.get(ex.Input.PointerSystem).initialize(scene);

    ex.Physics.useArcadePhysics();
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
    actor.pos = ex.vec(10, 10);

    expect(actor.pos.x).toBe(10);
    expect(actor.pos.y).toBe(10);
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
    expect(actor.visible).toBe(false);
    expect(actor2.pos.x).toBe(4);
    expect(actor2.pos.y).toBe(5);
  });

  it('should have default properties set', () => {
    const actor = new ex.Actor();

    expect(actor.anchor).toEqual(ex.Actor.defaults.anchor);
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
    expect(actor.graphics.current[0].graphic).toBeInstanceOf(ex.Circle);
    expect((actor.graphics.current[0].graphic as ex.Circle).radius).toBe(10);
    expect((actor.graphics.current[0].graphic as ex.Circle).color).toEqual(ex.Color.Red);
    expect(actor.collider.get()).toBeInstanceOf(ex.CircleCollider);
  });

  it('can be created with a width/height with default rectangle collider and graphic', () => {
    const actor = new ex.Actor({ x: 50, y: 50, color: ex.Color.Red, width: 10, height: 10 });
    expect(actor.graphics.current[0].graphic).toBeInstanceOf(ex.Rectangle);
    expect((actor.graphics.current[0].graphic as ex.Rectangle).width).toBe(10);
    expect((actor.graphics.current[0].graphic as ex.Rectangle).height).toBe(10);
    expect((actor.graphics.current[0].graphic as ex.Rectangle).color).toEqual(ex.Color.Red);
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

    motionSystem.update([actor], 1000);

    expect(actor.oldPos.x).toBe(10);
    expect(actor.oldPos.y).toBe(10);
    expect(actor.pos.x).toBe(20);
    expect(actor.pos.y).toBe(20);
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

    motionSystem.update([actor], 1000);
    expect(actor.pos.x).toBe(-10);
    expect(actor.pos.y).toBe(10);

    motionSystem.update([actor], 1000);
    expect(actor.pos.x).toBe(-20);
    expect(actor.pos.y).toBe(20);
  });

  it('should have an old velocity after an update', () => {
    actor.pos = ex.vec(0, 0);
    actor.vel = ex.vec(10, 10);
    actor.acc = ex.vec(10, 10);

    motionSystem.update([actor], 1000);

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
    expect(actor.collider.bounds.intersectWithSide(other.collider.bounds)).toBe(ex.Side.Right);
    expect(other.collider.bounds.intersectWithSide(actor.collider.bounds)).toBe(ex.Side.Left);

    // move other actor into collision range from the left side
    other.pos.x = -9;
    other.pos.y = 0;
    expect(actor.collider.bounds.intersectWithSide(other.collider.bounds)).toBe(ex.Side.Left);
    expect(other.collider.bounds.intersectWithSide(actor.collider.bounds)).toBe(ex.Side.Right);

    // move other actor into collision range from the top
    other.pos.x = 0;
    other.pos.y = -9;
    expect(actor.collider.bounds.intersectWithSide(other.collider.bounds)).toBe(ex.Side.Top);
    expect(other.collider.bounds.intersectWithSide(actor.collider.bounds)).toBe(ex.Side.Bottom);

    // move other actor into collision range from the bottom
    other.pos.x = 0;
    other.pos.y = 9;
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
    collisionSystem.update([actor, other], 20);
    collisionSystem.update([actor, other], 20);
    scene.update(engine, 20);
    scene.update(engine, 20);

    expect(actorCalled).toBe('actor');
    expect(otherCalled).toBe('other');
  });

  it('is rotated along with its parent', () => {
    const rotation = ex.Util.toRadians(90);

    actor.pos = ex.vec(10, 10);
    actor.rotation = rotation;

    const child = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (20, 10)

    actor.addChild(child);
    motionSystem.update([actor], 100);

    expect(child.getGlobalPos().x).toBeCloseTo(10, 0.001);
    expect(child.getGlobalPos().y).toBeCloseTo(20, 0.001);
  });

  it('is rotated along with its grandparent', () => {
    const rotation = ex.Util.toRadians(90);

    actor.pos = ex.vec(10, 10);
    actor.rotation = rotation;

    const child = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (20, 10)
    const grandchild = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (30, 10)

    actor.addChild(child);
    child.addChild(grandchild);
    motionSystem.update([actor], 100);

    expect(grandchild.getGlobalRotation()).toBe(rotation);
    expect(grandchild.getGlobalPos().x).toBeCloseTo(10, 0.001);
    expect(grandchild.getGlobalPos().y).toBeCloseTo(30, 0.001);
  });

  it('is scaled along with its parent', () => {
    actor.anchor = ex.vec(0, 0);
    actor.pos = ex.vec(10, 10);
    actor.scale = ex.vec(2, 2);

    const child = new ex.Actor({ x: 10, y: 10, width: 10, height: 10 });

    actor.addChild(child);
    motionSystem.update([actor], 100);

    expect(child.getGlobalPos().x).toBe(30);
    expect(child.getGlobalPos().y).toBe(30);
  });

  it('is scaled along with its grandparent', () => {
    actor.anchor = ex.vec(0, 0);
    actor.pos = ex.vec(10, 10);
    actor.scale = ex.vec(2, 2);

    const child = new ex.Actor({ x: 10, y: 10, width: 10, height: 10 });
    const grandchild = new ex.Actor({ x: 10, y: 10, width: 10, height: 10 });

    actor.addChild(child);
    child.addChild(grandchild);
    motionSystem.update([actor], 100);

    // Logic:
    // p = (10, 10)
    // c = (10 * 2 + 10, 10 * 2 + 10) = (30, 30)
    // gc = (10 * 2 + 30, 10 * 2 + 30) = (50, 50)
    expect(grandchild.getGlobalPos().x).toBe(50);
    expect(grandchild.getGlobalPos().y).toBe(50);
  });

  it('is rotated and scaled along with its parent', () => {
    const rotation = ex.Util.toRadians(90);

    actor.pos = ex.vec(10, 10);
    actor.scale = ex.vec(2, 2);
    actor.rotation = rotation;

    const child = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (30, 10)

    actor.addChild(child);
    motionSystem.update([actor], 100);

    expect(child.getGlobalPos().x).toBeCloseTo(10, 0.001);
    expect(child.getGlobalPos().y).toBeCloseTo(30, 0.001);
  });

  it('is rotated and scaled along with its grandparent', () => {
    const rotation = ex.Util.toRadians(90);

    actor.pos = ex.vec(10, 10);
    actor.scale = ex.vec(2, 2);
    actor.rotation = rotation;

    const child = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (30, 10)
    const grandchild = new ex.Actor({ x: 10, y: 0, width: 10, height: 10 }); // (50, 10)

    actor.addChild(child);
    child.addChild(grandchild);
    motionSystem.update([actor], 100);

    expect(grandchild.getGlobalPos().x).toBeCloseTo(10, 0.001);
    expect(grandchild.getGlobalPos().y).toBeCloseTo(50, 0.001);
  });

  it('can find its global coordinates if it has a parent', () => {
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);

    const childActor = new ex.Actor({ x: 50, y: 50 });
    expect(childActor.pos.x).toBe(50);
    expect(childActor.pos.y).toBe(50);

    actor.addChild(childActor);

    actor.actions.moveTo(10, 15, 1000);
    actionSystem.update([actor], 1000);
    motionSystem.update([actor], 1000);
    actionSystem.update([actor], 1);
    motionSystem.update([actor], 1);

    expect(childActor.getGlobalPos().x).toBe(60);
    expect(childActor.getGlobalPos().y).toBe(65);
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

    expect(grandChildActor.getGlobalPos().x).toBe(70);
    expect(grandChildActor.getGlobalPos().y).toBe(75);
  });

  it('can find its global coordinates if it doesnt have a parent', () => {
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);

    actor.actions.moveBy(10, 15, 1000);
    actor.update(engine, 1000);
    scene.update(engine, 1000);
    actor.update(engine, 1);
    scene.update(engine, 1);

    expect(actor.getGlobalPos().x).toBe(10);
    expect(actor.getGlobalPos().y).toBe(15);
  });

  it('can be removed from the scene', () => {
    scene.add(actor);
    expect(scene.actors.length).toBe(1);
    actor.kill();
    scene.update(engine, 100);
    expect(scene.actors.length).toBe(0);
  });

  it('once killed is not drawn', () => {
    engine.stop();
    engine = null;
    engine = TestUtils.engine({ width: 100, height: 100 });
    actor = new ex.Actor();
    actor.body.collisionType = ex.CollisionType.Active;
    motionSystem = new ex.MotionSystem();
    collisionSystem = new ex.CollisionSystem();
    scene = new ex.Scene();
    scene.add(actor);
    engine.addScene('test', scene);
    engine.goToScene('test');
    scene._initialize(engine);

    spyOn(scene, 'draw').and.callThrough();
    spyOn(scene, 'debugDraw').and.callThrough();

    spyOn(actor, 'draw');
    spyOn(actor, 'debugDraw');

    scene.add(actor);
    actor.kill();
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);
    expect(actor.draw).not.toHaveBeenCalled();
  });

  it('does not change opacity on color', () => {
    actor.color = ex.Color.Black.clone();
    expect(actor.color.a).toBe(1);
    expect(actor.color.r).toBe(0);
    expect(actor.color.g).toBe(0);
    expect(actor.color.b).toBe(0);
    expect(actor.opacity).toBe(1.0);

    actor.opacity = 0.5;
    actor.update(engine, 100);
    expect(actor.color.a).toBe(1.0);
    expect(actor.color.r).toBe(0);
    expect(actor.color.g).toBe(0);
    expect(actor.color.b).toBe(0);
    expect(actor.opacity).toBe(0.5);
  });

  it('is drawn on opacity 0', () => {
    const invisibleActor = new ex.Actor();
    spyOn(invisibleActor, 'draw');
    scene.add(invisibleActor);
    invisibleActor.opacity = 0;
    invisibleActor.update(engine, 100);

    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(invisibleActor.draw).toHaveBeenCalled();
  });

  it('can be drawn with a z-index', (done) => {
    engine = TestUtils.engine({
      width: 100,
      height: 100,
      suppressHiDPIScaling: true,
      backgroundColor: ex.Color.Transparent
    });

    scene = new ex.Scene();
    engine.addScene('test', scene);
    engine.goToScene('test');
    engine.start();

    const green = new ex.Actor({ x: 35, y: 35, width: 50, height: 50, color: ex.Color.Green });
    const blue = new ex.Actor({ x: 65, y: 65, width: 50, height: 50, color: ex.Color.Blue });

    green.z = 1;
    blue.z = 2;

    // Actors currently need to be in a scene for z to work
    scene.add(blue);
    scene.add(green);

    scene.draw(engine.ctx, 100);

    ensureImagesLoaded(engine.canvas, 'src/spec/images/ActorSpec/zindex-blue-top.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);

      green.z = 2;
      blue.z = 1;
      scene.draw(engine.ctx, 100);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/ActorSpec/zindex-green-top.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can have a graphic drawn at an opacity', (done) => {
    engine = TestUtils.engine({
      width: 62,
      height: 64,
      suppressHiDPIScaling: true
    });
    const texture = new ex.LegacyDrawing.Texture('src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const sprite = new ex.LegacyDrawing.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });

      const actor = new ex.Actor({
        pos: new ex.Vector(engine.halfCanvasWidth, engine.halfCanvasHeight),
        width: 10,
        height: 10
      });

      actor.addDrawing(sprite);

      actor.opacity = 0.1;

      drawWithTransform(engine.ctx, actor, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/opacity.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('will tick animations when drawing switched', (done) => {
    const texture = new ex.LegacyDrawing.Texture('src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const sprite = new ex.LegacyDrawing.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });
      const animation = new ex.LegacyDrawing.Animation({
        engine: engine,
        sprites: [sprite, sprite],
        speed: 200,
        loop: false,
        anchor: new ex.Vector(1, 1),
        rotation: Math.PI,
        scale: new ex.Vector(2, 2),
        flipVertical: true,
        flipHorizontal: true,
        width: 100,
        height: 200
      });

      spyOn(animation, 'tick').and.callThrough();

      const actor = new ex.Actor({
        pos: new ex.Vector(engine.halfCanvasWidth, engine.halfCanvasHeight),
        width: 10,
        height: 10
      });

      actor.addDrawing('default', animation);
      actor.setDrawing('default');
      expect(animation.tick).toHaveBeenCalledWith(0);
      done();
    });
  });

  it('will tick animations on update', (done) => {
    const texture = new ex.LegacyDrawing.Texture('src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const sprite = new ex.LegacyDrawing.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });
      const animation = new ex.LegacyDrawing.Animation({
        engine: engine,
        sprites: [sprite, sprite],
        speed: 200,
        loop: false,
        anchor: new ex.Vector(1, 1),
        rotation: Math.PI,
        scale: new ex.Vector(2, 2),
        flipVertical: true,
        flipHorizontal: true,
        width: 100,
        height: 200
      });

      spyOn(animation, 'tick').and.callThrough();

      const actor = new ex.Actor({
        pos: new ex.Vector(engine.halfCanvasWidth, engine.halfCanvasHeight),
        width: 10,
        height: 10
      });

      actor.addDrawing('anim', animation);
      actor.setDrawing('anim');
      actor.update(engine, 100);
      expect(animation.tick).toHaveBeenCalledWith(100, engine.stats.currFrame.id);
      done();
    });
  });

  it('can detect containment off of child actors', () => {
    const parent = new ex.Actor({ x: 600, y: 100, width: 100, height: 100 });
    const child = new ex.Actor({ x: 0, y: 0, width: 100, height: 100 });
    const child2 = new ex.Actor({ x: -600, y: -100, width: 100, height: 100 });

    parent.addChild(child);
    child.addChild(child2);

    // check reality
    expect(parent.contains(550.01, 50.01)).withContext('(550.1, 50.1) is top-left of parent should be contained').toBeTruthy();
    expect(parent.contains(650, 150)).withContext('(650, 150) is bottom-right of parent should be contained').toBeTruthy();

    // in world coordinates this should be false
    expect(child.contains(50, 50)).withContext('(50, 50) world coords is outside child world pos').toBeFalsy();

    // in world coordinates this should be true
    expect(child.contains(550.01, 50.01)).withContext('(550.1, 50.1) world should be top-left of of child').toBeTruthy();
    expect(child.contains(650, 150)).withContext('(650, 150) world should be bottom-rght of child').toBeTruthy();

    // second order child shifted to the origin
    expect(child2.contains(-49.99, -49.99)).withContext('(-50, -50) world should be top left of second order child').toBeTruthy();
    expect(child2.contains(50, 50)).withContext('(50, 50) world should be bottom right of second order child').toBeTruthy();
  });

  it('can recursively check containment', () => {
    const parent = new ex.Actor({ x: 0, y: 0, width: 100, height: 100 });
    const child = new ex.Actor({ x: 100, y: 100, width: 100, height: 100 });
    const child2 = new ex.Actor({ x: 100, y: 100, width: 100, height: 100 });
    parent.addChild(child);

    expect(parent.contains(150, 150)).toBeFalsy();
    expect(child.contains(150, 150)).toBeTruthy();
    expect(parent.contains(150, 150, true)).toBeTruthy();
    expect(parent.contains(200, 200, true)).toBeFalsy();

    child.addChild(child2);
    expect(parent.contains(250, 250, true)).toBeTruthy();
  });

  it('with an active collision type can be placed on a fixed type', () => {
    ex.Physics.useArcadePhysics();
    const scene = new ex.Scene();
    engine.add('somescene', scene);
    engine.goToScene('somescene');
    scene._initialize(engine);

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

  it('with an active collision type can jump on a fixed type', () => {
    const scene = new ex.Scene();
    scene._initialize(engine);
    const active = new ex.Actor({ x: 0, y: -50, width: 100, height: 100 });
    active.body.collisionType = ex.CollisionType.Active;
    active.vel.y = -100;
    ex.Physics.acc.setTo(0, 0);

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
    parentActor.addChild(childActor);

    spyOn(childActor, 'update');

    scene.update(engine, 100);

    expect(childActor.update).toHaveBeenCalled();
  });

  it('draws visible child actors', () => {
    const parentActor = new ex.Actor();
    const childActor = new ex.Actor();
    scene.add(parentActor);
    parentActor.addChild(childActor);

    spyOn(childActor, 'draw');

    childActor.visible = true;
    scene.draw(engine.ctx, 100);
    expect(childActor.draw).toHaveBeenCalled();
  });

  it('does not draw invisible child actors', () => {
    const parentActor = new ex.Actor();
    const childActor = new ex.Actor();
    scene.add(parentActor);
    parentActor.addChild(childActor);

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

  it('fires initialize event when before the first update', (done) => {
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
    let predrawFired = false;
    actor.on('predraw', () => {
      predrawFired = true;
    });

    actor.on('postdraw', () => {
      expect(predrawFired).toBe(true);
      done();
    });

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);
  });

  describe('should detect assigned events and', () => {
    it('should capture pointer move event', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const callables = {
        move: (pe: any) => {
          /* doesn't matter; */
        }
      };
      const moveSpy = spyOn(callables, 'move').and.callThrough();

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
      const enterSpy = spyOn(callables, 'enter').and.callThrough();

      actor.on('pointerenter', callables.enter);
      scene.add(actor);

      engine.input.pointers.triggerEvent('move', new ex.Vector(30, 30));
      engine.input.pointers.triggerEvent('move', new ex.Vector(0, 0));

      expect(enterSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0), 0.001);
    });

    it('should capture pointer leave event', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });

      const leaveSpy = jasmine.createSpy('leave');
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
      const dragStartSpy = spyOn(callables, 'dragStart').and.callThrough();

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
      const dragEndSpy = spyOn(callables, 'dragEnd').and.callThrough();

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
      const dragMoveSpy = spyOn(callables, 'dragMove').and.callThrough();

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
      const dragEnterSpy = jasmine.createSpy('dragenter');

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
      const dragLeaveSpy = jasmine.createSpy('dragLeave');

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
      const bubblingSpy = spyOn(callables, 'pointerDown').and.callThrough();

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

      expect(numPointerUps).toBe(1, 'Pointer up should be triggered once');
    });
  });

  it('should not corrupt shared sprite contexts', (done) => {
    engine = TestUtils.engine({
      width: 62,
      height: 64,
      suppressHiDPIScaling: true
    });

    const texture = new ex.LegacyDrawing.Texture('src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const actor = new ex.Actor({
        pos: new ex.Vector(engine.halfCanvasWidth, engine.halfCanvasHeight),
        width: 10,
        height: 10,
        rotation: Math.PI / 4
      });

      engine.add(actor);
      const s = texture.asSprite();
      s.scale = ex.vec(1, 1);
      actor.addDrawing(s);

      const a1 = new ex.Actor({ scale: new ex.Vector(3, 3) });
      a1.scale = ex.vec(3, 3);
      a1.addDrawing(texture);

      const a2 = new ex.Actor({ scale: new ex.Vector(3, 3) });
      a1.scale = ex.vec(3, 3);
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
      drawWithTransform(engine.ctx, actor, 100);

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

    expect(actor.isOffScreen).toBe(false, 'Actor should be onscreen');

    actor.pos = ex.vec(106, actor.pos.y);
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

    it('can have onInitialize overridden safely', () => {
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

    it('can have onPostUpdate overridden safely', () => {
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

    it('can have onPreUpdate overridden safely', () => {
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

    it('can have onPreDraw overridden safely', () => {
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

    it('can have onPostDraw overridden safely', () => {
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

    it('can have onPreKill overridden safely', () => {
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

    it('can have onPostKill overridden safely', () => {
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
