attribute vec4 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

void main() {
  // Multiply the position by the matrix.
  gl_Position = a_position;

  // Pass the texcoord to the fragment shader.
  v_texcoord = a_texcoord;
}