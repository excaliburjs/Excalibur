/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreen,
  pixelArt: true
});

var tex = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png', {
  wrapping: ex.ImageWrapping.Repeat
});

var loader = new ex.Loader([tex]);

var actor = new ex.Actor({
  x: 100,
  y: 100,
  anchor: ex.vec(0, 0),
  coordPlane: ex.CoordPlane.Screen,
  z: -10
});

var glsl = (tags: any) => tags[0];

var noop = glsl`#version 300 es
precision mediump float;

in vec2 v_uv;
uniform sampler2D u_graphic;
out vec4 fragColor;

void main() {
	fragColor = texture(u_graphic, v_uv);
	fragColor.rgb *= fragColor.a;
}`;

var red = glsl`#version 300 es
precision mediump float;

in vec2 v_uv;
uniform sampler2D u_graphic;
out vec4 fragColor;

void main() {
	fragColor = texture(u_graphic, v_uv);
	fragColor.r = 1.0;
}`;

var blue = glsl`#version 300 es
precision mediump float;

in vec2 v_uv;
uniform sampler2D u_graphic;
out vec4 fragColor;

void main() {
	fragColor = texture(u_graphic, v_uv);
	fragColor.b = 1.0;
}`;

var green = glsl`#version 300 es
precision mediump float;

in vec2 v_uv;
uniform sampler2D u_graphic;
out vec4 fragColor;

void main() {
	fragColor = texture(u_graphic, v_uv);
	fragColor.g = 1.0;
}`;

actor.graphics.use(tex.toSprite());
actor.graphics.material = game.graphicsContext.createMaterial({
  name: 'test',
  fragmentSource: noop
}) as ex.Material;

//actor.graphics.material.pipeline = new ex.ShaderPipeline({
//	graphicsContext: game.graphicsContext,
//	cache: true,
//	shaders: [
//		noop,
//		blue,
//		green
//		//red
//	]
//});
//

//var mat = new ex.Material({
//	graphicsContext: game.graphicsContext,
//	shaders: []
//});
//

game.add(actor);
game.start(loader);

game.currentScene.camera.pos = actor.pos;
