var engine = new ex.Engine({
  width: 600,
  height: 400
});

engine.debug.entity.showId = false;
engine.debug.collider.showGeometry = true;
engine.debug.transform.showPosition = true;

engine.showDebug(true);

var image = new ex.ImageSource('./spritefont.png');

var loader = new ex.Loader([image]);

var screenElement = new ex.ScreenElement({
  pos: ex.vec(engine.screen.halfDrawWidth, engine.screen.halfDrawHeight),
  width: 100,
  height: 100,
  anchor: ex.Vector.Half
});
// screenElement.collider.useBoxCollider(100, 100, ex.Vector.Half);

screenElement.graphics.use(image.toSprite(), { anchor: ex.vec(0.5, 0.5) });

engine.currentScene.add(screenElement);

engine.start(loader);
