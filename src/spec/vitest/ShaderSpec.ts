import * as ex from '@excalibur';

describe('A Shader', () => {
  let gl: WebGL2RenderingContext;
  let graphicsContext: ex.ExcaliburGraphicsContextWebGL;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    graphicsContext = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas
    });
    gl = graphicsContext.__gl;
  });

  it('exists', () => {
    expect(ex.Shader).toBeDefined();
  });

  it('can be constructed & compiled with shader source', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `
      attribute vec4 a_position;
      attribute vec3 a_otherposition;
      uniform bool u_bool;
      void main() {
        if (u_bool) {
          gl_Position = a_position + vec4(a_otherposition, 1.0);
        } else {
          gl_Position = vec4(1.0, 0, 0, 1.0);
        }
      }`,
      fragmentSource: `
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });
    expect(sut.compiled).toBe(false);
    sut.compile();
    expect(sut.compiled).toBe(true);
    expect(sut.attributes.a_position, 'a_position').toEqual({
      name: 'a_position',
      glType: gl.FLOAT,
      size: 4,
      normalized: false,
      location: sut.attributes.a_position.location
    });

    expect(sut.attributes.a_otherposition, 'a_otherposition').toEqual({
      name: 'a_otherposition',
      glType: gl.FLOAT,
      size: 3,
      normalized: false,
      location: sut.attributes.a_otherposition.location
    });

    const u_bool = sut.getUniformDefinitions()[0];
    expect(u_bool, 'u_bool').toEqual({
      name: 'u_bool',
      glType: gl.BOOL,
      location: u_bool.location
    });
  });

  it('can fail compiling vertex', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `
      uniform int u_int;
      // nonsense shader for testing
      void main() {
        gl_Position = vec4(1.0, 0, 0, 1.0 + u_int);
      }`,
      fragmentSource: `
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });
    expect(() => {
      sut.compile();
    }).toThrowError(/vertex/);
  });

  it('can fail compiling fragment', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `
      uniform int u_int;
      // nonsense shader for testing
      void main() {
        gl_Position = vec4(1.0, 0, 0, u_int);
      }`,
      fragmentSource: `
      void main() {
        gl_FragColor = vec4(1.0, 0, 0);
      }`
    });
    expect(() => {
      sut.compile();
    }).toThrowError(/fragment/);
  });

  it('must be compiled and shader.use() to set uniforms', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `
      uniform int u_int;
      // nonsense shader for testing
      void main() {
        gl_Position = vec4(1.0, 0, 0, float(u_int));
      }`,
      fragmentSource: `
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });

    expect(() => {
      sut.setUniform('uniform1i', 'u_int', 10);
    }).toThrowError('Must compile shader before setting a uniform uniform1i:u_int');

    sut.compile();

    expect(() => {
      sut.setUniform('uniform1i', 'u_int', 10);
    }).toThrowError(
      'Currently accessed shader instance is not the current active shader in WebGL,' + ' must call `shader.use()` before setting uniforms'
    );

    sut.use();

    expect(() => {
      sut.setUniform('uniform1i', 'u_int', 10);
    }).not.toThrow();
  });

  it('can set uniforms', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `
      attribute vec4 a_position;
      attribute vec3 a_otherposition;
      uniform int u_int;
      uniform int u_intarray[4];
      uniform float u_float;
      uniform float u_floatarray[5];
      uniform vec2 u_vec;
      uniform bool u_bool;
      uniform mat4 u_mat;
      uniform int u_unused;
      // nonsense shader for testing
      void main() {
        if (u_bool) {
          gl_Position = a_position + vec4(a_otherposition, u_float + float(u_int));
        } else {
          gl_Position = u_mat * vec4(1.0, u_vec.x, u_vec.y, u_floatarray[1]);
        }
        gl_Position = vec4(float(u_intarray[0]), float(u_intarray[1]), float(u_intarray[2]), float(u_intarray[3]));
      }`,
      fragmentSource: `
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });

    sut.compile();
    sut.use();

    sut.setUniformInt('u_int', 0);
    sut.setUniformIntArray('u_intarray', [0, 1, 2, 3]);
    sut.setUniformFloat('u_float', 5.5);
    sut.setUniformFloatArray('u_floatarray', [5.5, 4.2]);
    sut.setUniformFloatVector('u_vec', ex.vec(1, 2));
    sut.setUniformBoolean('u_bool', false);
    const matrix = ex.Matrix.identity();
    sut.setUniformMatrix('u_mat', matrix);
    sut.setUniform('uniformMatrix4fv', 'u_mat', false, matrix.data);

    expect(() => {
      sut.setUniformFloat('u_doesntexist', 42);
    }).toThrowError(
      "Uniform uniform1f:u_doesntexist doesn't exist or is not used in the shader source code," +
        ' unused uniforms are optimized away by most browsers'
    );

    expect(() => {
      sut.setUniformInt('u_unused', 42);
    }).toThrowError(
      "Uniform uniform1i:u_unused doesn't exist or is not used in the shader source code," +
        ' unused uniforms are optimized away by most browsers'
    );
  });

  it('can try set uniforms', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `
      attribute vec4 a_position;
      attribute vec3 a_otherposition;
      uniform int u_int;
      uniform int u_intarray[4];
      uniform float u_float;
      uniform float u_floatarray[5];
      uniform vec2 u_vec;
      uniform bool u_bool;
      uniform mat4 u_mat;
      uniform int u_unused;
      // nonsense shader for testing
      void main() {
        if (u_bool) {
          gl_Position = a_position + vec4(a_otherposition, u_float + float(u_int));
        } else {
          gl_Position = u_mat * vec4(1.0, u_vec.x, u_vec.y, u_floatarray[1]);
        }
        gl_Position = vec4(float(u_intarray[0]), float(u_intarray[1]), float(u_intarray[2]), float(u_intarray[3]));
      }`,
      fragmentSource: `
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });
    const logger = ex.Logger.getInstance();
    const loggerSpy = vi.spyOn(logger, 'warn');

    sut.trySetUniformInt('u_int', 0);
    expect(loggerSpy.mock.calls[0]).toEqual(['Must compile shader before setting a uniform uniform1i:u_int']);

    sut.compile();

    sut.trySetUniformInt('u_int', 0);
    expect(loggerSpy.mock.calls[1]).toEqual([
      'Currently accessed shader instance is not the current active shader in WebGL, must call `shader.use()` before setting uniforms'
    ]);
    sut.use();

    sut.trySetUniformInt('u_int', 0);
    sut.trySetUniformIntArray('u_intarray', [0, 1, 2, 3]);
    sut.trySetUniformFloat('u_float', 5.5);
    sut.trySetUniformFloatArray('u_floatarray', [5.5, 4.2]);
    sut.trySetUniformFloatVector('u_vec', ex.vec(1, 2));
    sut.trySetUniformBoolean('u_bool', false);
    const matrix = ex.Matrix.identity();
    sut.setUniformMatrix('u_mat', matrix);
    sut.setUniform('uniformMatrix4fv', 'u_mat', false, matrix.data);

    expect(() => {
      sut.trySetUniformFloat('u_doesntexist', 42);
    }).not.toThrowError(
      "Uniform uniform1f:u_doesntexist doesn't exist or is not used in the shader source code," +
        ' unused uniforms are optimized away by most browsers'
    );

    expect(() => {
      sut.trySetUniformInt('u_unused', 42);
    }).not.toThrowError(
      "Uniform uniform1i:u_unused doesn't exist or is not used in the shader source code," +
        ' unused uniforms are optimized away by most browsers'
    );
  });

  it('can have textures set', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `
      uniform int u_int;
      // nonsense shader for testing
      void main() {
        gl_Position = vec4(1.0, 0, 0, float(u_int));
      }`,
      fragmentSource: `
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });

    sut.compile();
    const tex = gl.createTexture();

    vi.spyOn(gl, 'activeTexture');
    vi.spyOn(gl, 'bindTexture');

    sut.setTexture(5, tex);

    expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE0 + 5);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, tex);
  });
});
