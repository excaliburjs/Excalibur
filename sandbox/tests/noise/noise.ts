/// <reference path="../../excalibur.d.ts" />

var canvas = <HTMLCanvasElement>document.getElementById('game');
var ctx = canvas.getContext('2d');

/*
var game = new ex.Engine({
   canvasElementId: 'game',
   width: 800,
   height: 800
});

game.currentScene.camera.x = 0;
game.currentScene.camera.y = 0;

var noise = new ex.PerlinNoise(10, 5, 9, 1, .2);
//var noise = new ex.PerlinNoise(105, 20, 3, 1, .3);

game.currentScene.on('postdraw', (evt: ex.PostDrawEvent) => {
   var img = evt.ctx.getImageData(0, 0, 800, 800);
   for (var i = 0; i < 800; i++) {
      for (var j = 0; j < 800; j++) {
         var val = noise.noise(i / 800, j / 800);
         var color = Math.floor(val * 255) & 0xff;
         img[i + j * 800] = color;
         img[i + j * 800 + 1] = color;
         img[i + j * 800 + 2] = color;
         img[i + j * 800 + 3] = 1;
      }
      //var y = noise.noise(i / 400) * 700;
      //ex.Util.DrawUtil.point(evt.ctx, ex.Color.Black, new ex.Vector(i, y + 400));

      
      
}
   evt.ctx.putImageData(img, 0, 0);
});

*/
var noise = new ex.PerlinNoise(10, 15, 2, .5, .5);
var img = ctx.getImageData(0, 0, 800, 800);
for (var j = 0; j < 800; j++) {
    for (var i = 0; i < 800; i++) {
        var val = noise.noise(i / 800, j / 800);
        
        var c = Math.floor(val * 255) & 0xff;        
        var pixel = (i + j * img.width) * 4;

        if ( c < 135) {
           img.data[pixel] = 0;
           img.data[pixel + 1] = 0;
           img.data[pixel + 2] = 170;
        } else if ( c > 235) {
           img.data[pixel] = 20;
           img.data[pixel + 1] = 20;
           img.data[pixel + 2] = 20;
        } else {
           img.data[pixel] = c - 90;
           img.data[pixel + 1] = c;
           img.data[pixel + 2] = c - 90;
        }        
        img.data[pixel + 3] = 255;
    }
}
ctx.putImageData(img, 0, 0);