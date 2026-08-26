import { Color } from '../../../../color';
import { vec } from '../../../../math/vector';
import type { ExcaliburGraphicsContextWebGL } from '../../excalibur-graphics-context-webgl';
import { glsl } from '../../glsl';
import { ShaderPass } from '../shader-pass';
import { gaussianBlurFragmentSource } from './blur-passes';

export interface GlowPassesOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  /**
   * Glow color, default white
   */
  color?: Color;
  /**
   * Resolution the glow blur runs at relative to the source, default 0.5 (half resolution)
   */
  scale?: number;
  /**
   * Blur radius multiplier in texels of the (downsampled) glow resolution, default 2
   */
  strength?: number;
  /**
   * Glow opacity multiplier, default 1. Values above 1 make a denser, hotter glow.
   */
  intensity?: number;
}

/**
 * Tints the graphic's silhouette (its alpha) with the glow color, this is what gets blurred
 * into the halo
 */
const silhouetteFragmentSource = glsl`#pragma excalibur premultiply(off)
in vec2 v_uv;
uniform sampler2D u_image;
uniform vec4 u_glow_color;
uniform float u_glow_intensity;
out vec4 fragColor;
void main() {
  float alpha = texture(u_image, v_uv).a;
  // premultiplied glow color scaled by the silhouette
  fragColor = vec4(u_glow_color.rgb * u_glow_color.a, u_glow_color.a) * alpha * u_glow_intensity;
}`;

/**
 * Composites the original graphic over the blurred glow, premultiplied "over"
 */
const compositeFragmentSource = glsl`#pragma excalibur premultiply(off)
in vec2 v_uv;
uniform sampler2D u_image;
uniform sampler2D u_original;
out vec4 fragColor;
void main() {
  vec4 original = texture(u_original, v_uv);
  vec4 glow = clamp(texture(u_image, v_uv), 0.0, 1.0);
  fragColor = original + glow * (1.0 - original.a);
}`;

/**
 * Outer glow: the graphic's silhouette is tinted with the glow color, gaussian blurred at reduced
 * resolution, and the original graphic is composited back over the halo.
 *
 * Designed for per-graphic use with a {@apilink Material}, where `padding` gives the halo room
 * outside the graphic's quad:
 *
 * ```typescript
 * actor.graphics.material = new ex.Material({
 *   graphicsContext,
 *   passes: ex.createGlowPasses({ graphicsContext, color: ex.Color.Cyan, strength: 3 }),
 *   padding: 16
 * });
 * ```
 */
export function createGlowPasses(options: GlowPassesOptions): ShaderPass[] {
  const { graphicsContext, color, scale, strength, intensity } = options;
  return [
    new ShaderPass({
      graphicsContext,
      name: 'glow silhouette',
      fragmentSource: silhouetteFragmentSource,
      scale: scale ?? 0.5,
      uniforms: {
        u_glow_color: color ?? Color.White,
        u_glow_intensity: intensity ?? 1
      }
    }),
    new ShaderPass({
      graphicsContext,
      name: 'glow blur horizontal',
      fragmentSource: gaussianBlurFragmentSource,
      scale: scale ?? 0.5,
      uniforms: {
        u_direction: vec(1, 0),
        u_strength: strength ?? 2
      }
    }),
    new ShaderPass({
      graphicsContext,
      name: 'glow blur vertical',
      fragmentSource: gaussianBlurFragmentSource,
      scale: scale ?? 0.5,
      uniforms: {
        u_direction: vec(0, 1),
        u_strength: strength ?? 2
      }
    }),
    new ShaderPass({
      graphicsContext,
      name: 'glow composite',
      fragmentSource: compositeFragmentSource
    })
  ];
}
