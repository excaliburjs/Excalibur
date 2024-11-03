var game = new ex.Engine({
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  pixelArt: true
});

var inputTile = new ex.ImageSource('./InputTile.png');

var actor = new ex.Actor({
  pos: ex.vec(200, 200)
});
game.add(actor);
var nineSlice = new ex.NineSlice({
  width: 300,
  height: 100,
  source: inputTile,
  sourceConfig: {
    width: 64,
    height: 64,
    topMargin: 5,
    leftMargin: 7,
    bottomMargin: 5,
    rightMargin: 7
  },
  destinationConfig: {
    drawCenter: true,
    horizontalStretch: ex.NineSliceStretch.Stretch,
    verticalStretch: ex.NineSliceStretch.Stretch
  }
});

actor.graphics.add(nineSlice);
var loader = new ex.Loader([inputTile]);
game.start(loader).then(() => {});
