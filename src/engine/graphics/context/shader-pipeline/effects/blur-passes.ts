import { vec } from '../../../../math/vector';
import type { ExcaliburGraphicsContextWebGL } from '../../excalibur-graphics-context-webgl';
import { glsl } from '../../glsl';
import type { ShaderPassDestination, ShaderPassSource } from '../shader-pass';
import { ShaderPass } from '../shader-pass';
import type { ShaderPipelineLike, ShaderPipelineProcessOptions } from '../shader-pipeline';
import { ShaderPipeline } from '../shader-pipeline';

export interface BlurPassesOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  /**
   * Resolution the blur runs at relative to the source, default 0.5 (half resolution).
   *
   * Lower is cheaper and blurrier, the final pass linearly upsamples back to full resolution.
   */
  scale?: number;
  /**
   * Blur radius multiplier in texels of the (downsampled) blur resolution, default 1
   */
  strength?: number;
}

/**
 * Blurring premultiplied colors directly is the correct alpha handling for a weighted average,
 * so this fragment opts out of the glsl tag's straight-alpha authoring space.
 *
 * Expects `u_direction` (e.g. `vec(1, 0)` for horizontal) and `u_strength` uniforms.
 */
export const gaussianBlurFragmentSource = glsl`#pragma excalibur premultiply(off)
in vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_texelSize;
uniform vec2 u_direction;
uniform float u_strength;
out vec4 fragColor;
void main() {
  vec2 offset = u_texelSize * u_direction * u_strength;
  // 9-tap gaussian, weights sum to 1.0
  vec4 sum = texture(u_image, v_uv) * 0.2270270270;
  sum += texture(u_image, v_uv + offset * 1.0) * 0.1945945946;
  sum += texture(u_image, v_uv - offset * 1.0) * 0.1945945946;
  sum += texture(u_image, v_uv + offset * 2.0) * 0.1216216216;
  sum += texture(u_image, v_uv - offset * 2.0) * 0.1216216216;
  sum += texture(u_image, v_uv + offset * 3.0) * 0.0540540541;
  sum += texture(u_image, v_uv - offset * 3.0) * 0.0540540541;
  sum += texture(u_image, v_uv + offset * 4.0) * 0.0162162162;
  sum += texture(u_image, v_uv - offset * 4.0) * 0.0162162162;
  fragColor = sum;
}`;

/**
 * Separable 9-tap gaussian blur: a horizontal pass at `scale` resolution followed by a vertical
 * pass that linearly upsamples back to the destination resolution.
 *
 * ```typescript
 * const material = new ex.Material({
 *   graphicsContext,
 *   passes: createBlurPasses({ graphicsContext }),
 *   padding: 8 // give the blur room so it is not clipped to the graphic
 * });
 *
 * // or fullscreen
 * game.graphicsContext.addPostProcessor(
 *   new ex.ShaderPipelinePostProcessor({ passes: createBlurPasses({ graphicsContext }) })
 * );
 * ```
 */
export function createBlurPasses(options: BlurPassesOptions): ShaderPass[] {
  const { graphicsContext, scale, strength } = options;
  return [
    new ShaderPass({
      graphicsContext,
      name: 'gaussian blur horizontal',
      fragmentSource: gaussianBlurFragmentSource,
      scale: scale ?? 0.5,
      uniforms: {
        u_direction: vec(1, 0),
        u_strength: strength ?? 1
      }
    }),
    new ShaderPass({
      graphicsContext,
      name: 'gaussian blur vertical',
      fragmentSource: gaussianBlurFragmentSource,
      uniforms: {
        u_direction: vec(0, 1),
        u_strength: strength ?? 1
      }
    })
  ];
}

/**
 * Separable gaussian blur wrapped in a convenient object with live-tunable settings, the
 * ergonomic counterpart to {@apilink createBlurPasses}.
 *
 * ```typescript
 * const blur = new ex.BlurEffect({ graphicsContext, strength: 2 });
 * actor.graphics.material = new ex.Material({ graphicsContext, passes: blur, padding: 16 });
 *
 * blur.strength = 4; // animate any time, applies next frame
 * ```
 */
export class BlurEffect implements ShaderPipelineLike {
  /**
   * Resolution the blur runs at relative to the source, fixed at construction
   */
  public readonly scale: number;
  private _pipeline: ShaderPipeline;
  private _horizontal: ShaderPass;
  private _vertical: ShaderPass;

  constructor(options: BlurPassesOptions) {
    this.scale = options.scale ?? 0.5;
    this._pipeline = new ShaderPipeline({
      graphicsContext: options.graphicsContext,
      name: 'blur effect',
      passes: createBlurPasses(options)
    });
    [this._horizontal, this._vertical] = this._pipeline.passes;
  }

  /**
   * Blur radius multiplier in texels of the (downsampled) blur resolution
   */
  public get strength(): number {
    return this._horizontal.uniforms.u_strength as number;
  }

  public set strength(value: number) {
    this._horizontal.uniforms.u_strength = value;
    this._vertical.uniforms.u_strength = value;
  }

  public process(source: ShaderPassSource, destination: ShaderPassDestination, options?: ShaderPipelineProcessOptions): void {
    this._pipeline.process(source, destination, options);
  }

  public dispose(): void {
    this._pipeline.dispose();
  }
}
