var engine = new ex.Engine({
    canvasElementId: 'game',
    width: 600,
    height: 400
});
var label = new ex.Label("This font should be white 20px consolas", 50, 50);
label.color = ex.Color.White;
label.fontFamily = 'Consolas';
label.fontUnit = ex.FontUnit.Px;
label.fontSize = 20;
var label2 = new ex.Label("Should be azure 20px Tahoma", 20, 150, "12px Arial");
label2.fontFamily = "Tahoma";
label2.fontUnit = ex.FontUnit.Px;
label2.fontSize = 20;
label2.color = ex.Color.Azure;
engine.add(label);
engine.add(label2);
engine.start();
//# sourceMappingURL=label.js.map