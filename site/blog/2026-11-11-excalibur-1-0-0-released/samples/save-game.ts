import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#1f2a1f')
});

const gemJam = 'https://excaliburjs.com/ludum-58/';
const images = {
  dirt: new ex.ImageSource(gemJam + 'images/dirt_back.png'),
  emerald: new ex.ImageSource(gemJam + 'images/emerald.png'),
  ruby: new ex.ImageSource(gemJam + 'images/ruby.png'),
  gold: new ex.ImageSource(gemJam + 'images/gold.png'),
  dwarf: new ex.ImageSource(gemJam + 'images/dwarf_idle.png')
};
const sounds = {
  common: new ex.Sound(gemJam + 'sounds/get_common.mp3'),
  rare: new ex.Sound(gemJam + 'sounds/get_rare.mp3'),
  legendary: new ex.Sound(gemJam + 'sounds/get_legendary.mp3')
};

// Registers the built-in components (transform, motion, graphics, body, collider, ...)
ex.Serializer.init();

// Graphics are saved by reference, so register the ones your actors use under stable keys
type GemKind = 'emerald' | 'ruby' | 'gold';
const gemSize = { width: 40, height: 40 };
const gemGraphics: Record<GemKind, ex.Sprite> = {
  emerald: images.emerald.toSprite({ destSize: gemSize }),
  ruby: images.ruby.toSprite({ destSize: gemSize }),
  gold: images.gold.toSprite({ destSize: gemSize })
};
const gemValues: Record<GemKind, number> = { emerald: 1, ruby: 3, gold: 5 };
ex.Serializer.registerGraphics({
  ...gemGraphics,
  dwarf: images.dwarf.toSprite(),
});

// Your own components round-trip automatically: public fields with default values are saved
class LootComponent extends ex.Component {
  value = 1;
  collected = false;
}
ex.Serializer.registerComponent(LootComponent);

let score = 0;
let hero: ex.Actor;

// Actor subclasses are restored as the right class
class Gem extends ex.Actor {
  // Keep the constructor callable with no arguments, that is how the Serializer re-creates it
  constructor(options?: ex.ActorOptions & { kind?: GemKind }) {
    const { kind = 'emerald', ...actorOptions } = options ?? {};
    super({ name: 'gem', ...actorOptions });
    this.addTag('saveable');
    for (const [name, graphic] of Object.entries(gemGraphics)) {
      this.graphics.add(name, graphic);
    }
    this.graphics.use(kind);
    const loot = new LootComponent();
    loot.value = gemValues[kind];
    this.addComponent(loot);
  }

  override onPostUpdate() {
    const loot = this.get(LootComponent);
    if (!loot.collected && hero && this.pos.distance(hero.pos) < 30) {
      loot.collected = true;
      this.graphics.opacity = 0.15; // opacity is part of the save too
      score += loot.value;
      (loot.value >= 5 ? sounds.legendary : loot.value >= 3 ? sounds.rare : sounds.common).play();
    }
  }
}

class Hero extends ex.Actor {
  constructor(options?: ex.ActorOptions) {
    super({ name: 'hero', pos: ex.vec(300, 180), ...options });
    this.addTag('saveable');
    this.graphics.add('dwarf', images.dwarf.toSprite());
    this.graphics.use('dwarf');
  }
}
ex.Serializer.registerCustomActors([Gem, Hero]);

const font = new ex.Font({
  size: 16,
  family: 'sans-serif',
  color: ex.Color.fromHex('#e8f5e9'),
  textAlign: ex.TextAlign.Center,
  baseAlign: ex.BaseAlign.Middle
});
const status = new ex.Label({ text: 'click the cave to walk, collect gems, then save', pos: ex.vec(300, 24), font, z: 2 });
game.add(status);
const scoreLabel = new ex.Label({ text: 'score 0', pos: ex.vec(300, 48), font, z: 2 });
game.add(scoreLabel);
scoreLabel.onPostUpdate = () => (scoreLabel.text = `score ${score}`);

const field = new ex.Actor({ name: 'field', pos: ex.vec(300, 180), width: 600, height: 240, z: -1 });
field.graphics.use(new ex.TiledSprite({ image: images.dirt, width: 600, height: 240 }));
game.add(field);
field.on('pointerdown', (evt) => {
  if (hero) {
    hero.graphics.flipHorizontal = evt.worldPos.x > hero.pos.x; // flips are saved too
    hero.actions.clearActions();
    hero.actions.moveTo({ pos: evt.worldPos, duration: 600 });
  }
});

const random = new ex.Random(7);
const kinds: GemKind[] = ['emerald', 'emerald', 'emerald', 'ruby', 'ruby', 'gold'];
function newGame() {
  game.currentScene.actors.filter((a) => a.hasTag('saveable')).forEach((a) => a.kill());
  score = 0;
  hero = new Hero();
  game.add(hero);
  for (let i = 0; i < 12; i++) {
    game.add(new Gem({
      pos: ex.vec(random.floating(30, 570), random.floating(80, 290)),
      kind: random.pickOne(kinds),
    }));
  }
}

const SAVE_KEY = 'excalibur-v1-save';
function save() {
  const actors = game.currentScene.actors.filter((a) => a.hasTag('saveable'));
  const json = JSON.stringify({
    score,
    actors: actors.map((a) => ex.Serializer.serializeActor(a)),
  });
  localStorage.setItem(SAVE_KEY, json);
  console.log(json);
  status.text = `saved ${actors.length} actors (${(json.length / 1024).toFixed(1)} KB), now move or scramble, then load`;
}

function load() {
  const json = localStorage.getItem(SAVE_KEY);
  if (!json) {
    status.text = 'nothing saved yet';
    return;
  }
  game.currentScene.actors.filter((a) => a.hasTag('saveable')).forEach((a) => a.kill());
  const data = JSON.parse(json) as { score: number; actors: ex.EntityData[] };
  score = data.score;
  for (const actorData of data.actors) {
    const actor = ex.Serializer.deserializeActor(actorData);
    if (actor) {
      game.add(actor);
      if (actor instanceof Hero) {
        hero = actor;
      }
    }
  }
  status.text = `loaded ${data.actors.length} actors, score and collected gems restored`;
}

function scramble() {
  for (const gem of game.currentScene.actors.filter((a) => a instanceof Gem)) {
    gem.pos = ex.vec(random.floating(30, 570), random.floating(80, 290));
  }
  status.text = 'scrambled! load to go back to your save';
}

function button(text: string, pos: ex.Vector, onClick: () => void) {
  const actor = new ex.Actor({ name: text, pos, width: 150, height: 40, color: ex.Color.fromHex('#3b6d3b') });
  actor.addChild(new ex.Label({ text, font }));
  actor.on('pointerdown', onClick);
  game.add(actor);
}

button('save', ex.vec(130, 350), save);
button('load', ex.vec(300, 350), load);
button('scramble', ex.vec(470, 350), scramble);

newGame();
game.start(new ex.Loader([...Object.values(images), ...Object.values(sounds)]));
