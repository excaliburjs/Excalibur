import { ExcaliburGraphicsContextWebGL } from '..';


/**
 * Interface that defines an Excalibur Renderer
 */
export interface RendererV2 {
  /**
   * Unique type name for this renderer
   */
  readonly type: string;

  /**
   * Render priority tie breaker when
   */
  priority: number;

  /**
   * Initialize your renderer
   *
   * @param gl
   * @param context
   */
  initialize(gl: WebGLRenderingContext, context: ExcaliburGraphicsContextWebGL): void;

  /**
   * Issue a draw command to draw something to the screen
   * @param args
   */
  draw(...args: any[]): void;

  /**
   * Flush any pending graphics draws to the screen
   */
  flush(): void;
}
