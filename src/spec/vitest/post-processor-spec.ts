import * as ex from '@excalibur';

describe('A PostProcessor', () => {
  it('rejects a post processor without process()', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black
    });

    const invalid = { initialize: vi.fn() } as unknown as ex.PostProcessor;
    expect(() => context.addPostProcessor(invalid)).toThrow(/process\(\)/);
  });

  describe('with a process() multipass post processor', () => {
    function createContext(width = 100, height = 100) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        backgroundColor: ex.Color.Black,
        antialiasing: false,
        snapToPixel: true
      });
      return { canvas, context };
    }

    class MockProcessPostProcessor implements ex.PostProcessor {
      initialize = vi.fn();
      process = vi.fn();
      onUpdate = vi.fn();
    }

    it('receives the screen source and an output framebuffer during flush', () => {
      const { context } = createContext();
      const mock = new MockProcessPostProcessor();
      context.addPostProcessor(mock);
      expect(mock.initialize).toHaveBeenCalledWith(context);

      context.beginDrawLifecycle();
      context.clear();
      context.flush();
      context.endDrawLifecycle();

      expect(mock.process).toHaveBeenCalledTimes(1);
      const [source, destination] = mock.process.mock.calls[0];
      expect(source).toBeInstanceOf(ex.Framebuffer);
      expect(destination).toBeInstanceOf(ex.Framebuffer);
      expect(source).not.toBe(destination);
      expect(destination.width).toBe(100);
      expect(destination.height).toBe(100);
      context.dispose();
    });

    it('accepts a ShaderPipelineLike effect directly', () => {
      const { context } = createContext();
      const bloom = new ex.BloomEffect({ graphicsContext: context });
      const processSpy = vi.spyOn(bloom, 'process');
      context.addPostProcessor(bloom);

      context.beginDrawLifecycle();
      context.clear();
      context.flush();
      context.endDrawLifecycle();

      expect(processSpy).toHaveBeenCalledTimes(1);
      bloom.dispose();
      context.dispose();
    });

    it('does not require a shader during updatePostProcessors', () => {
      const { context } = createContext();
      const mock = new MockProcessPostProcessor();
      context.addPostProcessor(mock);

      expect(() => context.updatePostProcessors(10)).not.toThrow();
      expect(mock.onUpdate).toHaveBeenCalledWith(10);
      context.dispose();
    });

    it('chains post processors in order', () => {
      const { context } = createContext();
      const order: string[] = [];
      const first = new MockProcessPostProcessor();
      first.process.mockImplementation(() => order.push('first'));
      const second = new MockProcessPostProcessor();
      second.process.mockImplementation(() => order.push('second'));

      context.addPostProcessor(first);
      context.addPostProcessor(second);

      context.beginDrawLifecycle();
      context.clear();
      context.flush();
      context.endDrawLifecycle();

      expect(order).toEqual(['first', 'second']);
      context.dispose();
    });
  });

  describe('A ShaderPipelinePostProcessor', () => {
    function createContext(width = 16, height = 16) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        backgroundColor: ex.Color.Black,
        antialiasing: false,
        snapToPixel: true
      });
      return { canvas, context };
    }

    it('throws without passes', () => {
      expect(() => new ex.ShaderPipelinePostProcessor({} as any)).toThrow(/must be provided passes/);
      expect(() => new ex.ShaderPipelinePostProcessor({ passes: [] })).toThrow(/must be provided passes/);
    });

    it('throws accessing the pipeline before initialize', () => {
      const pp = new ex.ShaderPipelinePostProcessor({ passes: ['out vec4 fragColor; void main() { fragColor = vec4(1.); }'] });
      expect(() => pp.pipeline).toThrow(/not initialized/);
    });

    it('builds a pipeline from passes and forwards elapsed to process', () => {
      const { context } = createContext();
      const pp = new ex.ShaderPipelinePostProcessor({
        passes: [
          `#version 300 es
           precision mediump float;
           in vec2 v_uv;
           uniform sampler2D u_image;
           out vec4 fragColor; 
           void main() { fragColor = texture(u_image, v_uv); }`
        ]
      });
      context.addPostProcessor(pp);
      expect(pp.pipeline).toBeInstanceOf(ex.ShaderPipeline);

      const processSpy = vi.spyOn(pp.pipeline, 'process');
      context.updatePostProcessors(16);
      context.beginDrawLifecycle();
      context.clear();
      context.flush();
      context.endDrawLifecycle();

      expect(processSpy).toHaveBeenCalledTimes(1);
      expect(processSpy.mock.calls[0][2]).toEqual({ elapsed: 16 });
      context.dispose();
    });

    it('accepts a custom ShaderPipelineLike', () => {
      const { context } = createContext();
      const custom: ex.ShaderPipelineLike = {
        process: vi.fn(),
        dispose: vi.fn()
      };
      const pp = new ex.ShaderPipelinePostProcessor({ passes: custom });
      context.addPostProcessor(pp);

      context.beginDrawLifecycle();
      context.clear();
      context.flush();
      context.endDrawLifecycle();

      expect(custom.process).toHaveBeenCalledTimes(1);
      pp.dispose();
      expect(custom.dispose).toHaveBeenCalled();
      context.dispose();
    });

    it('applies a fullscreen 2-pass tint pipeline end to end', () => {
      const { context } = createContext(4, 4);
      // paint the frame solid white then run red-channel and green-channel passes
      context.backgroundColor = ex.Color.White;
      const redOnly = `#version 300 es
        precision mediump float;
        in vec2 v_uv;
        uniform sampler2D u_image;
        out vec4 fragColor;
        void main() {
          vec4 color = texture(u_image, v_uv);
          fragColor = vec4(color.r, 0.0, 0.0, 1.0);
        }`;
      const shiftRedToGreen = `#version 300 es
        precision mediump float;
        in vec2 v_uv;
        uniform sampler2D u_image;
        out vec4 fragColor;
        void main() {
          vec4 color = texture(u_image, v_uv);
          fragColor = vec4(0.0, color.r, 0.0, 1.0);
        }`;
      context.addPostProcessor(new ex.ShaderPipelinePostProcessor({ passes: [redOnly, shiftRedToGreen] }));

      context.beginDrawLifecycle();
      context.clear();
      context.flush();
      context.endDrawLifecycle();

      // white background -> red pass -> green pass
      const gl = context.__gl;
      const pixel = new Uint8Array(4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.readPixels(2, 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      expect(Array.from(pixel)).toEqual([0, 255, 0, 255]);
      context.dispose();
    });
  });
});
