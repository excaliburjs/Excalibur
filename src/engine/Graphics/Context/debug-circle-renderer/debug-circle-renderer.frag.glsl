#version 300 es
precision highp float;

// UV coord
in vec2 v_uv;

// Color coord to blend with image
in lowp vec4 v_color;

// Stroke color if used
in lowp vec4 v_strokeColor;

// Stroke thickness if used
in lowp float v_strokeThickness;

in float v_radius;

// Opacity
in float v_opacity;

out vec4 fragColor;

void main() {
  // make (0, 0) the center the uv 
  vec2 uv = v_uv * 2.0 - 1.0;

  vec4 color = v_color;
  vec4 strokeColor = v_strokeColor;

  float dist = 1.0 - length(uv);
  float radius = dist * v_radius; // 0 is the edge

  // Fade based on fwidth
  float fade = fwidth(dot(uv, uv)) / 2.0;

  float fill = smoothstep(-fade, fade, radius);

  float stroke = 
    smoothstep(0.0, fade, radius) -
    smoothstep(v_strokeThickness, v_strokeThickness + fade, radius);

  strokeColor.a = stroke;
  strokeColor.rgb *= strokeColor.a;

  // vec4 finalColor = strokeColor;

  color.a *= fill * (1.0 - stroke);
  color.rgb *= color.a;

  vec4 finalColor = mix(vec4(0.0), (color + strokeColor), fill);
  finalColor.rgb = finalColor.rgb * v_opacity;
  finalColor.a = finalColor.a * v_opacity;

  fragColor = finalColor;
}
