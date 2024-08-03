import { ExcaliburGraphicsContextWebGL } from '../ExcaliburGraphicsContextWebGL';
import { RendererPlugin } from '../renderer';
import { Shader } from '../shader';
import particleVertexSource from './particle-vertex.glsl';
import particleFragmentSource from './particle-fragment.glsl';
import { GpuParticleState } from '../../../Particles/GpuParticleState';
import { vec } from '../../../Math/vector';

export class ParticleRenderer implements RendererPlugin {
  public readonly type = 'ex.particle' as const;
  public priority: number = 0;
  private _gl!: WebGL2RenderingContext;
  private _context!: ExcaliburGraphicsContextWebGL;
  private _shader!: Shader;

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
  }

  draw(particleState: GpuParticleState, elapsedMs: number): void {
    const gl = this._gl;

    this._shader.use();
    this._shader.setUniformMatrix('u_matrix', this._context.ortho);
    const transform = this._context.getTransform();
    this._shader.setUniformAffineMatrix('u_transform', transform);
    this._shader.setUniformBoolean('useTexture', particleState.particle.graphic ? true : false); // TODO configurable in particle state
    this._shader.setUniformFloat('maxLifeMs', particleState.particle.life ?? 2000); // TODO configurable in particle state
    this._shader.setUniformFloat('uRandom', Math.random()); // TODO ex Random
    this._shader.setUniformFloat('deltaMs', elapsedMs);
    this._shader.setUniformFloatVector('gravity', particleState.particle.acc ?? vec(0, 0)); // TODO configurable in particle state

    // Particle sprite
    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D, spriteTex);
    // gl.uniform1i(u_graphic, 0);

    // Collision Mask
    // gl.activeTexture(gl.TEXTURE0 + 1);
    // gl.bindTexture(gl.TEXTURE_2D, obstacleTex);
    // gl.uniform1i(u_obstacle, 1);

    particleState.draw(gl);
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
