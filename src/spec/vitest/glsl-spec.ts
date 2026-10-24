import * as ex from '@excalibur';

describe('The glsl tagged template literal', () => {
  it('exists', () => {
    expect(ex.glsl).toBeDefined();
  });

  describe('boilerplate', () => {
    it('adds a single #version 300 es as the very first line', () => {
      const source = ex.glsl`
      out vec4 fragColor;
      void main() { fragColor = vec4(1.0); }`;

      expect(source.startsWith('#version 300 es\n')).toBe(true);
      expect(source.match(/#version/g)!.length).toBe(1);
    });

    it('does not duplicate an author supplied #version', () => {
      const source = ex.glsl`#version 300 es
      out vec4 fragColor;
      void main() { fragColor = vec4(1.0); }`;

      expect(source.match(/#version/g)!.length).toBe(1);
    });

    it('adds a default float precision', () => {
      const source = ex.glsl`
      out vec4 fragColor;
      void main() { fragColor = vec4(1.0); }`;

      expect(source).toContain('precision mediump float;');
    });

    it('matches the author declared float precision instead of downgrading it', () => {
      const source = ex.glsl`
      precision highp float;
      out vec4 fragColor;
      void main() { fragColor = vec4(1.0); }`;

      expect(source).toContain('precision highp float;');
      expect(source).not.toContain('precision mediump float;');
    });

    it('leaves vertex shaders alone apart from the #version', () => {
      const source = ex.glsl`
      in vec2 a_position;
      out vec4 v_color;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_color = vec4(1.0);
      }`;

      expect(source.startsWith('#version 300 es\n')).toBe(true);
      // no premultiply wrapper and no downgraded precision
      expect(source).not.toContain('ex_main');
      expect(source).not.toContain('ex_premultiply');
      expect(source).not.toContain('precision');
    });
  });

  describe('sampling calls', () => {
    it('un-premultiplies texture() samples', () => {
      const source = ex.glsl`
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() { fragColor = texture(u_graphic, v_uv); }`;

      expect(source).toContain('fragColor = ex_texture(u_graphic, v_uv);');
      expect(source).toContain('vec4 ex_texture(in sampler2D tex, in vec2 uv) { return ex_unpremultiply(texture(tex, uv)); }');
    });

    it('rewrites textureLod and texelFetch', () => {
      const source = ex.glsl`
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() {
        fragColor = textureLod(u_graphic, v_uv, 0.0) + texelFetch(u_graphic, ivec2(0, 0), 0);
      }`;

      expect(source).toContain('ex_textureLod(u_graphic, v_uv, 0.0)');
      expect(source).toContain('ex_texelFetch(u_graphic, ivec2(0, 0), 0)');
    });

    it('rewrites nested sampling calls without mangling the inner call', () => {
      const source = ex.glsl`
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      uniform vec2 u_size;
      out vec4 fragColor;
      void main() { fragColor = texture(u_graphic, uv_iq(v_uv, u_size)); }`;

      expect(source).toContain('fragColor = ex_texture(u_graphic, uv_iq(v_uv, u_size));');
    });

    it('does not rewrite identifiers that merely end in texture', () => {
      const source = ex.glsl`
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() { fragColor = pixel_texture(u_graphic, v_uv); }`;

      expect(source).toContain('fragColor = pixel_texture(u_graphic, v_uv);');
      expect(source).not.toContain('pixel_ex_texture');
    });

    it('does not rewrite textureSize', () => {
      const source = ex.glsl`
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() { fragColor = vec4(vec2(textureSize(u_graphic, 0)), 0.0, 1.0); }`;

      expect(source).toContain('textureSize(u_graphic, 0)');
      expect(source).not.toContain('ex_textureSize');
    });

    it('leaves ex_texture_raw as a passthrough escape hatch for data textures', () => {
      const source = ex.glsl`
      in vec2 v_uv;
      uniform sampler2D u_lut;
      out vec4 fragColor;
      void main() { fragColor = ex_texture_raw(u_lut, v_uv); }`;

      expect(source).toContain('fragColor = ex_texture_raw(u_lut, v_uv);');
      expect(source).toContain('vec4 ex_texture_raw(in sampler2D tex, in vec2 uv) { return texture(tex, uv); }');
    });
  });

  describe('color output', () => {
    it('renames main and premultiplies the declared output', () => {
      const source = ex.glsl`
      out vec4 fragColor;
      void main() { fragColor = vec4(1.0, 0.0, 0.0, 0.5); }`;

      expect(source).toContain('void ex_main()');
      expect(source).toContain('fragColor = ex_premultiply(fragColor);');
      // exactly one entry point
      expect(source.match(/\bvoid\s+main\s*\(/g)!.length).toBe(1);
    });

    it('uses the author output name, not a hardcoded fragColor', () => {
      const source = ex.glsl`
      out vec4 color;
      void main() { color = vec4(1.0, 0.0, 0.0, 0.5); }`;

      expect(source).toContain('color = ex_premultiply(color);');
    });

    it('handles a layout qualified output', () => {
      const source = ex.glsl`
      layout(location = 0) out vec4 fragColor;
      void main() { fragColor = vec4(1.0); }`;

      expect(source).toContain('fragColor = ex_premultiply(fragColor);');
    });

    it('handles void main(void)', () => {
      const source = ex.glsl`
      out vec4 fragColor;
      void main(void) { fragColor = vec4(1.0); }`;

      expect(source).toContain('void ex_main(void)');
      expect(source).toContain('ex_main();');
    });

    it('does not wrap a shader with no vec4 color output', () => {
      const source = ex.glsl`
      void main() { discard; }`;

      expect(source).not.toContain('ex_main');
    });
  });

  describe('pixel_texture', () => {
    it('injects the filter and u_graphic_resolution when referenced', () => {
      const source = ex.glsl`
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() { fragColor = pixel_texture(u_graphic, v_uv); }`;

      expect(source).toContain('vec4 pixel_texture(in sampler2D tex, in vec2 uv) {');
      expect(source).toContain('uniform vec2 u_graphic_resolution;');
      // it returns straight alpha like every other sample
      expect(source).toContain('return ex_unpremultiply(texture(tex, pixel_uv));');
    });

    it('does not inject u_graphic_resolution if the author declared it', () => {
      const source = ex.glsl`
      in vec2 v_uv;
      uniform vec2 u_graphic_resolution;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() { fragColor = pixel_texture(u_graphic, v_uv); }`;

      expect(source.match(/uniform vec2 u_graphic_resolution;/g)!.length).toBe(1);
    });

    it('is not injected when unreferenced', () => {
      const source = ex.glsl`
      out vec4 fragColor;
      void main() { fragColor = vec4(1.0); }`;

      expect(source).not.toContain('pixel_texture');
    });
  });

  describe('#pragma excalibur premultiply(off)', () => {
    it('disables both rewrites and strips the pragma', () => {
      const source = ex.glsl`
      #pragma excalibur premultiply(off)
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() { fragColor = texture(u_graphic, v_uv); }`;

      expect(source).not.toContain('#pragma');
      expect(source).not.toContain('ex_texture');
      expect(source).not.toContain('ex_premultiply');
      expect(source).not.toContain('ex_main');
      expect(source).toContain('fragColor = texture(u_graphic, v_uv);');
    });

    it('still adds the #version, precision and pixel_texture', () => {
      const source = ex.glsl`
      #pragma excalibur premultiply(off)
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() { fragColor = pixel_texture(u_graphic, v_uv); }`;

      expect(source.startsWith('#version 300 es\n')).toBe(true);
      expect(source).toContain('precision mediump float;');
      expect(source).toContain('vec4 pixel_texture(in sampler2D tex, in vec2 uv) {');
      // raw sample, no alpha conversion
      expect(source).toContain('return texture(tex, pixel_uv);');
    });
  });

  describe('idempotence', () => {
    // re-tagging must not rewrite the texture() calls inside the injected helper bodies,
    // which would turn ex_texture into infinite recursion
    const retag = (source: string) => ex.glsl(Object.assign([source], { raw: [source] }) as unknown as TemplateStringsArray);

    it('is a no-op on its own output', () => {
      const once = ex.glsl`
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() { fragColor = texture(u_graphic, v_uv); }`;

      expect(retag(once)).toBe(once);
    });

    it('does not make the sampling helpers recursive', () => {
      const twice = retag(ex.glsl`
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() { fragColor = texture(u_graphic, v_uv); }`);

      expect(twice).toContain('vec4 ex_texture(in sampler2D tex, in vec2 uv) { return ex_unpremultiply(texture(tex, uv)); }');
      expect(twice).not.toContain('ex_unpremultiply(ex_texture(');
      expect(twice.match(/vec4 ex_premultiply\(vec4 color\)/g)!.length).toBe(1);
      expect(twice.match(/#version/g)!.length).toBe(1);
      expect(twice.match(/\bvoid\s+main\s*\(/g)!.length).toBe(1);
    });

    it('is a no-op on a pragma-off shader, which would otherwise re-enable the transform', () => {
      const once = ex.glsl`
      #pragma excalibur premultiply(off)
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() { fragColor = texture(u_graphic, v_uv); }`;

      expect(retag(once)).toBe(once);
      expect(retag(once)).not.toContain('ex_texture');
    });

    it('is a no-op on a vertex shader', () => {
      const once = ex.glsl`
      in vec2 a_position;
      void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

      expect(retag(once)).toBe(once);
    });
  });

  it('warns when the author also premultiplies by hand', () => {
    const warnSpy = vi.spyOn(ex.Logger.getInstance(), 'warnOnce');
    const _ = ex.glsl`
    in vec2 v_uv;
    uniform sampler2D u_graphic;
    out vec4 fragColor;
    void main() {
      fragColor = texture(u_graphic, v_uv);
      fragColor.rgb *= fragColor.a;
    }`;

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('premultiplies alpha by hand'));
    expect(_).toBeDefined();
  });

  describe('compiles in webgl', () => {
    let graphicsContext: ex.ExcaliburGraphicsContextWebGL;

    beforeEach(() => {
      const canvas = document.createElement('canvas');
      graphicsContext = new ex.ExcaliburGraphicsContextWebGL({ canvasElement: canvas });
    });

    const compile = (fragmentSource: string) => graphicsContext.createMaterial({ name: 'test', fragmentSource });

    it('compiles a straight alpha material', () => {
      expect(() =>
        compile(ex.glsl`
        in vec2 v_uv;
        uniform sampler2D u_graphic;
        uniform float u_opacity;
        out vec4 fragColor;
        void main() {
          vec4 color = texture(u_graphic, v_uv);
          color.a *= u_opacity;
          fragColor = color;
        }`)
      ).not.toThrow();
    });

    it('compiles every injected helper overload', () => {
      expect(() =>
        compile(ex.glsl`
        in vec2 v_uv;
        uniform sampler2D u_graphic;
        out vec4 fragColor;
        void main() {
          fragColor = texture(u_graphic, v_uv)
            + texture(u_graphic, v_uv, 0.0)
            + textureLod(u_graphic, v_uv, 0.0)
            + texelFetch(u_graphic, ivec2(0, 0), 0)
            + ex_texture_raw(u_graphic, v_uv)
            + ex_premultiply(ex_unpremultiply(vec4(1.0)));
        }`)
      ).not.toThrow();
    });

    it('compiles a pixel_texture material', () => {
      expect(() =>
        compile(ex.glsl`
        in vec2 v_uv;
        uniform sampler2D u_graphic;
        out vec4 fragColor;
        void main() { fragColor = pixel_texture(u_graphic, v_uv); }`)
      ).not.toThrow();
    });

    it('compiles with the premultiply pragma off', () => {
      expect(() =>
        compile(ex.glsl`
        #pragma excalibur premultiply(off)
        in vec2 v_uv;
        uniform sampler2D u_graphic;
        out vec4 fragColor;
        void main() {
          fragColor = texture(u_graphic, v_uv);
          fragColor.rgb *= fragColor.a;
        }`)
      ).not.toThrow();
    });
  });
});
