/// <reference path="../../lib/excalibur.d.ts" />

var canvas = <HTMLCanvasElement>document.getElementById('game');
var ctx = canvas.getContext('2d');
//var noise = new ex.PerlinNoise(10, 15, 2, .5, .5);
var noise = new ex.PerlinGenerator({
  seed: 515,
  octaves: 15,
  frequency: 2,
  amplitude: 0.5,
  persistance: 0.5
});

var drawer = new ex.PerlinDrawer2D(
  noise
); /*, (val: number) => {
   var color = new ex.Color(0, 0, 0, 0);
   if (val < 135) {
      color.r = 0;
      color.g = 0;
      color.b = 170;
   } else if (val < 136 && val >= 135) {
      color.r = 160;
      color.g = 200;
      color.b = 0;
   } else if (val > 148) {
      color.r = val;
      color.g = val;
      color.b = val;
   } else if (val > 145) {
      color.r = val - 130;
      color.g = val - 130;
      color.b = val - 130;
   } else {
      color.r = val - 90;
      color.g = val;
      color.b = val - 90;
   }
   color.a = 1;
   return color;
});*/

drawer.draw(ctx, 0, 0, 800, 800);

/*
var img = ctx.getImageData(0, 0, 800, 800);
for (var j = 0; j < 800; j++) {
    for (var i = 0; i < 800; i++) {
        var val = noise.noise(i / 800, j / 800);
        var c = Math.floor(val * 255) & 0xff;
        var pixel = (i + j * img.width) * 4;
        if (c < 135) {
            img.data[pixel] = 0;
            img.data[pixel + 1] = 0;
            img.data[pixel + 2] = 170;
        } else if (c < 136 && c >= 135) {
            img.data[pixel] = 160;
            img.data[pixel + 1] = 200;
            img.data[pixel + 2] = 0;
        } else if (c > 148) {
            img.data[pixel] = c;
            img.data[pixel + 1] = c;
            img.data[pixel + 2] = c;
        } else if (c > 145) {
            img.data[pixel] = c - 130;
            img.data[pixel + 1] = c - 130;
            img.data[pixel + 2] = c - 130;
        } else {
            img.data[pixel] = c - 90;
            img.data[pixel + 1] = c;
            img.data[pixel + 2] = c - 90;
        }
        img.data[pixel + 3] = 255;
    }
} 
ctx.putImageData(img, 0, 0);
*/
