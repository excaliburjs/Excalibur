/// <reference path='../../lib/excalibur.d.ts' />


ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;

class MyGame2 extends ex.Engine {
  constructor(args: ex.EngineOptions) {
    super(args);
    console.log("engine constructor");
    this.currentScene.onInitialize = () => {
      console.log("scene init");
    }
    this.currentScene.onActivate = () => {
      console.log("scene activate");
    }
    this.currentScene.onDeactivate = () => {
      console.log("scene deactivate");
    }
  }
  onInitialize() {
    console.log("engine init");
  }
}

var mygame = new MyGame2({ width: 300, height: 300, canvasElementId: 'game' });

var scene2 = new ex.Scene();

mygame.add('scene2', scene2);

var actor1 = new ex.Actor({x: 60, y: 60, width: 20, height: 20, color: ex.Color.Blue});
game.add(actor1);

var actor2 = new ex.Actor({x: 60, y: 60, width: 20, height: 20, color: ex.Color.Red});
scene2.add(actor2);

var loader = new ex.Loader([new ex.Graphics.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png')]);
mygame.start(loader);

document.getElementById('goToScene').addEventListener('click', () => mygame.goToScene('scene2'));
