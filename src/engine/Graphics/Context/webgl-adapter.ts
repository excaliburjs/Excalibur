
/**
 * Must be accessed after Engine construction time to ensure the context has been created
 */
export class ExcaliburWebGLContextAccessor {
  private static _GL: WebGLRenderingContext;
  public static clear() {
    ExcaliburWebGLContextAccessor._GL = null;
  }
  public static register(gl: WebGLRenderingContext) {
    ExcaliburWebGLContextAccessor._GL = gl;
  }
  // current webgl context
  public static get gl(): WebGLRenderingContext {
    if (!ExcaliburWebGLContextAccessor._GL) {
      throw Error('Attempted gl access before init');
    }
    return ExcaliburWebGLContextAccessor._GL;
  }
}