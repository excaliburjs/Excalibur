#version 300 es
in vec2 a_position;

// Opacity 
in float a_opacity;
out float v_opacity;

// UV coordinate
in vec2 a_texcoord;
out vec2 v_texcoord;

// Texture number
in lowp float a_textureIndex;
out lowp float v_textureIndex;

uniform mat4 u_matrix;

void main() {
   // Set the vertex position using the ortho transform matrix
   gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);

   // Pass through the Opacity to the fragment shader
   v_opacity = a_opacity;
   // Pass through the UV coord to the fragment shader
   v_texcoord = a_texcoord;
   // Pass through the texture number to the fragment shader
   v_textureIndex = a_textureIndex;
}