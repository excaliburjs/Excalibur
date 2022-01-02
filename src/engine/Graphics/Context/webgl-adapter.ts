
/**
 * Must be accessed after Engine construction time to ensure the context has been created
 */
export class ExcaliburWebGLContextAccessor {
  private static _gl: WebGLRenderingContext;
  public static register(gl: WebGLRenderingContext) {
    ExcaliburWebGLContextAccessor._gl = gl;
  }
  // current webgl context
  public static get gl(): WebGLRenderingContext {
    if (!ExcaliburWebGLContextAccessor._gl) {
      throw Error('Attmepted gl access before init');
    }
    return ExcaliburWebGLContextAccessor._gl;
  }
}