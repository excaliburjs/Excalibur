/// <reference path='../../excalibur.d.ts' />

class Cross extends ex.Actor {
   constructor(x, y) {
      super(x, y, 40, 40);

      this.on('predraw', this.onPreDraw);
   }

   onPreDraw(ev: ex.PreDrawEvent) {
      var ctx = ev.ctx;
      
      ctx.beginPath();
      ctx.lineTo(this.getWidth() / 2, 0);
      ctx.lineTo(this.getWidth() / 2, this.getHeight());
      ctx.strokeStyle = ex.Color.Black.toString();
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.lineTo(0, this.getHeight() / 2);
      ctx.lineTo(this.getWidth(), this.getHeight() / 2);
      ctx.strokeStyle = ex.Color.Black.toString();
      ctx.stroke();
      ctx.closePath();
   }
}

var game = new ex.Engine({ width: 500, height: 500 });
var heartTx = new ex.Texture('../../images/heart.png');
var ldr = new ex.Loader([heartTx]);

game.backgroundColor = ex.Color.White;
game.setAntialiasing(false);

// center anchored actors
var cl = new ex.Label('Centered', 0, 30);
cl.textAlign = ex.TextAlign.Center;
var ca1 = new ex.Actor(0, 0, 15, 15, ex.Color.Red);
var ca2 = new ex.Actor(0, 0, 10, 10, ex.Color.Green);
var ca3 = new ex.Actor(0, 0, 10, 10, ex.Color.Blue);
var ca4 = new ex.Actor(0, 0, 20, 20);
ca1.anchor.setTo(0.5, 0.5);
ca2.anchor.setTo(0.5, 0.5);
ca3.anchor.setTo(0.5, 0.5);
ca4.anchor.setTo(0.5, 0.5);
ca2.scale.setTo(2, 2);
ca4.scale.setTo(2, 2);
var heartSprite = heartTx.asSprite()
heartSprite.scale.setTo(3, 3);
ca4.addDrawing(heartSprite);
ca4.rx = .5;
ca3.rotation = ex.Util.toRadians(45);

game.add(ca4);
game.add(ca2);
game.add(ca1);
game.add(ca3);
game.add(cl);

// top left anchored actors
var tll = new ex.Label('Top Left', -100, -60);
tll.textAlign = ex.TextAlign.Center;
var tla1 = new ex.Actor(-100, -100, 15, 15, ex.Color.Red);
var tla2 = new ex.Actor(-100, -100, 10, 10, ex.Color.Green);
var tla3 = new ex.Actor(-100, -100, 10, 10, ex.Color.Blue);
var tla4 = new ex.Actor(-100, -100, 20, 20);
tla1.anchor.setTo(0, 0);
tla2.anchor.setTo(0, 0);
tla3.anchor.setTo(0, 0);
tla4.anchor.setTo(0, 0);
tla2.scale.setTo(2, 2);
tla4.scale.setTo(2, 2);
var heartSprite2 = heartTx.asSprite()
heartSprite2.scale.setTo(2, 2);
tla4.addDrawing(heartSprite2);
tla3.rotation = ex.Util.toRadians(45);

game.add(tla4);
game.add(tla2);
game.add(tla1);
game.add(tla3);
game.add(tll);

// top right anchored actors
var trl = new ex.Label('Top Right', 100, -60);
trl.textAlign = ex.TextAlign.Center;
var tra1 = new ex.Actor(100, -100, 15, 15, ex.Color.Red);
var tra2 = new ex.Actor(100, -100, 10, 10, ex.Color.Green);
var tra3 = new ex.Actor(100, -100, 10, 10, ex.Color.Blue);
var tra4 = new ex.Actor(100, -100, 20, 20);
tra1.anchor.setTo(1, 0);
tra2.anchor.setTo(1, 0);
tra3.anchor.setTo(1, 0);
tra4.anchor.setTo(1, 0);
tra2.scale.setTo(2, 2);
tra4.scale.setTo(2, 2);
tra4.addDrawing(heartTx);
tra3.rotation = ex.Util.toRadians(45);

game.add(tra4);
game.add(tra2);
game.add(tra1);
game.add(tra3);
game.add(trl);

// bottom left anchored actors
var bll = new ex.Label('Bottom Left', -100, 60);
bll.textAlign = ex.TextAlign.Center;
var bla1 = new ex.Actor(-100, 100, 15, 15, ex.Color.Red);
var bla2 = new ex.Actor(-100, 100, 10, 10, ex.Color.Green);
var bla3 = new ex.Actor(-100, 100, 10, 10, ex.Color.Blue);
var bla4 = new ex.Actor(-100, 100, 20, 20);
bla1.anchor.setTo(0, 1);
bla2.anchor.setTo(0, 1);
bla3.anchor.setTo(0, 1);
bla4.anchor.setTo(0, 1);
bla2.scale.setTo(2, 2);
bla4.scale.setTo(2, 2);
bla4.addDrawing(heartTx);
bla3.rotation = ex.Util.toRadians(45);

game.add(bla4);
game.add(bla2);
game.add(bla1);
game.add(bla3);
game.add(bll);

// bottom right anchored actors
var brl = new ex.Label('Bottom Right', 100, 60);
brl.textAlign = ex.TextAlign.Center;
var bra1 = new ex.Actor(100, 100, 15, 15, ex.Color.Red);
var bra2 = new ex.Actor(100, 100, 10, 10, ex.Color.Green);
var bra3 = new ex.Actor(100, 100, 10, 10, ex.Color.Blue);
var bra4 = new ex.Actor(100, 100, 20, 20);
bra1.anchor.setTo(1, 1);
bra2.anchor.setTo(1, 1);
bra3.anchor.setTo(1, 1);
bra4.anchor.setTo(1, 1);
bra2.scale.setTo(2, 2);
bra4.scale.setTo(2, 2);
bra4.addDrawing(heartTx);
bra3.rotation = ex.Util.toRadians(45);

game.add(bra4);
game.add(bra2);
game.add(bra1);
game.add(bra3);
game.add(brl);

// markers
var cc = new Cross(0, 0);
var tlc = new Cross(-100, -100);
var trc = new Cross(100, -100);
var blc = new Cross(-100, 100);
var brc = new Cross(100, 100);
game.add(cc);
game.add(tlc);
game.add(trc);
game.add(blc);
game.add(brc);

game.currentScene.camera.x = 0;
game.currentScene.camera.y = 0;
game.start(ldr);


game.input.keyboard.on('down', (evt: ex.Input.KeyEvent) =>{
   if(evt.key === ex.Input.Keys.Up) {
      heartSprite.scale.addEqual(new ex.Vector(.2, .2));
   } 
   if(evt.key === ex.Input.Keys.Down){
      heartSprite.scale.addEqual(new ex.Vector(-.2, -.2));
   }
   if(evt.key === ex.Input.Keys.Left){
      ca4.setWidth(ca4.getWidth() - .2);
   }

   if(evt.key === ex.Input.Keys.Right){
      ca4.setWidth(ca4.getWidth() + .2);
   }
})