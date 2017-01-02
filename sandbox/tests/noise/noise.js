var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var noise = new ex.PerlinNoise(10, 15, 2, .5, .5);
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
        }
        else if (c > 235) {
            img.data[pixel] = 20;
            img.data[pixel + 1] = 20;
            img.data[pixel + 2] = 20;
        }
        else {
            img.data[pixel] = c - 90;
            img.data[pixel + 1] = c;
            img.data[pixel + 2] = c - 90;
        }
        img.data[pixel + 3] = 255;
    }
}
ctx.putImageData(img, 0, 0);
//# sourceMappingURL=noise.js.map