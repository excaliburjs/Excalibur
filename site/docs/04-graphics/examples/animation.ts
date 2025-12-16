import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
});

const resources = {
    spritesheet: new ex.ImageSource('./player-run.png'),
} as const;

const loader = new ex.DefaultLoader();
loader.addResource(resources.spritesheet);

const runSheet = ex.SpriteSheet.fromImageSource({
    image: resources.spritesheet,
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

game.start(loader).then(() => {
    game.currentScene.add(actor);
});
