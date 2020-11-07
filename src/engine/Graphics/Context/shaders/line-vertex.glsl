attribute vec4 a_position;
attribute vec4 a_color;

varying lowp vec4 v_color;

uniform mat4 u_matrix;


void main() {
   // Set the vertex position using the ortho transform matrix
   gl_Position = u_matrix * a_position;

   // Passthrough the color
   v_color = a_color;
}