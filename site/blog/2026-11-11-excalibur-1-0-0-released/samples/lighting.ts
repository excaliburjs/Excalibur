import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#3b3a4a'),
  pixelArt: true,
  lighting: {
    enabled: true,
    ambientIntensity: 0.05,
    ambientColor: ex.Color.fromRGB(70, 70, 160) // moonlit blue veil
  }
});

const tactics = 'https://raw.githubusercontent.com/excaliburjs/sample-tactics/main/res/';
const images = {
  terrain: new ex.ImageSource(tactics + 'TerrainSheet.png'),
  knight: new ex.ImageSource(tactics + 'KnightSheet.png'),
  slime: new ex.ImageSource(tactics + 'slime.png'),
  spider: new ex.ImageSource(tactics + 'SpiderSheet.png')
};


const terrainSheet = ex.SpriteSheet.fromImageSource({
  image: images.terrain,
  grid: { rows: 1, columns: 6, spriteWidth: 32, spriteHeight: 48 },
});

const makeIdleAnim = (image: ex.ImageSource, strategy = ex.AnimationStrategy.Loop) =>
  ex.Animation.fromSpriteSheet(
    ex.SpriteSheet.fromImageSource({
      image,
      grid: {
        rows: 1,
        columns: 4,
        spriteWidth: 32,
        spriteHeight: 32,
      },
    }),
    [0, 1, 2, 3], 200, strategy);

// A meadow for the lights to reveal, with stone outcrops that cast shadows
const TILE_SIZE = 32;
const tileMap = new ex.TileMap({
  pos: ex.vec(12, 44),
  tileWidth: TILE_SIZE,
  tileHeight: TILE_SIZE,
  columns: 18,
  rows: 11,
});
const random = new ex.Random(11);
for (const tile of tileMap.tiles) {
  const stone = random.bool(0.07) && tile.x > 1;
  tile.addGraphic(
    terrainSheet.sprites[(stone ? 4 : random.bool(0.15) ? 2 : 0) + random.integer(0, 1)]
  );
  if (stone) {
    // Anything with a LightOccluderComponent casts a dynamic shadow
    const rock = new ex.Actor({
      name: 'rock',
      pos: tileMap.pos.add(ex.vec(tile.x * TILE_SIZE + 16, tile.y * TILE_SIZE + 12)),
    });
    rock.addComponent(
      new ex.LightOccluderComponent({
        shape: {
          kind: 'box',
          width: 30,
          height: 26,
        },
      }));
    game.add(rock);
  }
}
game.add(tileMap);

// The darkness veil covers the whole screen when no width/height is given
const night = new ex.Actor({ name: 'night' });
night.addComponent(new ex.DarknessComponent({ color: ex.Color.fromRGB(0, 0, 12), intensity: 0.95 }));
game.add(night);

// Torches are point lights, `flicker` animates their intensity
const torchColor = ex.Color.fromRGB(255, 170, 60);
for (const pos of [ex.vec(90, 70), ex.vec(510, 70), ex.vec(90, 330), ex.vec(510, 330)]) {
  const torch = new ex.Actor({ name: 'torch', pos, radius: 4, color: torchColor });
  torch.addComponent(
    new ex.PointLightComponent({
      color: torchColor,
      intensity: 0.7,
      radius: 160,
      flicker: { frequency: 3, amplitude: 0.2, secondaryFrequency: 7.3 }
    })
  );
  game.add(torch);
}

// Occluders can be lights too: the slimes glow green and still block the torches
for (const pos of [ex.vec(250, 150), ex.vec(420, 260)]) {
  const slime = new ex.Actor({ name: 'slime', pos, z: 1 });
  slime.graphics.use(makeIdleAnim(images.slime));
  slime.addComponent(
    new ex.LightOccluderComponent({
      shape: { kind: 'circle', radius: 12 },
    }));
  slime.addComponent(
    new ex.PointLightComponent({
      color: ex.Color.fromRGB(120, 255, 120),
      intensity: 0.6,
      radius: 80,
    }));
  // wander between two spots so the shadows move
  slime.actions.repeatForever((ctx) =>
    ctx.moveBy({
      offset: ex.vec(0, 60),
      duration: 3000,
    })
    .delay(500)
    .moveBy({
      offset: ex.vec(0, -60),
      duration: 3000,
    }).delay(500)
  );
  game.add(slime);
}

// A spider lurking in the dark, only the lights give it away
const spider = new ex.Actor({ name: 'spider', pos: ex.vec(330, 110), z: 1 });
spider.graphics.use(makeIdleAnim(images.spider, ex.AnimationStrategy.PingPong));
spider.addComponent(
  new ex.LightOccluderComponent({
    shape: { kind: 'circle', radius: 14 },
  }));
game.add(spider);

// The knight's lantern is a cone light. Move the mouse to aim it.
const knight = new ex.Actor({ name: 'knight', pos: ex.vec(300, 320), z: 1 });
knight.graphics.use(makeIdleAnim(images.knight));
const lantern = new ex.ConeLightComponent({
  color: ex.Color.fromRGB(220, 240, 255),
  intensity: 0.9,
  radius: 320,
  angle: Math.PI / 5,
  softness: 0.35
});
knight.addComponent(lantern);
game.add(knight);

game.input.pointers.primary.on('move', (evt) => {
  const toPointer = evt.worldPos.sub(knight.pos);
  lantern.direction = toPointer.toAngle();
  knight.graphics.flipHorizontal = toPointer.x < 0;
});

// Click to drop a colored lantern
const lanternColors = [
  ex.Color.fromRGB(120, 200, 255),
  ex.Color.fromRGB(255, 120, 200),
  ex.Color.fromRGB(140, 255, 140),
];
let lanternIndex = 0;
game.input.pointers.primary.on('down', (evt) => {
  const color = lanternColors[lanternIndex++ % lanternColors.length];
  const dropped = new ex.Actor({ name: 'lantern', pos: evt.worldPos, radius: 4, color });
  dropped.addComponent(new ex.PointLightComponent({
    color,
    intensity: 0.8,
    radius: 110,
  }));
  game.add(dropped);
});

game.start(new ex.Loader(Object.values(images)));
