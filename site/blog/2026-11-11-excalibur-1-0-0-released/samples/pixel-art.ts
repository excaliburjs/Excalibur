import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#0f172a'),
  pixelArt: true // turn on sepcial pixel art rendering that elminates shimmer and rotational artifaces
});

const platformer = 'https://excaliburjs.com/sample-platformer/res/';
const botImage = new ex.ImageSource(platformer + 'excalibot.png');

const botSheet = ex.SpriteSheet.fromImageSource({
  image: botImage,
  grid: { rows: 1, columns: 8, spriteWidth: 32, spriteHeight: 32 },
});
const run = ex.Animation.fromSpriteSheet(botSheet, [3, 4, 5, 6, 7], 100);

const hero = new ex.Actor({
  pos: ex.vec(300, 170),
  scale: ex.vec(5, 5),
  angularVelocity: 0.4,
});
hero.graphics.use(run.clone());

let t = 0;
hero.onPostUpdate = (_engine, elapsed) => {
  t += elapsed / 1000;
  const s = 5 + Math.sin(t * 1.1) * 1.5;
  hero.scale = ex.vec(s, s);
};
game.add(hero);

const random = new ex.Random(1234);
for (let i = 0; i < 6; i++) {
  const little = new ex.Actor({ pos: ex.vec(60 + i * 96, 340), scale: ex.vec(3, 3) });
  little.graphics.use(run.clone());
  little.onPostUpdate = () => {
    little.pos.x += Math.sin(t * 0.7 + i) * 0.35; // deliberately sub-pixel
  };
  game.add(little);
}

// Click anywhere to make everyone jump
game.input.pointers.primary.on('down', () => {
  for (const bot of game.currentScene.actors) {
    if (bot.actions.getQueue().isComplete) {
      bot.actions.moveBy({
        offset: ex.vec(0, -40),
        duration: 180,
      }).moveBy({
        offset: ex.vec(0, 40),
        duration: 220,
      });
    }
  }
});

game.add(
  new ex.Label({
    text: 'new ex.Engine({ pixelArt: true })  click to jump',
    pos: ex.vec(300, 24),
    font: new ex.Font({ size: 16, family: 'monospace', color: ex.Color.fromHex('#e2e8f0'), textAlign: ex.TextAlign.Center })
  })
);

game.start(new ex.Loader([botImage]));
