import * as ex from 'excalibur';

const sword = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png', false, ex.ImageFiltering.Pixel);
const loader = new ex.DefaultLoader();
loader.addResource(sword);

const waterFrag = `#version 300 es
precision mediump float;

#define NUM_NOISE_OCTAVES 20

// Precision-adjusted variations of https://www.shadertoy.com/view/4djSRW
float hash(float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }
float hash(vec2 p) {vec3 p3 = fract(vec3(p.xyx) * 0.13); p3 += dot(p3, p3.yzx + 3.333); return fract((p3.x + p3.y) * p3.z); }

float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
}


float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);

	// Four corners in 2D of a tile
	float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    // Simple 2D lerp using smoothstep envelope between the values.
	// return vec3(mix(mix(a, b, smoothstep(0.0, 1.0, f.x)),
	//			mix(c, d, smoothstep(0.0, 1.0, f.x)),
	//			smoothstep(0.0, 1.0, f.y)));

	// Same code, with the clamps in smoothstep and common subexpressions
	// optimized away.
    vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(float x) {
	float v = 0.0;
	float a = 0.5;
	float shift = float(100);
	for (int i = 0; i < NUM_NOISE_OCTAVES; ++i) {
		v += a * noise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}


float fbm(vec2 x) {
	float v = 0.0;
	float a = 0.5;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < NUM_NOISE_OCTAVES; ++i) {
		v += a * noise(x);
		x = rot * x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}



uniform float u_time_ms;
uniform vec4 u_color;
uniform sampler2D u_graphic;
uniform sampler2D u_screen_texture;

uniform vec2 u_resolution; // screen resolution
uniform vec2 u_graphic_resolution; // graphic resolution

in vec2 v_uv;
in vec2 v_screenuv;
out vec4 fragColor;
void main() {
  float time_sec = u_time_ms / 1000.;
  float wave_amplitude = .525;
  float wave_speed = 1.8;
  float wave_period = .175;
  vec2 scale = vec2(2.5, 8.5);

  float waves = v_uv.y * scale.y + 
        sin(v_uv.x * scale.x / wave_period - time_sec * wave_speed) *
        cos(0.2 * v_uv.x * scale.x /wave_period + time_sec * wave_speed) *
        wave_amplitude - wave_amplitude;

  
  float distortion = noise(v_uv*scale*vec2(2.1, 1.05) + time_sec * 0.12) * .25 - .125;

  vec2 reflected_screenuv = vec2(v_screenuv.x - distortion, v_screenuv.y);
  vec4 screen_color = texture(u_screen_texture, reflected_screenuv);

  vec4 wave_crest_color = vec4(1);
  float wave_crest = clamp(smoothstep(0.1, 0.14, waves) - smoothstep(0.018, 0.99, waves), 0., 1.);

  fragColor.a = smoothstep(0.1, 0.12, waves);
  vec3 mixColor = (u_color.rgb * u_color.a); // pre-multiplied alpha
  
  fragColor.rgb = mix(screen_color.rgb, mixColor, u_color.a)*fragColor.a + (wave_crest_color.rgb * wave_crest);
}`;

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
});

const waterMaterial =  game.graphicsContext.createMaterial({
  name: 'water',
  fragmentSource: waterFrag,
  color: ex.Color.fromRGB(55, 0, 200, .6)
});


const actor = new ex.Actor({ x: 100, y: 100, width: 50, height: 50 });
actor.onInitialize = () => {
  var sprite = new ex.Sprite({
    image: sword,
    destSize: {
      width: 300,
      height: 300
    }
  });
  actor.graphics.add(sprite);
};
game.add(actor);
game.input.pointers.primary.on('move', evt => {
  actor.pos = evt.worldPos;
});


const reflection = new ex.Actor({
  x: 0,
  y: game.screen.resolution.height/2,
  anchor: ex.vec(0, 0),
  width: 512,
  height: game.screen.resolution.height/2,
  coordPlane: ex.CoordPlane.Screen,
  color: ex.Color.Red // < - this gets overridden by the material
});
reflection.graphics.material = waterMaterial;
reflection.z = 99;
game.add(reflection);

game.start(loader);