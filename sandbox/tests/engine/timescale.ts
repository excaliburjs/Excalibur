/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 400,
  height: 400
});

game.input.keyboard.on('up', (ev: ex.KeyEvent) => {
  if (ev.key === ex.Keys.W) {
    increaseTimescale();
  } else if (ev.key === ex.Keys.S) {
    decreaseTimescale();
  }
});

game.on('postupdate', () => {
  document.getElementById('timescale').innerText = game.timescale.toString() + 'x';
});

game.start().then(() => {
  var rect = new ex.Actor({ x: 200, y: 200, width: 50, height: 50, color: ex.Color.Red });

  rect.actions.repeatForever((ctx) => {
    ctx.easeTo(300, 200, 600, ex.EasingFunctions.EaseOutCubic).easeTo(200, 200, 600, ex.EasingFunctions.EaseOutCubic);
  });

  game.add(rect);
});

function increaseTimescale() {
  game.timescale += 0.1;
}

function decreaseTimescale() {
  game.timescale -= 0.1;
}
