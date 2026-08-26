import { Color } from '../../../../color';
import { vec } from '../../../../math/vector';
import type { ExcaliburGraphicsContextWebGL } from '../../excalibur-graphics-context-webgl';
import { glsl } from '../../glsl';
import type { ShaderPassDestination, ShaderPassSource } from '../shader-pass';
import { ShaderPass } from '../shader-pass';
import type { ShaderPipelineLike, ShaderPipelineProcessOptions } from '../shader-pipeline';
import { ShaderPipeline } from '../shader-pipeline';
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

/**
 * Outer glow wrapped in a convenient object with live-tunable settings, the ergonomic
 * counterpart to {@apilink createGlowPasses}.
 *
 * ```typescript
 * const glow = new ex.GlowEffect({ graphicsContext, color: ex.Color.Cyan, strength: 3 });
 * actor.graphics.material = new ex.Material({ graphicsContext, passes: glow, padding: 16 });
 *
 * glow.intensity = 2;            // animate any time, applies next frame
 * glow.color = ex.Color.Magenta;
 * ```
 */
export class GlowEffect implements ShaderPipelineLike {
  /**
   * Resolution the glow blur runs at relative to the source, fixed at construction
   */
  public readonly scale: number;
  private _pipeline: ShaderPipeline;
  private _silhouette: ShaderPass;
  private _horizontal: ShaderPass;
  private _vertical: ShaderPass;
  private _color: Color;

  constructor(options: GlowPassesOptions) {
    this.scale = options.scale ?? 0.5;
    this._color = options.color ?? Color.White;
    this._pipeline = new ShaderPipeline({
      graphicsContext: options.graphicsContext,
      name: 'glow effect',
      passes: createGlowPasses(options)
    });
    [this._silhouette, this._horizontal, this._vertical] = this._pipeline.passes;
  }

  /**
   * Glow color. Assign a new color to change it, mutating the color instance in place
   * will not be picked up.
   */
  public get color(): Color {
    return this._color;
  }

  public set color(value: Color) {
    this._color = value;
    this._silhouette.uniforms.u_glow_color = value;
  }

  /**
   * Glow opacity multiplier, values above 1 make a denser, hotter glow
   */
  public get intensity(): number {
    return this._silhouette.uniforms.u_glow_intensity as number;
  }

  public set intensity(value: number) {
    this._silhouette.uniforms.u_glow_intensity = value;
  }

  /**
   * Blur radius multiplier in texels of the (downsampled) glow resolution
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
