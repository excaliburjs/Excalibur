export default `
import * as ex from 'excalibur';
console.log('hello, world');

const resources = {
    tilemap: new ex.ImageSource('./tiny-town/tilemap/tilemap.png'),
} as const;

const loader = new ex.Loader(Object.values(resources));

const TILE_SIZE = 16;

const game = new ex.Engine({
    canvasElementId: 'preview-canvas',
    displayMode: ex.DisplayMode.FitContainer,
    width: 592,
    height: 400,
    pixelArt: true,
});

const spriteSheet = ex.SpriteSheet.fromImageSource({
    image: resources.tilemap,
    grid: {
        rows: 10,
        columns: 11,
        spriteWidth: TILE_SIZE,
        spriteHeight: TILE_SIZE,
    }
});

const map = new ex.Actor();
const group = new ex.GraphicsGroup({
  members: []
});

for (let j = 0; j < game.drawHeight / TILE_SIZE; j++) {
  for (let i = 0; i < game.drawWidth / TILE_SIZE; i++) {
    // Select a grassy tile from the first 3
    const tileSprite = spriteSheet.getSprite(ex.randomIntInRange(0, 2), 0);
    group.members.push({
      graphic: tileSprite, 
      offset: ex.vec(i * TILE_SIZE, j * TILE_SIZE)
    });
  }
}

map.graphics.use(group, { anchor: ex.vec(0, 0) });

const zoom = 4;
const { camera } = game.currentScene;
camera.zoom = zoom;
camera.pos = ex.vec(game.halfDrawWidth/zoom, game.halfDrawHeight/zoom);
game.add(map);
map.pos = ex.vec(0, 0)
game.start(loader);

`;