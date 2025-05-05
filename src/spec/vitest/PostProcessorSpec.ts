import * as ex from '@excalibur';

const source = `#version 300 es
precision mediump float;
uniform vec2 u_resolution;

uniform float u_time_ms;

uniform float u_elapsed_ms;

out vec4 fragColor;
void main() {
  // this is nonsense, but uniforms need to be used to show up in js
  fragColor = vec4(u_time_ms, u_elapsed_ms, u_resolution.x, u_resolution.y);
}
`;

class MockPostProcessor implements ex.PostProcessor {
  private _shader: ex.ScreenShader;
  initialize(graphicsContext: ex.ExcaliburGraphicsContextWebGL): void {
    this._shader = new ex.ScreenShader(graphicsContext, source);
  }
  getShader(): ex.Shader {
    return this._shader.getShader();
  }
  getLayout(): ex.VertexLayout {
    return this._shader.getLayout();
  }
  onUpdate = vi.fn();
}

describe('A PostProcessor', () => {
  it('will call onUpdate if present', () => {
    const mock = new MockPostProcessor();
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black
    });

    context.addPostProcessor(mock);

    context.updatePostProcessors(10);
    context.updatePostProcessors(10);
    context.updatePostProcessors(10);

    expect(mock.onUpdate).toHaveBeenCalledTimes(3);
  });

  it('set the default uniforms if present in the source', () => {
    const mock = new MockPostProcessor();
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black
    });
    context.addPostProcessor(mock);

    const shader = mock.getShader();

    const setUniformFloatCalls = vi.spyOn(shader, 'setUniformFloat');
    const setUniformFloatVectorCalls = vi.spyOn(shader, 'setUniformFloatVector');

    context.updatePostProcessors(10);

    expect(shader.setUniformFloat).toHaveBeenCalledTimes(2);
    expect(shader.setUniformFloatVector).toHaveBeenCalledTimes(1);

    expect(setUniformFloatCalls.mock.calls[0]).toEqual(['u_time_ms', 10]);
    expect(setUniformFloatCalls.mock.calls[1]).toEqual(['u_elapsed_ms', 10]);
    expect(setUniformFloatVectorCalls.mock.calls[0]).toEqual(['u_resolution', ex.vec(100, 100)]);
  });
});
