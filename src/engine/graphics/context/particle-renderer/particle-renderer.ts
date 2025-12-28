import type { ExcaliburGraphicsContextWebGL } from '../excalibur-graphics-context-web-gl';
import type { RendererPlugin } from '../renderer';
import { Shader } from '../shader';
import particleVertexSource from './particle-vertex.glsl?raw';
import particleFragmentSource from './particle-fragment.glsl?raw';
import type { GpuParticleRenderer } from '../../../particles/gpu-particle-renderer';
import { vec } from '../../../math/vector';
import { Color } from '../../../color';
import type { HTMLImageSource } from '../excalibur-graphics-context';
import { ImageSourceAttributeConstants } from '../../image-source';
import { parseImageWrapping } from '../../wrapping';
import { parseImageFiltering } from '../../filtering';
import { ParticleTransform } from '../../../particles/particles';

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
      graphicsContext: context,
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

  draw(renderer: GpuParticleRenderer, elapsed: number): void {
    const gl = this._gl;

    this._shader.use();
    this._shader.setUniformMatrix('u_matrix', this._context.ortho);
    const transform =
      renderer.particle.transform === ParticleTransform.Local
        ? this._context.getTransform()
        : this._context.getTransform().multiply(renderer.emitter.transform.get().inverse);
    this._shader.setUniformAffineMatrix('u_transform', transform);
    this._shader.setUniformBoolean('fade', renderer.particle.fade ? true : false);
    this._shader.setUniformBoolean('useTexture', renderer.particle.graphic ? true : false);
    this._shader.setUniformFloat('maxLifeMs', renderer.particle.life ?? 2000);
    this._shader.setUniformFloat('deltaMs', elapsed);
    this._shader.setUniformFloatVector('gravity', renderer.particle.acc ?? vec(0, 0));
    this._shader.setUniformFloatColor('beginColor', renderer.particle.beginColor ?? Color.Transparent);
    this._shader.setUniformFloatColor('endColor', renderer.particle.endColor ?? Color.Transparent);

    let startSize = renderer.particle.startSize ?? 0;
    let endSize = renderer.particle.endSize ?? 0;
    const size = renderer.particle.size ?? 0;
    if (size > 0) {
      startSize = size;
      endSize = size;
    }

    this._shader.setUniformFloat('startSize', startSize ?? 10);
    this._shader.setUniformFloat('endSize', endSize ?? 10);
    this._shader.setUniformFloat('startOpacity', renderer.particle.opacity ?? 1);

    if (renderer.particle.focus) {
      this._shader.setUniformFloatVector('focus', renderer.particle.focus);
      this._shader.setUniformFloat('focusAccel', renderer.particle.focusAccel ?? 0);
    }

    // Particle Graphic (only Sprites right now)
    if (renderer.particle.graphic) {
      const graphic = renderer.particle.graphic;

      const texture = this._getTexture(graphic.image.image);

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
