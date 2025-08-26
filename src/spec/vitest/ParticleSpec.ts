import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A particle', () => {
  let engine: ex.Engine;
  let scene: ex.Scene;
  beforeEach(async () => {
    engine = TestUtils.engine(
      {
        width: 800,
        height: 200,
        backgroundColor: ex.Color.Black
      },
      []
    );
    scene = new ex.Scene();
    engine.addScene('root', scene);
    await TestUtils.runToReady(engine);
    const clock = engine.clock as ex.TestClock;
    clock.step(1);
  });
  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('should have props set by the constructor', () => {
    const emitter = new ex.ParticleEmitter({
      pos: new ex.Vector(400, 100),
      width: 20,
      height: 30,
      isEmitting: true,
      particle: {
        minSpeed: 40,
        maxSpeed: 50,
        acc: ex.Vector.Zero.clone(),
        minAngle: 0,
        maxAngle: Math.PI / 2,
        life: 4,
        opacity: 0.5,
        fade: false,
        startSize: 1,
        endSize: 10,
        minSize: 1,
        maxSize: 3,
        beginColor: ex.Color.Red.clone(),
        endColor: ex.Color.Blue.clone(),
        graphic: null,
        angularVelocity: 3,
        randomRotation: false
      },
      emitRate: 3,
      emitterType: ex.EmitterType.Circle,
      radius: 20,
      random: new ex.Random(1337)
    });

    expect(emitter.pos.x).toBe(400);
    expect(emitter.pos.y).toBe(100);
    expect(emitter.width).toBe(20);
    expect(emitter.height).toBe(30);
    expect(emitter.isEmitting).toBe(true);
    expect(emitter.particle.minSpeed).toBe(40);
    expect(emitter.particle.maxSpeed).toBe(50);
    expect(emitter.acc.toString()).toBe(ex.Vector.Zero.clone().toString());
    expect(emitter.particle.minAngle).toBe(0);
    expect(emitter.particle.maxAngle).toBe(Math.PI / 2);
    expect(emitter.emitRate).toBe(3);
    expect(emitter.particle.life).toBe(4);
    expect(emitter.particle.opacity).toBe(0.5);
    expect(emitter.particle.fade).toBe(false);
    expect(emitter.particle.focus).toBe(undefined);
    expect(emitter.particle.focusAccel).toBe(undefined);
    expect(emitter.particle.startSize).toBe(1);
    expect(emitter.particle.endSize).toBe(10);
    expect(emitter.particle.minSize).toBe(1);
    expect(emitter.particle.maxSize).toBe(3);
    expect(emitter.particle.beginColor.toString()).toBe(ex.Color.Red.clone().toString());
    expect(emitter.particle.endColor.toString()).toBe(ex.Color.Blue.clone().toString());
    expect(emitter.particle.graphic).toBe(null);
    expect(emitter.emitterType).toBe(ex.EmitterType.Circle);
    expect(emitter.radius).toBe(20);
    expect(emitter.particle.angularVelocity).toBe(3);
    expect(emitter.particle.randomRotation).toBe(false);
    expect(emitter.random.seed).toBe(1337);
  });

  it('should emit particles', async () => {
    const emitter = new ex.ParticleEmitter({
      pos: new ex.Vector(400, 100),
      width: 20,
      height: 30,
      isEmitting: true,
      emitRate: 5,
      particle: {
        minSpeed: 100,
        maxSpeed: 200,
        acc: ex.Vector.Zero.clone(),
        minAngle: 0,
        maxAngle: Math.PI / 2,
        life: 4000,
        opacity: 0.5,
        fade: false,
        startSize: 30,
        endSize: 40,
        beginColor: ex.Color.Red.clone(),
        endColor: ex.Color.Blue.clone(),
        graphic: null,
        angularVelocity: 3,
        randomRotation: false
      },
      focus: null,
      focusAccel: null,
      emitterType: ex.EmitterType.Circle,
      radius: 20,
      random: new ex.Random(1337)
    });
    engine.backgroundColor = ex.Color.Transparent;
    engine.add(emitter);
    emitter.emitParticles(10);

    engine.currentScene.update(engine, 100);
    engine.currentScene.update(engine, 100);
    engine.currentScene.update(engine, 100);
    engine.currentScene.draw(engine.graphicsContext, 100);
    engine.graphicsContext.flush();
    await expect(engine.canvas).toEqualImage('/src/spec/assets/images/ParticleSpec/Particles.png');
  });

  it('should clear particles', async () => {
    const emitter = new ex.ParticleEmitter({
      pos: new ex.Vector(400, 100),
      width: 20,
      height: 30,
      isEmitting: true,
      emitRate: 5,
      particle: {
        minSpeed: 100,
        maxSpeed: 200,
        acc: ex.Vector.Zero.clone(),
        minAngle: 0,
        maxAngle: Math.PI / 2,
        life: 4000,
        opacity: 0.5,
        fade: false,
        startSize: 30,
        endSize: 40,
        beginColor: ex.Color.Red.clone(),
        endColor: ex.Color.Blue.clone(),
        graphic: null,
        angularVelocity: 3,
        randomRotation: false
      },
      focus: null,
      focusAccel: null,
      emitterType: ex.EmitterType.Circle,
      radius: 20,
      random: new ex.Random(1337)
    });
    engine.backgroundColor = ex.Color.Transparent;
    engine.add(emitter);
    emitter.emitParticles(10);
    emitter.clearParticles();

    engine.currentScene.update(engine, 100);
    engine.currentScene.update(engine, 100);
    engine.currentScene.update(engine, 100);
    engine.currentScene.draw(engine.graphicsContext, 100);
    engine.graphicsContext.flush();
    await expect(engine.canvas).toEqualImage('/src/spec/assets/images/ParticleSpec/clear.png');
  });

  it('can be parented', async () => {
    const emitter = new ex.ParticleEmitter({
      pos: new ex.Vector(0, 0),
      width: 20,
      height: 30,
      isEmitting: true,
      emitRate: 5,
      particle: {
        minSpeed: 100,
        maxSpeed: 200,
        acc: ex.Vector.Zero.clone(),
        minAngle: 0,
        maxAngle: Math.PI / 2,
        life: 4000,
        opacity: 0.5,
        fade: false,
        startSize: 30,
        endSize: 40,
        beginColor: ex.Color.Red.clone(),
        endColor: ex.Color.Blue.clone(),
        graphic: null,
        angularVelocity: 3,
        randomRotation: false
      },
      focus: null,
      focusAccel: null,
      emitterType: ex.EmitterType.Circle,
      radius: 20,
      random: new ex.Random(1337)
    });

    const parent = new ex.Actor({
      pos: ex.vec(100, 50),
      width: 10,
      height: 10
    });
    parent.addChild(emitter);

    engine.backgroundColor = ex.Color.Transparent;
    engine.add(emitter);

    emitter.emitParticles(20);
    engine.currentScene.update(engine, 100);
    engine.currentScene.update(engine, 100);
    engine.currentScene.update(engine, 100);
    engine.currentScene.draw(engine.graphicsContext, 100);
    engine.graphicsContext.flush();
    await expect(engine.canvas).toEqualImage('/src/spec/assets/images/ParticleSpec/parented.png');
  });

  it('can set the particle transform to local making particles children of the emitter', () => {
    const emitter = new ex.ParticleEmitter({
      particle: {
        transform: ex.ParticleTransform.Local,
        minSpeed: 100,
        maxSpeed: 200,
        acc: ex.Vector.Zero.clone(),
        minAngle: 0,
        maxAngle: Math.PI / 2,
        life: 4000,
        fade: false,
        opacity: 0.5,
        startSize: 30,
        endSize: 40,
        beginColor: ex.Color.Red.clone(),
        endColor: ex.Color.Blue.clone(),
        graphic: null,
        angularVelocity: 3,
        randomRotation: false
      },
      pos: new ex.Vector(0, 0),
      width: 20,
      height: 30,
      isEmitting: true,
      emitRate: 5,
      focus: null,
      focusAccel: null,
      emitterType: ex.EmitterType.Circle,
      radius: 20,
      random: new ex.Random(1337)
    });
    engine.add(emitter);
    emitter.emitParticles(20);
    expect(emitter.children.length).toBe(20);
    expect(engine.currentScene.actors.length).toBe(1);
  });

  it('can set the particle transform to global adding particles directly to the scene', () => {
    const emitter = new ex.ParticleEmitter({
      particle: {
        transform: ex.ParticleTransform.Global,
        minSpeed: 100,
        maxSpeed: 200,
        acc: ex.Vector.Zero.clone(),
        minAngle: 0,
        maxAngle: Math.PI / 2,
        life: 4000,
        opacity: 0.5,
        fade: false,
        startSize: 30,
        endSize: 40,
        beginColor: ex.Color.Red.clone(),
        endColor: ex.Color.Blue.clone(),
        graphic: null,
        angularVelocity: 3,
        randomRotation: false
      },
      pos: new ex.Vector(0, 0),
      z: 5,
      width: 20,
      height: 30,
      isEmitting: true,
      emitRate: 5,
      focus: null,
      focusAccel: null,
      emitterType: ex.EmitterType.Circle,
      radius: 20,
      random: new ex.Random(1337)
    });
    engine.add(emitter);
    emitter.emitParticles(20);
    expect(emitter.children.length).toBe(0);
    expect(engine.currentScene.actors.length).toBe(1);
    expect(engine.currentScene.world.entityManager.entities.length).toBe(21);
    expect(
      engine.currentScene.world.entityManager.entities
        .filter((entity) => entity instanceof ex.Particle)
        .every((entity) => entity.transform.z === 5)
    ).toBeTruthy();
  });
});
