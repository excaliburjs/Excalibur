import { vec } from '../../../../math/vector';
import type { ExcaliburGraphicsContextWebGL } from '../../excalibur-graphics-context-webgl';
import { Framebuffer } from '../../framebuffer';
import { glsl } from '../../glsl';
import type { ShaderPassDestination, ShaderPassSource } from '../shader-pass';
import { getSourceDimensions, ShaderPass } from '../shader-pass';
import type { ShaderPipelineLike, ShaderPipelineProcessOptions } from '../shader-pipeline';

export interface BloomEffectOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  /**
   * Luminance cutoff (0-1) above which pixels contribute to the bloom, default 0.8
   */
  threshold?: number;
  /**
   * Strength of the bloom added onto the original image, default 1
   */
  intensity?: number;
  /**
   * Depth of the downsample/upsample ladder, default 4.
   *
   * Each level halves the resolution, more levels produce a wider, softer bloom for the same cost
   * profile. Clamped to at least 1.
   */
  levels?: number;
}

/**
 * All bloom fragments work in premultiplied space directly, weighted averages and additive
 * blending are correct there.
 */
const thresholdFragmentSource = glsl`#pragma excalibur premultiply(off)
in vec2 v_uv;
uniform sampler2D u_image;
uniform float u_threshold;
out vec4 fragColor;
void main() {
  vec4 color = texture(u_image, v_uv);
  float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  fragColor = luminance > u_threshold ? color : vec4(0.0);
}`;

/**
 * 13-tap downsampling blur, samples a 4x4 texel footprint of the higher resolution input with
 * overlapping bilinear quads so each downsample level is also a blur step
 */
const downsampleFragmentSource = glsl`#pragma excalibur premultiply(off)
in vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_texelSize;
out vec4 fragColor;
void main() {
  vec4 A = texture(u_image, v_uv + u_texelSize * vec2(-1.0,  1.0));
  vec4 B = texture(u_image, v_uv + u_texelSize * vec2( 0.0,  1.0));
  vec4 C = texture(u_image, v_uv + u_texelSize * vec2( 1.0,  1.0));
  vec4 D = texture(u_image, v_uv + u_texelSize * vec2(-0.5,  0.5));
  vec4 E = texture(u_image, v_uv + u_texelSize * vec2( 0.5,  0.5));
  vec4 F = texture(u_image, v_uv + u_texelSize * vec2(-1.0,  0.0));
  vec4 G = texture(u_image, v_uv);
  vec4 H = texture(u_image, v_uv + u_texelSize * vec2( 1.0,  0.0));
  vec4 I = texture(u_image, v_uv + u_texelSize * vec2(-0.5, -0.5));
  vec4 J = texture(u_image, v_uv + u_texelSize * vec2( 0.5, -0.5));
  vec4 K = texture(u_image, v_uv + u_texelSize * vec2(-1.0, -1.0));
  vec4 L = texture(u_image, v_uv + u_texelSize * vec2( 0.0, -1.0));
  vec4 M = texture(u_image, v_uv + u_texelSize * vec2( 1.0, -1.0));

  vec4 quadNW = (A + B + F + G) * 0.25;
  vec4 quadNE = (B + C + G + H) * 0.25;
  vec4 quadSW = (F + G + K + L) * 0.25;
  vec4 quadSE = (G + H + L + M) * 0.25;
  vec4 quadC  = (D + E + I + J) * 0.25;

  // weights sum to exactly 1.0, no change in brightness
  fragColor = 0.125 * (quadNW + quadNE + quadSW + quadSE) + 0.5 * quadC;
}`;

/**
 * Upsamples the smaller level with a 4-tap tent (half-texel offsets in the larger level's texel
 * space lean on bilinear filtering) and adds the larger level, accumulating bloom up the ladder.
 *
 * `u_larger` is the first source so the convention `u_texelSize` is the larger level's.
 */
const upsampleMergeFragmentSource = glsl`#pragma excalibur premultiply(off)
in vec2 v_uv;
uniform sampler2D u_larger;
uniform sampler2D u_smaller;
uniform vec2 u_texelSize;
out vec4 fragColor;
void main() {
  vec4 A = texture(u_smaller, v_uv + u_texelSize * vec2(-1.0,  1.0));
  vec4 B = texture(u_smaller, v_uv + u_texelSize * vec2( 1.0,  1.0));
  vec4 C = texture(u_smaller, v_uv + u_texelSize * vec2(-1.0, -1.0));
  vec4 D = texture(u_smaller, v_uv + u_texelSize * vec2( 1.0, -1.0));
  vec4 blurred = (A + B + C + D) * 0.25;

  fragColor = blurred + texture(u_larger, v_uv);
}`;

const combineFragmentSource = glsl`#pragma excalibur premultiply(off)
in vec2 v_uv;
uniform sampler2D u_image;
uniform sampler2D u_original;
uniform float u_intensity;
out vec4 fragColor;
void main() {
  vec4 original = texture(u_original, v_uv);
  vec4 bloom = texture(u_image, v_uv) * u_intensity;
  fragColor = clamp(original + bloom, 0.0, 1.0);
}`;

/**
 * Multipass bloom: bright areas of the source are extracted, blurred down a progressive
 * downsample ladder, accumulated back up with tent-filter upsampling, and added onto the
 * original image.
 *
 * Implements {@apilink ShaderPipelineLike} as a non-linear pass graph, so it plugs into either
 * integration point:
 *
 * ```typescript
 * // fullscreen
 * game.graphicsContext.addPostProcessor(
 *   new ex.ShaderPipelinePostProcessor({
 *     pipeline: new ex.BloomEffect({ graphicsContext, threshold: 0.6, intensity: 1.5 })
 *   })
 * );
 *
 * // or per-graphic
 * actor.graphics.material = new ex.Material({
 *   graphicsContext,
 *   passes: new ex.BloomEffect({ graphicsContext, threshold: 0.5 }),
 *   padding: 32 // room for the bloom halo
 * });
 * ```
 */
export class BloomEffect implements ShaderPipelineLike {
  private _graphicsContext: ExcaliburGraphicsContextWebGL;
  private _levels: number;
  private _threshold: ShaderPass;
  private _downsample: ShaderPass;
  private _upsampleMerge: ShaderPass;
  private _combine: ShaderPass;
  private _downFramebuffers: Framebuffer[] = [];
  private _upFramebuffers: Framebuffer[] = [];
  private _disposed = false;

  constructor(options: BloomEffectOptions) {
    const { graphicsContext, threshold, intensity, levels } = options;
    this._graphicsContext = graphicsContext;
    this._levels = Math.max(1, levels ?? 4);
    this._threshold = new ShaderPass({
      graphicsContext,
      name: 'bloom threshold',
      fragmentSource: thresholdFragmentSource,
      uniforms: {
        u_threshold: threshold ?? 0.8
      }
    });
    this._downsample = new ShaderPass({
      graphicsContext,
      name: 'bloom downsample',
      fragmentSource: downsampleFragmentSource
    });
    this._upsampleMerge = new ShaderPass({
      graphicsContext,
      name: 'bloom upsample merge',
      fragmentSource: upsampleMergeFragmentSource
    });
    this._combine = new ShaderPass({
      graphicsContext,
      name: 'bloom combine',
      fragmentSource: combineFragmentSource,
      uniforms: {
        u_intensity: intensity ?? 1
      }
    });
  }

  /**
   * Luminance cutoff (0-1) above which pixels contribute to the bloom
   */
  public get threshold(): number {
    return this._threshold.uniforms.u_threshold as number;
  }

  public set threshold(value: number) {
    this._threshold.uniforms.u_threshold = value;
  }

  /**
   * Strength of the bloom added onto the original image
   */
  public get intensity(): number {
    return this._combine.uniforms.u_intensity as number;
  }

  public set intensity(value: number) {
    this._combine.uniforms.u_intensity = value;
  }

  private _ensureFramebuffers(sourceWidth: number, sourceHeight: number): void {
    let width = sourceWidth;
    let height = sourceHeight;
    for (let level = 0; level < this._levels; level++) {
      width = Math.max(1, Math.floor(width / 2));
      height = Math.max(1, Math.floor(height / 2));
      if (!this._downFramebuffers[level]) {
        this._downFramebuffers[level] = new Framebuffer({ graphicsContext: this._graphicsContext, width, height });
      } else {
        this._downFramebuffers[level].resize(width, height);
      }
      // up framebuffers mirror every level but the smallest
      if (level < this._levels - 1) {
        if (!this._upFramebuffers[level]) {
          this._upFramebuffers[level] = new Framebuffer({ graphicsContext: this._graphicsContext, width, height });
        } else {
          this._upFramebuffers[level].resize(width, height);
        }
      }
    }
  }

  public process(source: ShaderPassSource, destination: ShaderPassDestination, options?: ShaderPipelineProcessOptions): void {
    if (this._disposed) {
      throw new Error('BloomEffect has been disposed and cannot be used. Create a new effect instance.');
    }
    const elapsed = options?.elapsed;
    const [sourceWidth, sourceHeight] = getSourceDimensions(this._graphicsContext, source);
    this._ensureFramebuffers(sourceWidth, sourceHeight);

    // extract bright areas into the first half-resolution level
    this._threshold.draw({ source, destination: this._downFramebuffers[0], elapsed });

    // blur down the ladder, the tap footprint is in destination texels for a wider blur
    for (let level = 1; level < this._levels; level++) {
      const target = this._downFramebuffers[level];
      this._downsample.draw({
        source: this._downFramebuffers[level - 1],
        destination: target,
        uniforms: {
          u_texelSize: vec(target.texelSize[0], target.texelSize[1])
        }
      });
    }

    // tent-upsample back up, accumulating each level
    let smaller: Framebuffer = this._downFramebuffers[this._levels - 1];
    for (let level = this._levels - 2; level >= 0; level--) {
      this._upsampleMerge.draw({
        sources: {
          u_larger: this._downFramebuffers[level],
          u_smaller: smaller
        },
        destination: this._upFramebuffers[level]
      });
      smaller = this._upFramebuffers[level];
    }

    // add the accumulated bloom onto the original
    this._combine.draw({
      sources: {
        u_image: smaller,
        u_original: source
      },
      destination,
      elapsed
    });
  }

  public dispose(): void {
    if (!this._disposed) {
      this._disposed = true;
      this._threshold.dispose();
      this._downsample.dispose();
      this._upsampleMerge.dispose();
      this._combine.dispose();
      for (const framebuffer of this._downFramebuffers) {
        framebuffer.dispose();
      }
      for (const framebuffer of this._upFramebuffers) {
        framebuffer.dispose();
      }
      this._downFramebuffers.length = 0;
      this._upFramebuffers.length = 0;
    }
  }
}
