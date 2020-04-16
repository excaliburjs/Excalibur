attribute vec4 a_position;

// Opacity 
attribute float a_opacity;
varying float v_opacity;

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

   // Pass through the Opacity to the fragment shader
   v_opacity = a_opacity;
   // Pass through the UV coord to the fragment shader
   v_texcoord = a_texcoord;
   // Pass through the texture number to the fragment shader
   v_textureIndex = a_textureIndex;
}