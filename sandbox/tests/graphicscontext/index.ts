var canvasElement = document.createElement('canvas');
document.body.appendChild(canvasElement);
canvasElement.width = 100;
canvasElement.height = 100;
var sut = new ex.ExcaliburGraphicsContextWebGL({
  canvasElement: canvasElement,
  enableTransparency: false,
  antialiasing: false,
  multiSampleAntialiasing: true,
  backgroundColor: ex.Color.White
});
sut.updateViewport({
  width: 100,
  height: 100
});

var rect = new ex.Rectangle({
  width: 50,
  height: 50,
  color: ex.Color.Blue
});
sut.beginDrawLifecycle();
sut.clear();

sut.save();
sut.drawImage(rect._bitmap, 20, 20);
sut.restore();

sut.flush();
sut.endDrawLifecycle();
