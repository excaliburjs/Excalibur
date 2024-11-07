import { ExcaliburGraphicsContextWebGL } from '../ExcaliburGraphicsContextWebGL';
import { RendererPlugin } from '../renderer';
import { Shader } from '../shader';
import particleVertexSource from './particle-vertex.glsl';
import particleFragmentSource from './particle-fragment.glsl';
import { GpuParticleRenderer } from '../../../Particles/GpuParticleRenderer';
import { vec } from '../../../Math/vector';
import { Color } from '../../../Color';
import { HTMLImageSource } from '../ExcaliburGraphicsContext';
import { ImageSourceAttributeConstants } from '../../ImageSource';
import { parseImageWrapping } from '../../Wrapping';
import { parseImageFiltering } from '../../Filtering';
import { AffineMatrix } from '../../../Math/affine-matrix';
import { ParticleTransform } from '../../../Particles/Particles';

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

  private _getTexture(image: HTMLImageSource) {
    // if (this._texture) {
    //   return this._texture; // TODO invalidate if image changes
    // }
    // TODO DOM apis really sucks perf cache it?
    const maybeFiltering = image.getAttribute(ImageSourceAttributeConstants.Filtering);
    const filtering = maybeFiltering ? parseImageFiltering(maybeFiltering) : undefined;
    const wrapX = parseImageWrapping(image.getAttribute(ImageSourceAttributeConstants.WrappingX) as any);
    const wrapY = parseImageWrapping(image.getAttribute(ImageSourceAttributeConstants.WrappingY) as any);

    const force = image.getAttribute('forceUpload') === 'true' ? true : false;
    const texture = this._context.textureLoader.load(
      image,
      {
        filtering,
        wrapping: { x: wrapX, y: wrapY }
      },
      force
    )!;
    // remove force attribute after upload
    image.removeAttribute('forceUpload');
    return texture;
  }

  draw(renderer: GpuParticleRenderer, elapsedMs: number): void {
    const gl = this._gl;

    this._shader.use();
    this._shader.setUniformMatrix('u_matrix', this._context.ortho);
    const transform = renderer.particle.transform === ParticleTransform.Local ? this._context.getTransform() : AffineMatrix.identity();
    this._shader.setUniformAffineMatrix('u_transform', transform);
    this._shader.setUniformBoolean('fade', renderer.particle.fade ? true : false);
    this._shader.setUniformBoolean('useTexture', renderer.particle.graphic ? true : false);
    this._shader.setUniformFloat('maxLifeMs', renderer.particle.life ?? 2000);
    // this._shader.setUniformFloat('uRandom', Math.random()); // TODO ex Random
    this._shader.setUniformFloat('deltaMs', elapsedMs);
    this._shader.setUniformFloatVector('gravity', renderer.particle.acc ?? vec(0, 0));
    this._shader.setUniformFloatColor('beginColor', renderer.particle.beginColor ?? Color.Transparent);
    this._shader.setUniformFloatColor('endColor', renderer.particle.endColor ?? Color.Transparent);
    this._shader.setUniformFloat('startSize', renderer.particle.startSize ?? 10);
    this._shader.setUniformFloat('endSize', renderer.particle.endSize ?? 10);

    // Particle Graphic (only Sprites right now)
    if (renderer.particle.graphic) {
      const graphic = renderer.particle.graphic;

      const texture = this._getTexture(graphic.image.image);
      // TODO need to hint the GC

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      this._shader.setUniformInt('graphic', 0);
    }

    // Collision Mask
    // gl.activeTexture(gl.TEXTURE0 + 1);
    // gl.bindTexture(gl.TEXTURE_2D, obstacleTex);
    // gl.uniform1i(u_obstacle, 1);

    renderer.draw(gl);
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
