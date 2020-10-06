import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';
import { TestUtils } from './util/TestUtils';

describe('A game actor', () => {
  let actor: ex.Actor;

  let engine: ex.Engine;
  let scene: ex.Scene;

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine({ width: 100, height: 100 });
    actor = new ex.Actor();
    actor.body.collider.type = ex.CollisionType.Active;
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
      color: ex.Color.Red,
      visible: false
    });

    const actor2 = new ex.Actor({
      pos: new ex.Vector(4, 5)
    });

    expect(actor.pos.x).toBe(2);
    expect(actor.pos.y).toBe(3);
    expect(actor.width).toBe(100);
    expect(actor.height).toBe(200);
    expect(actor.vel.x).toBe(30);
    expect(actor.vel.y).toBe(40);
    expect(actor.acc.x).toBe(50);
    expect(actor.acc.y).toBe(60);
    expect(actor.rotation).toBe(2);
    expect(actor.rx).toBe(0.1);
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
    expect(actor.width).toBe(0);
    expect(actor.height).toBe(0);

    actor.width = 20;
    actor.height = 20;

    expect(actor.width).toBe(20);
    expect(actor.height).toBe(20);

    actor.scale.x = 2;
    actor.scale.y = 3;

    expect(actor.width).toBe(40);
    expect(actor.height).toBe(60);

    actor.scale.x = 0.5;
    actor.scale.y = 0.1;

    expect(actor.width).toBe(10);
    expect(actor.height).toBe(2);
  });

  it('can have its height and width scaled by parent', () => {
    actor.scale.setTo(2, 2);

    const child = new ex.Actor(0, 0, 50, 50);

    actor.add(child);

    expect(child.width).toBe(100);
    expect(child.height).toBe(100);

    actor.scale.setTo(0.5, 0.5);

    expect(child.width).toBe(25);
    expect(child.height).toBe(25);
  });

  it('can have a center point', () => {
    actor.height = 100;
    actor.width = 50;

    let center = actor.center;
    expect(center.x).toBe(0);
    expect(center.y).toBe(0);

    actor.pos.x = 100;
    actor.pos.y = 100;

    center = actor.center;
    expect(center.x).toBe(100);
    expect(center.y).toBe(100);

    // changing the anchor
    actor.anchor = new ex.Vector(0, 0);
    actor.pos.x = 0;
    actor.pos.y = 0;

    center = actor.center;
    expect(center.x).toBe(25);
    expect(center.y).toBe(50);

    actor.pos.x = 100;
    actor.pos.y = 100;

    center = actor.center;
    expect(center.x).toBe(125);
    expect(center.y).toBe(150);
  });

  it('has a left, right, top, and bottom', () => {
    actor.pos.x = 0;
    actor.pos.y = 0;
    actor.anchor = new ex.Vector(0.5, 0.5);
    actor.width = 100;
    actor.height = 100;

    expect(actor.body.collider.bounds.left).toBe(-50);
    expect(actor.body.collider.bounds.right).toBe(50);
    expect(actor.body.collider.bounds.top).toBe(-50);
    expect(actor.body.collider.bounds.bottom).toBe(50);
  });

  it('should have correct bounds when scaled', () => {
    actor.pos.x = 0;
    actor.pos.y = 0;
    actor.width = 100;
    actor.height = 100;
    actor.scale.setTo(2, 2);
    actor.anchor = new ex.Vector(0.5, 0.5);

    actor.body.collider.shape.recalc();

    expect(actor.body.collider.bounds.left).toBe(-100);
    expect(actor.body.collider.bounds.right).toBe(100);
    expect(actor.body.collider.bounds.top).toBe(-100);
    expect(actor.body.collider.bounds.bottom).toBe(100);
  });

  it('can collide with other actors', () => {
    const actor = new ex.Actor(0, 0, 10, 10);
    const other = new ex.Actor(10, 10, 10, 10);

    // Actors are adjacent and not overlapping should not collide
    expect(actor.body.collider.bounds.intersectWithSide(other.body.collider.bounds)).toBe(ex.Side.None);
    expect(other.body.collider.bounds.intersectWithSide(actor.body.collider.bounds)).toBe(ex.Side.None);

    // move other actor into collision range from the right side
    other.pos.x = 9;
    other.pos.y = 0;
    expect(actor.body.collider.bounds.intersectWithSide(other.body.collider.bounds)).toBe(ex.Side.Right);
    expect(other.body.collider.bounds.intersectWithSide(actor.body.collider.bounds)).toBe(ex.Side.Left);

    // move other actor into collision range from the left side
    other.pos.x = -9;
    other.pos.y = 0;
    expect(actor.body.collider.bounds.intersectWithSide(other.body.collider.bounds)).toBe(ex.Side.Left);
    expect(other.body.collider.bounds.intersectWithSide(actor.body.collider.bounds)).toBe(ex.Side.Right);

    // move other actor into collision range from the top
    other.pos.x = 0;
    other.pos.y = -9;
    expect(actor.body.collider.bounds.intersectWithSide(other.body.collider.bounds)).toBe(ex.Side.Top);
    expect(other.body.collider.bounds.intersectWithSide(actor.body.collider.bounds)).toBe(ex.Side.Bottom);

    // move other actor into collision range from the bottom
    other.pos.x = 0;
    other.pos.y = 9;
    expect(actor.body.collider.bounds.intersectWithSide(other.body.collider.bounds)).toBe(ex.Side.Bottom);
    expect(other.body.collider.bounds.intersectWithSide(actor.body.collider.bounds)).toBe(ex.Side.Top);
  });

  it('participates with another in a collision', () => {
    const actor = new ex.Actor(0, 0, 10, 10);
    actor.body.collider.type = ex.CollisionType.Active;
    const other = new ex.Actor(8, 0, 10, 10);
    other.body.collider.type = ex.CollisionType.Active;
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

    actor.actions.moveTo(10, 15, 1000);
    actor.update(engine, 1000);
    actor.update(engine, 1);

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
    actor.update(engine, 1);

    expect(grandChildActor.getWorldPos().x).toBe(70);
    expect(grandChildActor.getWorldPos().y).toBe(75);
  });

  it('can find its global coordinates if it doesnt have a parent', () => {
    expect(actor.pos.x).toBe(0);
    expect(actor.pos.y).toBe(0);

    actor.actions.moveBy(10, 15, 1000);
    actor.update(engine, 1000);
    actor.update(engine, 1);

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

  it('does not incur pointer overhead until an event is registered', () => {
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

  it('not drawn on opacity 0', () => {
    const invisibleActor = new ex.Actor();
    spyOn(invisibleActor, 'draw');
    scene.add(invisibleActor);
    invisibleActor.opacity = 0;
    invisibleActor.update(engine, 100);

    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(invisibleActor.draw).not.toHaveBeenCalled();
  });

  it('can be drawn with a z-index', (done) => {
    engine = TestUtils.engine({
      width: 62,
      height: 64,
      suppressHiDPIScaling: true
    });

    const green = new ex.Actor({ x: 50, y: 50, width: 40, height: 40, color: ex.Color.Green });
    const blue = new ex.Actor({ x: 40, y: 40, width: 40, height: 40, color: ex.Color.Blue });

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
    const texture = new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const sprite = new ex.Sprite({
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

      actor.draw(engine.ctx, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/opacity.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('will tick animations when drawing switched', (done) => {
    const texture = new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const sprite = new ex.Sprite({
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
      const animation = new ex.Animation({
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
    const texture = new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const sprite = new ex.Sprite({
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
      const animation = new ex.Animation({
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
    active.body.collider.type = ex.CollisionType.Active;
    active.vel.y = 10;
    active.acc.y = 1000;

    const fixed = new ex.Actor(-100, 50, 1000, 100);
    fixed.body.collider.type = ex.CollisionType.Fixed;

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
    active.body.collider.type = ex.CollisionType.Active;
    active.vel.y = -100;
    ex.Physics.acc.setTo(0, 0);

    const fixed = new ex.Actor(-100, 50, 1000, 100);
    fixed.body.collider.type = ex.CollisionType.Fixed;

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

      engine.input.pointers.triggerEvent('move', new ex.Vector(0, 0));

      expect(moveSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0), 0.001);
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

      engine.input.pointers.triggerEvent('move', new ex.Vector(30, 30));
      engine.input.pointers.triggerEvent('move', new ex.Vector(0, 0));

      expect(enterSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0), 0.001);
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

      engine.input.pointers.triggerEvent('move', new ex.Vector(0, 0));
      engine.input.pointers.triggerEvent('move', new ex.Vector(30, 30));

      expect(leaveSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(30, 30), 0.001);
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

      actor.update(engine, 100);
      engine.input.pointers.triggerEvent('down', new ex.Vector(0, 0));

      expect(dragStartSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0));
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

      engine.input.pointers.triggerEvent('down', new ex.Vector(0, 0));
      engine.input.pointers.triggerEvent('up', new ex.Vector(0, 0));

      expect(dragEndSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0));
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

      engine.input.pointers.triggerEvent('down', new ex.Vector(0, 0));
      engine.input.pointers.triggerEvent('move', new ex.Vector(0, 0));
      engine.input.pointers.triggerEvent('up', new ex.Vector(0, 0));

      expect(dragMoveSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0));
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

      engine.input.pointers.triggerEvent('down', new ex.Vector(-20, -20));
      engine.input.pointers.triggerEvent('move', new ex.Vector(0, 0));

      expect(dragEnterSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0));
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

      engine.input.pointers.triggerEvent('down', new ex.Vector(0, 0));
      engine.input.pointers.triggerEvent('move', new ex.Vector(30, 30));

      expect(dragLeaveSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(30, 30));
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

      engine.input.pointers.triggerEvent('down', new ex.Vector(0, 0));

      expect(bubblingSpy).toHaveBeenCalledTimes(1);
      expect(engine.input.pointers.at(0).lastWorldPos).toBeVector(new ex.Vector(0, 0));
    });

    it('only has pointer events happen once per frame', () => {
      const actor = new ex.Actor(0, 0, 100, 100);
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

    const texture = new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const actor = new ex.Actor({
        pos: new ex.Vector(engine.halfCanvasWidth, engine.halfCanvasHeight),
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

    expect(scene.remove).toHaveBeenCalledWith(<any>actor);
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

    actor.pos.x = 106;
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
