/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({ width: 800, height: 300, canvasElementId: 'game' });

var label = new ex.Label({ text: 'Should be 72px Impact', x: 20, y: 100 });
label.font.size = 72;
label.font.family = 'Impact';
label.color = ex.Color.White;

var label2 = new ex.Label({ text: 'Should be 20px Tahoma', x: 20, y: 150 });
label2.font.size = 20;
label2.font.family = 'Tahoma';
label2.color = ex.Color.Azure;

game.add(label);
game.add(label2);

game.start();
