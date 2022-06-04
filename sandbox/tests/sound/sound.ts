
var game = new ex.Engine({
  width: 600,
  height: 400
});

var sound = new ex.Sound('./preview.ogg');
sound.playbackRate = 2.0;
var loader = new ex.Loader([
  sound
]);

var label = new ex.Label({
  x: 50,
  y: 100,
  text: 'Current Time: 0'
});
label.font = new ex.Font({
  size: 30,
  family: 'sans-serif'
});
game.currentScene.add(label);

var play = new ex.Actor({
  x: 200,
  y: 200,
  width: 40,
  height: 40,
  color: ex.Color.Green
});
play.on('pointerdown', () => {
  sound.play();
});
game.currentScene.add(play);

var pause = new ex.Actor({
  x: 300,
  y: 200,
  width: 40,
  height: 40,
  color: ex.Color.Red
});
pause.on('pointerdown', () => {
  sound.pause();
});
game.currentScene.add(pause);


game.currentScene.onPostUpdate = () => {
  label.text = 'Current Time: ' + sound.getPlaybackPosition();
}

game.start(loader);