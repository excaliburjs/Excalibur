/// <reference path="../../lib/excalibur.d.ts" />

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

var loader = new ex.Loader([tex, background]);

var outline = `#version 300 es
precision mediump float;

uniform float iTime;

uniform sampler2D u_graphic;

in vec2 v_uv;

out vec4 fragColor;

void main() {
  const float TAU = 6.28318530;
	const float steps = 32.0;

	float radius = 1.0;

  vec2 aspect = 1.0 / vec2(textureSize(u_graphic, 0));

	//fragColor = vec4(uv.y, 0.0, uv.x, 1.0);
	for (float i = 0.0; i < TAU; i += TAU / steps) {
		// Sample image in a circular pattern
    vec2 offset = vec2(sin(i), cos(i)) * aspect * radius;
		vec4 col = texture(u_graphic, v_uv + offset);
		
		// Mix outline with background
		float alpha = smoothstep(0.5, 0.7, col.a);
		fragColor = mix(fragColor, vec4(1.0), alpha); // white outline
	}
	
  // Overlay original texture
	vec4 mat = texture(u_graphic, v_uv);
	float factor = smoothstep(0.5, 0.7, mat.a);
	fragColor = mix(fragColor, mat, factor);
}
`

var fragmentSource = `#version 300 es
precision mediump float;

// UV coord
in vec2 v_uv;

uniform sampler2D u_graphic;

uniform vec2 u_resolution;

uniform float iTime;

uniform vec2 iMouse;

uniform vec2 u_size;

uniform vec4 u_color;

uniform float u_opacity;

out vec4 fragColor;

void main() {
   vec4 color = u_color;

  float effectRadius = .5;
  float effectAngle = mod(iTime/2., 2.)  * 3.14159;

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
`

var swirlMaterial = game.graphicsContext.createMaterial({
  name: 'swirl',
  fragmentSource
});

var outlineMaterial = game.graphicsContext.createMaterial({
  name: 'outline',
  fragmentSource: outline
})

var click = ex.vec(0, 0);

game.input.pointers.primary.on('down', evt => {
  click = evt.worldPos; // might need to change if you have a camera
});

var actor = new ex.Actor({x: 100, y: 100, width: 50, height: 50});
actor.onInitialize = () => {
  var sprite = new ex.Sprite({
    image: tex,
    destSize: {
      width: 300,
      height: 300
    }
  });
  actor.graphics.add(sprite);
  actor.graphics.material = outlineMaterial;
};

actor.onPostUpdate = (_, delta) => {
  time += (delta / 1000);
  swirlMaterial.getShader().use();
  swirlMaterial.getShader().trySetUniformFloat('iTime', time);
}


var backgroundActor = new ex.ScreenElement({x: 0, y: 0, width: 512, height: 512, z: -1});
var time = 0;
backgroundActor.onPostUpdate = (_, delta) => {
  time += (delta / 1000);
  swirlMaterial.getShader().use();
  swirlMaterial.getShader().trySetUniformFloat('iTime', time);
  swirlMaterial.getShader().trySetUniformFloatVector('iMouse', click);
}
backgroundActor.onInitialize = () => {
  backgroundActor.graphics.add(background.toSprite());
  backgroundActor.graphics.material = swirlMaterial;
};

game.add(actor);
game.add(backgroundActor);
game.start(loader);