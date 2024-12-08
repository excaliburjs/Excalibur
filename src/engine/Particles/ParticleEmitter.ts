import { Engine } from '../Engine';
import { Actor } from '../Actor';
import { vec } from '../Math/vector';
import { Random } from '../Math/Random';
import { CollisionType } from '../Collision/CollisionType';
import { randomInRange } from '../Math/util';
import { EmitterType } from './EmitterType';
import { Particle, ParticleTransform, ParticleEmitterArgs, ParticleConfig } from './Particles';
import { RentalPool } from '../Util/RentalPool';

/**
 * Using a particle emitter is a great way to create interesting effects
 * in your game, like smoke, fire, water, explosions, etc. `ParticleEmitter`
 * extend {@apilink Actor} allowing you to use all of the features that come with.
 *
 * These particles are simulated on the CPU in JavaScript
 */
export class ParticleEmitter extends Actor {
  private _particlesToEmit: number = 0;

  private _particlePool = new RentalPool(
    () => new Particle({}),
    (p) => p,
    500
  );

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
   * Gets or sets the backing deadParticle collection
   */
  public deadParticles: Particle[] = [];

  /**
   * Gets or sets the emission rate for particles (particles/sec)
   */
  public emitRate: number = 1; //particles/sec

  /**
   * Gets or sets the emitter type for the particle emitter
   */
  public emitterType: EmitterType = EmitterType.Rectangle;

  /**
   * Gets or sets the emitter radius, only takes effect when the {@apilink emitterType} is {@apilink EmitterType.Circle}
   */
  public radius: number = 0;

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

  /**
   * @param config particle emitter options bag
   */
  constructor(config: ParticleEmitterArgs) {
    super({ width: config.width ?? 0, height: config.height ?? 0 });

    const { particle, x, y, z, pos, isEmitting, emitRate, emitterType, radius, random } = { ...config };

    this.particle = { ...this.particle, ...particle };

    this.pos = pos ?? vec(x ?? 0, y ?? 0);
    this.z = z ?? 0;
    this.isEmitting = isEmitting ?? this.isEmitting;
    this.emitRate = emitRate ?? this.emitRate;
    this.emitterType = emitterType ?? this.emitterType;
    this.radius = radius ?? this.radius;

    this.body.collisionType = CollisionType.PreventCollision;

    this.random = random ?? new Random();
  }

  public removeParticle(particle: Particle) {
    this.deadParticles.push(particle);
  }

  private _activeParticles: Particle[] = [];

  /**
   * Causes the emitter to emit particles
   * @param particleCount  Number of particles to emit right now
   */
  public emitParticles(particleCount: number) {
    if (particleCount <= 0) {
      return;
    }
    particleCount = particleCount | 0; // coerce to int
    for (let i = 0; i < particleCount; i++) {
      const p = this._createParticle();
      if (this?.scene?.world) {
        if (this.particle.transform === ParticleTransform.Global) {
          this.scene.world.add(p);
        } else {
          this.addChild(p);
        }
      }
      this._activeParticles.push(p);
    }
  }

  public clearParticles() {
    for (let i = 0; i < this._activeParticles.length; i++) {
      this.removeParticle(this._activeParticles[i]);
    }
  }

  // Creates a new particle given the constraints of the emitter
  private _createParticle(): Particle {
    let ranX = 0;
    let ranY = 0;

    const angle = randomInRange(this.particle.minAngle || 0, this.particle.maxAngle || Math.PI * 2, this.random);
    const vel = randomInRange(this.particle.minSpeed || 0, this.particle.maxSpeed || 0, this.random);
    const size = this.particle.startSize || randomInRange(this.particle.minSize || 5, this.particle.maxSize || 5, this.random);
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

    const p = this._particlePool.rent();
    p.configure({
      life: this.particle.life,
      opacity: this.particle.opacity,
      beginColor: this.particle.beginColor,
      endColor: this.particle.endColor,
      pos: vec(ranX, ranY),
      vel: vec(dx, dy),
      acc: this.particle.acc,
      angularVelocity: this.particle.angularVelocity,
      startSize: this.particle.startSize,
      endSize: this.particle.endSize,
      size: size,
      graphic: this.particle.graphic,
      fade: this.particle.fade
    });
    p.registerEmitter(this);
    if (this.particle.randomRotation) {
      p.transform.rotation = randomInRange(0, Math.PI * 2, this.random);
    }
    if (this.particle.focus) {
      p.focus = this.particle.focus.add(vec(this.pos.x, this.pos.y));
      p.focusAccel = this.particle.focusAccel;
    }
    return p;
  }

  public update(engine: Engine, elapsed: number) {
    super.update(engine, elapsed);

    if (this.isEmitting) {
      this._particlesToEmit += this.emitRate * (elapsed / 1000);
      if (this._particlesToEmit > 1.0) {
        this.emitParticles(Math.floor(this._particlesToEmit));
        this._particlesToEmit = this._particlesToEmit - Math.floor(this._particlesToEmit);
      }
    }

    // deferred removal
    for (let i = 0; i < this.deadParticles.length; i++) {
      if (this?.scene?.world) {
        this.scene.world.remove(this.deadParticles[i], false);
        this._particlePool.return(this.deadParticles[i]);
      }
      const index = this._activeParticles.indexOf(this.deadParticles[i]);
      if (index > -1) {
        this._activeParticles.splice(index, 1);
      }
    }
    this.deadParticles.length = 0;
  }
}
