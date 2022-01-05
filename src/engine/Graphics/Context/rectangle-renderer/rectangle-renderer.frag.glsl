#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision mediump float;

// UV coord
varying vec2 v_uv;

// Color coord to blend with image
varying lowp vec4 v_color;

// Border radius
varying float v_radius;

// Stroke color if used
varying lowp vec4 v_strokeColor;

// Stroke thickness if used
varying lowp float v_strokeThickness;

// Opacity
varying float v_opacity;

void main() {
  vec2 uv = v_uv * 2.0 - 1.0; // Make (0.5, 0.5) the center
  vec4 color = v_color;
  vec4 strokeColor = v_strokeColor;
  
  float thickness = v_strokeThickness;// 0.1;
  float radius = v_radius;//0.2;
  vec2 size = vec2(1.0);
  float fade = 0.005;

  // Box sdf
  vec2 box = abs(uv)-size + radius;
  float distance = length(max(box, 0.0)) + min(max(box.x, box.y),0.0) -radius;
  float boxborder = -smoothstep(0.0, fade, distance) + smoothstep(-thickness, -thickness + fade, distance);
  
  strokeColor.rgb *= vec3(boxborder);
  strokeColor.a *= boxborder;
  color.rbg *= vec3(1.0-boxborder);
  color.a *= 1.0-boxborder;

  vec4 quadColor = mix(vec4(0.0), strokeColor + color, 1.0-smoothstep(0.0, fade, distance));
  quadColor.a  = quadColor.a * v_opacity;
  gl_FragColor = quadColor;
}