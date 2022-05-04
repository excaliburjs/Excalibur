#version 300 es
precision mediump float;
// our texture
uniform sampler2D u_image;
// the texCoords passed in from the vertex shader.
in vec2 v_texcoord;

// color blind type
uniform int u_type;

// simulation?
uniform bool u_simulate;

out vec4 fragColor;

void main() {
  vec4 o =  texture(u_image, v_texcoord);
  // RGB to LMS matrix conversion
  float L = (17.8824 * o.r) + (43.5161 * o.g) + (4.11935 * o.b);
  float M = (3.45565 * o.r) + (27.1554 * o.g) + (3.86714 * o.b);
  float S = (0.0299566 * o.r) + (0.184309 * o.g) + (1.46709 * o.b);
  // Simulate color blindness
  float l;
  float m;
  float s;
  //MODE CODE//
  if (u_type == 0) {
    // Protanope
    l = 0.0 * L + 2.02344 * M + -2.52581 * S;
    m = 0.0 * L + 1.0 * M + 0.0 * S;
    s = 0.0 * L + 0.0 * M + 1.0 * S;;
  } else if (u_type == 1) {
    // Deuteranope
    l = 1.0 * L + 0.0 * M + 0.0 * S;
    m = 0.494207 * L + 0.0 * M + 1.24827 * S;
    s = 0.0 * L + 0.0 * M + 1.0 * S;
  } else if (u_type == 2) {
    // Tritanope
    l = 1.0 * L + 0.0 * M + 0.0 * S;
    m = 0.0 * L + 1.0 * M + 0.0 * S;
    s = -0.395913 * L + 0.801109 * M + 0.0 * S;
  }

  // LMS to RGB matrix conversion
  vec4 error; // simulate the colors
  error.r = (0.0809444479 * l) + (-0.130504409 * m) + (0.116721066 * s);
  error.g = (-0.0102485335 * l) + (0.0540193266 * m) + (-0.113614708 * s);
  error.b = (-0.000365296938 * l) + (-0.00412161469 * m) + (0.693511405 * s);
  error.a = 1.0;
  vec4 diff = o - error;
  vec4 correction; // correct the colors
  correction.r = 0.0;
  correction.g =  (diff.r * 0.7) + (diff.g * 1.0);
  correction.b =  (diff.r * 0.7) + (diff.b * 1.0);
  correction = o + correction;
  correction.a = o.a;
  //SIMULATE//

  // sim 
  if (u_simulate) {
    fragColor = error.rgba;
  } else {
    fragColor = correction.rgba;
  }
}