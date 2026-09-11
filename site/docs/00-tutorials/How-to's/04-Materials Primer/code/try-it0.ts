import * as ex from 'excalibur';

const game = new ex.Engine({ canvasElementId: 'game', width: 400, height: 400 });

const colorTintMaterial = game.graphicsContext.createMaterial({
  name: 'color-tint',
  fragmentSource: ex.glsl`
    uniform sampler2D u_graphic;
    in vec2 v_uv;
    out vec4 fragColor;

    void main() {
      vec4 tex = texture(u_graphic, v_uv);
      // Tint sprite green based on horizontal position (v_uv.x)
      fragColor = mix(tex.rgb, vec3(0.0, 1.0, 0.4), v_uv.x);
    }
  `
});

const actor = new ex.Actor({ pos: game.screen.center, width: 100, height: 100 });
actor.graphics.use(new ex.Rectangle({ width: 100, height: 100, color: ex.Color.White }));
actor.graphics.material = colorTintMaterial;

game.add(actor);
game.start();