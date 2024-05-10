import { Engine } from './Engine';
import { Actor } from './Actor';
import { Color } from './Color';
import { Vector, vec } from './Math/vector';
import * as Util from './Util/Util';
import { Random } from './Math/Random';
import { CollisionType } from './Collision/CollisionType';
import { randomInRange } from './Math/util';
import { Graphic } from './Graphics';
import { EmitterType } from './EmitterType';
import { Particle, ParticleTransform, ParticleEmitterArgs } from './Particles';

/**
 * Using a particle emitter is a great way to create interesting effects
 * in your game, like smoke, fire, water, explosions, etc. `ParticleEmitter`
 * extend [[Actor]] allowing you to use all of the features that come with.
 */
export class ParticleEmitter extends Actor {
  private _particlesToEmit: number = 0;

  public numParticles: number = 0;

  /**
   * Random number generator
   */
  public random: Random;

  /**
   * Gets or sets the isEmitting flag
   */
  public isEmitting: boolean = true;
  /**
   * Gets or sets the backing particle collection
   */
  public particles: Particle[] = [];

  /**
   * Gets or sets the backing deadParticle collection
   */
  public deadParticles: Particle[] = [];

  /**
   * Gets or sets the minimum particle velocity
   */
  public minVel: number = 0;
  /**
   * Gets or sets the maximum particle velocity
   */
  public maxVel: number = 0;

  /**
   * Gets or sets the acceleration vector for all particles
   */
  public acceleration: Vector = new Vector(0, 0);

  /**
   * Gets or sets the minimum angle in radians
   */
  public minAngle: number = 0;
  /**
   * Gets or sets the maximum angle in radians
   */
  public maxAngle: number = 0;

  /**
   * Gets or sets the emission rate for particles (particles/sec)
   */
  public emitRate: number = 1; //particles/sec
  /**
   * Gets or sets the life of each particle in milliseconds
   */
  public particleLife: number = 2000;
  /**
   * Gets the opacity of each particle from 0 to 1.0
   */
  public get opacity(): number {
    return this.graphics.opacity;
  }
  /**
   * Gets the opacity of each particle from 0 to 1.0
   */
  public set opacity(opacity: number) {
    this.graphics.opacity = opacity;
  }
  /**
   * Gets or sets the fade flag which causes particles to gradually fade out over the course of their life.
   */
  public fadeFlag: boolean = false;

  /**
   * Gets or sets the optional focus where all particles should accelerate towards
   */
  public focus: Vector = null;
  /**
   * Gets or sets the acceleration for focusing particles if a focus has been specified
   */
  public focusAccel: number = null;
  /**
   * Gets or sets the optional starting size for the particles
   */
  public startSize: number = null;
  /**
   * Gets or sets the optional ending size for the particles
   */
  public endSize: number = null;

  /**
   * Gets or sets the minimum size of all particles
   */
  public minSize: number = 5;
  /**
   * Gets or sets the maximum size of all particles
   */
  public maxSize: number = 5;

  /**
   * Gets or sets the beginning color of all particles
   */
  public beginColor: Color = Color.White;
  /**
   * Gets or sets the ending color of all particles
   */
  public endColor: Color = Color.White;

  private _sprite: Graphic = null;
  /**
   * Gets or sets the sprite that a particle should use
   */
  public get particleSprite(): Graphic {
    return this._sprite;
  }

  public set particleSprite(val: Graphic) {
    if (val) {
      this._sprite = val;
    }
  }

  /**
   * Gets or sets the emitter type for the particle emitter
   */
  public emitterType: EmitterType = EmitterType.Rectangle;

  /**
   * Gets or sets the emitter radius, only takes effect when the [[emitterType]] is [[EmitterType.Circle]]
   */
  public radius: number = 0;

  /**
   * Gets or sets the particle rotational speed velocity
   */
  public particleRotationalVelocity: number = 0;

  /**
   * Indicates whether particles should start with a random rotation
   */
  public randomRotation: boolean = false;

  /**
   * Gets or sets the emitted particle transform style, [[ParticleTransform.Global]] is the default and emits particles as if
   * they were world space objects, useful for most effects.
   *
   * If set to [[ParticleTransform.Local]] particles are children of the emitter and move relative to the emitter
   * as they would in a parent/child actor relationship.
   */
  public particleTransform: ParticleTransform = ParticleTransform.Global;

  /**
   * @param config particle emitter options bag
   */
  constructor(config: ParticleEmitterArgs) {
    super({ width: config.width ?? 0, height: config.height ?? 0 });

    const {
      x,
      y,
      z,
      pos,
      isEmitting,
      minVel,
      maxVel,
      acceleration,
      minAngle,
      maxAngle,
      emitRate,
      particleLife,
      opacity,
      fadeFlag,
      focus,
      focusAccel,
      startSize,
      endSize,
      minSize,
      maxSize,
      beginColor,
      endColor,
      particleSprite,
      emitterType,
      radius,
      particleRotationalVelocity,
      particleTransform,
      randomRotation,
      random
    } = { ...config };

    this.pos = pos ?? vec(x ?? 0, y ?? 0);
    this.z = z ?? 0;
    this.isEmitting = isEmitting ?? this.isEmitting;
    this.minVel = minVel ?? this.minVel;
    this.maxVel = maxVel ?? this.maxVel;
    this.acceleration = acceleration ?? this.acceleration;
    this.minAngle = minAngle ?? this.minAngle;
    this.maxAngle = maxAngle ?? this.maxAngle;
    this.emitRate = emitRate ?? this.emitRate;
    this.particleLife = particleLife ?? this.particleLife;
    this.opacity = opacity ?? this.opacity;
    this.fadeFlag = fadeFlag ?? this.fadeFlag;
    this.focus = focus ?? this.focus;
    this.focusAccel = focusAccel ?? this.focusAccel;
    this.startSize = startSize ?? this.startSize;
    this.endSize = endSize ?? this.endSize;
    this.minSize = minSize ?? this.minSize;
    this.maxSize = maxSize ?? this.maxSize;
    this.beginColor = beginColor ?? this.beginColor;
    this.endColor = endColor ?? this.endColor;
    this.particleSprite = particleSprite ?? this.particleSprite;
    this.emitterType = emitterType ?? this.emitterType;
    this.radius = radius ?? this.radius;
    this.particleRotationalVelocity = particleRotationalVelocity ?? this.particleRotationalVelocity;
    this.randomRotation = randomRotation ?? this.randomRotation;
    this.particleTransform = particleTransform ?? this.particleTransform;

    this.body.collisionType = CollisionType.PreventCollision;

    this.random = random ?? new Random();
  }

  public removeParticle(particle: Particle) {
    this.deadParticles.push(particle);
  }

  /**
   * Causes the emitter to emit particles
   * @param particleCount  Number of particles to emit right now
   */
  public emitParticles(particleCount: number) {
    for (let i = 0; i < particleCount; i++) {
      const p = this._createParticle();
      this.particles.push(p);
      if (this?.scene?.world) {
        if (this.particleTransform === ParticleTransform.Global) {
          this.scene.world.add(p);
        } else {
          this.addChild(p);
        }
      }
    }
  }

  public clearParticles() {
    this.particles.length = 0;
  }

  // Creates a new particle given the constraints of the emitter
  private _createParticle(): Particle {
    // todo implement emitter constraints;
    let ranX = 0;
    let ranY = 0;

    const angle = randomInRange(this.minAngle, this.maxAngle, this.random);
    const vel = randomInRange(this.minVel, this.maxVel, this.random);
    const size = this.startSize || randomInRange(this.minSize, this.maxSize, this.random);
    const dx = vel * Math.cos(angle);
    const dy = vel * Math.sin(angle);

    if (this.emitterType === EmitterType.Rectangle) {
      ranX = randomInRange(0, this.width, this.random);
      ranY = randomInRange(0, this.height, this.random);
    } else if (this.emitterType === EmitterType.Circle) {
      const radius = randomInRange(0, this.radius, this.random);
      ranX = radius * Math.cos(angle);
      ranY = radius * Math.sin(angle);
    }

    const p = new Particle(
      this,
      this.particleLife,
      this.opacity,
      this.beginColor,
      this.endColor,
      new Vector(ranX, ranY),
      new Vector(dx, dy),
      this.acceleration,
      this.startSize,
      this.endSize,
      this.particleSprite
    );
    p.fadeFlag = this.fadeFlag;
    p.particleSize = size;
    p.particleRotationalVelocity = this.particleRotationalVelocity;
    if (this.randomRotation) {
      p.currentRotation = randomInRange(0, Math.PI * 2, this.random);
    }
    if (this.focus) {
      p.focus = this.focus.add(new Vector(this.pos.x, this.pos.y));
      p.focusAccel = this.focusAccel;
    }
    return p;
  }

  public update(engine: Engine, delta: number) {
    super.update(engine, delta);

    if (this.isEmitting) {
      this._particlesToEmit += this.emitRate * (delta / 1000);
      if (this._particlesToEmit > 1.0) {
        this.emitParticles(Math.floor(this._particlesToEmit));
        this._particlesToEmit = this._particlesToEmit - Math.floor(this._particlesToEmit);
      }
    }

    // deferred removal
    for (let i = 0; i < this.deadParticles.length; i++) {
      Util.removeItemFromArray(this.deadParticles[i], this.particles);
      if (this?.scene?.world) {
        this.scene.world.remove(this.deadParticles[i], false);
      }
    }
    this.deadParticles.length = 0;
  }
}
