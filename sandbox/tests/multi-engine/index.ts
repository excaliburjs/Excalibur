
var engine1 = new ex.Engine({
  canvasElementId: 'game1',
  width: 600,
  height: 400,
  backgroundColor: ex.Color.Black
});
engine1.start();

var engine2 = new ex.Engine({
  canvasElementId: 'game2',
  width: 600,
  height: 400,
  backgroundColor: ex.Color.ExcaliburBlue
});
engine2.start();