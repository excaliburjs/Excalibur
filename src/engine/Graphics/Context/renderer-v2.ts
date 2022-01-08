import { ExcaliburGraphicsContextWebGL } from './ExcaliburGraphicsContextWebGL';


/**
 * Interface that defines an Excalibur Renderer that can be called with .draw() in the [[ExcaliburGraphicsContext]]
 */
export interface RendererV2 {
  /**
   * Unique type name for this renderer plugin
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
