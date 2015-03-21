var width = 600;
var height = 400;
var minVel = -200;
var maxVel = 200;
var numActors = 300;
var blockTexture = new ex.Texture("block.png");
var engine = new ex.Engine(width, height, 'game');
//engine.isDebug = true;
var blockGroup = engine.currentScene.createGroup("blocks");
var blockSprite = blockTexture.asSprite();
blockSprite.scale.setTo(.2, .2);
var player = new ex.Actor(width / 2, height / 2, 30, 30, ex.Color.Cyan);
player.collisionType = 4 /* Fixed */;
engine.currentScene.add(player);
for (var i = 0; i < numActors; i++) {
    var actor = new ex.Actor(Math.random() * width, Math.random() * height, .2 * 64, .2 * 48);
    actor.addDrawing("default", blockSprite);
    actor.collisionType = 3 /* Elastic */;
    actor.on('update', function (e) {
        if (this.x < 0) {
            this.dx = Math.abs(this.dx);
        }
        if (this.y < 0) {
            this.dy = Math.abs(this.dy);
        }
        if (this.x > width) {
            this.dx = -1 * Math.abs(this.dx);
        }
        if (this.y > height) {
            this.dy = -1 * Math.abs(this.dy);
        }
    });
    actor.on('collision', function () {
        //console.log('inner collision');
    });
    actor.dx = ex.Util.randomInRange(minVel, maxVel);
    actor.dy = ex.Util.randomInRange(minVel, maxVel);
    blockGroup.add(actor);
}
blockGroup.on('collision', function (e) {
    if (e.other === player) {
        //console.log("collision with player!");
        player.color.r += 1;
        player.color.g -= 1;
        player.color.b -= 1;
    }
});
engine.start(new ex.Loader([blockTexture])).then(function () {
    // do stuff
});
//# sourceMappingURL=group.js.map