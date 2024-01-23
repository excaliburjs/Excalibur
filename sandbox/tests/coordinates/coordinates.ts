/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({ width: 500, height: 500 });
game.backgroundColor = ex.Color.fromHex('#eeeeee');

function addTestPoint(x, y, ax, ay, s = 1, rd = 0, parent = null) {
  var p = new Point(x, y, ax, ay);

  if (s > 0) {
    p.scale.setTo(s, s);
  }
  if (rd !== 0) {
    p.rotation = ex.toRadians(rd);
  }

  if (parent != null) {
    parent.addChild(p);
  } else {
    game.add(p);
  }

  var pl = new PointLabel(p);
  game.add(pl);

  return p;
}

class Point extends ex.Actor {
  constructor(x, y, public expectedX, public expectedY) {
    super({x, y, width: 3, height: 3, color: ex.Color.Red});
  }
}

class PointLabel extends ex.Actor {
  private _expectLabel: ex.Label;
  private _actualLabel: ex.Label;

  constructor(public point: Point) {
    super({x: 0, y: 0, width: 0, height: 0});

    this.anchor.setTo(0, 0);
  }

  onInitialize(engine: ex.Engine) {
    super.onInitialize(engine);

    this._expectLabel = new ex.Label({text: '', x: 5, y: 10});
    this._expectLabel.color = ex.Color.fromHex('#249111');
    this.addChild(this._expectLabel);

    this._actualLabel = new ex.Label({text: '', x: 5, y: 20});
    this._actualLabel.color = ex.Color.Blue;
    this.addChild(this._actualLabel);
  }

  //@ts-ignore
  update(engine: ex.Engine, delta: number) {
    super.update(engine, delta);

    var xx = this.point.expectedX;
    var xy = this.point.expectedY;
    var ax = this.point.getGlobalPos().x;
    var ay = this.point.getGlobalPos().y;

    this._expectLabel.text = `(${xx}, ${xy})`;
    this._actualLabel.text = `(${ax}, ${ay})`;

    // actual !== expected
    if (!isCloseEnough(xx, ax) || !isCloseEnough(xy, ay)) {
      this._expectLabel.color = ex.Color.Red;
    }

    this.pos.setTo(ax, ay - 10);
  }
}

function isCloseEnough(a, b, t = 1) {
  var diff = Math.abs(b - a);

  return diff <= t;
}

class GridLine extends ex.Actor {
  constructor(dir: 'x' | 'y', pos: number, size: number) {
    super({
      x: dir === 'x' ? pos : 0,
      y: dir === 'y' ? pos : 0,
      width: dir === 'x' ? 1 : size,
      height: dir === 'y' ? 1 : size,
      color: ex.Color.fromHex('#dedede')
    });

    this.anchor.setTo(0, 0);
  }
}

function drawGrid() {
  var step = 10; // px step for lines

  var lines = [],
    gw = game.drawWidth,
    gh = game.drawHeight;

  for (var y = 0; y < gh; y += step) {
    lines.push(new GridLine('y', y, gw));
  }
  for (var x = 0; x < gw; x += step) {
    lines.push(new GridLine('x', x, gh));
  }

  for (var a of lines) {
    game.add(a);
  }
}

game.start().then(() => {
  // draw grid
  drawGrid();

  // shift camera over
  game.currentScene.camera.x = 150;
  game.currentScene.camera.y = 150;

  // draw points
  addTestPoint(0, 0, 0, 0); // origin
  addTestPoint(50, 0, 50, 0);
  addTestPoint(50, 50, 50, 50);

  // parent -> child translation
  var p1 = addTestPoint(100, 0, 100, 0);
  addTestPoint(50, 0, 150, 0, 1, 0, p1);

  // parent -> child rotation (90deg)
  var p2 = addTestPoint(100, 150, 100, 150, 1, 90);
  addTestPoint(50, 0, 100, 200, 1, 0, p2);

  // parent -> child scale (2x)
  var p3 = addTestPoint(100, 100, 100, 100, 2);
  var c1 = addTestPoint(50, 0, 200, 100, 1, 0, p3);

  // grandchild -> scale (2x)
  addTestPoint(10, 20, 220, 140, 1, 0, c1);

  // parent -> child scale (2x) and rotation (45deg)
  var p4 = addTestPoint(100, 250, 100, 250, 2, 45);
  var c2 = addTestPoint(50, 0, 170, 320, 1, 0, p4);

  // grandchild scale (2x) + rotation (45deg)
  addTestPoint(0, 20, 142, 348, 1, 0, c2);
});
