import { Engine } from './Engine';
import { Color } from './Color';
import { Vector, vec } from './Math/vector';
import { Configurable } from './Configurable';
import { Random } from './Math/Random';
import { TransformComponent } from './EntityComponentSystem/Components/TransformComponent';
import { GraphicsComponent } from './Graphics/GraphicsComponent';
import { Entity } from './EntityComponentSystem/Entity';
import { BoundingBox } from './Collision/BoundingBox';
import { clamp } from './Math/util';
import { Graphic } from './Graphics';
import { EmitterType } from './EmitterType';
import type { ParticleEmitter } from './ParticleEmitter';

const isEmitterConfig = (emitterOrConfig: ParticleEmitter | ParticleArgs): emitterOrConfig is ParticleArgs => {
  return emitterOrConfig && !emitterOrConfig.constructor;
};

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
  public particleSprite: Graphic = null;

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
    endSize?: number,
    particleSprite?: Graphic
  ) {
    super();
    let emitter = emitterOrConfig;
    if (isEmitterConfig(emitterOrConfig)) {
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
      particleSprite = config.particleSprite;
    }
    this.emitter = <ParticleEmitter>emitter;
    this.life = life || this.life;
    this.opacity = opacity || this.opacity;
    this.endColor = endColor || this.endColor.clone();
    this.beginColor = beginColor || this.beginColor.clone();
    this._currentColor = this.beginColor.clone();
    this.particleSprite = particleSprite;

    if (this.emitter.particleTransform === ParticleTransform.Global) {
      const globalPos = this.emitter.transform.globalPos;
      this.position = (position || this.position).add(globalPos);
      this.velocity = (velocity || this.velocity).rotate(this.emitter.transform.globalRotation);
    } else {
      this.velocity = velocity || this.velocity;
      this.position = position || this.position;
    }
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
    this.transform.z = this.emitter.z;
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

  public update(engine: Engine, delta: number) {
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
  particleSprite?: Graphic;
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
    endSize?: number,
    particleSprite?: Graphic
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
    endSize?: number,
    particleSprite?: Graphic
  ) {
    super(emitterOrConfig, life, opacity, beginColor, endColor, position, velocity, acceleration, startSize, endSize, particleSprite);
  }
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
  x?: number;
  y?: number;
  z?: number;
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
  /**
   * Optionally set the emitted particle transform style, [[ParticleTransform.Global]] is the default and emits particles as if
   * they were world space objects, useful for most effects.
   *
   * If set to [[ParticleTransform.Local]] particles are children of the emitter and move relative to the emitter
   * as they would in a parent/child actor relationship.
   */
  particleTransform?: ParticleTransform;
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
  particleSprite?: Graphic;
  emitterType?: EmitterType;
  radius?: number;
  particleRotationalVelocity?: number;
  randomRotation?: boolean;
  random?: Random;
}
