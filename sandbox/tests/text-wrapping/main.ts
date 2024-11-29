var game = new ex.Engine({
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill
});

var text = new ex.Text({
  text: '😻',
  maxWidth: 200,
  font: new ex.Font({
    family: 'Consolas',
    size: 30,
    unit: ex.FontUnit.Px,
    color: ex.Color.Black
  })
});

var textActor = new ex.Actor({
  pos: game.screen.center
});
textActor.graphics.use(text);
game.currentScene.add(textActor);

game.input.keyboard.on('release', (ev) => {
  if (ev.key !== ex.Keys.ShiftLeft && ev.key !== ex.Keys.ShiftRight && ev.key !== ex.Keys.Enter && ev.key !== ex.Keys.Backspace) {
    text.text += ev.value;
  }
  if (ev.key === ex.Keys.Enter) {
    text.text += '\n';
  }
  if (ev.key === ex.Keys.Backspace) {
    text.text = text.text.slice(0, text.text.length - 1);
  }
});

game.start();
