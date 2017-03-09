/// <reference path="../../excalibur.d.ts" />

var Resources = {
  Background: new ex.Texture('../../images/Background.png')
};

var game = new ex.Engine({ width: 720, height: 480 });
var loader = new ex.Loader();

for (var key in Resources) {
   if (Resources.hasOwnProperty(key)) {
      loader.addResource(<ex.ILoadable>Resources[key]);
   }
}

game.start(loader).then(() => {   

   // draw background
   var bg = new ex.UIActor();   
   bg.addDrawing(Resources.Background);
   game.add(bg);


});