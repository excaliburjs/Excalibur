/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill
});

var fragmentSource = `#version 300 es
precision mediump float;

// UV coord
in vec2 v_uv;

uniform sampler2D u_graphic;

uniform vec2 u_graphic_resolution;

out vec4 fragColor;

vec2 v2len(in vec2 a, in vec2 b) {
  return sqrt(a*a+b*b);
}

vec4 textureBlocky(in sampler2D tex, in vec2 uv, in vec2 res) {
  uv *= res; // enter texel coordinate space.
  
  vec2 seam = floor(uv+.5); // find the nearest seam between texels.
  
  // here's where the magic happens. scale up the distance to the seam so that all
  // interpolation happens in a one-pixel-wide space.
  uv = (uv-seam)/v2len(dFdx(uv),dFdy(uv))+seam;
  
  uv = clamp(uv, seam-.5, seam+.5); // clamp to the center of a texel.
  
  return texture(tex, uv/res, -1000.);//.xxxx; // convert back to 0..1 coordinate space.
}

void main() {
  fragColor = textureBlocky(u_graphic, v_uv, u_graphic_resolution);
}
`

var material = game.graphicsContext.createMaterial({
  name: 'aa',
  fragmentSource
});

var tex = new ex.ImageSource(
  'https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png',
  false,
  ex.ImageFiltering.Blended
  );

var loader = new ex.Loader([tex]);

var actor = new ex.Actor({x: 100, y: 100, width: 50, height: 50});
actor.onInitialize = () => {
  var sprite = new ex.Sprite({
    image: tex,
    destSize: {
      width: 100,
      height: 100
    }
  });
  actor.graphics.add(sprite);
  actor.graphics.material = material;
};
game.add(actor);
game.start(loader);

game.currentScene.camera.pos = actor.pos;
game.currentScene.camera.zoom = 7;
actor.angularVelocity = .1;
