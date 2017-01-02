/// <reference path="../../excalibur.d.ts" />

var canvas = <HTMLCanvasElement>document.getElementById('game');
var ctx = canvas.getContext('2d');
//var noise = new ex.PerlinNoise(10, 15, 2, .5, .5);
var noise = new ex.PerlinGenerator({
   seed: 10,
   octaves: 15,
   frequency: 2,
   amplitude: .5,
   persistance: .5
});

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
ctx.putImageData(img, 0, 0);