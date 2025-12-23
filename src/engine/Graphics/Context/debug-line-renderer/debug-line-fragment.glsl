#version 300 es
precision mediump float;

// Color
in lowp vec4 v_color;
in float v_lengthSoFar;

out vec4 fragColor;

uniform bool u_dashed;

void main() {
  fragColor = v_color;
  if (u_dashed) {
    fragColor.a = smoothstep(0.5, 0.55, fract(v_lengthSoFar / 10.0)); // 10 pixel dashes
    fragColor.rgb *= fragColor.a;
  }
}
