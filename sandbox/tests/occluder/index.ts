var occluder = new ex.ImageSource('test.png');

var shader = `#version 300 es
precision mediump float;

uniform sampler2D u_image;  // Default texture slot
uniform sampler2D u_myTexture;  // Slot 2 texture

uniform vec2 u_resolution;
uniform vec2 u_texturePosition; // Position of the second texture
uniform vec2 u_textureSize;     // Size of the second texture

in vec2 v_uv;
out vec4 fragColor;

void main() {
    vec2 pixelCoord = v_uv * u_resolution;
    vec2 adjustedUV = (pixelCoord - u_texturePosition) / u_textureSize;
    
    vec4 defaultColor = texture(u_image, v_uv);
    vec4 secondTexture = texture(u_myTexture, adjustedUV);
    vec4 endColor = mix(defaultColor, secondTexture, .5);
    fragColor = vec4(endColor.rgb * endColor.a, endColor.a);
    
    //fragColor = vec4(secondTexture.rgb * secondTexture.a, secondTexture.a);
    
}
`;

class LightingPostProcessor implements ex.PostProcessor {
  private _pass: ex.ShaderPass | undefined;
  gctx: ex.ExcaliburGraphicsContextWebGL;
  texture: WebGLTexture;

  constructor(public graphicsContext: ex.ExcaliburGraphicsContextWebGL) {
    this.gctx = graphicsContext;
    this.texture = this.graphicsContext.textureLoader.load(
      occluder.image,
      { wrapping: { x: ex.ImageWrapping.Repeat, y: ex.ImageWrapping.Repeat } },
      true
    ) as WebGLTexture;
    console.log(occluder);

    console.log(this.texture);
  }

  initialize(graphicsContext: ex.ExcaliburGraphicsContextWebGL): void {
    this._pass = new ex.ShaderPass({
      graphicsContext,
      fragmentSource: shader,
      uniforms: {
        u_texturePosition: new ex.Vector(100.0, 100.0),
        u_textureSize: new ex.Vector(64.0, 64.0)
      }
    });
  }

  process(source: ex.Framebuffer, destination: ex.Framebuffer): void {
    this._pass?.draw({
      source,
      sources: { u_myTexture: this.texture },
      destination
    });
  }
}

var game = new ex.Engine({
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill
});

var actor = new ex.Actor({
  width: 100,
  height: 100,
  color: ex.Color.Red
});
actor.angularVelocity = 0.2;
actor.actions.repeatForever((ctx) => {
  ctx.moveTo(ex.vec(1000, 0), 200);
  ctx.moveTo(ex.vec(0, 400), 200);
  ctx.moveTo(ex.vec(1000, 400), 200);
  ctx.moveTo(ex.vec(0, 0), 200);
});
game.currentScene.add(actor);

var ctx = game.graphicsContext as ex.ExcaliburGraphicsContextWebGL;
game.start(new ex.Loader([occluder])).then(() => {
  ctx.addPostProcessor(new LightingPostProcessor(ctx));
});
