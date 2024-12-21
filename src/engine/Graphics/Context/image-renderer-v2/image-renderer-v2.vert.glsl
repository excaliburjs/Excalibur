#version 300 es
layout(location=0) in vec2 pos;
layout(location=1) in vec2 a_texcoord;
out vec2 v_texcoord;

layout(location=2) in vec2 a_offset;
layout(location=3) in vec2 a_mat_column1;
layout(location=4) in vec2 a_mat_column2;
layout(location=5) in vec2 a_mat_column3;

layout(location=6) in float a_opacity;
out float v_opacity;

// Texture resolution (could be bigger than a_size)
layout(location=7) in vec2 a_res;
out vec2 v_res;

// Final size of graphic
layout(location=8) in vec2 a_size;
out vec2 v_size;

layout(location=9) in lowp float a_texture_index;
out lowp float v_texture_index;

layout(location=10) in vec2 a_uv_min;
out vec2 v_uv_min;

layout(location=11) in vec2 a_uv_max;
out vec2 v_uv_max;

layout(location=12) in vec4 a_tint;
out vec4 v_tint;

uniform mat4 u_matrix;

void main(){
  mat4 world_mat = mat4(
    a_mat_column1.x, a_mat_column1.y, 0., 0.,
    a_mat_column2.x, a_mat_column2.y, 0., 0.,
    0.             , 0.             , 1., 0.,
    a_mat_column3.x, a_mat_column3.y, 0., 1.
  );

  vec2 newPos = vec2(pos.x * a_res.x, pos.y * a_res.y);
  gl_Position = u_matrix * world_mat * vec4(newPos + a_offset, 0., 1.);

  v_opacity = a_opacity;
  v_texcoord = a_texcoord;
  v_uv_min = a_uv_min;
  v_uv_max = a_uv_max;
  v_res = a_res;
  v_size = a_size;
  v_texture_index = a_texture_index;
  v_tint = a_tint;
}