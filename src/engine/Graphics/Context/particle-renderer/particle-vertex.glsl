#version 300 es
precision mediump float;
/* From TheBookOfShaders, chapter 10. This is a slightly upscaled implementation
of the algorithm:
r = Math.cos(aReallyHugeNumber);
except it attempts to avoid the concentration of values around 1 and 0 by
multiplying by a very large irrational number and then discarding the result's
integer component. Acceptable results. Other deterministic pseudo-random number
algorithms are available (including random textures).
*/
float rand2(vec2 source)
{
  return fract(sin(dot(source.xy,vec2(1.9898,1.2313)))*42758.5453123);
}

float ran_range(float ran,float minf,float maxf){
  return ran*(maxf-minf)+minf;
}

uniform float uRandom;
uniform float deltaMs;
uniform float maxLifeMs;
uniform vec2 gravity;
uniform mat4 u_matrix;
uniform mat4 u_transform;
uniform float startSize;
uniform float endSize;
uniform bool isEmitting;

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

  float width = 800.;
  float height = 800.;

  if (lifeMs >= 0.) {
    // Evolve particle
    float seconds = deltaMs / 1000.;
    // euler integration
    // todo weird artifact of re-using the same buffer layout for update/draw
    finalVelocity = velocity + gravity * seconds;
    finalPosition = position + velocity * seconds + gravity * .5 * seconds * seconds;
    finalRotation = rotation + angularVelocity * seconds;
    finalAngularVelocity = angularVelocity; 
    finalLifeMs = lifeMs - deltaMs;

    // Collision mask sampling
    // vec2 samplePoint = finalPosition / vec2(width, height);
    // vec4 collides = texture(obstacle, samplePoint);
    // if (distance(collides,vec4(0.)) > .01) {
    //   // non opaque means we collide! recalc final pos/vel
    //   vec2 newVelocity = velocity * -.1;// lose energy
    //   finalVelocity = newVelocity + gravity * seconds;
    //   finalPosition = position + newVelocity * seconds + gravity * .5 * seconds * seconds;
    // }
  } else if (lifeMs < 0. && isEmitting) {
    // Reset particle!
    // Seed some randoms
    float s = float(gl_VertexID);
    float r1 = rand2(vec2(s, uRandom));
    float r2 = rand2(vec2(r1, uRandom));
    float r3 = rand2(vec2(uRandom, r1 * uRandom));

    // TODO use informs to set the initial state?
    finalVelocity = vec2(ran_range(r1,-200.,100.),ran_range(r2,0.,-300.));
    finalPosition = vec2(0, 0);// vec2(ran_range(r2,0.,800.),800.);
    finalRotation = 3.14*2.*r3;
    finalAngularVelocity = 6.*r2-3.14;
    finalLifeMs = maxLifeMs*r3; // TODO should this be random
  }

  float perc = finalLifeMs/maxLifeMs;
  vec2 transformedPos= (u_matrix * u_transform * vec4(finalPosition,0.,1.)).xy;

  gl_Position= vec4(transformedPos, 0., 1.);
  gl_PointSize=mix(startSize, endSize, 1.0 - perc);
}