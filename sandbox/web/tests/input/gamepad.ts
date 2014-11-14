/// <reference path="../../../../dist/Excalibur.d.ts"/>

var game = new ex.Engine(800, 503, "game");
var padTexture = new ex.Texture("gamepad.png");

game.backgroundColor = ex.Color.White;
game.start(new ex.Loader([padTexture])).then(start);

function start() {
   // Load gamepad sprite
   // BUG #355: Can't use padTexture.width/padTexture.height
   var padSprite = new ex.Sprite(padTexture, 0, 0, 800, 503);

   // Enable Gamepad support
   game.input.gamepads.enabled = true;
   
   // Draw gamepad
   var gamepad = new ex.Actor(0, 0, padSprite.width, padSprite.height);
   gamepad.addDrawing("bg", padSprite);
   game.add(gamepad);

   // Sticks
   var leftStick = new CircleActor(-70, 18, 25, 25, ex.Color.fromRGB(95, 164, 22, 0.6));
   var rightStick = new CircleActor(70, 18, 25, 25, ex.Color.fromRGB(164, 45, 22, 0.6));

   game.add(leftStick);
   game.add(rightStick);

   // Update global state on engine update
   game.on("update", (ue: ex.UpdateEvent) => {

      document.getElementById("gamepad-num").innerHTML = game.input.gamepads.count().toString();

   });
}

class CircleActor extends ex.Actor {   
   public draw(ctx: CanvasRenderingContext2D, delta: number) {
      ctx.save();
      ctx.translate(this.x, this.y);

      ctx.beginPath();
      ctx.arc(0, 0, this.getWidth(), 0, 2 * Math.PI, true);
      ctx.fillStyle = this.color.toString();
      ctx.fill();
      ctx.closePath();
      ctx.restore();
   }
}