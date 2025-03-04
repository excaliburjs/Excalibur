var game = new ex.Engine({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitScreen,
  backgroundColor: ex.Color.Black
});

var actor = new ex.Actor({
  pos: ex.vec(400, 300),
  width: 100,
  height: 100,
  color: ex.Color.Red
});
game.add(actor);

var label = new ex.Label({
  pos: ex.vec(0, 0),
  text: 'Some long text that I want centered 💖',
  color: ex.Color.White,
  font: new ex.Font({
    textAlign: ex.TextAlign.Center,
    baseAlign: ex.BaseAlign.Middle,
    size: 24,
    unit: ex.FontUnit.Px
  })
});

var text = label.graphics.current as ex.Text;
console.log(text.width, text.height);

actor.addChild(label);

game.start();
