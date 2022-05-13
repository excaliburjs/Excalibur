#version 300 es
in vec2 a_position;
in vec4 a_color;

out lowp vec4 v_color;

uniform mat4 u_matrix;

void main() {
   // Set the vertex position using the ortho transform matrix
   gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);

   // Passthrough the color
   v_color = a_color;
}