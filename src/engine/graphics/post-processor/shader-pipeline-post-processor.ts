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
   * Ordered passes run over the screen, see {@apilink ShaderPipeline}
   */
  passes?: ShaderPassLike[];
  /**
   * Bring your own pipeline, for example a custom non-linear pass graph implementing
   * {@apilink ShaderPipelineLike}
   */
  pipeline?: ShaderPipelineLike;
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
  private _options: ShaderPipelinePostProcessorOptions;
  private _pipeline?: ShaderPipelineLike;
  private _elapsed = 0;

  constructor(options: ShaderPipelinePostProcessorOptions) {
    if (!options.passes?.length && !options.pipeline) {
      throw new Error(`ShaderPipelinePostProcessor "${options.name ?? 'anonymous'}" must be provided passes or a pipeline`);
    }
    this.name = options.name ?? 'anonymous pipeline post processor';
    this._options = options;
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
    this._pipeline =
      this._options.pipeline ??
      new ShaderPipeline({
        graphicsContext,
        name: this.name,
        passes: this._options.passes!
      });
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
