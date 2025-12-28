import type { ExcaliburGraphicsContextWebGL } from './excalibur-graphics-context-web-gl';

/**
 * Interface that defines an Excalibur Renderer that can be called with .draw() in the {@apilink ExcaliburGraphicsContext}
 */
export interface RendererPlugin {
  /**
   * Unique type name for this renderer plugin
   */
  readonly type: string;

  /**
   * Render priority tie breaker when drawings are at the same z index
   *
   * Lower number means higher priority and is drawn first. Higher number means lower priority and is drawn last.
   */
  priority: number;

  /**
   * Initialize your renderer
   * @param gl
   * @param context
   */
  initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL): void;

  /**
   * Issue a draw command to draw something to the screen
   * @param args
   */
  draw(...args: any[]): void;

  /**
   * @returns if there are any pending draws in the renderer
   */
  hasPendingDraws(): boolean;

  /**
   * Flush any pending graphics draws to the screen
   */
  flush(): void;

  /**
   * Clear out any allocated memory
   */
  dispose(): void;
}
