
/// <reference path="../../../../dist/Excalibur.d.ts" />

var game = new ex.Engine({
   width: 600,
   height: 400,
   canvasElementId: "game",
   pointerScope: ex.Input.PointerScope.Canvas
});

var spriteFontTex = new ex.Texture('spritefont.png');
var label : ex.Label = null;
var loader = new ex.Loader([spriteFontTex]);

game.start(loader).then(() => {
   
   var spriteFont = new ex.SpriteFont(spriteFontTex, '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ', true, 16, 3, 16, 16);

   label = new ex.Label("This is a sprite Font test", game.width / 2, game.height / 2, null, spriteFont);
   label.color = ex.Color.Azure.clone();
   label.letterSpacing = -20;
   label.fontSize = 10;
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

document.getElementById('textalign').addEventListener('change', function (evt) {
   label.textAlign = (<any>ex.TextAlign)[(<any>evt.currentTarget).value];
});

document.getElementById('basealign').addEventListener('change', function (evt) {
   label.baseAlign = (<any>ex.BaseAlign)[(<any>evt.currentTarget).value];
});

document.getElementById('fontsize').addEventListener('change', function (evt) {
   label.fontSize = (<any>evt.currentTarget).value;
});

document.getElementById('letterspacing').addEventListener('keyup', function (evt) {
   label.letterSpacing = parseFloat((<any>evt.currentTarget).value);
});

document.getElementById('textshadow').addEventListener('change', function (evt) {
   var val = <boolean>((<any>evt.currentTarget).checked);
   label.useTextShadow(val);
});

document.getElementById('setshadowcolor').addEventListener('click', function () {
   var text = (<any>document.getElementById('textshadowcolor')).value;
   label.setTextShadow(5, 5, ex.Color.fromHex(text));
});