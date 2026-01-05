#version 300 es
in vec2 a_position;

// UV coordinate
in vec2 a_uv;
out vec2 v_uv;

// Opacity 
in float a_opacity;
out float v_opacity;

in vec4 a_color;
out vec4 v_color;

in vec4 a_strokeColor;
out vec4 v_strokeColor;

in float a_strokeThickness;
out float v_strokeThickness;

uniform mat4 u_matrix;


void main() {
   // Set the vertex position using the ortho transform matrix
   gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);

   // Pass through UV coords
   v_uv = a_uv;
   // Pass through the Opacity to the fragment shader
   v_opacity = a_opacity;
   // Pass through the color to the fragment shader
   v_color = a_color;
   // Pass through the stroke color to the fragment shader
   v_strokeColor = a_strokeColor;
   // Pass through the stroke thickenss to the fragment shader
   v_strokeThickness = a_strokeThickness;
}