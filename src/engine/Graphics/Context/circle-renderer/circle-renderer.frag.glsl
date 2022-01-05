#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

// UV coord
varying vec2 v_uv;

// Color coord to blend with image
varying lowp vec4 v_color;

// Stroke color if used
varying lowp vec4 v_strokeColor;

// Stroke thickness if used
varying lowp float v_strokeThickness;

// Opacity
varying float v_opacity;

void main() {
  // make (0, 0) the center the uv 
  vec2 uv = v_uv * 2.0 - 1.0;

  vec4 color = v_color;
  vec4 strokeColor = v_strokeColor;

  // circle border is at radius 1.0 
  // dist is > 0 when inside the circle 
  float d = length(uv);
  float dist = 1.0 - length(uv);

  // Fade based on fwidth
  float fade = fwidth(dot(uv, uv));

  // if dist is greater than 0 step to 1;
  // when we cross this 0 threshold add a smooth fade
  float fill = smoothstep(-fade/2.0, fade/2.0, dist);

  // if dist is greater than the stroke thickness step to 1
  float stroke = 1.0 - smoothstep(v_strokeThickness, v_strokeThickness + fade, dist);

  strokeColor.a *= fill * stroke;
  strokeColor.rgb *= strokeColor.a;

  color.a *= fill * (1.0 - stroke);
  color.rgb *= color.a;

  vec4 finalColor = mix(vec4(0.0), (color + strokeColor), fill);
  finalColor.rgb = finalColor.rgb * v_opacity;
  finalColor.a = finalColor.a * v_opacity;
  gl_FragColor = finalColor;
}