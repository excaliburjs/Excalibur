import { TwoPI } from '../Math/util';
import { ExcaliburGraphicsContextWebGL } from '../Graphics/Context/ExcaliburGraphicsContextWebGL';
import { GpuParticleEmitter } from './GpuParticleEmitter';
import { ParticleConfig, ParticleTransform } from './Particles';
import { Random } from '../Math/Random';
import { Sprite } from '../Graphics/Sprite';

export interface GpuParticleConfig extends ParticleConfig {
  /**
   * Only Sprite graphics are supported in GPU particles at the moment
   */
  graphic?: Sprite;
  /**
   * Set the maximum particles to use for this emitter
   */
  maxParticles?: number;
}

/**
 * Container for the GPU Particle State contains the internal state needed for the GPU
 * to render particles and maintain state.
 */
export class GpuParticleState {
  static readonly GPU_MAX_PARTICLES: number = 100_000;
  emitter: GpuParticleEmitter;
  emitRate: number = 1;
  particle: GpuParticleConfig;

  private _initialized: boolean = false;
  private _vaos: WebGLVertexArrayObject[] = [];
  private _buffers: WebGLBuffer[] = [];
  private _random: Random;

  private _drawIndex = 0;
  private _currentVao!: WebGLVertexArrayObject;
  private _currentBuffer!: WebGLBuffer;

  private _numInputFloats = 2 + 2 + 1 + 1 + 1;
  private _particleData = new Float32Array(GpuParticleState.GPU_MAX_PARTICLES * this._numInputFloats);
  private _particleIndex = 0;
  private _uploadIndex: number = 0;

  constructor(emitter: GpuParticleEmitter, random: Random, options: GpuParticleConfig) {
    this.emitter = emitter;
    this.particle = options;
    this._random = random;
  }

  public get isInitialized() {
    return this._initialized;
  }

  public get maxParticles(): number {
    return this.emitter.maxParticles;
  }

  initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL) {
    if (this._initialized) {
      return;
    }

    const numParticles = GpuParticleState.GPU_MAX_PARTICLES;
    const numInputFloats = this._numInputFloats;
    const particleData = this._particleData;
    const bytesPerFloat = 4;

    const particleDataBuffer1 = gl.createBuffer()!;
    const vao1 = gl.createVertexArray()!;
    gl.bindVertexArray(vao1);
    gl.bindBuffer(gl.ARRAY_BUFFER, particleDataBuffer1);
    gl.bufferData(gl.ARRAY_BUFFER, numParticles * numInputFloats * bytesPerFloat, gl.DYNAMIC_COPY);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, particleData);
    let offset = 0;
    // position
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, numInputFloats * bytesPerFloat, 0);
    offset += bytesPerFloat * 2;
    // velocity
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, numInputFloats * bytesPerFloat, offset);
    offset += bytesPerFloat * 2;
    // rotation
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, numInputFloats * bytesPerFloat, offset);
    offset += bytesPerFloat * 1;
    // angularVelocity
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, numInputFloats * bytesPerFloat, offset);
    offset += bytesPerFloat * 1;
    // life
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, numInputFloats * bytesPerFloat, offset);
    offset += bytesPerFloat * 1;

    // enable attributes
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);
    gl.enableVertexAttribArray(3);
    gl.enableVertexAttribArray(4);

    this._vaos.push(vao1);
    this._buffers.push(particleDataBuffer1);
    // Clean up
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const particleDataBuffer2 = gl.createBuffer()!;
    const vao2 = gl.createVertexArray()!;
    gl.bindVertexArray(vao2);
    gl.bindBuffer(gl.ARRAY_BUFFER, particleDataBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, numParticles * numInputFloats * bytesPerFloat, gl.DYNAMIC_COPY);
    offset = 0;
    // position
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, numInputFloats * bytesPerFloat, 0);
    offset += bytesPerFloat * 2;
    // velocity
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, numInputFloats * bytesPerFloat, offset);
    offset += bytesPerFloat * 2;
    // rotation
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, numInputFloats * bytesPerFloat, offset);
    offset += bytesPerFloat * 1;
    // angularVelocity
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, numInputFloats * bytesPerFloat, offset);
    offset += bytesPerFloat * 1;
    // life
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, numInputFloats * bytesPerFloat, offset);
    offset += bytesPerFloat * 1;

    // enable attributes
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);
    gl.enableVertexAttribArray(3);
    gl.enableVertexAttribArray(4);

    this._vaos.push(vao2);
    this._buffers.push(particleDataBuffer2);

    // Clean up
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this._currentVao = this._vaos[this._drawIndex % 2];
    this._currentBuffer = this._buffers[(this._drawIndex + 1) % 2];

    this._initialized = true;
  }

  // private _lifeTracker = new Map<number, [life: number, endIndex: number]>();
  // // TODO mem inefficient

  // private _runs: [start: number, end: number][] = [];
  // update(elapsedMs: number) {
  //   const lifeTracker = new Map(this._lifeTracker);
  //   this._runs.length = 0;

  //   for(let [index, [life, count]] of lifeTracker) {
  //     life -= elapsedMs;
  //     if (life <= 0) {
  //       this._lifeTracker.delete(index);
  //     } else {
  //       this._lifeTracker.set(index, [life, count]);
  //     }
  //   }
  //   const kvs = Array.from(this._lifeTracker.entries());
  //   kvs.sort((a, b) => a[0] - b[0]); // relies on index order
  //   let runs = this._runs;
  //   for (let i = 0; i < kvs.length; i++) {
  //     let [currentBatchIndex, [_, end]] = kvs[i];
  //     if (runs.length === 0) {
  //       runs.push([currentBatchIndex, end]);
  //     } else {
  //       let currentRun = runs[runs.length - 1];
  //       // current run matches up with the next batch merge
  //       if (currentRun[1] === currentBatchIndex) {
  //         currentRun[1] = end;
  //       // start a new run otherwise
  //       } else {
  //         runs.push([currentBatchIndex, end]);
  //       }
  //     }
  //   }
  // }

  emitParticles(particleCount: number) {
    const startIndex = this._particleIndex;
    const maxSize = this.maxParticles * this._numInputFloats;
    const endIndex = particleCount * this._numInputFloats + startIndex;
    for (let i = startIndex; i < endIndex; i += this._numInputFloats) {
      // TODO missing props, or exclude them from public api for now
      // 1. opacity
      // 2. focus (uniform?)
      // 3. focusAccel (uniform?)
      // 4. particle transform
      // 5. emitter type (uniform?)
      //    - radius
      //    - width/height
      // 6. size
      // 7. color
      // 8. accel
      const data = [
        this.particle.transform === ParticleTransform.Local ? 0 : this.emitter.transform.pos.x,
        this.particle.transform === ParticleTransform.Local ? 0 : this.emitter.transform.pos.y, // pos in world space
        this._random.floating(this.particle.minVel || 0, this.particle.maxVel || 0),
        this._random.floating(this.particle.minVel || 0, this.particle.maxVel || 0), // velocity
        this.particle.randomRotation
          ? this._random.floating(this.particle.minAngle || 0, this.particle.maxAngle || TwoPI)
          : this.particle.rotation || 0, // rotation
        this.particle.angularVelocity || 0, // angular velocity
        this.particle.life ?? 2000 // life
      ];

      // ASSERT data needs to match input floats
      if (data.length !== this._numInputFloats) {
        throw new Error('Invalid particle attribute data');
      }

      if (i % this._numInputFloats) {
        throw new Error('Invalid index');
      }

      this._particleData.set(data, i % this._particleData.length);
    }
    this._particleIndex = endIndex % maxSize;
    // // TODO track alive index an count of particles, tick down life to calculate minimum draw call
    // this._lifeTracker.set(startIndex / this._numInputFloats, [this.particle.life ?? 2000, endIndex / this._numInputFloats]);
  }

  private _uploadEmitted(gl: WebGL2RenderingContext) {
    if (this._particleIndex !== this._uploadIndex) {
      // Bind one buffer to ARRAY_BUFFER and the other to TFB
      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers[(this._drawIndex + 1) % 2]);
      if (this._particleIndex > this._uploadIndex) {
        gl.bufferSubData(
          gl.ARRAY_BUFFER,
          this._uploadIndex * 4, // dst byte offset 4 bytes per float
          this._particleData,
          this._uploadIndex,
          this._particleIndex - this._uploadIndex
        );
      }
      // TODO ELSE particleIndex has wrapped the buffer
      // else { ... }
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    this._uploadIndex = this._particleIndex % (this.maxParticles * this._numInputFloats);
  }

  draw(gl: WebGL2RenderingContext) {
    if (this._initialized) {
      // Emit
      this._uploadEmitted(gl);

      // Bind one buffer to ARRAY_BUFFER and the other to transform feedback buffer
      gl.bindVertexArray(this._currentVao);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this._currentBuffer);

      // Perform transform feedback (run the simulation) and the draw call all at once
      gl.beginTransformFeedback(gl.POINTS);
      // currently we simulate ALL particles alive or dead
      // // TODO is there a way we can calculate the parts of the buffer that have alive particles
      // // Happy path alive particles are in 1 contiguous chunk
      // if (this._runs.length === 1) {
      //   // console.log(Math.floor(this._runs[0][0] / this._numInputFloats), Math.floor(this._runs[0][1] / this._numInputFloats) - Math.floor(this._runs[0][0] / this._numInputFloats));
      //   const count = this._runs[0][1]  - this._runs[0][0];
      //   console.log(Math.floor(Math.max(this._runs[0][0] - count, 0) / this._numInputFloats), count);
      //   gl.drawArrays(gl.POINTS, Math.floor(Math.max(this._runs[0][0] - count, 0) / this._numInputFloats), count);

      //   // gl.drawArrays(gl.POINTS, 0, this.maxParticles);
      // } else {
      //   // TODO Sad path alive particles are in 2 split chunks
      //   // console.log(this._runs);
      // }
      gl.drawArrays(gl.POINTS, 0, this.maxParticles);
      gl.endTransformFeedback();

      // Clean up after ourselves to avoid errors.
      gl.bindVertexArray(null);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

      // flip flop buffers
      this._currentVao = this._vaos[this._drawIndex % 2];
      this._currentBuffer = this._buffers[(this._drawIndex + 1) % 2];
      this._drawIndex = (this._drawIndex + 1) % 2;
    }
  }
}
