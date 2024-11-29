/// <reference path='../../lib/excalibur.d.ts' />

var engine = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});

var label = new ex.Label({ text: 'This font should be white 20px consolas', x: 50, y: 50 });
/*label.onInitialize = function() {
   label.color = ex.Color.White;
}*/
label.color = ex.Color.White;
label.font.family = 'Consolas';
label.font.unit = ex.FontUnit.Px;
label.font.size = 20;

var label2 = new ex.Label({ text: 'Should be azure 20px Tahoma', x: 20, y: 150, font: new ex.Font({ size: 12, family: 'Arial' }) });
label2.font.family = 'Tahoma';
label2.font.unit = ex.FontUnit.Px;
label2.font.size = 20;
label2.color = ex.Color.Azure;

engine.add(label);
engine.add(label2);

engine.start();
