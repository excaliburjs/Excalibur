import { ExcaliburGraphicsContextWebGL } from '../ExcaliburGraphicsContextWebGL';
import { RendererPlugin } from '../renderer';
import { Shader } from '../shader';
import particleVertexSource from './particle-vertex.glsl';
import particleFragmentSource from './particle-fragment.glsl';
import { GpuParticleState } from '../../../Particles/GpuParticleState';
import { vec } from '../../../Math/vector';

// TODO: DELETE ME
/**
 *
 */
function ran_range(ran: number, minf: number, maxf: number) {
  return ran * (maxf - minf) + minf;
}

const TwoPI = Math.PI * 2;
// TODO move this state into a "GPU Particle State" type

const numDraw = 10000;
export class ParticleRenderer implements RendererPlugin {
  public readonly type = 'ex.particle' as const;
  public priority: number = 0;
  private _gl!: WebGL2RenderingContext;
  private _context!: ExcaliburGraphicsContextWebGL;
  private _shader!: Shader;

  private _vaos: WebGLVertexArrayObject[] = [];
  private _buffers: WebGLBuffer[] = [];

  private _drawIndex = 0;
  private _currentVao!: WebGLVertexArrayObject;
  private _currentBuffer!: WebGLBuffer;

  initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;
    this._shader = new Shader({
      gl,
      vertexSource: particleVertexSource,
      fragmentSource: particleFragmentSource,
      onPreLink: (program) => {
        gl.transformFeedbackVaryings(
          program,
          ['finalPosition', 'finalVelocity', 'finalRotation', 'finalAngularVelocity', 'finalLifeMs'],
          gl.INTERLEAVED_ATTRIBS
        );
      }
    });
    this._shader.compile();
    this._shader.use();
    this._shader.setUniformMatrix('u_matrix', this._context.ortho);

    const numParticles = 100_000;
    const numInputFloats = 2 + 2 + 1 + 1 + 1;
    const particleData = new Float32Array(numParticles * numInputFloats);
    const bytesPerFloat = 4;

    for (let i = 0; i < numParticles * numInputFloats; i += numInputFloats) {
      particleData.set(
        [
          Math.random() * 800,
          Math.random() * 800, // pos in world space
          // Math.random()*2-1, Math.random()*2-1, // pos in clip space
          ran_range(Math.random(), -100, 100),
          ran_range(Math.random(), -100, 100), // velocity
          Math.random() * TwoPI, // rotation
          Math.random() * 2.5, // angular velocity
          Math.random() * 2000 // life
        ],
        i
      );
    }

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
  }

  draw(particleState: GpuParticleState, elapsedMs: number): void {
    const gl = this._gl;
    this._shader.use();
    this._shader.setUniformBoolean('useTexture', false); // TODO configurable in particle state
    this._shader.setUniformFloat('maxLifeMs', 2000); // TODO configurable in particle state
    this._shader.setUniformFloat('uRandom', Math.random()); // TODO ex Random
    this._shader.setUniformFloat('deltaMs', elapsedMs);
    this._shader.setUniformFloatVector('gravity', vec(0, -100)); // TODO configurable in particle state

    // Particle sprite
    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D, spriteTex);
    // gl.uniform1i(u_graphic, 0);

    // Collision Mask
    // gl.activeTexture(gl.TEXTURE0 + 1);
    // gl.bindTexture(gl.TEXTURE_2D, obstacleTex);
    // gl.uniform1i(u_obstacle, 1);

    // gl.clearColor(0, 0, 0, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // Bind one buffer to ARRAY_BUFFER and the other to TFB
    gl.bindVertexArray(this._currentVao);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this._currentBuffer);

    // Perform transform feedback and the draw call
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, numDraw);
    gl.endTransformFeedback();

    // Clean up after ourselves to avoid errors.
    gl.bindVertexArray(null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

    // flip flop buffers
    this._currentVao = this._vaos[this._drawIndex % 2];
    this._currentBuffer = this._buffers[(this._drawIndex + 1) % 2];
    this._drawIndex = (this._drawIndex + 1) % 2;
  }
  hasPendingDraws(): boolean {
    return false;
  }
  flush(): void {
    // pass
  }
  dispose(): void {
    // pass
  }
}
