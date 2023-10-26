
class StartButton extends ex.ScreenElement {
 constructor(x: number, y: number) {
  super({
    x, y
  })
 }
 onInitialize() {
   this.graphics.use(new ex.Rectangle({
    color: ex.Color.Green,
    width: 300,
    height: 50
   }));
   // ...
   this.on('pointerup', () => {
     alert("I've been clicked");
   })
   // ...
 }
}

var engine = new ex.Engine({
  width: 800,
  height: 400
});

engine.add(new StartButton(400, 200));

engine.start();