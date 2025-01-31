var game = new ex.Engine({
  width: 800,
  height: 800
});

var tex = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png', false, ex.ImageFiltering.Pixel);

var actor = new ex.Actor({
  pos: ex.vec(0, 0),
  anchor: ex.vec(0, 0),
  width: 800,
  height: 800,
  color: ex.Color.Black
});

game.add(actor);

var material = game.graphicsContext.createMaterial({
  name: 'flash-material',
  fragmentSource: `#version 300 es
    precision mediump float;

    struct Light {
     vec2 pos;
     float radius;
     vec4 color;
    };

    layout(std140) uniform Lighting {
        Light lights[2];
    };

    in vec2 v_uv;
    out vec4 color;

    void main() {
        float distanceToLights = 1.0;
        vec4 finalColor = vec4(0.0, 0.0, 0.0, 1.0);
        for (int i = 0; i < 2; i++) {
            float dist = length(lights[i].pos - v_uv);
            dist = smoothstep(lights[i].radius-.2, lights[i].radius+.2, dist);
            finalColor += lights[i].color * (1.0 - dist);
        }

        color = finalColor;
        // premultiply alpha
        color.rgb = color.rgb * color.a;
    }`,
  uniforms: {
    Lighting: new Float32Array([
      0.5,
      0.5,
      0.1,
      0.1, // light 1 pos
      0,
      1,
      0,
      1, // light 1 color
      1,
      1,
      0.1,
      0.1, // light2 pos
      0,
      0,
      1,
      1 // light 2 color
    ])
  }
}) as ex.Material;

actor.graphics.material = material;
ex.coroutine(
  game,
  function* () {
    let time = 0;
    while (true) {
      const elapsed = yield;
      time += elapsed / 1000;
      const x1 = Math.cos(time);
      const y1 = Math.sin(time);
      const x2 = Math.cos(-time);
      const y2 = Math.sin(-time);

      material.update((shader: ex.Shader) => {
        shader.setUniformBufferFloat32Array(
          'Lighting',
          new Float32Array([0.2 * x1 + 0.2, 0.2 * y1 + 0.2, 0.1, 0, 0, 1, 0, 1, 0.5 * x2 + 0.5, 0.5 * y2 + 0.5, 0.1, 0, 0, 0, 1, 1])
        );
      });
    }
  }.bind(this)
);

game.start(new ex.Loader([tex]));
