import { Engine } from '../Engine';
import { Color } from '../Color';
import { Vector, vec } from '../Math/vector';
import { Random } from '../Math/Random';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { GraphicsComponent } from '../Graphics/GraphicsComponent';
import { Entity } from '../EntityComponentSystem/Entity';
import { BoundingBox } from '../Collision/BoundingBox';
import { clamp } from '../Math/util';
import { Graphic } from '../Graphics';
import { EmitterType } from './EmitterType';
import { MotionComponent } from '../EntityComponentSystem';
import { EulerIntegrator } from '../Collision/Integrator';
import type { ParticleEmitter } from './ParticleEmitter';

/**
/**
 * CPU Particle is used in a {@apilink ParticleEmitter}
 */
export class Particle extends Entity {
  public static DefaultConfig: ParticleConfig = {
    beginColor: Color.White,
    endColor: Color.White,
    life: 300,
    fade: false,
    size: 5,
    graphic: undefined,
    startSize: undefined,
    endSize: undefined
  };

  public focus?: Vector;
  public focusAccel?: number;
  public beginColor: Color = Color.White;
  public endColor: Color = Color.White;

  // Life is counted in ms
  public life: number = 300;
  public fade: boolean = false;

  // Color transitions
  private _rRate: number = 1;
  private _gRate: number = 1;
  private _bRate: number = 1;
  private _aRate: number = 0;
  private _currentColor: Color = Color.White;

  public size: number = 5;
  public graphic?: Graphic;

  public startSize?: number;
  public endSize?: number;
  public sizeRate: number = 0;

  public visible = true;
  public isOffscreen = false;

  public transform: TransformComponent;
  public motion: MotionComponent;
  public graphics: GraphicsComponent;
  public particleTransform = ParticleTransform.Global;

  public name = `Particle#${this.id}`;

  constructor(options: ParticleConfig) {
    super({ silenceWarnings: true });
    this.addComponent((this.transform = new TransformComponent()));
    this.addComponent((this.motion = new MotionComponent()));
    this.addComponent((this.graphics = new GraphicsComponent()));
    this.configure(options);
  }

  private _emitter?: ParticleEmitter;
  registerEmitter(emitter: ParticleEmitter) {
    this._emitter = emitter;
    if (this.particleTransform === ParticleTransform.Global) {
      const globalPos = this._emitter.transform.globalPos;
      this.transform.pos = this.transform.pos.add(globalPos);
      this.motion.vel = this.motion.vel.rotate(this._emitter.transform.globalRotation);
    }
  }

  configure(options: ParticleConfig) {
    this.particleTransform = options.transform ?? this.particleTransform;
    this.life = options.life ?? this.life;
    this.fade = options.fade ?? this.fade;
    this.size = options.size ?? this.size;
    this.endColor = options.endColor ?? this.endColor.clone();
    this.beginColor = options.beginColor ?? this.beginColor.clone();
    this._currentColor = this.beginColor.clone();

    this.graphic = options.graphic;
    this.graphics.opacity = options.opacity ?? this.graphics.opacity;
    this.transform.pos = options.pos ?? this.transform.pos;
    this.transform.rotation = options.rotation ?? 0;
    this.transform.scale = vec(1, 1);

    this.motion.vel = options.vel ?? this.motion.vel;
    this.motion.angularVelocity = options.angularVelocity ?? 0;
    this.motion.acc = options.acc ?? this.motion.acc;

    this._rRate = (this.endColor.r - this.beginColor.r) / this.life;
    this._gRate = (this.endColor.g - this.beginColor.g) / this.life;
    this._bRate = (this.endColor.b - this.beginColor.b) / this.life;
    this._aRate = this.graphics.opacity / this.life;

    this.startSize = options.startSize ?? 0;
    this.endSize = options.endSize ?? 0;

    if (this.endSize > 0 && this.startSize > 0) {
      this.sizeRate = (this.endSize - this.startSize) / this.life;
      this.size = this.startSize;
    }
    if (this.graphic) {
      this.graphics.use(this.graphic);
      this.graphics.onPostDraw = undefined;
    } else {
      this.graphics.localBounds = BoundingBox.fromDimension(this.size, this.size, Vector.Half);
      this.graphics.onPostDraw = (ctx) => {
        ctx.save();
        ctx.debug.drawPoint(vec(0, 0), { color: this._currentColor, size: this.size });
        ctx.restore();
      };
    }
  }

  public override kill() {
    if (this._emitter?.isActive) {
      this._emitter.removeParticle(this);
    } else {
      super.kill();
    }
  }

  public update(engine: Engine, elapsed: number) {
    this.life = this.life - elapsed;

    if (this.life < 0) {
      this.kill();
    }

    if (this.fade) {
      this.graphics.opacity = clamp(this._aRate * this.life, 0.0001, 1);
    }

    if (this.startSize && this.endSize && this.startSize > 0 && this.endSize > 0) {
      this.size = clamp(
        this.sizeRate * elapsed + this.size,
        Math.min(this.startSize, this.endSize),
        Math.max(this.startSize, this.endSize)
      );
    }

    this._currentColor.r = clamp(this._currentColor.r + this._rRate * elapsed, 0, 255);
    this._currentColor.g = clamp(this._currentColor.g + this._gRate * elapsed, 0, 255);
    this._currentColor.b = clamp(this._currentColor.b + this._bRate * elapsed, 0, 255);
    this._currentColor.a = this.graphics.opacity;

    let accel = this.motion.acc;
    if (this.focus) {
      accel = this.focus
        .sub(this.transform.pos)
        .normalize()
        .scale(this.focusAccel || 0)
        .scale(elapsed / 1000);
    }
    // Update transform and motion based on Euler linear algebra
    EulerIntegrator.integrate(this.transform, this.motion, accel, elapsed);
  }
}

export interface ParticleConfig {
  /**
   * Optionally set the emitted particle transform style, {@apilink ParticleTransform.Global} is the default and emits particles as if
   * they were world space objects, useful for most effects.
   *
   * If set to {@apilink ParticleTransform.Local} particles are children of the emitter and move relative to the emitter
   * as they would in a parent/child actor relationship.
   */
  transform?: ParticleTransform;
  /**
   * Starting position of the particle
   */
  pos?: Vector;
  /**
   * Starting velocity of the particle
   */
  vel?: Vector;
  /**
   * Starting acceleration of the particle
   */
  acc?: Vector;
  /**
   * Starting angular velocity of the particle
   */
  angularVelocity?: number;
  /**
   * Starting rotation of the particle
   */
  rotation?: number;
  /**
   * Size of the particle in pixels
   */
  size?: number;
  /**
   * Optionally set a graphic
   */
  graphic?: Graphic;
  /**
   * Totally life of the particle in milliseconds
   */
  life?: number;
  /**
   * Starting opacity of the particle
   */
  opacity?: number;
  /**
   * Should the particle fade out to fully transparent over their life
   */
  fade?: boolean;

  /**
   * Ending color of the particle over its life
   */
  endColor?: Color;
  /**
   * Beginning color of the particle over its life
   */
  beginColor?: Color;

  /**
   * Set the start size when you want to change particle size over their life
   */
  startSize?: number;
  /**
   * Set the end size when you want to change particle size over their life
   */
  endSize?: number;

  /**
   * Smallest possible starting size of the particle
   */
  minSize?: number;
  /**
   * Largest possible starting size of the particle
   */
  maxSize?: number;
  /**
   * Minimum magnitude of the particle starting speed
   */
  minSpeed?: number;
  /**
   * Maximum magnitude of the particle starting speed
   */
  maxSpeed?: number;
  /**
   * Minimum angle to use for the particles starting rotation
   */
  minAngle?: number;
  /**
   * Maximum angle to use for the particles starting rotation
   */
  maxAngle?: number;

  /**
   * Gets or sets the optional focus where all particles should accelerate towards
   *
   * If the particle transform is global the focus is in world space, otherwise it is relative to the emitter
   */
  focus?: Vector;
  /**
   * Gets or sets the optional acceleration for focusing particles if a focus has been specified
   */
  focusAccel?: number;

  /**
   * Indicates whether particles should start with a random rotation
   */
  randomRotation?: boolean;
}

export enum ParticleTransform {
  /**
   * {@apilink ParticleTransform.Global} is the default and emits particles as if
   * they were world space objects, useful for most effects.
   */
  Global = 'global',
  /**
   * {@apilink ParticleTransform.Local} particles are children of the emitter and move relative to the emitter
   * as they would in a parent/child actor relationship.
   */
  Local = 'local'
}

export interface ParticleEmitterArgs {
  particle?: ParticleConfig;
  x?: number;
  y?: number;
  z?: number;
  pos?: Vector;
  width?: number;
  height?: number;
  /**
   * Is emitting currently
   */
  isEmitting?: boolean;
  /**
   * Particles per second
   */
  emitRate?: number;
  focus?: Vector;
  focusAccel?: number;
  /**
   * Emitter shape
   */
  emitterType?: EmitterType;
  /**
   * Radius of the emitter if the emitter type is EmitterType.Circle
   */
  radius?: number;
  random?: Random;
}
