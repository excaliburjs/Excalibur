attribute vec2 a_position;
attribute vec4 a_color;
attribute float a_size;
varying lowp vec4 v_color;
uniform mat4 u_matrix;

void main() {
  gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
  gl_PointSize = a_size * 2.0;
  v_color = a_color;
}