/// <reference path="../../lib/excalibur.d.ts" />

// identity tagged template literal lights up glsl-literal vscode plugin
var glsl = (x) => x[0];

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 512,
  height: 512,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  backgroundColor: ex.Color.Black,
  antialiasing: true
});

var tex = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png', false, ex.ImageFiltering.Pixel);
var heartImage = new ex.ImageSource('./heart.png', false, ex.ImageFiltering.Pixel);
var background = new ex.ImageSource('./stars.png', false, ex.ImageFiltering.Blended);

var loader = new ex.Loader([tex, heartImage, background]);

var outline = glsl`#version 300 es
precision mediump float;

uniform float u_time_ms;
uniform sampler2D u_graphic;

in vec2 v_uv;
in vec2 v_screenuv;
out vec4 fragColor;

vec3 hsv2rgb(vec3 c){
  vec4 K=vec4(1.,2./3.,1./3.,3.);
  return c.z*mix(K.xxx,clamp(abs(fract(c.x+K.xyz)*6.-K.w)-K.x, 0., 1.),c.y);
}

void main() {
  const float TAU = 6.28318530;
  const float steps = 4.0; // up/down/left/right pixels
  float radius = 2.0;
  float time_sec = u_time_ms / 1000.;

  vec3 outlineColorHSL = vec3(sin(time_sec/2.0) * 1., 1., 1.);
  vec2 aspect = 1.0 / vec2(textureSize(u_graphic, 0));

  for (float i = 0.0; i < TAU; i += TAU / steps) {
    // Sample image in a circular pattern
    vec2 offset = vec2(sin(i), cos(i)) * aspect * radius;
    vec4 col = texture(u_graphic, v_uv + offset);

    // Mix outline with background
    float alpha = smoothstep(0.5, 0.7, col.a);
    fragColor = mix(fragColor, vec4(hsv2rgb(outlineColorHSL), 1.0), alpha); // apply outline
  }

  // Overlay original texture
  vec4 mat = texture(u_graphic, v_uv);
  float factor = smoothstep(0.5, 0.7, mat.a);
  fragColor = mix(fragColor, mat, factor);
}
`;

var fragmentSource = glsl`#version 300 es
precision mediump float;

// UV coord
in vec2 v_uv;

uniform sampler2D u_graphic;

uniform vec2 u_resolution;

uniform float u_time_ms;

uniform vec2 iMouse;

uniform vec2 u_size;

uniform vec4 u_color;

uniform float u_opacity;

out vec4 fragColor;

void main() {
  vec4 color = u_color;
  float time_sec = u_time_ms / 1000.;
  float effectRadius = .5;
  float effectAngle = mod(time_sec/2., 2.)  * 3.14159;

  vec2 size = u_size.xy;
  vec2 center = iMouse.xy / u_size.xy;
  vec2 uv = v_uv.xy - center;

  float len = length(uv * vec2(size.x / size.y, 1.));
  float angle = atan(uv.y, uv.x) + effectAngle * smoothstep(effectRadius, 0., len);
  float radius = length(uv);
  vec2 newUv = vec2(radius * cos(angle), radius * sin(angle)) + center;
   color = texture(u_graphic, newUv);
   color.rgb = color.rgb * u_opacity;
   color.a = color.a * u_opacity;
  
   fragColor = color * u_color;
}
`;

var swirlMaterial = game.graphicsContext.createMaterial({
  name: 'swirl',
  fragmentSource
});

var click = ex.vec(0, 0);

game.input.pointers.primary.on('down', (evt) => {
  click = evt.worldPos; // might need to change if you have a camera
});

var outlineMaterial = game.graphicsContext.createMaterial({
  name: 'outline',
  fragmentSource: outline
});

var actor = new ex.Actor({ x: 100, y: 100, width: 50, height: 50 });
actor.onInitialize = () => {
  var sprite = new ex.Sprite({
    image: tex,
    destSize: {
      width: 300,
      height: 300
    }
  });
  actor.graphics.add(sprite);
};
actor.graphics.material = outlineMaterial;

var heartActor = new ex.Actor({ x: 200, y: 200 });
heartActor.onInitialize = () => {
  var sprite = heartImage.toSprite();
  sprite.scale = ex.vec(4, 4);
  heartActor.graphics.add(sprite);
  heartActor.graphics.material = outlineMaterial;
};

game.add(heartActor);

game.input.pointers.primary.on('move', (evt) => {
  heartActor.pos = evt.worldPos;
  swirlMaterial.update((shader) => {
    shader.trySetUniformFloatVector('iMouse', evt.worldPos);
  });
});

var backgroundActor = new ex.ScreenElement({ x: 0, y: 0, width: 512, height: 512, z: -1 });

backgroundActor.onInitialize = () => {
  backgroundActor.graphics.add(background.toSprite());
  backgroundActor.graphics.material = swirlMaterial;
};

// material without graphic!?
var waterFrag = glsl`#version 300 es
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
uniform sampler2D u_noise;

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

  float distortion = (texture(u_noise, v_uv)).x;
  //float distortion = noise(v_uv*scale*vec2(2.1, 1.05) + time_sec * 0.12) * .25 - .125;

  vec2 reflected_screenuv = vec2(v_screenuv.x - distortion, v_screenuv.y);
  vec4 screen_color = texture(u_screen_texture, reflected_screenuv);

  vec4 wave_crest_color = vec4(1);
  float wave_crest = clamp(smoothstep(0.1, 0.14, waves) - smoothstep(0.018, 0.99, waves), 0., 1.);

  fragColor.a = smoothstep(0.1, 0.12, waves);
  vec3 mixColor = (u_color.rgb * u_color.a); // pre-multiplied alpha
  
  fragColor.rgb = mix(screen_color.rgb, mixColor, u_color.a)*fragColor.a + (wave_crest_color.rgb * wave_crest);
  fragColor.rgb = texture(u_noise, v_uv).rgb * fragColor.a;
  fragColor.rgb = vec3(gl_FragCoord.xy/u_resolution, 0.0);
}`;

const noise = new ex.ImageSource('./noise.avif', false, ex.ImageFiltering.Pixel);
loader.addResource(noise);

var waterMaterial = game.graphicsContext.createMaterial({
  name: 'water',
  fragmentSource: waterFrag,
  color: ex.Color.fromRGB(55, 0, 200, 0.6),
  images: {
    u_noise: noise
  }
});
var reflection = new ex.Actor({
  x: 0,
  y: game.screen.resolution.height / 2,
  anchor: ex.vec(0, 0),
  width: 512,
  height: game.screen.resolution.height / 2,
  coordPlane: ex.CoordPlane.Screen,
  color: ex.Color.Red
});

reflection.graphics.material = waterMaterial;
reflection.z = 99;

game.add(actor);
game.add(backgroundActor);
game.add(reflection);

game.start(loader).then(async () => {
  // const image = await game.screenshot(true);
  // document.body.appendChild(image);
});
