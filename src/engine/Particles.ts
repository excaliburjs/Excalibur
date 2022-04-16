import { Engine } from './Engine';
import { Actor } from './Actor';
import { Color } from './Color';
import { Vector, vec } from './Math/vector';
import * as Util from './Util/Util';
import { Configurable } from './Configurable';
import { Random } from './Math/Random';
import { CollisionType } from './Collision/CollisionType';
import { TransformComponent } from './EntityComponentSystem/Components/TransformComponent';
import { GraphicsComponent } from './Graphics/GraphicsComponent';
import { Entity } from './EntityComponentSystem/Entity';
import { Sprite } from './Graphics/Sprite';
import { BoundingBox } from './Collision/BoundingBox';
import { clamp, randomInRange } from './Math/util';

/**
 * An enum that represents the types of emitter nozzles
 */
export enum EmitterType {
  /**
   * Constant for the circular emitter type
   */
  Circle,
  /**
   * Constant for the rectangular emitter type
   */
  Rectangle
}

/**
 * @hidden
 */
export class ParticleImpl extends Entity {
  public position: Vector = new Vector(0, 0);
  public velocity: Vector = new Vector(0, 0);
  public acceleration: Vector = new Vector(0, 0);
  public particleRotationalVelocity: number = 0;
  public currentRotation: number = 0;

  public focus: Vector = null;
  public focusAccel: number = 0;
  public opacity: number = 1;
  public beginColor: Color = Color.White;
  public endColor: Color = Color.White;

  // Life is counted in ms
  public life: number = 300;
  public fadeFlag: boolean = false;

  // Color transitions
  private _rRate: number = 1;
  private _gRate: number = 1;
  private _bRate: number = 1;
  private _aRate: number = 0;
  private _currentColor: Color = Color.White;

  public emitter: ParticleEmitter = null;
  public particleSize: number = 5;
  public particleSprite: Sprite = null;

  public startSize: number;
  public endSize: number;
  public sizeRate: number = 0;
  public elapsedMultiplier: number = 0;

  public visible = true;
  public isOffscreen = false;

  public transform: TransformComponent;
  public graphics: GraphicsComponent;

  constructor(
    emitterOrConfig: ParticleEmitter | ParticleArgs,
    life?: number,
    opacity?: number,
    beginColor?: Color,
    endColor?: Color,
    position?: Vector,
    velocity?: Vector,
    acceleration?: Vector,
    startSize?: number,
    endSize?: number
  ) {
    super();
    let emitter = emitterOrConfig;
    if (emitter && !(emitterOrConfig instanceof ParticleEmitter)) {
      const config = emitterOrConfig;
      emitter = config.emitter;
      life = config.life;
      opacity = config.opacity;
      endColor = config.endColor;
      beginColor = config.beginColor;
      position = config.position;
      velocity = config.velocity;
      acceleration = config.acceleration;
      startSize = config.startSize;
      endSize = config.endSize;
    }
    this.emitter = <ParticleEmitter>emitter;
    this.life = life || this.life;
    this.opacity = opacity || this.opacity;
    this.endColor = endColor || this.endColor.clone();
    this.beginColor = beginColor || this.beginColor.clone();
    this._currentColor = this.beginColor.clone();
    this.position = (position || this.position).add(this.emitter.pos);
    this.velocity = velocity || this.velocity;
    this.acceleration = acceleration || this.acceleration;
    this._rRate = (this.endColor.r - this.beginColor.r) / this.life;
    this._gRate = (this.endColor.g - this.beginColor.g) / this.life;
    this._bRate = (this.endColor.b - this.beginColor.b) / this.life;
    this._aRate = this.opacity / this.life;

    this.startSize = startSize || 0;
    this.endSize = endSize || 0;

    if (this.endSize > 0 && this.startSize > 0) {
      this.sizeRate = (this.endSize - this.startSize) / this.life;
      this.particleSize = this.startSize;
    }

    this.addComponent((this.transform = new TransformComponent()));
    this.addComponent((this.graphics = new GraphicsComponent()));

    this.transform.pos = this.position;
    this.transform.rotation = this.currentRotation;
    this.transform.scale = vec(1, 1); // TODO wut
    if (this.particleSprite) {
      this.graphics.opacity = this.opacity;
      this.graphics.use(this.particleSprite);
    } else {
      this.graphics.localBounds = BoundingBox.fromDimension(this.particleSize, this.particleSize, Vector.Half);
      this.graphics.onPostDraw = (ctx) => {
        ctx.save();
        this.graphics.opacity = this.opacity;
        const tmpColor = this._currentColor.clone();
        tmpColor.a = 1;
        ctx.debug.drawPoint(vec(0, 0), { color: tmpColor, size: this.particleSize });
        ctx.restore();
      };
    }
  }

  public kill() {
    this.emitter.removeParticle(this);
  }

  public update(_engine: Engine, delta: number) {
    this.life = this.life - delta;
    this.elapsedMultiplier = this.elapsedMultiplier + delta;

    if (this.life < 0) {
      this.kill();
    }

    if (this.fadeFlag) {
      this.opacity = clamp(this._aRate * this.life, 0.0001, 1);
    }

    if (this.startSize > 0 && this.endSize > 0) {
      this.particleSize = clamp(
        this.sizeRate * delta + this.particleSize,
        Math.min(this.startSize, this.endSize),
        Math.max(this.startSize, this.endSize)
      );
    }

    this._currentColor.r = clamp(this._currentColor.r + this._rRate * delta, 0, 255);
    this._currentColor.g = clamp(this._currentColor.g + this._gRate * delta, 0, 255);
    this._currentColor.b = clamp(this._currentColor.b + this._bRate * delta, 0, 255);
    this._currentColor.a = clamp(this.opacity, 0.0001, 1);

    if (this.focus) {
      const accel = this.focus
        .sub(this.position)
        .normalize()
        .scale(this.focusAccel)
        .scale(delta / 1000);
      this.velocity = this.velocity.add(accel);
    } else {
      this.velocity = this.velocity.add(this.acceleration.scale(delta / 1000));
    }
    this.position = this.position.add(this.velocity.scale(delta / 1000));

    if (this.particleRotationalVelocity) {
      this.currentRotation = (this.currentRotation + (this.particleRotationalVelocity * delta) / 1000) % (2 * Math.PI);
    }

    this.transform.pos = this.position;
    this.transform.rotation = this.currentRotation;
    this.transform.scale = vec(1, 1); // todo wut
    this.graphics.opacity = this.opacity;
  }
}

export interface ParticleArgs extends Partial<ParticleImpl> {
  emitter: ParticleEmitter;
  position?: Vector;
  velocity?: Vector;
  acceleration?: Vector;
  particleRotationalVelocity?: number;
  currentRotation?: number;
  particleSize?: number;
  particleSprite?: Sprite;
}

/**
 * Particle is used in a [[ParticleEmitter]]
 */
export class Particle extends Configurable(ParticleImpl) {
  constructor(config: ParticleArgs);
  constructor(
    emitter: ParticleEmitter,
    life?: number,
    opacity?: number,
    beginColor?: Color,
    endColor?: Color,
    position?: Vector,
    velocity?: Vector,
    acceleration?: Vector,
    startSize?: number,
    endSize?: number
  );
  constructor(
    emitterOrConfig: ParticleEmitter | ParticleArgs,
    life?: number,
    opacity?: number,
    beginColor?: Color,
    endColor?: Color,
    position?: Vector,
    velocity?: Vector,
    acceleration?: Vector,
    startSize?: number,
    endSize?: number
  ) {
    super(emitterOrConfig, life, opacity, beginColor, endColor, position, velocity, acceleration, startSize, endSize);
  }
}

export interface ParticleEmitterArgs {
  x?: number;
  y?: number;
  pos?: Vector;
  width?: number;
  height?: number;
  isEmitting?: boolean;
  minVel?: number;
  maxVel?: number;
  acceleration?: Vector;
  minAngle?: number;
  maxAngle?: number;
  emitRate?: number;
  particleLife?: number;
  opacity?: number;
  fadeFlag?: boolean;
  focus?: Vector;
  focusAccel?: number;
  startSize?: number;
  endSize?: number;
  minSize?: number;
  maxSize?: number;
  beginColor?: Color;
  endColor?: Color;
  particleSprite?: Sprite;
  emitterType?: EmitterType;
  radius?: number;
  particleRotationalVelocity?: number;
  randomRotation?: boolean;
  random?: Random;
}

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
    return super.graphics.opacity;
  }
  /**
   * Gets the opacity of each particle from 0 to 1.0
   */
  public set opacity(opacity: number) {
    super.graphics.opacity = opacity;
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

  private _sprite: Sprite = null;
  /**
   * Gets or sets the sprite that a particle should use
   */
  public get particleSprite(): Sprite {
    return this._sprite;
  }

  public set particleSprite(val: Sprite) {
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
   * @param config particle emitter options bag
   */
  constructor(config: ParticleEmitterArgs) {
    super({ width: config.width ?? 0, height: config.height ?? 0 });

    const {
      x,
      y,
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
      randomRotation,
      random
    } = { ...config };

    this.pos = pos ?? vec(x ?? 0, y ?? 0);
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
        this.scene.world.add(p);
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
      this.endSize
    );
    p.fadeFlag = this.fadeFlag;
    p.particleSize = size;
    if (this.particleSprite) {
      p.particleSprite = this.particleSprite;
      p.graphics.opacity = this.opacity;
      p.graphics.use(this._sprite);
    }
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
