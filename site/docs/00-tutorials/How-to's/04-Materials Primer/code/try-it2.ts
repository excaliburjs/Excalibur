import * as ex from 'excalibur';

const game = new ex.Engine({ canvasElementId: 'game', width: 400, height: 400 });

// 1. Create custom ShaderPass with initial uniform values
const chromaticPass = new ex.ShaderPass({
  graphicsContext: game.graphicsContext as ex.ExcaliburGraphicsContextWebGL,
  uniforms: {
    u_shift: 0.05,
  },
  fragmentSource: glsl`
    uniform sampler2D u_graphic;
    uniform float u_shift;
    in vec2 v_uv;
    out vec4 fragColor;

    void main() {
      // Split RGB color channels to create chromatic aberration
      float r = texture(u_graphic, v_uv + vec2(u_shift, 0.0)).r;
      float g = texture(u_graphic, v_uv).g;
      float b = texture(u_graphic, v_uv - vec2(u_shift, 0.0)).b;
      float a = texture(u_graphic, v_uv).a;
      fragColor = vec4(r, g, b, a);
    }
  `,
});

// 2. Create material holding the pass
const aberrationMaterial = new ex.Material({
  name: "chromatic-material",
  graphicsContext: game.graphicsContext as ex.ExcaliburGraphicsContextWebGL,
  passes: [chromaticPass],
  padding: 10,
});

// 3. Attach material to an Actor
const actor = new ex.Actor({
  pos: game.screen.center,
  width: 100,
  height: 100,
});

actor.graphics.use(new ex.Rectangle({ width: 100, height: 100, color: ex.Color.Magenta }));
actor.graphics.material = aberrationMaterial;

// 4. Update shaderPass.uniforms dynamically on frame updates
let elapsed = 0;
actor.onPreUpdate = (engine, delta) => {
  elapsed += delta / 1000;
  // Oscillate shift offset via direct uniform property access
  console.log(chromaticPass.uniforms);

  chromaticPass.uniforms.u_shift = 0.15 * Math.sin(elapsed * 6.0);
};

game.add(actor);
game.start();