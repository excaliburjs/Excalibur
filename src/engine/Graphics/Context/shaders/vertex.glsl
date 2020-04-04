attribute vec4 a_position;

// UV coordinate
attribute vec2 a_texcoord;
varying vec2 v_texcoord;

// Texture number
attribute lowp float a_textureIndex;
varying lowp float v_textureIndex;

uniform mat4 u_matrix;


void main() {
   // Set the vertex position using the ortho transform matrix
   gl_Position = u_matrix * a_position;

   // Pass through the UV coord to fragment
   v_texcoord = a_texcoord;
   // Pass through the texture number to fragment
   v_textureIndex = a_textureIndex;
}