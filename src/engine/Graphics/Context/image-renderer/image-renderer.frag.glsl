#version 300 es
precision mediump float;

// UV coord
in vec2 v_texcoord;

// Texture index
in lowp float v_textureIndex;

// Textures in the current draw
uniform sampler2D u_textures[%%count%%];

uniform bool u_pixelart;

// Opacity
in float v_opacity;

in vec4 v_tint;

in vec2 v_res;

out vec4 fragColor;

// Inigo Quilez pixel art filter https://jorenjoestar.github.io/post/pixel_art_filtering/
vec2 uv_iq(in vec2 uv, in vec2 texture_size) {
  vec2 pixel = uv * texture_size;
  
  vec2 seam=floor(pixel+.5);
  vec2 dudv=fwidth(pixel);
  pixel=seam+clamp((pixel-seam)/dudv,-.5,.5);
  
  return pixel/texture_size;
}

void main(){
  // In order to support the most efficient sprite batching, we have multiple
  // textures loaded into the gpu (usually 8) this picker logic skips over textures
  // that do not apply to a particular sprite.
  
  vec4 color=vec4(1.,0,0,1.);
  
  // GLSL is templated out to pick the right texture and set the vec4 color
  %%texture_picker%%
  
  color.rgb=color.rgb*v_opacity;
  color.a=color.a*v_opacity;
  fragColor=color*v_tint;
}