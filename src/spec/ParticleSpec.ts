import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

const drawWithTransform = (ctx: CanvasRenderingContext2D, actor: ex.Actor, delta: number = 1) => {
  ctx.save();
  ctx.translate(actor.pos.x, actor.pos.y);
  ctx.rotate(actor.rotation);
  ctx.scale(actor.scale.x, actor.scale.y);
  actor.draw(ctx, delta);
  ctx.restore();
};

describe('A particle', () => {
  let engine: ex.Engine;
  let texture: ex.Texture;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine({
      width: 800,
      height: 200
    });

    texture = new ex.Texture('base/src/spec/images/SpriteFontSpec/SpriteFont.png', true);
  });
  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('should have props set by the constructor', () => {
    const emitter = new ex.ParticleEmitter({
      pos: new ex.Vector(400, 100),
      width: 20,
      height: 30,
      isEmitting: true,
      minVel: 40,
      maxVel: 50,
      acceleration: ex.Vector.Zero.clone(),
      minAngle: 0,
      maxAngle: Math.PI / 2,
      emitRate: 3,
      particleLife: 4,
      opacity: 0.5,
      fadeFlag: false,
      focus: null,
      focusAccel: null,
      startSize: 1,
      endSize: 10,
      minSize: 1,
      maxSize: 3,
      beginColor: ex.Color.Red.clone(),
      endColor: ex.Color.Blue.clone(),
      particleSprite: null,
      emitterType: ex.EmitterType.Circle,
      radius: 20,
      particleRotationalVelocity: 3,
      randomRotation: false,
      random: new ex.Random(1337)
    });

    expect(emitter.pos.x).toBe(400);
    expect(emitter.pos.y).toBe(100);
    expect(emitter.width).toBe(20);
    expect(emitter.height).toBe(30);
    expect(emitter.isEmitting).toBe(true);
    expect(emitter.minVel).toBe(40);
    expect(emitter.maxVel).toBe(50);
    expect(emitter.acceleration.toString()).toBe(ex.Vector.Zero.clone().toString());
    expect(emitter.minAngle).toBe(0);
    expect(emitter.maxAngle).toBe(Math.PI / 2);
    expect(emitter.emitRate).toBe(3);
    expect(emitter.particleLife).toBe(4);
    expect(emitter.opacity).toBe(0.5);
    expect(emitter.fadeFlag).toBe(false);
    expect(emitter.focus).toBe(null);
    expect(emitter.focusAccel).toBe(null);
    expect(emitter.startSize).toBe(1);
    expect(emitter.endSize).toBe(10);
    expect(emitter.minSize).toBe(1);
    expect(emitter.maxSize).toBe(3);
    expect(emitter.beginColor.toString()).toBe(ex.Color.Red.clone().toString());
    expect(emitter.endColor.toString()).toBe(ex.Color.Blue.clone().toString());
    expect(emitter.particleSprite).toBe(null);
    expect(emitter.emitterType).toBe(ex.EmitterType.Circle);
    expect(emitter.radius).toBe(20);
    expect(emitter.particleRotationalVelocity).toBe(3);
    expect(emitter.randomRotation).toBe(false);
    expect(emitter.random.seed).toBe(1337);
  });

  it('should emit particles', (done) => {
    const emitter = new ex.ParticleEmitter({
      pos: new ex.Vector(400, 100),
      width: 20,
      height: 30,
      isEmitting: true,
      minVel: 100,
      maxVel: 200,
      acceleration: ex.Vector.Zero.clone(),
      minAngle: 0,
      maxAngle: Math.PI / 2,
      emitRate: 5,
      particleLife: 4000,
      opacity: 0.5,
      fadeFlag: false,
      focus: null,
      focusAccel: null,
      startSize: 30,
      endSize: 40,
      beginColor: ex.Color.Red.clone(),
      endColor: ex.Color.Blue.clone(),
      particleSprite: null,
      emitterType: ex.EmitterType.Circle,
      radius: 20,
      particleRotationalVelocity: 3,
      randomRotation: false,
      random: new ex.Random(1337)
    });

    emitter.emitParticles(10);
    emitter.update(engine, 100);
    emitter.update(engine, 100);
    emitter.update(engine, 100);

    drawWithTransform(engine.ctx, emitter, 100);

    ensureImagesLoaded(engine.canvas, 'src/spec/images/ParticleSpec/Particles.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);
      done();
    });
  });
});
