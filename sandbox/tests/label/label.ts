/// <reference path='../../lib/excalibur.d.ts' />


var engine = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});

var label = new ex.Label({text: 'This font should be white 20px consolas', x: 50, y: 50});
/*label.onInitialize = function() {
   label.color = ex.Color.White;
}*/
label.color = ex.Color.White;
label.fontFamily = 'Consolas';
label.fontUnit = ex.FontUnit.Px;
label.fontSize = 20;

var label2 = new ex.Label({text: 'Should be azure 20px Tahoma', x: 20, y: 150, font: new ex.Font({size: 12, family: 'Arial'})});
label2.fontFamily = 'Tahoma';
label2.fontUnit = ex.FontUnit.Px;
label2.fontSize = 20;
label2.color = ex.Color.Azure;

engine.add(label);
engine.add(label2);

engine.start();
