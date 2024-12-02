#version 300 es
precision mediump float;

uniform sampler2D graphic;
uniform bool useTexture;
uniform float maxLifeMs;

uniform vec4 beginColor;
uniform vec4 endColor;
uniform bool fade;
uniform float startOpacity;

in float finalRotation;
in float finalLifeMs;
out vec4 fragColor;

void main(){

  float lifePct = finalLifeMs / maxLifeMs;

  if (useTexture) {
    /** Draw texture */
    if (lifePct <= 0.) discard;
    float mid = .5;
    float cosine = cos(finalRotation);
    float sine = sin(finalRotation);
    vec2 rotated = vec2(cosine * (gl_PointCoord.x - mid) + sine * (gl_PointCoord.y - mid) + mid,
                        cosine * (gl_PointCoord.y - mid) - sine * (gl_PointCoord.x - mid) + mid);
    vec4 color = texture(graphic, rotated);
    fragColor = color * (fade ? lifePct : 1.0);
  } else {
    /** Draw circle */
    if (lifePct <= 0.) discard;
    vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
    float dist = 1.0 - length(uv);
    float edge = fwidth(dot(uv, uv));
    float circle = smoothstep(-edge/2.0, edge/2.0, dist);
    vec4 color = mix(beginColor, endColor, 1.0 - lifePct) * startOpacity;
    fragColor = color * (fade ? lifePct : 1.0) * circle;
  }
}