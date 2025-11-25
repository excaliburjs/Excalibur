import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
});

const sword = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png', false, ex.ImageFiltering.Pixel);
const loader = new ex.DefaultLoader();
loader.addResource(sword);

const outline = `#version 300 es
precision mediump float;

uniform float u_time_ms;
uniform sampler2D u_graphic;

in vec2 v_uv;
in vec2 v_screenuv;
out vec4 fragColor;

vec3 hsv2rgb(vec3 c){
  vec4 K=vec4(1.,2./3.,1./3.,3.);
  return c.z*mix(K.xxx,clamp(abs(fract(c.x+K.xyz)*6.-K.w)-K.x, 0., 1.),c.y);
}

void main() {
  const float TAU = 6.28318530;
  const float steps = 4.0; // up/down/left/right pixels
  float radius = 2.0;
  float time_sec = u_time_ms / 1000.;

  vec3 outlineColorHSL = vec3(sin(time_sec/2.0) * 1., 1., 1.);
  vec2 aspect = 1.0 / vec2(textureSize(u_graphic, 0));

  for (float i = 0.0; i < TAU; i += TAU / steps) {
    // Sample image in a circular pattern
    vec2 offset = vec2(sin(i), cos(i)) * aspect * radius;
    vec4 col = texture(u_graphic, v_uv + offset);

    // Mix outline with background
    float alpha = smoothstep(0.5, 0.7, col.a);
    fragColor = mix(fragColor, vec4(hsv2rgb(outlineColorHSL), 1.0), alpha); // apply outline
  }

  // Overlay original texture
  vec4 mat = texture(u_graphic, v_uv);
  float factor = smoothstep(0.5, 0.7, mat.a);
  fragColor = mix(fragColor, mat, factor);
}
`

const outlineMaterial =  game.graphicsContext.createMaterial({
  name: 'outline',
  fragmentSource: outline
});


const actor = new ex.Actor({ x: 100, y: 100, width: 50, height: 50 });
actor.onInitialize = () => {
  var sprite = new ex.Sprite({
    image: sword,
    destSize: {
      width: 300,
      height: 300
    }
  });
  actor.graphics.add(sprite);
};
actor.graphics.material = outlineMaterial;


game.add(actor);
game.input.pointers.primary.on('move', evt => {
  actor.pos = evt.worldPos;
});

game.start(loader);