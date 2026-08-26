import { vec } from '../../../../math/vector';
import type { ExcaliburGraphicsContextWebGL } from '../../excalibur-graphics-context-webgl';
import { glsl } from '../../glsl';
import { ShaderPass } from '../shader-pass';

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
 */
const gaussianBlurSource = glsl`#pragma excalibur premultiply(off)
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
      fragmentSource: gaussianBlurSource,
      scale: scale ?? 0.5,
      uniforms: {
        u_direction: vec(1, 0),
        u_strength: strength ?? 1
      }
    }),
    new ShaderPass({
      graphicsContext,
      name: 'gaussian blur vertical',
      fragmentSource: gaussianBlurSource,
      uniforms: {
        u_direction: vec(0, 1),
        u_strength: strength ?? 1
      }
    })
  ];
}
