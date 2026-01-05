#version 300 es

precision mediump float;
in lowp vec4 v_color;

out vec4 fragColor;

void main() {
  float r = 0.0, delta = 0.0, alpha = 1.0;
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  r = dot(cxy, cxy);

  delta = fwidth(r);
  alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
  // "premultiply" the color by alpha
  vec4 color = v_color;
  color.a = color.a * alpha;
  color.rgb = color.rgb * color.a;
  fragColor = color;
}