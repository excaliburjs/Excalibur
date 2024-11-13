#version 300 es
layout(location=0) in vec2 pos;
layout(location=1) in vec2 a_texcoord;
out vec2 v_texcoord;

layout(location=2) in vec2 a_position;
layout(location=3) in vec2 a_scale;
layout(location=4) in vec2 a_rotation;

// Opacity
layout(location=5) in float a_opacity;
out float v_opacity;

// Texture res
layout(location=6) in vec2 a_res;
out vec2 v_res;

// Texture number
layout(location=7) in float a_texture_index;
out float v_texture_index;

layout(location=8) in vec2 a_uv_min;
out vec2 v_uv_min;

layout(location=9) in vec2 a_uv_max;
out vec2 v_uv_max;

layout(location=10) in vec4 a_tint;
out vec4 v_tint;

uniform mat4 u_matrix;

void main(){
  mat4 world_mat = mat4(
    a_rotation.x, a_rotation.y, 0., 0.,
    a_scale.x, a_scale.y, 0., 0.,
    0., 0., 1., 0.,
    a_position.x, a_position.y, 0., 1.
  );

  gl_Position = u_matrix * world_mat * vec4(pos * a_res, 0., 1.);

  v_opacity = a_opacity;
  v_texcoord = a_texcoord;
  v_uv_min = a_uv_min;
  v_uv_max = a_uv_max;
  v_res = a_res;
  v_texture_index = a_texture_index;
  v_tint = a_tint;
}