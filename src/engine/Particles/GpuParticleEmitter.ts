import { TransformComponent } from '../EntityComponentSystem';
import { Entity } from '../EntityComponentSystem/Entity';
import { EmitterType, Engine, ExcaliburGraphicsContextWebGL, GpuParticleState, GraphicsComponent, Random, vec, Vector } from '../';
import { ParticleConfig, ParticleEmitterArgs, ParticleTransform } from './Particles';

export class GpuParticleEmitter extends Entity {
  // TODO new renderer plugin
  // TODO transform feedback
  // TODO random glsl

  public particle: ParticleConfig = {
    /**
     * Gets or sets the life of each particle in milliseconds
     */
    life: 2000,
    transform: ParticleTransform.Global,
    graphic: undefined,
    opacity: 1,
    angularVelocity: 0,
    focus: undefined,
    focusAccel: undefined,
    randomRotation: false
  };

  public transform = new TransformComponent();
  public graphics = new GraphicsComponent();
  public state: GpuParticleState;
  public isEmitting: boolean = false;
  public emitRate: number = 1;
  public emitterType: EmitterType = EmitterType.Rectangle;
  public radius: number = 0;

  public get pos() {
    return this.transform.pos;
  }

  public set pos(pos: Vector) {
    this.transform.pos = pos;
  }

  public get z() {
    return this.transform.z;
  }

  public set z(z: number) {
    this.transform.z = z;
  }

  constructor(config: ParticleEmitterArgs) {
    super({ name: `GpuParticleEmitter` });
    this.addComponent(this.transform);
    this.addComponent(this.graphics);
    (this.graphics.onPostDraw as any) = (ctx: ExcaliburGraphicsContextWebGL, elapsedMilliseconds: number) => {
      ctx.draw<ex.ParticleRenderer>('ex.particle', this.state, elapsedMilliseconds);
    };

    const { particle, x, y, z, pos, isEmitting, emitRate, emitterType, radius, random } = { ...config };

    this.pos = pos ?? vec(x ?? 0, y ?? 0);

    this.z = z ?? 0;

    this.isEmitting = isEmitting ?? this.isEmitting;

    this.emitRate = emitRate ?? this.emitRate;

    this.emitterType = emitterType ?? this.emitterType;

    this.radius = radius ?? this.radius;

    this.particle = { ...this.particle, ...particle };

    this.state = new GpuParticleState(this, random ?? new Random(), this.particle);
  }

  public _initialize(engine: Engine): void {
    super._initialize(engine);
    const context = engine.graphicsContext as ExcaliburGraphicsContextWebGL;
    this.state.initialize(context.__gl, context);
  }

  draw(ctx: ExcaliburGraphicsContextWebGL, elapsedMilliseconds: number) {
    ctx.draw<ex.ParticleRenderer>('ex.particle', this.state, elapsedMilliseconds);
  }
}
