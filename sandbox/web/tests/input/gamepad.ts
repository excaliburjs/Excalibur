/// <reference path="../../../../dist/Excalibur.d.ts"/>

var game = new ex.Engine(500, 500, "game");
var padTexture = new ex.Texture("gamepad.png");

game.start(new ex.Loader([padTexture])).then(start);

function start() {
   // Load gamepad sprite
   var padSprite = new ex.Sprite(padTexture, 0, 0, padTexture.width, padTexture.height);

   // Enable Gamepad support
   game.input.gamepads.enabled = true;
   
   // Draw gamepad
   var gamepad = new ex.Actor(0, 0, padSprite.width, padSprite.height);
   gamepad.addDrawing("bg", padSprite);
   game.add(gamepad);

   // todo add other buttons/actors
   
   // Update global state on engine update
   game.on("update", (ue: ex.UpdateEvent) => {

      document.getElementById("gamepad-num").innerHTML = game.input.gamepads.count().toString();

   });
}