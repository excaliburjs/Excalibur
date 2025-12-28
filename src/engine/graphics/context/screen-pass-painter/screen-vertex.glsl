#version 300 es
in vec2 a_position;

in vec2 a_texcoord;
out vec2 v_texcoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);

  // Pass the texcoord to the fragment shader.
  v_texcoord = a_texcoord;
}