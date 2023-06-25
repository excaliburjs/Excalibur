
import { VertexLayout } from '..';
import { Shader } from '../Context/shader';


/**
 * PostProcessors can be used to apply a shader to the entire screen. It is recommended
 * you use the [[ScreenShader]] to build your post processor shader.
 *
 * The screen texture comes through as this uniform
 *
 * `uniform sampler2D u_image`
 *
 * Post processor shaders get some default uniforms passed to them
 *
 * `uniform float u_time_ms` - total playback time in milliseconds
 * `uniform float u_elapsed_ms` - the elapsed time from the last frame in milliseconds
 * `uniform vec2 u_resolution` - the resolution of the canvas (in pixels)
 *
 * Custom uniforms can be updated in the [[PostProcessor.onUpdate]]
 */
export interface PostProcessor {
  initialize(gl: WebGL2RenderingContext): void;
  getShader(): Shader;
  getLayout(): VertexLayout;
  /**
   * Use the onUpdate hook to update any uniforms in the postprocessors shader
   *
   * The shader has already been bound so there is no need to call shader.use();
   * @param delta
   */
  onUpdate?(delta: number): void;
}
