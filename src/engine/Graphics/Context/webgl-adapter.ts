
/**
 * Must be accessed after Engine construction time to ensure the context has been created
 */
export class ExcaliburWebGLContextAccessor {
  private static _GL: WebGL2RenderingContext;
  public static clear() {
    ExcaliburWebGLContextAccessor._GL = null;
  }
  public static register(gl: WebGL2RenderingContext) {
    ExcaliburWebGLContextAccessor._GL = gl;
  }
  // current webgl context
  public static get gl(): WebGL2RenderingContext {
    if (!ExcaliburWebGLContextAccessor._GL) {
      throw Error('Attempted gl access before init');
    }
    return ExcaliburWebGLContextAccessor._GL;
  }
}