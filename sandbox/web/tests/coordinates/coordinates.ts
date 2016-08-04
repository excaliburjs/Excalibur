/// <reference path="../../../../dist/Excalibur.d.ts" />

var game = new ex.Engine({ width: 500, height: 500 });
game.backgroundColor = ex.Color.fromHex("#eeeeee");

function addTestPoint(x, y, ax, ay, s = 1, rd = 0, parent = null) {
   var p = new Point(x, y, ax, ay);

   if (s > 0) {
      p.scale.setTo(s, s);
   }
   if (rd !== 0) {
      p.rotation = ex.Util.toRadians(rd);
   }

   if (parent != null) {
      parent.add(p);
   } else {
      game.add(p);
   }

   return p;
}

class Point extends ex.Actor {
   private _expectLabel: ex.Label;
   private _actualLabel: ex.Label;

   constructor(x, y, public actualX, public actualY) {
      super(x, y, 3, 3, ex.Color.Red);

      this.anchor.setTo(0, 0);
   }

   onInitialize(engine: ex.Engine) {
      super.onInitialize(engine);

      this._expectLabel = new ex.Label('', 5, 10);
      this._expectLabel.color = ex.Color.Red;
      this.add(this._expectLabel);

      this._actualLabel = new ex.Label('', 5, 20);
      this._actualLabel.color = ex.Color.Blue;
      this.add(this._actualLabel);
   }

   update(engine: ex.Engine, delta: number) {
      super.update(engine, delta);

      this._expectLabel.text = `(${this.actualX}, ${this.actualY})`;
      this._actualLabel.text = `(${this.getWorldX()}, ${this.getWorldY()})`;
   }
}

class GridLine extends ex.Actor {
   constructor(dir: "x"|"y", pos: number, size: number) {
      super(
         dir === "x" ? pos : 0, 
         dir === "y" ? pos : 0, 
         dir === "x" ? 1 : size,
         dir === "y" ? 1 : size,
         ex.Color.fromHex("#dedede"));

      this.anchor.setTo(0, 0);
   }
}

function drawGrid() {
   var step = 10; // px step for lines

   var lines = [],
      gw = game.getWidth(),
      gh = game.getHeight();

   for (var y = 0; y < gh; y += step) {
      lines.push(new GridLine("y", y, gw));
   }
   for (var x = 0; x < gw; x += step) {
      lines.push(new GridLine("x", x, gh));
   }

   for (var a of lines) {
      game.add(a);
   }
}

game.start().then(() => {   

   // draw grid
   drawGrid();

   // shift camera over
   game.currentScene.camera.x = 150;
   game.currentScene.camera.y = 150;

   // draw points
   addTestPoint(0, 0, 0, 0); // origin
   addTestPoint(50, 0, 50, 0);
   addTestPoint(50, 50, 50, 50);

   // parent -> child translation
   var p1 = addTestPoint(100, 0, 100, 0);
   addTestPoint(50, 0, 150, 0, 1, 0, p1);
});