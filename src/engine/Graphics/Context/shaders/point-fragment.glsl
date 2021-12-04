#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision mediump float;
varying lowp vec4 v_color;

void main() {
  float r = 0.0, delta = 0.0, alpha = 1.0;
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  r = dot(cxy, cxy);
  
#ifdef GL_OES_standard_derivatives
  delta = fwidth(r);
  alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
#else
  if (r > 1.0) {
    discard;
  }
#endif
  
  // blend the alphas
  // vec3 final_color = v_color.rgb * fract(v_color.a);
  // vec4 black = vec4(0.0, 0.0, 0.0, alpha);
  // float final_alpha = alpha + black.a * (1.0 - alpha);
  // gl_FragColor = vec4((black.rgb * black.a + final_color * (1.0 - black.a)) / final_alpha, final_alpha);
  // // float final_alpha = v_color.a + alpha * (1.0 = v_color.a);
  // // final_color =  final_color.rgb * alpha + final_color.rgb * (1.0 - alpha);
  // // float final_alpha = alpha + 

  // "premultiply" the color by alpha
  gl_FragColor = vec4(v_color.rgb * v_color.a * alpha, v_color.a * alpha);
}