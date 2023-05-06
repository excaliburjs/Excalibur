
var engine1 = new ex.Engine({
  canvasElementId: 'game1',
  width: 600,
  height: 400,
  backgroundColor: ex.Color.Black
});
engine1.add(new ex.Actor({
  color: ex.Color.Blue,
  x: 100,
  y: 100,
  width: 100,
  height: 100,
}));
engine1.start();

var engine2 = new ex.Engine({
  canvasElementId: 'game2',
  width: 600,
  height: 400,
  backgroundColor: ex.Color.ExcaliburBlue
});
engine2.add(new ex.Actor({
  color: ex.Color.Red,
  x: 100,
  y: 100,
  width: 100,
  height: 100,
}));
engine2.start();