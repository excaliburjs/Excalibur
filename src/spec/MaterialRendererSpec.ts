import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburAsyncMatchers } from 'excalibur-jasmine';

describe('A Material', () => {
  let graphicsContext: ex.ExcaliburGraphicsContext;
  beforeAll(() => {
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  beforeEach(() => {
    const engine = TestUtils.engine();
    graphicsContext = engine.graphicsContext;
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

  it('can be created with a custom fragment shader', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const graphicsContext = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black,
      smoothing: false,
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

    const tex = new ex.ImageSource('src/spec/images/MaterialRendererSpec/sword.png');
    await tex.load();

    graphicsContext.clear();
    graphicsContext.save();
    graphicsContext.material = material;
    graphicsContext.drawImage(tex.image, 0, 0);
    graphicsContext.flush();
    graphicsContext.restore();

    expect(graphicsContext.material).toBe(null);
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(canvas))
      .toEqualImage('src/spec/images/MaterialRendererSpec/material.png');
  });

  it('can draw the screen texture', async () => {

    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.ExcaliburBlue,
      smoothing: false,
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

    const tex = new ex.ImageSource('src/spec/images/MaterialRendererSpec/sword.png');
    await tex.load();

    context.clear();
    context.save();
    context.material = material;
    context.drawImage(tex.image, 0, 0);
    context.flush();
    context.restore();

    expect(context.material).toBe(null);
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(canvas))
      .toEqualImage('src/spec/images/MaterialRendererSpec/multiply-comp.png');
  });

  it('can update uniforms with the .update()', async () => {

    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.ExcaliburBlue,
      smoothing: false,
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

    const tex = new ex.ImageSource('src/spec/images/MaterialRendererSpec/sword.png');
    await tex.load();

    context.clear();
    context.save();
    context.material = material;
    material.update(shader => {
      shader.setUniformFloatColor('customcolor', ex.Color.Red);
    });
    context.drawImage(tex.image, 0, 0);
    context.flush();
    context.restore();

    expect(context.material).toBe(null);
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(canvas))
      .toEqualImage('src/spec/images/MaterialRendererSpec/update-uniform.png');
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



    const tex = new ex.ImageSource('src/spec/images/MaterialRendererSpec/sword.png');

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
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas))
      .toEqualImage('src/spec/images/MaterialRendererSpec/material-component.png');
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



    const tex = new ex.ImageSource('src/spec/images/MaterialRendererSpec/sword.png');

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
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas))
      .toEqualImage('src/spec/images/MaterialRendererSpec/multi-mat.png');
  });
});