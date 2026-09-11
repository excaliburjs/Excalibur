import * as ex from 'excalibur';

class FlashActor extends ex.Actor {
  private mat!: ex.Material;
  private flash: number = 0;

  onInitialize(engine: ex.Engine) {
    this.graphics.use(new ex.Rectangle({ width: 100, height: 100, color: ex.Color.Magenta }));

    this.mat = new ex.Material({
      name: 'click-flash',
      graphicsContext: engine.graphicsContext,
      fragmentSource: ex.glsl`
        uniform sampler2D u_graphic;
        uniform float u_amount;
        in vec2 v_uv;
        out vec4 fragColor;

        void main() {
          vec4 tex = texture(u_graphic, v_uv);
          fragColor = vec4(mix(tex.rgb, vec3(1.0), u_amount), tex.a);
        }
      `
    });

    this.graphics.material = this.mat;
    this.pointer.useGraphicsBounds = true;
    this.on('pointerdown', () => { this.flash = 1.0; });
  }

  onPreUpdate(engine: ex.Engine, delta: number) {
    if (this.flash > 0) {
      this.flash = Math.max(0, this.flash - delta / 300);
      this.mat.update((shader) => {
        shader.setUniformFloat('u_amount', this.flash);
      });
    }
  }
}

const game = new ex.Engine({ canvasElementId: 'game', width: 400, height: 400 });
const actor = new FlashActor({ pos: game.screen.center, width: 100, height: 100 });
game.add(actor);
game.start();