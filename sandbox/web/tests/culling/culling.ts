var width = 600;
var height = 400;
var playerTexture = new ex.Texture("culling-sprite.png");
var speed = 100;

var engine = new ex.Engine(width, height, 'game');

engine.backgroundColor = ex.Color.Black;

var player = new ex.Actor(width / 2, height / 2, 30, 30, ex.Color.Red);
var playerSprite = playerTexture.asSprite();
player.addDrawing("default", playerSprite);
player.currentDrawing.anchor = new ex.Point(0.5, 0.5); //TODO what if we don't do this?
//player.currentDrawing.scale = new ex.Point(0.5, 0.5);
engine.currentScene.add(player);

engine.input.keyboard.on('down', (keyDown?: ex.Input.KeyEvent) => {
   if (keyDown.key === ex.Input.Keys.D) {
      engine.isDebug = !engine.isDebug;
   } else if (keyDown.key === ex.Input.Keys.Up) {
      player.dy = -speed;
   } else if (keyDown.key === ex.Input.Keys.Down) {
      player.dy = speed;
   } else if (keyDown.key === ex.Input.Keys.Left) {
      player.dx = -speed;
   } else if (keyDown.key === ex.Input.Keys.Right) {
      player.dx = speed; 
   }
});

engine.input.keyboard.on('up', (keyUp?: ex.Input.KeyEvent) => {
   if (keyUp.key === ex.Input.Keys.Up) {
      player.dy = 0;
   } else if (keyUp.key === ex.Input.Keys.Down) {
      player.dy = 0;
   } else if (keyUp.key === ex.Input.Keys.Left) {
      player.dx = 0;
   } else if (keyUp.key === ex.Input.Keys.Right) {
      player.dx = 0;
   }
});

engine.start(new ex.Loader([playerTexture])).then(() => {

}); 