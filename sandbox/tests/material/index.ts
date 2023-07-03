/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 800,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  antialiasing: true
});

var tex = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png', false, ex.ImageFiltering.Blended);

var loader = new ex.Loader([tex]);

var fragmentSource = `#version 300 es
precision mediump float;

// UV coord
in vec2 v_uv;

uniform sampler2D u_graphic;

uniform vec2 u_resolution;

uniform float iTime;

uniform vec2 u_size;

uniform vec4 u_color;

uniform float u_opacity;

out vec4 fragColor;

// basically calculates the lengths of (a.x, b.x) and (a.y, b.y) at the same time
vec2 v2len(in vec2 a, in vec2 b) {
    return sqrt(a*a+b*b);
}


// samples from a linearly-interpolated texture to produce an appearance similar to
// nearest-neighbor interpolation, but with resolution-dependent antialiasing
// 
// this function's interface is exactly the same as texture's, aside from the 'res'
// parameter, which represents the resolution of the texture 'tex'.
vec4 textureBlocky(in sampler2D tex, in vec2 uv, in vec2 res) {
    uv *= res; // enter texel coordinate space.
    
    
    vec2 seam = floor(uv+.5); // find the nearest seam between texels.
    
    // here's where the magic happens. scale up the distance to the seam so that all
    // interpolation happens in a one-pixel-wide space.
    uv = (uv-seam)/v2len(dFdx(uv),dFdy(uv))+seam;
    
    uv = clamp(uv, seam-.5, seam+.5); // clamp to the center of a texel.
    
    
    return texture(tex, uv/res, -1000.).xxxx; // convert back to 0..1 coordinate space.
}

vec4 texture2DAA(sampler2D tex, vec2 uv) {
  vec2 texsize = vec2(textureSize(tex,0));
  vec2 uv_texspace = uv*texsize;
  vec2 seam = floor(uv_texspace+.5);
  uv_texspace = (uv_texspace-seam)/fwidth(uv_texspace)+seam;
  uv_texspace = clamp(uv_texspace, seam-.5, seam+.5);
  return texture(tex, uv_texspace/texsize);
}

void main() {
   vec4 color = u_color;

  float effectRadius = .5;
  float effectAngle = mod(iTime/2., 2.)  * 3.14159;

  vec2 center = vec2(.5, .5);
  vec2 size = u_size.xy;

  vec2 uv = v_uv - center;

  float len = length(uv * vec2(size.x / size.y, 1.));
  float angle = atan(uv.y, uv.x) + effectAngle * smoothstep(effectRadius, 0., len);
  float radius = length(uv);
  vec2 newUv = vec2(radius * cos(angle), radius * sin(angle)) + center;

   color = texture(u_graphic, newUv);
   color.rgb = color.rgb * u_opacity;
   color.a = color.a * u_opacity;
  
   fragColor = color * u_color;
}
`

var material = game.graphicsContext.createMaterial({
  name: 'test',
  fragmentSource,
  color: ex.Color.Red
});


var actor = new ex.Actor({x: 100, y: 100, width: 50, height: 50});
actor.onInitialize = () => {
  var sprite = new ex.Sprite({
    image: tex,
    destSize: {
      width: 300,
      height: 300
    }
  });
  actor.graphics.add(sprite);
};
var actor2 = new ex.Actor({x: 300, y: 300, width: 50, height: 50});
var time = 0;
actor2.onPostUpdate = (_, delta) => {
  time += (delta / 1000);
  material.getShader().use();
  material.getShader().trySetUniformFloat('iTime', time);
}
actor2.onInitialize = () => {
  var sprite = new ex.Sprite({
    image: tex,
    destSize: {
      width: 300,
      height: 300
    }
  });
  actor2.graphics.add(sprite);
  actor2.graphics.material = material;
};
actor2.angularVelocity = .2;

game.add(actor);
game.add(actor2);
game.start(loader);