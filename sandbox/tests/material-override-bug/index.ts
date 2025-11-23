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

var heartImage = new ex.ImageSource('./heart.png', false, ex.ImageFiltering.Pixel);
var loader = new ex.Loader([heartImage]);
var colorMaterial = game.graphicsContext.createMaterial({
  name: 'color',
  images: {
    u_graphic: heartImage,
    u_graphic2: heartImage
  },
  fragmentSource: glsl`#version 300 es
    precision mediump float;
    uniform sampler2D u_graphic;
    uniform sampler2D u_graphic2;
    in vec2 v_uv;
    out vec4 fragColor;

    void main() {

      // Should be a heart but is default
      fragColor = texture(u_graphic, v_uv);
      // Correctly is heart 
      // fragColor = texture(u_graphic2, v_uv);
    }
  `
});

var actor = new ex.Actor({
  x: 100,
  y: 100,
  width: 50,
  height: 50,
  color: ex.Color.Blue
});
actor.graphics.material = colorMaterial;

game.add(actor);

game.start(loader).then(async () => {
  // const image = await game.screenshot(true);
  // document.body.appendChild(image);
});
