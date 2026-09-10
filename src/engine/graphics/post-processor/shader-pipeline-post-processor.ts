import type { ExcaliburGraphicsContextWebGL } from '../context/excalibur-graphics-context-webgl';
import type { Framebuffer } from '../context/framebuffer';
import type { ShaderPassLike, ShaderPipelineLike } from '../context/shader-pipeline/shader-pipeline';
import { ShaderPipeline } from '../context/shader-pipeline/shader-pipeline';
import type { PostProcessor } from './post-processor';

export interface ShaderPipelinePostProcessorOptions {
  /**
   * Name the post processor for debugging
   */
  name?: string;
  /**
   * Multipass pipeline run over the screen, mirroring {@apilink Material}'s `passes`.
   *
   * Provide an ordered list of passes (bare fragment strings or {@apilink ShaderPass}), or any
   * {@apilink ShaderPipelineLike} implementation ({@apilink BloomEffect}, {@apilink GlowEffect},
   * {@apilink BlurEffect}, or your own pass graph).
   */
  passes: ShaderPassLike[] | ShaderPipelineLike;
}

/**
 * A fullscreen multipass {@apilink PostProcessor} built on {@apilink ShaderPipeline}.
 *
 * ```typescript
 * game.graphicsContext.addPostProcessor(new ex.ShaderPipelinePostProcessor({
 *   passes: [thresholdGlsl, blurHorizontalPass, blurVerticalPass]
 * }));
 * ```
 *
 * Each frame the screen is run through the passes and the final pass renders back into the
 * engine's post processing chain, composing with any other post processors in order.
 */
export class ShaderPipelinePostProcessor implements PostProcessor {
  public readonly name: string;
  private _passes: ShaderPassLike[] | ShaderPipelineLike;
  private _pipeline?: ShaderPipelineLike;
  private _elapsed = 0;

  constructor(options: ShaderPipelinePostProcessorOptions) {
    if (!options.passes || (Array.isArray(options.passes) && !options.passes.length)) {
      throw new Error(`ShaderPipelinePostProcessor "${options.name ?? 'anonymous'}" must be provided passes`);
    }
    this.name = options.name ?? 'anonymous pipeline post processor';
    this._passes = options.passes;
  }

  /**
   * The pipeline run over the screen, available after the post processor is added to the context
   */
  public get pipeline(): ShaderPipelineLike {
    if (!this._pipeline) {
      throw new Error(
        `ShaderPipelinePostProcessor "${this.name}" is not initialized yet, ` +
          `add it with ExcaliburGraphicsContext.addPostProcessor() first`
      );
    }
    return this._pipeline;
  }

  public initialize(graphicsContext: ExcaliburGraphicsContextWebGL): void {
    if (this._pipeline) {
      return;
    }
    if (Array.isArray(this._passes)) {
      this._pipeline = new ShaderPipeline({
        graphicsContext,
        name: this.name,
        passes: this._passes
      });
    } else {
      this._pipeline = this._passes;
    }
  }

  public onUpdate(elapsed: number): void {
    this._elapsed = elapsed;
  }

  public process(source: Framebuffer, destination: Framebuffer): void {
    this.pipeline.process(source, destination, { elapsed: this._elapsed });
  }

  public dispose(): void {
    this._pipeline?.dispose?.();
    this._pipeline = undefined;
  }
}
