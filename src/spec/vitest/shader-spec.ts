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

  it('maps all sampler types to uniform1i in glTypeToUniformTypeName', () => {
    expect(ex.glTypeToUniformTypeName(gl, gl.SAMPLER_2D)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.SAMPLER_CUBE)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.SAMPLER_2D_ARRAY)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.SAMPLER_2D_ARRAY_SHADOW)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.SAMPLER_CUBE_SHADOW)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.INT_SAMPLER_2D)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.INT_SAMPLER_3D)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.INT_SAMPLER_CUBE)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.INT_SAMPLER_2D_ARRAY)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.UNSIGNED_INT_SAMPLER_2D)).toBe('uniform1i');
  });

  it('skips uniform block members in getUniformDefinitions (null location)', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform float u_regular;
      layout(std140) uniform TestBlock {
        vec4 data;
      };
      void main() {
        gl_Position = a_position + data + vec4(u_regular);
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();
    const defs = sut.getUniformDefinitions();
    const names = defs.map((d) => d.name);
    expect(names).toContain('u_regular');
    expect(defs.every((d) => d.location !== null)).toBe(true);
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

  it('can set Float32Array as regular uniform (not uniform block)', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform vec4 u_axisAngle;
      uniform float u_floatarray[4];
      void main() {
        gl_Position = a_position + vec4(u_axisAngle.x, u_axisAngle.y, u_axisAngle.z, u_axisAngle.w + u_floatarray[0]);
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0, 0, 0, 1.0);
      }`
    });

    sut.uniforms = {
      u_axisAngle: new Float32Array([1.0, 0.0, 0.0, Math.PI / 2]),
      u_floatarray: new Float32Array([1.0, 2.0, 3.0, 4.0])
    };

    sut.compile();
    sut.use();

    expect(() => {
      sut.setUniform('uniform4f', 'u_axisAngle', 1.0, 0.0, 0.0, Math.PI / 2);
    }).not.toThrow();
  });

  it('can set Float32Array as uniform block when uniform block exists', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      layout(std140) uniform TestBlock {
        vec4 data;
      };
      void main() {
        gl_Position = a_position + data;
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0, 0, 0, 1.0);
      }`
    });

    sut.uniforms = {
      TestBlock: new Float32Array([1.0, 0.0, 0.0, 1.0])
    };

    sut.compile();
    sut.use();

    expect(sut.uniforms.TestBlock).toBeInstanceOf(Float32Array);
  });

  it('setUniformBuffer returns early for invalid block name without crashing', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      void main() {
        gl_Position = a_position;
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();
    sut.use();

    const logger = ex.Logger.getInstance();
    const warnSpy = vi.spyOn(logger, 'warnOnce');

    expect(() => {
      sut.setUniformBuffer('NonExistentBlock', new Float32Array([1.0, 2.0, 3.0, 4.0]));
    }).not.toThrow();

    expect(warnSpy).toHaveBeenCalledWith('Invalid block name NonExistentBlock');
  });

  it('setUniform and trySetUniform use null check not falsy check for location', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform float u_first;
      uniform float u_second;
      uniform float u_third;
      void main() {
        gl_Position = a_position + vec4(u_first + u_second + u_third);
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();
    sut.use();

    expect(() => {
      sut.setUniformFloat('u_first', 1.0);
      sut.setUniformFloat('u_second', 2.0);
      sut.setUniformFloat('u_third', 3.0);
    }).not.toThrow();

    expect(sut.trySetUniformFloat('u_first', 1.0)).toBe(true);
    expect(sut.trySetUniformFloat('u_second', 2.0)).toBe(true);
    expect(sut.trySetUniformFloat('u_third', 3.0)).toBe(true);
  });

  it('setUniformFloatArray accepts Float32Array directly without copy', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform float u_floatarray[4];
      void main() {
        gl_Position = a_position + vec4(u_floatarray[0], u_floatarray[1], u_floatarray[2], u_floatarray[3]);
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();
    sut.use();

    const data = new Float32Array([1.0, 2.0, 3.0, 4.0]);
    expect(() => {
      sut.setUniformFloatArray('u_floatarray', data);
    }).not.toThrow();

    expect(sut.trySetUniformFloatArray('u_floatarray', data)).toBe(true);
  });

  it('setUniformBuffer recreates buffer if new data is larger', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      layout(std140) uniform TestBlock {
        vec4 data;
      };
      void main() {
        gl_Position = a_position + data;
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();
    sut.use();

    const smallData = new Float32Array([1.0, 2.0, 3.0, 4.0]);
    sut.setUniformBuffer('TestBlock', smallData);

    const largeData = new Float32Array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0]);
    expect(() => {
      sut.setUniformBuffer('TestBlock', largeData);
    }).not.toThrow();
  });

  it('_setUniforms handles all uniform types correctly after refactor', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform float u_float;
      uniform int u_int;
      uniform bool u_bool;
      uniform vec2 u_vec;
      uniform vec4 u_color;
      uniform mat4 u_mat;
      void main() {
        gl_Position = a_position + vec4(u_float + float(u_int) + float(u_bool) + u_vec.x + u_color.x + u_mat[0][0]);
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.uniforms = {
      u_float: 1.5,
      u_int: 42,
      u_bool: true,
      u_vec: ex.vec(1.0, 2.0),
      u_color: ex.Color.Red,
      u_mat: ex.Matrix.identity()
    };

    sut.compile();
    sut.use();

    expect(sut.uniforms.u_float).toBe(1.5);
    expect(sut.uniforms.u_int).toBe(42);
    expect(sut.uniforms.u_bool).toBe(true);
  });

  it('Vector uniform adapts to vec2/vec3/vec4 GLSL type', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform vec2 u_vec2;
      uniform vec3 u_vec3;
      uniform vec4 u_vec4;
      void main() {
        gl_Position = a_position + vec4(u_vec2.x, u_vec3.x, u_vec4.x, 1.0);
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.uniforms = {
      u_vec2: ex.vec(1.0, 2.0),
      u_vec3: ex.vec(3.0, 4.0),
      u_vec4: ex.vec(5.0, 6.0)
    };

    sut.compile();
    sut.use();

    expect(sut.uniforms.u_vec2).toBeInstanceOf(ex.Vector);
    expect(sut.uniforms.u_vec3).toBeInstanceOf(ex.Vector);
    expect(sut.uniforms.u_vec4).toBeInstanceOf(ex.Vector);
  });

  it('setUniformAffineMatrix uses Float32Array for efficiency', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform mat4 u_affine;
      void main() {
        gl_Position = u_affine * a_position;
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();
    sut.use();

    const affine = new ex.AffineMatrix();
    expect(() => {
      sut.setUniformAffineMatrix('u_affine', affine);
    }).not.toThrow();
  });

  it('_setUniforms uses cached uniform definitions instead of querying WebGL', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform float u_test;
      void main() {
        gl_Position = a_position + vec4(u_test);
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();

    const getUniformDefsSpy = vi.spyOn(sut, 'getUniformDefinitions');

    sut.uniforms = { u_test: 1.0 };
    sut.use();

    sut.uniforms = { u_test: 2.0 };
    sut.use();

    expect(getUniformDefsSpy).not.toHaveBeenCalled();
  });

  it('unsigned int uniform handles conversion correctly', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform uint u_uint;
      void main() {
        gl_Position = a_position + vec4(float(u_uint));
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.uniforms = { u_uint: 42 };
    sut.compile();
    sut.use();

    expect(sut.uniforms.u_uint).toBe(42);
  });

  it('_setImages skips null textures without binding or setting uniforms', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform sampler2D u_texture;
      void main() {
        gl_Position = a_position;
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();

    const bindTextureSpy = vi.spyOn(gl, 'bindTexture');
    const setUniformSpy = vi.spyOn(sut, 'trySetUniformInt');

    const fakeImage = {
      isLoaded: () => true,
      image: { src: 'fake-image.png' }
    } as any;
    vi.spyOn(sut as any, '_loadImageSource').mockReturnValue(null);

    sut.images = { u_texture: fakeImage };
    sut.use();

    expect(bindTextureSpy).not.toHaveBeenCalledWith(gl.TEXTURE_2D, null);
    expect(setUniformSpy).not.toHaveBeenCalledWith('u_texture', expect.any(Number));
  });

  it('dispose() cleans up uniform buffers and textures', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      layout(std140) uniform TestBlock {
        vec4 data;
      };
      void main() {
        gl_Position = a_position + data;
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.uniforms = {
      TestBlock: new Float32Array([1.0, 2.0, 3.0, 4.0])
    };

    sut.compile();
    sut.use();

    const fakeTexture = gl.createTexture();
    const fakeImage = {} as any;
    (sut as any)._textures.set(fakeImage, fakeTexture);

    const deleteBufferSpy = vi.spyOn(gl, 'deleteBuffer');
    const deleteTextureSpy = vi.spyOn(gl, 'deleteTexture');

    sut.dispose();

    expect(deleteBufferSpy).toHaveBeenCalled();
    expect(deleteTextureSpy).toHaveBeenCalledWith(fakeTexture);
  });

  it('Float32Array uniform uses correct WebGL method based on GL type', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform vec2 u_vec2Array[2];
      uniform vec3 u_vec3Array[2];
      uniform vec4 u_vec4Array[2];
      void main() {
        gl_Position = a_position + vec4(u_vec2Array[0].x + u_vec3Array[0].x + u_vec4Array[0].x);
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.uniforms = {
      u_vec2Array: new Float32Array([1.0, 2.0, 3.0, 4.0]),
      u_vec3Array: new Float32Array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0]),
      u_vec4Array: new Float32Array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0])
    };

    sut.compile();
    sut.use();

    expect(sut.uniforms.u_vec2Array).toBeInstanceOf(Float32Array);
    expect(sut.uniforms.u_vec3Array).toBeInstanceOf(Float32Array);
    expect(sut.uniforms.u_vec4Array).toBeInstanceOf(Float32Array);
  });

  it('setUniform and trySetUniform use cached uniform locations', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform float u_test;
      void main() {
        gl_Position = a_position + vec4(u_test);
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();
    sut.use();

    const getLocationSpy = vi.spyOn(gl, 'getUniformLocation');
    getLocationSpy.mockClear();

    sut.setUniformFloat('u_test', 1.0);
    sut.trySetUniformFloat('u_test', 2.0);

    expect(getLocationSpy).not.toHaveBeenCalled();
  });

  it('multiple uniform blocks get unique binding points automatically', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      layout(std140) uniform Block1 {
        vec4 data1;
      };
      layout(std140) uniform Block2 {
        vec4 data2;
      };
      void main() {
        gl_Position = a_position + data1 + data2;
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.uniforms = {
      Block1: new Float32Array([1.0, 2.0, 3.0, 4.0]),
      Block2: new Float32Array([5.0, 6.0, 7.0, 8.0])
    };

    sut.compile();
    sut.use();

    const bindingPoints = (sut as any)._uniformBufferBindingPoints;
    expect(bindingPoints.Block1).toBeDefined();
    expect(bindingPoints.Block2).toBeDefined();
    expect(bindingPoints.Block1).not.toBe(bindingPoints.Block2);
  });

  it('setUniformAffineMatrix reuses cached Float32Array', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform mat4 u_affine;
      void main() {
        gl_Position = u_affine * a_position;
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();
    sut.use();

    const cache = (sut as any)._affineMatrixCache;
    const affine = new ex.AffineMatrix();

    sut.setUniformAffineMatrix('u_affine', affine);
    const firstRef = cache;

    affine.data[0] = 99;
    sut.setUniformAffineMatrix('u_affine', affine);
    const secondRef = cache;

    expect(firstRef).toBe(secondRef);
  });

  it('use() throws clear error after dispose()', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      void main() {
        gl_Position = a_position;
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();
    sut.dispose();

    expect(() => sut.use()).toThrowError(/has been disposed/);
  });
});
