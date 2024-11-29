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

const runAnim = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: runSheet,
  durationPerFrameMs: 200,
  frameCoordinates: [
    {x: 1, y: 0},
    {x: 2, y: 0},
    {x: 3, y: 0},
    {x: 4, y: 0},
    {x: 5, y: 0}
  ]
});

const actor = new ex.Actor({
    pos: ex.vec(game.halfDrawWidth, game.halfDrawHeight)
});
actor.graphics.use(runAnim);

const loader = new ex.Loader([runImage]);
game.start(loader).then(() => {
    game.currentScene.add(actor);
});
