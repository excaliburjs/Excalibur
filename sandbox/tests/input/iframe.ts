/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({ width: 800, height: 600, canvasElementId: 'game' });
var label = new ex.Label({text: '', x: 400, y: 300, font: new ex.Font({size: 48, family: 'Arial'})});
label.color = ex.Color.Chartreuse;
label.font.textAlign = ex.TextAlign.Center;

game.add(label);

game.on('postupdate', (ue: ex.PostUpdateEvent) => {
  var keys = game.input.keyboard
    .getKeys()
    .map((k) => {
      return (ex.Keys[k] || 'Unknown') + '(' + k.toString() + ')';
    })
    .join(', ');

  label.text = keys;
});

game.start();
