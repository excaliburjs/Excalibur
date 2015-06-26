var engine = new ex.Engine(600, 400);
var active = new ex.Actor(0, -50, 100, 100, ex.Color.Cyan);
active.collisionType = 2 /* Active */;
active.dy = 100;
active.ay = 900;
active.on('update', function () {
    //console.log('current dy', active.dy);
});
var fixed = new ex.Actor(0, 50, 100, 100, ex.Color.Green);
fixed.collisionType = 4 /* Fixed */;
fixed.moveTo(0, 100, 300).moveTo(0, 50, 300).repeatForever();
engine.add(active);
engine.add(fixed);
engine.input.keyboard.on('down', function () {
    console.log('jump');
    active.dy = -300;
});
engine.start().then(function () {
    console.log("loaded");
    engine.currentScene.camera.setFocus(0, 0);
});
//# sourceMappingURL=index.js.map