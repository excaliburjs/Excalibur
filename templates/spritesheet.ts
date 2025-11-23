export default `
import * as ex from 'excalibur';
console.log('hello, world');
  
const resources = {
    spritesheet: new ex.ImageSource('./player-run.png'),
} as const;

const loader = new ex.DefaultLoader();
loader.addResource(resources.spritesheet);

const TILE_SIZE = 96;

const game = new ex.Engine({
    canvasElementId: 'preview-canvas',
    displayMode: ex.DisplayMode.FitContainer,
    width: 592,
    height: 400,
    pixelArt: true,
});

const runSheet = ex.SpriteSheet.fromImageSource({
    image: resources.spritesheet,
    grid: {
        rows: 1,
        columns: 21,
        spriteWidth: TILE_SIZE,
        spriteHeight: TILE_SIZE
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
`;