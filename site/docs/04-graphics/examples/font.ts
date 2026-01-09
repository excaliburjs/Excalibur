import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FitContainer,
  width: 200,
  height: 200,
  pixelRatio: 4
});

const label = new ex.Label({
    text: 'Some Default\nSans Serif',
    pos: ex.vec(100, 100),
    font: new ex.Font({
        family: 'sans-serif',
        size: 24,
        color: ex.Color.Red,
        baseAlign: ex.BaseAlign.Middle,
        textAlign: ex.TextAlign.Center,
        unit: ex.FontUnit.Px
    })
});
game.add(label);

game.start();
