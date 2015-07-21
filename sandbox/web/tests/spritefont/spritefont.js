var game = new ex.Engine({
    width: 600,
    height: 400,
    canvasElementId: "game",
    pointerScope: 0 /* Canvas */
});
var spriteFontTex = new ex.Texture('spritefont.png');
var label = null;
game.start(spriteFontTex).then(function () {
    var spriteFont = new ex.SpriteFont(spriteFontTex, '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ', true, 16, 3, 16, 16);
    label = new ex.Label("This is a test!?!", 10, game.height / 2, null, spriteFont);
    label.color = ex.Color.Azure.clone();
    game.add(label);
});
document.getElementById('lighten').addEventListener('click', function () {
    label.opacity -= .05;
});
document.getElementById('darken').addEventListener('click', function () {
    label.opacity += .05;
});
document.getElementById('setcolor').addEventListener('click', function () {
    var text = document.getElementById('color').value;
    label.color = ex.Color.fromHex(text);
    label.opacity = label.color.a;
});
document.getElementById('text').addEventListener('keyup', function () {
    label.text = document.getElementById('text').value;
});
//# sourceMappingURL=spritefont.js.map