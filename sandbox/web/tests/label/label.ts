var engine = new ex.Engine({
   canvasElementId: 'game',
   width: 600,
   height: 400
});


var label = new ex.Label("Test Label", 50, 50);
/*label.onInitialize = function() {
   label.color = ex.Color.White;
}*/
label.color = ex.Color.White;
label.font = '20pt Consolas';

engine.add(label);

engine.start();