import type { VertexLayout } from '../context/vertex-layout';
import type { Shader } from '../context/shader';
import type { ExcaliburGraphicsContextWebGL } from '../context/excalibur-graphics-context-webgl';
import type { Framebuffer } from '../context/framebuffer';

/**
 * PostProcessors apply a shader effect to the entire screen at the end of the frame.
 *
 * Implement {@apilink PostProcessor.process}: the current (MSAA-resolved) screen arrives as
 * `source` and the result must be rendered into `destination` — typically with a
 * {@apilink ShaderPass} or {@apilink ShaderPipeline}. Because the shape matches
 * {@apilink ShaderPipelineLike}, effect objects like {@apilink BloomEffect} or
 * {@apilink BlurEffect} can be added as post processors directly:
 *
 * ```typescript
 * game.graphicsContext.addPostProcessor(new ex.BloomEffect({ graphicsContext }));
 * ```
 *
 * Use {@apilink ShaderPipelinePostProcessor} to build one from a list of fragment sources.
 *
 * Fragment shaders in a {@apilink ShaderPass}/{@apilink ShaderPipeline} get these built-ins:
 *
 * * `uniform sampler2D u_image` - the current screen (or previous pass output)
 * * `uniform vec2 u_resolution` - the destination resolution (in pixels)
 * * `uniform vec2 u_texelSize` - `1.0 / source resolution`
 * * `uniform float u_time_ms` - total time in milliseconds
 * * `uniform float u_elapsed_ms` - elapsed milliseconds since the last frame
 * * `in vec2 v_uv` - 0-1 UV over the screen
 *
 * The deprecated single-pass path receives `u_image` at slot 0 plus `u_time_ms`,
 * `u_elapsed_ms`, and `u_resolution` when declared; custom uniforms can be updated in
 * {@apilink PostProcessor.onUpdate}.
 */
export interface PostProcessor {
  /**
   * Called once when the post processor is added to the graphics context
   */
  initialize?(graphicsContext: ExcaliburGraphicsContextWebGL): void;

  /**
   * `source` is the current (MSAA-resolved) screen framebuffer, render the result into
   * `destination`, for example with a {@apilink ShaderPass} or {@apilink ShaderPipeline}.
   */
  process?(source: Framebuffer, destination: Framebuffer): void;

  /**
   * @deprecated implement {@apilink PostProcessor.process} instead, the single-pass
   * shader/layout path will be removed in v1. The screen texture is bound to slot 0 as
   * `uniform sampler2D u_image` and default uniforms (`u_time_ms`, `u_elapsed_ms`,
   * `u_resolution`) are set when declared.
   */
  getShader?(): Shader;

  /**
   * @deprecated implement {@apilink PostProcessor.process} instead, the single-pass
   * shader/layout path will be removed in v1
   */
  getLayout?(): VertexLayout;

  /**
   * Use the onUpdate hook to update any uniforms in the postprocessors shader
   *
   * The shader has already been bound so there is no need to call shader.use();
   * @param elapsed
   */
  onUpdate?(elapsed: number): void;

  /**
   * Use the onDraw hook to upload any textures or command that need to run right before draw
   */
  onDraw?(): void;
}
