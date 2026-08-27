import type { ExcaliburGraphicsContextWebGL } from '../excalibur-graphics-context-webgl';
import { Framebuffer } from '../framebuffer';
import type { UniformDictionary } from '../shader';
import type { ShaderPassDestination, ShaderPassSource } from './shader-pass';
import { getSourceDimensions, ShaderPass } from './shader-pass';

export interface ShaderPipelineProcessOptions {
  /**
   * Elapsed milliseconds forwarded to each pass's `u_elapsed_ms`
   */
  elapsed?: number;
  /**
   * Uniform values forwarded to every pass, merged over each pass's own uniforms.
   *
   * Materials use this to flow their custom uniforms and built-ins into the pipeline.
   */
  uniforms?: UniformDictionary;
  /**
   * Additional named sources bound to every pass after its own (`u_image`, `u_original`, ...),
   * each record key is bound as the sampler uniform of that name.
   *
   * Materials use this to flow their `images` into the pipeline. Reserved pass source names
   * cannot be overridden.
   */
  sources?: Record<string, ShaderPassSource>;
}

/**
 * Adds `extra` sources onto `sources` without clobbering the pass's own reserved names
 * @internal
 */
export function mergePassSources(
  sources: Record<string, ShaderPassSource>,
  extra?: Record<string, ShaderPassSource>
): Record<string, ShaderPassSource> {
  if (extra) {
    for (const [name, source] of Object.entries(extra)) {
      if (!(name in sources)) {
        sources[name] = source;
      }
    }
  }
  return sources;
}

/**
 * Anything that can transform a source into a destination through one or more shader passes.
 *
 * {@apilink ShaderPipeline} is the built-in linear implementation; implement this directly for
 * non-linear pass graphs (for example bloom's downsample/upsample ladder) and plug it into a
 * {@apilink Material} or {@apilink ShaderPipelinePostProcessor} the same way.
 */
export interface ShaderPipelineLike {
  process(source: ShaderPassSource, destination: ShaderPassDestination, options?: ShaderPipelineProcessOptions): void;
  dispose?(): void;
}

/**
 * A {@apilink ShaderPass}, or a bare fragment source string that wraps into one
 */
export type ShaderPassLike = string | ShaderPass;

export interface ShaderPipelineOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  /**
   * Name the pipeline for debugging
   */
  name?: string;
  /**
   * Ordered passes, each one reads the previous pass's output as `u_image` (the pipeline source
   * for the first pass) and can read the original pipeline source as `u_original`
   */
  passes: ShaderPassLike[];
}

/**
 * Runs an ordered chain of {@apilink ShaderPass}es:
 * `source → pass0 → fb0 → pass1 → fb1 → ... → destination`
 *
 * Intermediate framebuffers are allocated lazily, one per pass, sized by each pass's `scale`
 * relative to the source. The final pass renders into the caller's destination at the
 * destination's own size, which is what upsamples a downscaled chain back up.
 */
export class ShaderPipeline implements ShaderPipelineLike {
  public readonly name: string;
  public readonly passes: ShaderPass[];
  private _graphicsContext: ExcaliburGraphicsContextWebGL;
  private _intermediates: (Framebuffer | undefined)[];
  private _disposed = false;

  constructor(options: ShaderPipelineOptions) {
    const { graphicsContext, name, passes } = options;
    if (!passes || passes.length < 1) {
      throw new Error(`ShaderPipeline "${name ?? 'anonymous'}" must be provided at least 1 pass`);
    }
    this._graphicsContext = graphicsContext;
    this.name = name ?? 'anonymous pipeline';
    this.passes = passes.map((pass, index) =>
      typeof pass === 'string' ? new ShaderPass({ graphicsContext, name: `${this.name} pass ${index}`, fragmentSource: pass }) : pass
    );
    this._intermediates = new Array(this.passes.length).fill(undefined);
  }

  /**
   * Runs every pass in order, rendering the final pass into `destination`
   */
  public process(source: ShaderPassSource, destination: ShaderPassDestination, options?: ShaderPipelineProcessOptions): void {
    if (this._disposed) {
      throw new Error(`ShaderPipeline "${this.name}" has been disposed and cannot be used. Create a new pipeline instance.`);
    }
    const [sourceWidth, sourceHeight] = getSourceDimensions(this._graphicsContext, source);
    const elapsed = options?.elapsed;
    const uniforms = options?.uniforms;
    const extraSources = options?.sources;

    let previous: ShaderPassSource = source;
    for (let i = 0; i < this.passes.length; i++) {
      const pass = this.passes[i];
      const isLast = i === this.passes.length - 1;

      let target: ShaderPassDestination;
      if (isLast) {
        target = destination;
      } else {
        const width = Math.max(1, Math.ceil(sourceWidth * pass.scale));
        const height = Math.max(1, Math.ceil(sourceHeight * pass.scale));
        let intermediate = this._intermediates[i];
        if (!intermediate) {
          intermediate = this._intermediates[i] = new Framebuffer({
            graphicsContext: this._graphicsContext,
            width,
            height,
            filtering: pass.filtering
          });
        } else {
          intermediate.resize(width, height);
        }
        target = intermediate;
      }

      pass.draw({
        sources: mergePassSources({ u_image: previous, u_original: source }, extraSources),
        destination: target,
        uniforms,
        elapsed
      });

      previous = target ?? previous;
    }
  }

  /**
   * Disposes the passes and intermediate framebuffers, the pipeline cannot be used afterwards
   */
  public dispose(): void {
    if (!this._disposed) {
      this._disposed = true;
      for (const pass of this.passes) {
        pass.dispose();
      }
      for (const intermediate of this._intermediates) {
        intermediate?.dispose();
      }
      this._intermediates.length = 0;
    }
  }
}
