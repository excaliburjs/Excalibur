
var game = new ex.Engine({
   width: 600,
   height: 400,
   canvasElementId: "game",
   pointerScope: ex.Input.PointerScope.Canvas
});



var spriteFontTex = new ex.Texture('spritefont.png');
var label : ex.Label = null;

game.start(spriteFontTex).then(() => {
   
   var spriteFont = new ex.SpriteFont(spriteFontTex, '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ', true, 16, 3, 16, 16);

   label = new ex.Label("This is a test!?!", 10, game.height / 2, null, spriteFont);
   label.color = ex.Color.Azure.clone();
   game.add(label);

});

document.getElementById('lighten').addEventListener('click', function() {
   label.opacity -= .05;
});

document.getElementById('darken').addEventListener('click', function() {
   label.opacity += .05;
});

document.getElementById('setcolor').addEventListener('click', function() {
   var text = (<any>document.getElementById('color')).value;
   label.color = ex.Color.fromHex(text);
   label.opacity = label.color.a;
});

document.getElementById('text').addEventListener('keyup', function() {
   label.text = (<any>document.getElementById('text')).value;
});