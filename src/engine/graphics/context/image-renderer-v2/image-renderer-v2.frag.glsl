#version 300 es
precision mediump float;

// UV coord
in vec2 v_texcoord;

// Textures in the current draw
uniform sampler2D u_textures[%%count%%];

uniform bool u_pixelart;

in float v_texture_index;

in float v_opacity;

in vec4 v_tint;

// texture resolution
in vec2 v_res;

in vec2 v_size;

in vec2 v_uv_min;
in vec2 v_uv_max;

out vec4 fragColor;

// Inigo Quilez pixel art filter https://jorenjoestar.github.io/post/pixel_art_filtering/
vec2 uv_iq(in vec2 uv, in vec2 texture_size) {
  vec2 pixel = uv * texture_size;

  vec2 seam=floor(pixel+.5);
  vec2 dudv=fwidth(pixel);
  pixel=seam+clamp((pixel-seam)/dudv,-.5,.5);

  return pixel/texture_size;
}

float lerp(float from, float to, float rel){
  return ((1. - rel) * from) + (rel * to);
}

float invLerp(float from, float to, float value){
  return (value - from) / (to - from);
}

float remap(float origFrom, float origTo, float targetFrom, float targetTo, float value){
  float rel = invLerp(origFrom, origTo, value);
  return lerp(targetFrom, targetTo, rel);
}

void main(){
  // In order to support the most efficient sprite batching, we have multiple
  // textures loaded into the gpu (usually 8) this picker logic skips over textures
  // that do not apply to a particular sprite.

  vec4 color=vec4(1.,0,0,1.);
  vec2 remapped_uv = v_texcoord;
  remapped_uv.x = remap(0.,1., v_uv_min.x, v_uv_max.x, v_texcoord.x);
  remapped_uv.y = remap(0.,1., v_uv_min.y, v_uv_max.y, v_texcoord.y);
  vec2 uv = u_pixelart ? uv_iq(remapped_uv, v_size) : remapped_uv;

  // GLSL is templated out to pick the right texture and set the vec4 color
  %%texture_picker%%

  color.rgb = color.rgb * v_opacity;
  color.a = color.a * v_opacity;
  fragColor = color * v_tint;
}