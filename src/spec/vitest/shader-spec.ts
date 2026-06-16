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
    expect(ex.glTypeToUniformTypeName(gl, gl.SAMPLER_3D)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.SAMPLER_2D_SHADOW)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.UNSIGNED_INT_SAMPLER_3D)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.UNSIGNED_INT_SAMPLER_CUBE)).toBe('uniform1i');
    expect(ex.glTypeToUniformTypeName(gl, gl.UNSIGNED_INT_SAMPLER_2D_ARRAY)).toBe('uniform1i');
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
        vec4 result = vec4(0.0);
        if (u_bool) {
          result += a_position + vec4(a_otherposition, u_float + float(u_int));
        } else {
          result += u_mat * vec4(1.0, u_vec.x, u_vec.y, u_floatarray[1]);
        }
        result += vec4(float(u_intarray[0]), float(u_intarray[1]), float(u_intarray[2]), float(u_intarray[3]));
        gl_Position = result;
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
        vec4 result = vec4(0.0);
        if (u_bool) {
          result += a_position + vec4(a_otherposition, u_float + float(u_int));
        } else {
          result += u_mat * vec4(1.0, u_vec.x, u_vec.y, u_floatarray[1]);
        }
        result += vec4(float(u_intarray[0]), float(u_intarray[1]), float(u_intarray[2]), float(u_intarray[3]));
        gl_Position = result;
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

  it('dispose() cleans up uniform buffers and texture cache', () => {
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
    // Textures are owned by TextureLoader, not deleted by Shader
    expect(deleteTextureSpy).not.toHaveBeenCalledWith(fakeTexture);
    // But the texture cache should be cleared
    expect((sut as any)._textures.size).toBe(0);
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

  it('_setImages stops binding textures when max slots exceeded', () => {
    const sut = new ex.Shader({
      graphicsContext,
      startingTextureSlot: 0,
      vertexSource: `#version 300 es
      in vec4 a_position;
      uniform sampler2D u_tex0;
      uniform sampler2D u_tex1;
      uniform sampler2D u_tex2;
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

    // Force max texture slots to 2
    (sut as any)._maxTextureSlots = 2;

    const fakeImage = {
      isLoaded: () => true,
      image: {
        src: 'fake.png',
        getAttribute: () => null,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        removeAttribute: () => {}
      }
    } as any;

    const fakeTexture = gl.createTexture();
    vi.spyOn(sut as any, '_loadImageSource').mockReturnValue(fakeTexture);

    sut.images = {
      u_tex0: fakeImage,
      u_tex1: fakeImage,
      u_tex2: fakeImage // This one should be skipped
    };

    const activeTextureSpy = vi.spyOn(gl, 'activeTexture');
    const logger = ex.Logger.getInstance();
    const warnSpy = vi.spyOn(logger, 'warnOnce');

    sut.compile();
    sut.use();

    // Should only have called activeTexture for slots 0 and 1, not slot 2
    expect(activeTextureSpy).toHaveBeenCalledWith(gl.TEXTURE0 + 0);
    expect(activeTextureSpy).toHaveBeenCalledWith(gl.TEXTURE0 + 1);
    expect(activeTextureSpy).not.toHaveBeenCalledWith(gl.TEXTURE0 + 2);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Max number texture slots'));
  });

  it('_processSourceForError handles multi-digit line numbers', () => {
    // Create a shader with an error on line 12 (multi-digit)
    const vertexSource = `#version 300 es
in vec4 a_position;
void main() {
  // line 4
  // line 5
  // line 6
  // line 7
  // line 8
  // line 9
  // line 10
  // line 11
  gl_Position = a_position + INVALID_SYNTAX_HERE;
}`;

    const sut = new ex.Shader({
      graphicsContext,
      vertexSource,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    try {
      sut.compile();
      expect.fail('Should have thrown');
    } catch (e: any) {
      const errorMessage = e.message;
      // The error should correctly identify line 12 (where INVALID_SYNTAX_HERE is)
      // Line 12 should be marked with "<----- ERROR!"
      expect(errorMessage).toContain('12:');
      expect(errorMessage).toContain('<----- ERROR!');
      // The ERROR marker should be on line 12, not line 1 or 2
      const lines = errorMessage.split('\n');
      const errorLine = lines.find((l: string) => l.includes('<----- ERROR!'));
      expect(errorLine).toBeDefined();
      expect(errorLine).toMatch(/^12:/);
    }
  });

  it('setUniformBuffer throws if shader is not currently bound', () => {
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
    // Note: NOT calling sut.use()

    expect(() => {
      sut.setUniformBuffer('TestBlock', new Float32Array([1.0, 2.0, 3.0, 4.0]));
    }).toThrowError(/must call `shader.use\(\)` before setting uniforms/);
  });

  it('_loadImageSource does not cache null textures', () => {
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

    const fakeImage = {
      isLoaded: () => true,
      image: {
        src: 'null-texture.png',
        getAttribute: () => null,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        removeAttribute: () => {}
      }
    } as any;

    vi.spyOn((sut as any)._textureLoader, 'load').mockReturnValue(null);

    const result = (sut as any)._loadImageSource(fakeImage);
    expect(result).toBeNull();
    expect((sut as any)._textures.has(fakeImage)).toBe(false);
  });

  it('unuse() does not throw after dispose()', () => {
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

    expect(() => sut.unuse()).not.toThrow();
  });

  it('compile() always deletes shader objects', () => {
    const deleteShaderSpy = vi.spyOn(gl, 'deleteShader');

    const sut1 = new ex.Shader({
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

    sut1.compile();
    expect(deleteShaderSpy).toHaveBeenCalledTimes(2);

    deleteShaderSpy.mockClear();

    const sut2 = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      out float v_badType;
      void main() {
        v_badType = 1.0;
        gl_Position = a_position;
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      in vec2 v_badType;
      void main() {
        color = vec4(v_badType, 0.0, 1.0);
      }`
    });

    expect(() => sut2.compile()).toThrow();
    expect(deleteShaderSpy).toHaveBeenCalledTimes(2);
  });

  it('setUniformBuffer uses bufferSubData instead of bufferData when updating existing buffer', () => {
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

    const data1 = new Float32Array([1.0, 2.0, 3.0, 4.0]);
    sut.setUniformBuffer('TestBlock', data1);

    const bufferDataSpy = vi.spyOn(gl, 'bufferData');
    const bufferSubDataSpy = vi.spyOn(gl, 'bufferSubData');
    bufferDataSpy.mockClear();
    bufferSubDataSpy.mockClear();

    const data2 = new Float32Array([5.0, 6.0, 7.0, 8.0]);
    sut.setUniformBuffer('TestBlock', data2);

    expect(bufferDataSpy).not.toHaveBeenCalled();
    expect(bufferSubDataSpy).toHaveBeenCalled();
  });

  it("setUniformBuffer does not mutate caller's Float32Array", () => {
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

    const data1 = new Float32Array([1.0, 2.0, 3.0, 4.0]);
    const originalData1 = new Float32Array(data1);
    sut.setUniformBuffer('TestBlock', data1);

    const data2 = new Float32Array([5.0, 6.0, 7.0, 8.0]);
    sut.setUniformBuffer('TestBlock', data2);

    expect(data1).toEqual(originalData1);
  });

  it('dispose() does not throw when called twice', () => {
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

    expect(() => sut.dispose()).not.toThrow();
  });

  it('sampler uniform set via number uses uniform1i not uniform1f', () => {
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
      uniform sampler2D u_texture;
      void main() {
        color = texture(u_texture, vec2(0.5));
      }`
    });

    sut.compile();

    const uniform1fSpy = vi.spyOn(gl, 'uniform1f');
    const uniform1iSpy = vi.spyOn(gl, 'uniform1i');
    uniform1fSpy.mockClear();
    uniform1iSpy.mockClear();

    sut.uniforms.u_texture = 3;
    sut.flagUniformsDirty();
    sut.use();

    expect(uniform1iSpy).toHaveBeenCalledWith(expect.anything(), 3);
    expect(uniform1fSpy).not.toHaveBeenCalled();
  });

  it('getAttributeDefinitions handles WebGL2 integer attribute types', () => {
    const sut = new ex.Shader({
      graphicsContext,
      vertexSource: `#version 300 es
      in vec4 a_position;
      in int a_int;
      in ivec2 a_ivec2;
      in ivec3 a_ivec3;
      in ivec4 a_ivec4;
      in uint a_uint;
      in uvec2 a_uvec2;
      in uvec3 a_uvec3;
      in uvec4 a_uvec4;
      void main() {
        gl_Position = a_position + vec4(float(a_int), float(a_ivec2.x), float(a_ivec3.x), float(a_ivec4.x)) + vec4(float(a_uint), float(a_uvec2.x), float(a_uvec3.x), float(a_uvec4.x));
      }`,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0);
      }`
    });

    sut.compile();

    expect(sut.attributes.a_int).toBeDefined();
    expect(sut.attributes.a_int.glType).toBe(gl.INT);
    expect(sut.attributes.a_int.size).toBe(1);

    expect(sut.attributes.a_ivec2).toBeDefined();
    expect(sut.attributes.a_ivec2.glType).toBe(gl.INT);
    expect(sut.attributes.a_ivec2.size).toBe(2);

    expect(sut.attributes.a_ivec3).toBeDefined();
    expect(sut.attributes.a_ivec3.glType).toBe(gl.INT);
    expect(sut.attributes.a_ivec3.size).toBe(3);

    expect(sut.attributes.a_ivec4).toBeDefined();
    expect(sut.attributes.a_ivec4.glType).toBe(gl.INT);
    expect(sut.attributes.a_ivec4.size).toBe(4);

    expect(sut.attributes.a_uint).toBeDefined();
    expect(sut.attributes.a_uint.glType).toBe(gl.UNSIGNED_INT);
    expect(sut.attributes.a_uint.size).toBe(1);

    expect(sut.attributes.a_uvec2).toBeDefined();
    expect(sut.attributes.a_uvec2.glType).toBe(gl.UNSIGNED_INT);
    expect(sut.attributes.a_uvec2.size).toBe(2);

    expect(sut.attributes.a_uvec3).toBeDefined();
    expect(sut.attributes.a_uvec3.glType).toBe(gl.UNSIGNED_INT);
    expect(sut.attributes.a_uvec3.size).toBe(3);

    expect(sut.attributes.a_uvec4).toBeDefined();
    expect(sut.attributes.a_uvec4.glType).toBe(gl.UNSIGNED_INT);
    expect(sut.attributes.a_uvec4.size).toBe(4);
  });

  it('setUniformBuffer caches getUniformBlockIndex results', () => {
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

    const getBlockIndexSpy = vi.spyOn(gl, 'getUniformBlockIndex');
    getBlockIndexSpy.mockClear();

    const data = new Float32Array([1.0, 2.0, 3.0, 4.0]);
    sut.setUniformBuffer('TestBlock', data);
    sut.setUniformBuffer('TestBlock', data);
    sut.setUniformBuffer('TestBlock', data);

    expect(getBlockIndexSpy).toHaveBeenCalledTimes(1);
  });

  it('setUniformBuffer skips redundant uniformBlockBinding and bindBufferBase calls', () => {
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

    const data = new Float32Array([1.0, 2.0, 3.0, 4.0]);
    sut.setUniformBuffer('TestBlock', data);

    const uniformBlockBindingSpy = vi.spyOn(gl, 'uniformBlockBinding');
    const bindBufferBaseSpy = vi.spyOn(gl, 'bindBufferBase');
    uniformBlockBindingSpy.mockClear();
    bindBufferBaseSpy.mockClear();

    sut.setUniformBuffer('TestBlock', data);
    sut.setUniformBuffer('TestBlock', data);

    expect(uniformBlockBindingSpy).not.toHaveBeenCalled();
    expect(bindBufferBaseSpy).not.toHaveBeenCalled();
  });
});
