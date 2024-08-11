import { randomInRange, TwoPI } from '../Math/util';
import { ExcaliburGraphicsContextWebGL } from '../Graphics/Context/ExcaliburGraphicsContextWebGL';
import { GpuParticleEmitter } from './GpuParticleEmitter';
import { ParticleConfig } from './Particles';
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
  emitter: GpuParticleEmitter;
  numParticles: number = 1000; // todo getter/setter to enforce max
  static GPU_MAX_PARTICLES: number = 100_000;
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
    this.numParticles = options.maxParticles ?? this.numParticles;
  }

  public get isInitialized() {
    return this._initialized;
  }

  initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL) {
    if (this._initialized) {
      return;
    }

    // TODO this is wasteful, also causes a problem when
    const numParticles = GpuParticleState.GPU_MAX_PARTICLES; // % this.numParticles;
    const numInputFloats = this._numInputFloats;
    const particleData = this._particleData;
    const bytesPerFloat = 4;

    // p/s
    // ms/p
    // const lifeSeconds = (this.particle.life ?? 2000) / 1000;

    this.emitParticles(this.emitRate /* * 1 / (lifeSeconds)*/);

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

  emitParticles(particleCount: number) {
    const startIndex = this._particleIndex;
    const endIndex = particleCount * this._numInputFloats + startIndex;
    for (let i = startIndex; i < endIndex; i += this._numInputFloats) {
      this._particleData.set(
        [
          0, // TODO distribute randomly based on emitter params
          0, // pos in world space
          // Math.random()*2-1, Math.random()*2-1, // pos in clip space
          randomInRange(-100, 100, this._random),
          randomInRange(-100, 100, this._random), // velocity
          this._random.next() * TwoPI, // rotation
          this._random.next() * 2.5, // angular velocity
          this.particle.life ?? 2000 // life
        ],
        i
      );
    }
    this._particleIndex = endIndex % (this.numParticles * this._numInputFloats);
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
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    this._uploadIndex = this._particleIndex % (this.numParticles * this._numInputFloats);
  }

  draw(gl: WebGL2RenderingContext) {
    if (this._initialized) {
      // Emit
      this._uploadEmitted(gl);

      // Bind one buffer to ARRAY_BUFFER and the other to TFB
      gl.bindVertexArray(this._currentVao);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this._currentBuffer);

      // Perform transform feedback and the draw call
      gl.beginTransformFeedback(gl.POINTS);
      gl.drawArrays(gl.POINTS, 0, this.numParticles);
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
