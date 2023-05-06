import * as ex from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';

describe('A VertexLayout', () => {
  let gl: WebGL2RenderingContext;
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    const _ctx = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas
    });

    gl = _ctx.__gl;
  });

  it('exists', () => {
    expect(ex.VertexLayout).toBeDefined();
  });

  it('can be constructed', () => {
    const shader = new ex.Shader({
      gl,
      vertexSource: `
      // nonsense shader for testing
      void main() {
        gl_Position = vec4(1.0, 1.0, 0, 1.0);
      }`,
      fragmentSource: `
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });
    shader.compile();
    const vertexBuffer = new ex.VertexBuffer({
      gl,
      size: 2 * 100,
      type: 'dynamic'
    });

    expect(() => {
      const sut = new ex.VertexLayout({
        gl,
        shader,
        vertexBuffer,
        attributes: []
      });
    }).not.toThrow();
  });

  it('requires a compiled shader', () => {
    const shader = new ex.Shader({
      gl,
      vertexSource: `
      attribute vec2 a_position;
      // nonsense shader for testing
      void main() {
        gl_Position = vec4(a_position, 0, 1.0);
      }`,
      fragmentSource: `
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });
    const vertexBuffer = new ex.VertexBuffer({
      gl,
      size: 2 * 100,
      type: 'dynamic'
    });
    expect(() => {
      const sut = new ex.VertexLayout({
        gl,
        shader,
        vertexBuffer,
        attributes: [
          ['a_position', 2]
        ]
      });
    }).toThrowError('Shader not compiled, shader must be compiled before defining a vertex layout');
  });

  it('will throw on invalid attribute name', () => {
    const shader = new ex.Shader({
      gl,
      vertexSource: `
      attribute vec2 a_position;
      // nonsense shader for testing
      void main() {
        gl_Position = vec4(a_position, 0, 1.0);
      }`,
      fragmentSource: `
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });
    shader.compile();
    const vertexBuffer = new ex.VertexBuffer({
      gl,
      size: 2 * 100,
      type: 'dynamic'
    });
    expect(() => {
      const sut = new ex.VertexLayout({
        gl,
        shader,
        vertexBuffer,
        attributes: [
          ['a_invalid', 2]
        ]
      });
    }).toThrowMatching((e: Error) => e.message.includes('attribute named: a_invalid size 2 not found'));
  });

  it('will throw on invalid attribute size', () => {
    const shader = new ex.Shader({
      gl,
      vertexSource: `
      attribute vec2 a_position;
      // nonsense shader for testing
      void main() {
        gl_Position = vec4(a_position, 0, 1.0);
      }`,
      fragmentSource: `
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });
    shader.compile();
    const vertexBuffer = new ex.VertexBuffer({
      gl,
      size: 2 * 100,
      type: 'dynamic'
    });
    expect(() => {
      const sut = new ex.VertexLayout({
        gl,
        shader,
        vertexBuffer,
        attributes: [
          ['a_position', 4]
        ]
      });
    }).toThrowMatching((e: Error) => e.message.includes('VertexLayout size definition for attribute: [a_position, 4]'));
  });

  it('will calculate vertex size and webgl vbo corretly', () => {
    const shader = new ex.Shader({
      gl,
      vertexSource: `
      attribute vec2 a_position;
      attribute vec2 a_uv;
      varying vec2 v_uv;
      void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_position, 0, 1.0);
      }`,
      fragmentSource: `
      precision mediump float;
      varying vec2 v_uv;
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });
    shader.compile();
    const vertexBuffer = new ex.VertexBuffer({
      gl,
      size: 4 * 100,
      type: 'dynamic'
    });

    const sut = new ex.VertexLayout({
      gl,
      shader,
      vertexBuffer,
      attributes: [
        ['a_position', 2],
        ['a_uv', 2]
      ]
    });
    expect(sut.totalVertexSizeBytes).withContext('pos is 2x4 + uv is 2x4').toBe(16);
    spyOn(gl, 'vertexAttribPointer').and.callThrough();
    const vertexAttribPointerSpy = gl.vertexAttribPointer as jasmine.Spy;
    spyOn(gl, 'enableVertexAttribArray').and.callThrough();
    const enableVertexAttribArraySpy = gl.enableVertexAttribArray as jasmine.Spy;

    shader.use();
    sut.use();

    const pos = shader.attributes.a_position;
    const uv = shader.attributes.a_uv;
    expect(vertexAttribPointerSpy.calls.argsFor(0)).toEqual([
      pos.location,
      2,
      gl.FLOAT,
      false,
      16,
      0
    ]);
    expect(enableVertexAttribArraySpy.calls.argsFor(0)).toEqual([
      pos.location
    ]);
    expect(vertexAttribPointerSpy.calls.argsFor(1)).toEqual([
      uv.location,
      2,
      gl.FLOAT,
      false,
      16,
      8
    ]);
    expect(enableVertexAttribArraySpy.calls.argsFor(1)).toEqual([
      uv.location
    ]);

    expect(gl.vertexAttribPointer).toHaveBeenCalledTimes(2);
    expect(gl.enableVertexAttribArray).toHaveBeenCalledTimes(2);
  });

  it('can have multiple layouts per shader', () => {
    const shader = new ex.Shader({
      gl,
      vertexSource: `
      attribute vec2 a_position;
      attribute vec2 a_uv;
      varying vec2 v_uv;
      void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_position, 0, 1.0);
      }`,
      fragmentSource: `
      precision mediump float;
      varying vec2 v_uv;
      void main() {
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
      }`
    });
    shader.compile();
    const vertexBufferPos = new ex.VertexBuffer({
      gl,
      size: 2 * 100,
      type: 'dynamic'
    });

    const vertexBufferUV = new ex.VertexBuffer({
      gl,
      size: 2 * 100,
      type: 'static'
    });

    const sut1 = new ex.VertexLayout({
      gl,
      shader,
      vertexBuffer: vertexBufferPos,
      attributes: [
        ['a_position', 2]
      ]
    });

    const sut2 = new ex.VertexLayout({
      gl,
      shader,
      vertexBuffer: vertexBufferUV,
      attributes: [
        ['a_uv', 2]
      ]
    });

    shader.use();
    sut1.use(true);
    sut2.use(true);
  });

});