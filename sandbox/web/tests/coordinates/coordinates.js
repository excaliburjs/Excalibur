/// <reference path='../../excalibur.d.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var game = new ex.Engine({ width: 500, height: 500 });
game.backgroundColor = ex.Color.fromHex("#eeeeee");
function addTestPoint(x, y, ax, ay, s, rd, parent) {
    if (s === void 0) { s = 1; }
    if (rd === void 0) { rd = 0; }
    if (parent === void 0) { parent = null; }
    var p = new Point(x, y, ax, ay);
    if (s > 0) {
        p.scale.setTo(s, s);
    }
    if (rd !== 0) {
        p.rotation = ex.Util.toRadians(rd);
    }
    if (parent != null) {
        parent.add(p);
    }
    else {
        game.add(p);
    }
    var pl = new PointLabel(p);
    game.add(pl);
    return p;
}
var Point = (function (_super) {
    __extends(Point, _super);
    function Point(x, y, expectedX, expectedY) {
        _super.call(this, x, y, 3, 3, ex.Color.Red);
        this.expectedX = expectedX;
        this.expectedY = expectedY;
    }
    return Point;
}(ex.Actor));
var PointLabel = (function (_super) {
    __extends(PointLabel, _super);
    function PointLabel(point) {
        _super.call(this, 0, 0, 0, 0);
        this.point = point;
        this.anchor.setTo(0, 0);
    }
    PointLabel.prototype.onInitialize = function (engine) {
        _super.prototype.onInitialize.call(this, engine);
        this._expectLabel = new ex.Label('', 5, 10);
        this._expectLabel.color = ex.Color.fromHex("#249111");
        this.add(this._expectLabel);
        this._actualLabel = new ex.Label('', 5, 20);
        this._actualLabel.color = ex.Color.Blue;
        this.add(this._actualLabel);
    };
    PointLabel.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);
        var xx = this.point.expectedX;
        var xy = this.point.expectedY;
        var ax = this.point.getWorldPos().x;
        var ay = this.point.getWorldPos().y;
        this._expectLabel.text = "(" + xx + ", " + xy + ")";
        this._actualLabel.text = "(" + ax + ", " + ay + ")";
        // actual !== expected
        if (!isCloseEnough(xx, ax) || !isCloseEnough(xy, ay)) {
            this._expectLabel.color = ex.Color.Red;
        }
        this.pos.setTo(ax, ay - 10);
    };
    return PointLabel;
}(ex.Actor));
function isCloseEnough(a, b, t) {
    if (t === void 0) { t = 1; }
    var diff = Math.abs(b - a);
    return diff <= t;
}
var GridLine = (function (_super) {
    __extends(GridLine, _super);
    function GridLine(dir, pos, size) {
        _super.call(this, dir === "x" ? pos : 0, dir === "y" ? pos : 0, dir === "x" ? 1 : size, dir === "y" ? 1 : size, ex.Color.fromHex("#dedede"));
        this.anchor.setTo(0, 0);
    }
    return GridLine;
}(ex.Actor));
function drawGrid() {
    var step = 10; // px step for lines
    var lines = [], gw = game.getWidth(), gh = game.getHeight();
    for (var y = 0; y < gh; y += step) {
        lines.push(new GridLine("y", y, gw));
    }
    for (var x = 0; x < gw; x += step) {
        lines.push(new GridLine("x", x, gh));
    }
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var a = lines_1[_i];
        game.add(a);
    }
}
game.start().then(function () {
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
