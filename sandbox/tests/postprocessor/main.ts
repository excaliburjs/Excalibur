var crtFragmentSource = `#version 300 es
precision mediump float;
// Sourced from https://www.shadertoy.com/view/Ms23DR
// Loosely based on postprocessing shader by inigo quilez, License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
uniform sampler2D u_image;

uniform vec2 u_resolution;

uniform float u_time_ms;

uniform float u_elapsed_ms;

out vec4 fragColor;

vec2 curve(vec2 uv)
{
	uv = (uv - 0.5) * 2.0;
	uv *= 1.1;	
	uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
	uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
	uv  = (uv / 2.0) + 0.5;
	uv =  uv *0.92 + 0.04;
	return uv;
}
void main()
{
    vec2 q = gl_FragCoord.xy / u_resolution;
    vec2 uv = q;
    uv = curve( uv );
    // vec3 oricol = texture( iChannel0, vec2(q.x,q.y) ).xyz;
    // vec4 o =  texture(u_image, v_texcoord).xyz;
    vec3 col;
    float iTime = u_time_ms / 1000.0;
    float x =  sin(0.3*iTime+uv.y*21.0)*sin(0.7*iTime+uv.y*29.0)*sin(0.3+0.33*iTime+uv.y*31.0)*0.0017;

    col.r = texture(u_image,vec2(x+uv.x+0.001,uv.y+0.001)).x+0.05;
    col.g = texture(u_image,vec2(x+uv.x+0.000,uv.y-0.002)).y+0.05;
    col.b = texture(u_image,vec2(x+uv.x-0.002,uv.y+0.000)).z+0.05;
    col.r += 0.08*texture(u_image,0.75*vec2(x+0.025, -0.027)+vec2(uv.x+0.001,uv.y+0.001)).x;
    col.g += 0.05*texture(u_image,0.75*vec2(x+-0.022, -0.02)+vec2(uv.x+0.000,uv.y-0.002)).y;
    col.b += 0.08*texture(u_image,0.75*vec2(x+-0.02, -0.018)+vec2(uv.x-0.002,uv.y+0.000)).z;

    col = clamp(col*0.6+0.4*col*col*1.0,0.0,1.0);

    float vig = (0.0 + 1.0*16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));
	col *= vec3(pow(vig,0.3));

    col *= vec3(0.95,1.05,0.95);
	col *= 2.8;

	float scans = clamp( 0.35+0.35*sin(3.5*iTime+uv.y*u_resolution.y*1.5), 0.0, 1.0);
	
	float s = pow(scans,1.7);
	col = col*vec3( 0.4+0.7*s) ;

    col *= 1.0+0.01*sin(110.0*iTime);
	if (uv.x < 0.0 || uv.x > 1.0)
		col *= 0.0;
	if (uv.y < 0.0 || uv.y > 1.0)
		col *= 0.0;
	
	col*=1.0-0.65*vec3(clamp((mod(gl_FragCoord.x, 2.0)-1.0)*2.0,0.0,1.0));
	
    float comp = smoothstep( 0.1, 0.9, sin(iTime) );
 
	// Remove the next line to stop cross-fade between original and postprocess
//	col = mix( col, oricol, comp );

    fragColor = vec4(col,1.0);
}`

class CRTPostProcessors implements ex.PostProcessor {
  private _shader: ex.ScreenShader;
  constructor() {}
  initialize(gl: WebGL2RenderingContext): void {
    this._shader = new ex.ScreenShader(gl, crtFragmentSource);
  }
  getShader(): ex.Shader {
    return this._shader.getShader();
  }
  getLayout(): ex.VertexLayout {
    return this._shader.getLayout();
  }
  onUpdate(delta: number): void {
    // set your own uniforms here
    const shader = this.getShader();
    shader.trySetUniformBoolean('u_some_uniform', true);
  }
}

var game = new ex.Engine({
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill
});

var actor = new ex.Actor({
  width: 100,
  height: 100,
  color: ex.Color.Red
});
actor.angularVelocity = .2;
actor.actions
  .repeatForever((ctx) => {
    ctx.moveTo(ex.vec(600, 0), 200);
    ctx.moveTo(ex.vec(0, 400), 200);
    ctx.moveTo(ex.vec(600, 400), 200);
    ctx.moveTo(ex.vec(0, 0), 200);
  });
game.currentScene.add(actor);

var ctx = game.graphicsContext as ex.ExcaliburGraphicsContextWebGL;
ctx.addPostProcessor(new CRTPostProcessors());

game.start();