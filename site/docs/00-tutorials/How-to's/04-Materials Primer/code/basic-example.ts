import * as ex from 'excalibur';

const game = new ex.Engine({ width: 600, height: 400 });

// Step 1 ) Draft your shader
const flashShader = ex.glsl`
    uniform sampler2D u_graphic; // The sprite image
    in vec2 v_uv;               // UV coordinates (0.0 to 1.0 across the sprite)
    out vec4 fragColor;

    void main() {
      vec4 spriteColor = texture(u_graphic, v_uv);
      fragColor = vec4(1.0, 1.0, 1.0, spriteColor.a);
    }
  `;


// Step 2. Create the material
const hitFlashMaterial = game.graphicsContext.createMaterial({
  name: 'hit-flash',
  fragmentSource: flashShader
});

// Step 3. Apply to an Actor
const player = new ex.Actor({ pos: game.screen.center, width: 64, height: 64 });
player.graphics.use(new ex.Rectangle({ width: 64, height: 64, color: ex.Color.Red }));
player.graphics.material = hitFlashMaterial;

game.add(player);
game.start();