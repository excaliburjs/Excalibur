#version 300 es
precision mediump float;

uniform float deltaMs;
uniform float maxLifeMs;
uniform vec2 gravity;
uniform mat4 u_matrix;
uniform mat4 u_transform;
uniform float startSize;
uniform float endSize;
// uniform sampler2D obstacle;

layout(location=0)in vec2 position;
layout(location=1)in vec2 velocity;
layout(location=2)in float rotation;
layout(location=3)in float angularVelocity;
layout(location=4)in float lifeMs;

out vec2 finalPosition;
out vec2 finalVelocity;
out float finalRotation;
out float finalAngularVelocity;
out float finalLifeMs;
void main(){
  // Evolve particle
  float seconds = deltaMs / 1000.;
  // euler integration
  // todo weird artifact of re-using the same buffer layout for update/draw
  finalVelocity = velocity + gravity * seconds;
  finalPosition = position + velocity * seconds + gravity * .5 * seconds * seconds;
  finalRotation = rotation + angularVelocity * seconds;
  finalAngularVelocity = angularVelocity;
  finalLifeMs = clamp(lifeMs - deltaMs, 0., maxLifeMs);

  // Collision mask sampling
  // vec2 samplePoint = finalPosition / vec2(width, height);
  // vec4 collides = texture(obstacle, samplePoint);
  // if (distance(collides,vec4(0.)) > .01) {
  //   // non opaque means we collide! recalc final pos/vel
  //   vec2 newVelocity = velocity * -.1;// lose energy
  //   finalVelocity = newVelocity + gravity * seconds;
  //   finalPosition = position + newVelocity * seconds + gravity * .5 * seconds * seconds;
  // }

  float lifePercent = finalLifeMs / maxLifeMs;
  vec2 transformedPos = (u_matrix * u_transform * vec4(finalPosition,0.,1.)).xy;

  gl_Position = vec4(transformedPos, 0., 1.);
  gl_PointSize = mix(startSize, endSize, 1.0 - lifePercent);
}