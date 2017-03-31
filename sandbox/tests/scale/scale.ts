/// <reference path='../../excalibur.d.ts' />

var game = new ex.Engine({
    width: 800,
    height: 600
});


// create an asset loader
var loader = new ex.Loader();
var resources = {
    txPlayer: new ex.Texture('logo.png')
};

// queue resources for loading
for (var r in resources) {
    loader.addResource(resources[r]);
}

var target = new ex.Actor(500, 500, 20, 20, ex.Color.Red);
game.add(target);

var aim = new ex.Actor(game.getDrawWidth() / 2 , game.getDrawHeight() / 2, 100, 100, ex.Color.Black);
aim.addDrawing(resources.txPlayer);
aim.setHeight(10);
aim.scale.setTo(1, .2);
game.add(aim);

// uncomment loader after adding resources
game.start(loader).then(() => {

    game.input.pointers.primary.on('move', (ev: ex.Input.PointerEvent) => {
        target.pos.setTo(ev.x, ev.y);

        var aimVec = target.pos.sub(aim.pos);
        aim.rotation =  aimVec.toAngle();
    });

});