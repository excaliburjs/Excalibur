attribute vec2 a_position;

// UV coordinate
attribute vec2 a_uv;
varying vec2 v_uv;

// Opacity 
attribute float a_opacity;
varying float v_opacity;

attribute vec4 a_color;
varying vec4 v_color;

attribute vec4 a_strokeColor;
varying vec4 v_strokeColor;

attribute float a_strokeThickness;
varying float v_strokeThickness;

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