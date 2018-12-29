/// <reference path='../../lib/excalibur.d.ts' />
var game = new ex.Engine({
  canvasElementId: 'game',
  width: 400,
  height: 400,
  backgroundColor: ex.Color.fromHex('454545')
});

// let background = new ex.Actor(
//   game.canvasWidth / 2,
//   game.canvasHeight / 2,
//   game.canvasWidth,
//   game.canvasHeight,
//   ex.Color.fromHex('454545')
// );
// game.add(background);

let person = new ex.Actor(275, 250, 15, 15, ex.Color.White);
game.add(person);

let soontobeoffscreen = new ex.Actor(375, 250, 15, 15, ex.Color.White);
game.add(soontobeoffscreen);
soontobeoffscreen.on('exitviewport', () => {
  console.log('offscreen');
});

soontobeoffscreen.on('enterviewport', () => {
  console.log('onscreen');
});

// for (let i = 0 ; i < 10 ; i++) {
//   let yPos = (i + 1 ) * 10;
//   let line = new ex.Actor(game.canvasWidth / 2, (game.canvasHeight / 100) * yPos, game.canvasWidth, 1, ex.Color.White);
//   game.add(line);
// }

// for (let i = 0; i < 12 ; i++) {
//   let pos = i + 1;
//   let yPos = pos + 1;
//   let x = (i * 40);
//   let y = game.canvasHeight / 2;
//   var label = new ex.Label(':)', x, y, '10px Arial');
//   label.color = ex.Color.White;
//   label.fontFamily = 'Arial';
//   label.fontSize = 20;
//   game.add(label);
// }
game.start();

// loop zooming in and out
let zoomed = false;
setInterval(() => {
  if (zoomed) {
    game.currentScene.camera.zoom(1, 3500);
    zoomed = false;
  } else {
    game.currentScene.camera.zoom(2, 3500);
    zoomed = true;
  }
}, 4000);
