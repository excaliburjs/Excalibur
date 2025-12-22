import * as ex from '@excalibur';
import { TestUtils } from '../__util__/TestUtils';

describe('A Material', () => {
  let engine: ex.Engine;
  let graphicsContext: ex.ExcaliburGraphicsContext;

  beforeEach(() => {
    engine = TestUtils.engine();
    graphicsContext = engine.graphicsContext;
  });
  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
    graphicsContext = null;
  });

  it('exists', () => {
    expect(ex.Material).toBeDefined();
  });

  it('can be created with a name', () => {
    const material = new ex.Material({
      name: 'test',
      graphicsContext,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0, 0.0, 0.0, 1.0);
      }`
    });

    expect(material.name).toBe('test');
  });

  it('will warn if you override built in u_graphic', () => {
    const warnSpy = vi.spyOn(ex.Logger.getInstance(), 'warn');
    const material = new ex.Material({
      name: 'override-test',
      graphicsContext,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0, 0.0, 0.0, 1.0);
      }`,
      images: {
        u_graphic: new ex.ImageSource('')
      }
    });

    expect(material.name).toBe('override-test');
    expect(warnSpy).toHaveBeenCalledWith(
      'Material named "override-test" is overriding built in image u_graphic, is this on purpose? If so ignore this warning.'
    );
  });

  it('does not throw when use() is called after ctor', () => {
    const material = new ex.Material({
      name: 'test',
      graphicsContext,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0, 0.0, 0.0, 1.0);
      }`
    });

    expect(() => material.use()).not.toThrow();
  });

  describe('@visual', () => {
    it('can be created with a custom fragment shader', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const graphicsContext = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        backgroundColor: ex.Color.Black,
        antialiasing: false,
        snapToPixel: true
      });
      const material = new ex.Material({
        name: 'test',
        graphicsContext,
        color: ex.Color.Red,
        fragmentSource: `#version 300 es
      precision mediump float;
      // UV coord
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      uniform vec4 u_color;
      uniform float u_opacity;
      out vec4 fragColor;
      void main() {
        vec4 color = u_color;
        color = texture(u_graphic, v_uv);
        color.rgb = color.rgb * u_opacity;
        color.a = color.a * u_opacity;
        fragColor = color * u_color;
      }`
      });

      const tex = new ex.ImageSource('/src/spec/assets/images/MaterialRendererSpec/sword.png');
      await tex.load();

      graphicsContext.clear();
      graphicsContext.save();
      graphicsContext.material = material;
      graphicsContext.drawImage(tex.image, 0, 0);
      graphicsContext.flush();
      graphicsContext.restore();

      expect(graphicsContext.material).toBe(null);
      await expect(canvas).toEqualImage('/src/spec/assets/images/MaterialRendererSpec/material.png');
      graphicsContext.dispose();
    });

    it('can draw the screen texture', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const context = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        backgroundColor: ex.Color.ExcaliburBlue,
        antialiasing: false,
        snapToPixel: true
      });

      const material = context.createMaterial({
        name: 'test',
        color: ex.Color.Red,
        fragmentSource: `#version 300 es
      precision mediump float;
      // UV coord
      in vec2 v_uv;
      in vec2 v_screenuv;
      uniform sampler2D u_screen_texture;
      uniform sampler2D u_graphic;

      out vec4 fragColor;
      void main() {
        fragColor = texture(u_screen_texture, v_screenuv) * texture(u_graphic, v_uv);
      }`
      });

      const tex = new ex.ImageSource('/src/spec/assets/images/MaterialRendererSpec/sword.png');
      await tex.load();

      context.clear();
      context.save();
      context.material = material;
      context.drawImage(tex.image, 0, 0);
      context.flush();
      context.restore();

      expect(context.material).toBe(null);
      await expect(canvas).toEqualImage('/src/spec/assets/images/MaterialRendererSpec/multiply-comp.png');
      context.dispose();
    });

    it('can update uniforms with the .update()', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const context = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        backgroundColor: ex.Color.ExcaliburBlue,
        antialiasing: false,
        snapToPixel: true
      });

      const material = context.createMaterial({
        name: 'test',
        color: ex.Color.Red,
        fragmentSource: `#version 300 es
      precision mediump float;
      // UV coord
      in vec2 v_uv;
      in vec2 v_screenuv;
      uniform sampler2D u_screen_texture;
      uniform sampler2D u_graphic;
      uniform vec4 customcolor;

      out vec4 fragColor;
      void main() {
        fragColor = texture(u_screen_texture, v_screenuv) * texture(u_graphic, v_uv) - customcolor;
      }`
      });

      const tex = new ex.ImageSource('/src/spec/assets/images/MaterialRendererSpec/sword.png');
      await tex.load();

      context.clear();
      context.save();
      context.material = material;
      material.update((shader) => {
        shader.setUniformFloatColor('customcolor', ex.Color.Red);
      });
      context.drawImage(tex.image, 0, 0);
      context.flush();
      context.restore();

      expect(context.material).toBe(null);
      await expect(canvas).toEqualImage('/src/spec/assets/images/MaterialRendererSpec/update-uniform.png');
    });

    it('can be created with a custom fragment shader with the graphics component', async () => {
      const engine = TestUtils.engine({
        width: 100,
        height: 100,
        antialiasing: false,
        snapToPixel: true
      });
      const graphicsContext = engine.graphicsContext as ex.ExcaliburGraphicsContextWebGL;
      const material = new ex.Material({
        name: 'test',
        graphicsContext,
        color: ex.Color.Red,
        fragmentSource: `#version 300 es
      precision mediump float;
      // UV coord
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      uniform vec4 u_color;
      uniform float u_opacity;
      out vec4 fragColor;
      void main() {
        vec4 color = u_color;
        color = texture(u_graphic, v_uv);
        color.rgb = color.rgb * u_opacity;
        color.a = color.a * u_opacity;
        fragColor = color * u_color;
      }`
      });

      const tex = new ex.ImageSource('/src/spec/assets/images/MaterialRendererSpec/sword.png');

      const loader = new ex.Loader([tex]);

      await TestUtils.runToReady(engine, loader);

      const actor = new ex.Actor({
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });
      actor.graphics.use(tex.toSprite());
      actor.graphics.material = material;

      graphicsContext.clear();
      engine.currentScene.add(actor);
      engine.currentScene.draw(graphicsContext, 100);
      graphicsContext.flush();

      expect(graphicsContext.material).toBe(null);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/MaterialRendererSpec/material-component.png');
      engine.dispose();
    });

    it('can be draw multiple materials', async () => {
      const engine = TestUtils.engine({
        width: 100,
        height: 100,
        antialiasing: false,
        snapToPixel: true
      });
      const graphicsContext = engine.graphicsContext;
      const material1 = new ex.Material({
        name: 'material1',
        graphicsContext,
        color: ex.Color.Red,
        fragmentSource: `#version 300 es
      precision mediump float;
      uniform vec4 u_color;
      out vec4 fragColor;
      void main() {
        fragColor = u_color;
      }`
      });

      const material2 = new ex.Material({
        name: 'material2',
        graphicsContext,
        color: ex.Color.Blue,
        fragmentSource: `#version 300 es
      precision mediump float;
      uniform vec4 u_color;
      out vec4 fragColor;
      void main() {
        fragColor = u_color;
      }`
      });

      const tex = new ex.ImageSource('/src/spec/assets/images/MaterialRendererSpec/sword.png');

      const loader = new ex.Loader([tex]);

      await TestUtils.runToReady(engine, loader);

      const actor1 = new ex.Actor({
        x: 0,
        y: 0,
        width: 100,
        height: 100
      });
      actor1.graphics.use(tex.toSprite());
      actor1.graphics.material = material1;

      const actor2 = new ex.Actor({
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });
      actor2.graphics.use(tex.toSprite());
      actor2.graphics.material = material2;

      graphicsContext.clear();
      engine.currentScene.add(actor1);
      engine.currentScene.add(actor2);
      engine.currentScene.draw(graphicsContext, 100);
      graphicsContext.flush();

      expect(graphicsContext.material).toBe(null);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/MaterialRendererSpec/multi-mat.png');

      engine.dispose();
    });

    it('will allow addition images', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const graphicsContext = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        backgroundColor: ex.Color.Black,
        antialiasing: false,
        snapToPixel: true
      });

      const stars = new ex.ImageSource('/src/spec/assets/images/MaterialRendererSpec/stars.png');
      await stars.load();

      const material = new ex.Material({
        name: 'test',
        graphicsContext,
        fragmentSource: `#version 300 es
      precision mediump float;
      // UV coord
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      uniform sampler2D u_additional;
      uniform vec4 u_color;
      uniform float u_opacity;
      out vec4 fragColor;
      void main() {
        vec4 color = u_color;
        color = mix(texture(u_additional, v_uv), texture(u_graphic, v_uv), .5);
        color.rgb = color.rgb * u_opacity;
        color.a = color.a * u_opacity;
        fragColor = color * u_color;
      }`,
        images: {
          u_additional: stars
        }
      });

      const tex = new ex.ImageSource('/src/spec/assets/images/MaterialRendererSpec/sword.png');
      await tex.load();

      graphicsContext.clear();
      graphicsContext.save();
      graphicsContext.material = material;
      graphicsContext.drawImage(tex.image, 0, 0);
      graphicsContext.flush();
      graphicsContext.restore();

      expect(graphicsContext.material).toBe(null);
      await expect(canvas).toEqualImage('/src/spec/assets/images/MaterialRendererSpec/additional.png');
    });

    it('will log a warning if you exceed you texture slots', () => {
      const logger = ex.Logger.getInstance();
      vi.spyOn(logger, 'warn');

      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const graphicsContext = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        backgroundColor: ex.Color.Black,
        antialiasing: false,
        snapToPixel: true
      });

      const stars = new ex.ImageSource('/src/spec/assets/images/MaterialRendererSpec/stars.png');

      const material = new ex.Material({
        name: 'test',
        graphicsContext,
        fragmentSource: `#version 300 es
      precision mediump float;
      // UV coord
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      uniform sampler2D u_additional;
      uniform vec4 u_color;
      uniform float u_opacity;
      out vec4 fragColor;
      void main() {
        vec4 color = u_color;
        color = mix(texture(u_additional, v_uv), texture(u_graphic, v_uv), .5);
        color.rgb = color.rgb * u_opacity;
        color.a = color.a * u_opacity;
        fragColor = color * u_color;
      }`,
        images: {
          u_additional: stars,
          u_additional1: stars,
          u_additional2: stars,
          u_additional3: stars,
          u_additional4: stars,
          u_additional5: stars,
          u_additional6: stars,
          u_additional7: stars,
          u_additional8: stars,
          u_additional9: stars,
          u_additional10: stars,
          u_additional11: stars,
          u_additional12: stars,
          u_additional13: stars,
          u_additional14: stars,
          u_additional15: stars,
          u_additional16: stars,
          u_additional17: stars,
          u_additional18: stars,
          u_additional19: stars,
          u_additional20: stars,
          u_additional21: stars,
          u_additional22: stars,
          u_additional23: stars,
          u_additional24: stars,
          u_additional25: stars,
          u_additional26: stars,
          u_additional27: stars,
          u_additional28: stars,
          u_additional29: stars,
          u_additional30: stars,
          u_additional31: stars,
          u_additional32: stars
        }
      });

      expect(material).toBeDefined();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringMatching(
          // this was 31 before, but since moving to vite it's 15. Is there a difference in max texture slots from chromium vs old karma browser?
          /Max number texture slots (\d+) have been reached for material "test", no more textures will be uploaded due to hardware constraints\./
        )
      );
    });
  });
});
