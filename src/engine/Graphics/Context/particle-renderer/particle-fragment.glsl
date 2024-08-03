#version 300 es
precision mediump float;

uniform sampler2D graphic;
uniform bool useTexture;
uniform float maxLifeMs;

in float finalRotation;
in float finalLifeMs;
out vec4 fragColor;

void main(){

  float alpha=finalLifeMs/maxLifeMs;

  /** Draw texture */
  if (useTexture) {
    float mid = .5;
    float cosine = cos(finalRotation);
    float sine = sin(finalRotation);
    vec2 rotated = vec2(cosine * (gl_PointCoord.x - mid) + sine * (gl_PointCoord.y - mid) + mid,
                        cosine * (gl_PointCoord.y - mid) - sine * (gl_PointCoord.x - mid) + mid);
    vec4 color = texture(graphic, rotated);
    fragColor = color * alpha;
  } else {
    /** Draw circle */
    float distanceFromPointCenter=distance(gl_PointCoord.xy,vec2(.5));
    if(distanceFromPointCenter>.5)discard;
    // TODO particle colors as uniforms
    fragColor=vec4(.8,.9*alpha,.1,1.)*alpha;
  }
}