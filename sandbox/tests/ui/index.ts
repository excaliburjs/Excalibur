/// <reference path="../../lib/excalibur.d.ts" />

var Resources = {
  Background: new ex.ImageSource('../../images/Background.png')
};

var game = new ex.Engine({ width: 720, height: 480 });
var loader = new ex.Loader();

for (var key in Resources) {
  if (Resources.hasOwnProperty(key)) {
    loader.addResource(Resources[key]);
  }
}

game.start(loader).then(() => {
  // draw background
  var bg = new ex.ScreenElement();
  bg.graphics.add(Resources.Background.toSprite());
  game.add(bg);
});
