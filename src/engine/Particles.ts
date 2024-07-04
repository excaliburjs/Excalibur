import { Engine } from './Engine';
import { Color } from './Color';
import { Vector, vec } from './Math/vector';
import { Random } from './Math/Random';
import { TransformComponent } from './EntityComponentSystem/Components/TransformComponent';
import { GraphicsComponent } from './Graphics/GraphicsComponent';
import { Entity } from './EntityComponentSystem/Entity';
import { BoundingBox } from './Collision/BoundingBox';
import { clamp } from './Math/util';
import { Graphic } from './Graphics';
import { EmitterType } from './EmitterType';
import { MotionComponent } from './EntityComponentSystem';
import { EulerIntegrator } from './Collision/Integrator';
import type { ParticleEmitter } from './ParticleEmitter';

/**
/**
 * Particle is used in a [[ParticleEmitter]]
 */
export class Particle extends Entity {
  public static DefaultConfig: ParticleConfig = {
    beginColor: Color.White,
    endColor: Color.White,
    life: 300,
    fade: false,
    size: 5,
    graphic: null,
    startSize: undefined,
    endSize: undefined
  };

  public focus: Vector = null;
  public focusAccel: number = 0;
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
  public graphic: Graphic = null;

  public startSize: number;
  public endSize: number;
  public sizeRate: number = 0;

  public visible = true;
  public isOffscreen = false;

  public transform: TransformComponent;
  public motion: MotionComponent;
  public graphics: GraphicsComponent;
  public particleTransform = ParticleTransform.Global;

  constructor(options: ParticleConfig) {
    super();
    this.addComponent((this.transform = new TransformComponent()));
    this.addComponent((this.motion = new MotionComponent()));
    this.addComponent((this.graphics = new GraphicsComponent()));
    this.configure(options);
  }

  private _emitter: ParticleEmitter;
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

  public kill() {
    if (this._emitter) {
      this._emitter.removeParticle(this);
    }
  }

  public update(engine: Engine, delta: number) {
    this.life = this.life - delta;

    if (this.life < 0) {
      this.kill();
    }

    if (this.fade) {
      this.graphics.opacity = clamp(this._aRate * this.life, 0.0001, 1);
    }

    if (this.startSize > 0 && this.endSize > 0) {
      this.size = clamp(this.sizeRate * delta + this.size, Math.min(this.startSize, this.endSize), Math.max(this.startSize, this.endSize));
    }

    this._currentColor.r = clamp(this._currentColor.r + this._rRate * delta, 0, 255);
    this._currentColor.g = clamp(this._currentColor.g + this._gRate * delta, 0, 255);
    this._currentColor.b = clamp(this._currentColor.b + this._bRate * delta, 0, 255);
    this._currentColor.a = this.graphics.opacity;

    let accel = this.motion.acc;
    if (this.focus) {
      accel = this.focus
        .sub(this.transform.pos)
        .normalize()
        .scale(this.focusAccel)
        .scale(delta / 1000);
    }
    // Update transform and motion based on Euler linear algebra
    EulerIntegrator.integrate(this.transform, this.motion, accel, delta);
  }
}

export interface ParticleConfig {
  /**
   * Optionally set the emitted particle transform style, [[ParticleTransform.Global]] is the default and emits particles as if
   * they were world space objects, useful for most effects.
   *
   * If set to [[ParticleTransform.Local]] particles are children of the emitter and move relative to the emitter
   * as they would in a parent/child actor relationship.
   */
  transform?: ParticleTransform;
  pos?: Vector;
  vel?: Vector;
  acc?: Vector;
  angularVelocity?: number;
  rotation?: number;
  size?: number;
  graphic?: Graphic;
  life?: number;
  opacity?: number;
  fade?: boolean;

  endColor?: Color;
  beginColor?: Color;

  startSize?: number;
  endSize?: number;

  minSize?: number;
  maxSize?: number; // how does this work with start/end size

  minVel?: number;
  maxVel?: number;

  minAngle?: number;
  maxAngle?: number;
}

export enum ParticleTransform {
  /**
   * [[ParticleTransform.Global]] is the default and emits particles as if
   * they were world space objects, useful for most effects.
   */
  Global = 'global',
  /**
   * [[ParticleTransform.Local]] particles are children of the emitter and move relative to the emitter
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
  isEmitting?: boolean;
  emitRate?: number;
  focus?: Vector;
  focusAccel?: number;
  emitterType?: EmitterType;
  radius?: number;
  randomRotation?: boolean;
  random?: Random;
}
