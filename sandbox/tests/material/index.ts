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

var vertexSource = `#version 300 es
in vec2 a_position;

in vec2 a_uv;
out vec2 v_uv;

uniform mat4 u_matrix;
uniform mat4 u_transform;

void main() {
  // Set the vertex position using the ortho transform matrix
  gl_Position = u_matrix * u_transform * vec4(a_position, 0.0, 1.0);

  // Pass through the UV coord to the fragment shader
  v_uv = a_uv;
}
`
var fragmentSource = `#version 300 es
precision mediump float;

// UV coord
in vec2 v_uv;

uniform sampler2D u_graphic;

uniform vec2 u_resolution;

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

   color = textureBlocky(u_graphic, v_uv, u_resolution); // texture2DAA(u_graphic, v_uv); //texture(u_graphic, v_uv);
   color.rgb = color.rgb * u_opacity;
   color.a = color.a * u_opacity;
  
   fragColor = color * u_color;
}
`


var shader = new ex.Shader({
  gl: (game.graphicsContext as ex.ExcaliburGraphicsContextWebGL).__gl,
  vertexSource,
  fragmentSource
});

var material = new ex.Material({
  name: 'test',
  shader,
  color: ex.Color.Red,
  opacity: 0.5
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
actor2.onInitialize = () => {
  var sprite = new ex.Sprite({
    image: tex,
    destSize: {
      width: 300,
      height: 300
    }
  });
  actor2.graphics.add(sprite);
  const shader = material.getShader();
  shader.use()
  shader.setUniformFloatVector('u_resolution', ex.vec(game.canvas.width, game.canvas.height));
  actor2.graphics.material = material;
};
actor2.angularVelocity = .2;

game.add(actor);
game.add(actor2);
game.start(loader);