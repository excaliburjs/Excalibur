import playerRun from './player-run.png';

const runImage = new ex.ImageSource(playerRun);

const runSheet = ex.SpriteSheet.fromImageSource({
    image: runImage,
    grid: {
        rows: 1,
        columns: 21,
        spriteWidth: 96,
        spriteHeight: 96
    }
});

const runAnim = ex.Animation.fromSpriteSheet(runSheet, ex.range(1, 10), 200);

const actor = new ex.Actor({
    pos: ex.vec(game.halfDrawWidth, game.halfDrawHeight)
});
actor.graphics.use(runAnim);

const loader = new ex.Loader([runImage]);
game.start(loader).then(() => {
    game.currentScene.add(actor);
});
