import * as ex from 'excalibur';

// Save games are built in: the Serializer turns actors and their components into JSON
// and back, including your own components and Actor subclasses.
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#1f2a1f')
});

// Registers the built-in components (transform, motion, graphics, body, collider, ...)
ex.Serializer.init();

// Graphics are saved by reference, so register the ones your actors use under stable keys
const gemGraphic = new ex.Polygon({
  points: [ex.vec(0, -14), ex.vec(12, 0), ex.vec(0, 14), ex.vec(-12, 0)],
  color: ex.Color.fromHex('#6ee7b7')
});
const heroGraphic = new ex.Circle({ radius: 14, color: ex.Color.fromHex('#fbbf24') });
ex.Serializer.registerGraphics({ gem: gemGraphic, hero: heroGraphic });

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
  constructor(options?: ex.ActorOptions & { value?: number }) {
    const { value = 1, ...actorOptions } = options ?? {};
    super({ name: 'gem', ...actorOptions });
    this.addTag('saveable');
    this.graphics.add('gem', gemGraphic);
    this.graphics.use('gem');
    const loot = new LootComponent();
    loot.value = value;
    this.addComponent(loot);
  }

  override onPostUpdate() {
    const loot = this.get(LootComponent);
    if (!loot.collected && hero && this.pos.distance(hero.pos) < 26) {
      loot.collected = true;
      this.graphics.opacity = 0.15; // opacity is part of the save too
      score += loot.value;
    }
  }
}

class Hero extends ex.Actor {
  constructor(options?: ex.ActorOptions) {
    super({ name: 'hero', pos: ex.vec(300, 150), ...options });
    this.addTag('saveable');
    this.graphics.add('hero', heroGraphic);
    this.graphics.use('hero');
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
const status = new ex.Label({ text: 'click the field to walk, collect gems, then save', pos: ex.vec(300, 24), font, z: 2 });
game.add(status);
const scoreLabel = new ex.Label({ text: 'score 0', pos: ex.vec(300, 48), font, z: 2 });
game.add(scoreLabel);
scoreLabel.onPostUpdate = () => (scoreLabel.text = `score ${score}`);

const field = new ex.Actor({ name: 'field', pos: ex.vec(300, 180), width: 600, height: 240, color: ex.Color.fromHex('#2f4a2f'), z: -1 });
game.add(field);
field.on('pointerdown', (evt) => {
  hero?.actions.clearActions();
  hero?.actions.moveTo({ pos: evt.worldPos, duration: 600 });
});

const random = new ex.Random(7);
function newGame() {
  game.currentScene.actors.filter((a) => a.hasTag('saveable')).forEach((a) => a.kill());
  score = 0;
  hero = new Hero();
  game.add(hero);
  for (let i = 0; i < 12; i++) {
    game.add(new Gem({ pos: ex.vec(random.floating(30, 570), random.floating(80, 290)), value: random.integer(1, 5) }));
  }
}

const SAVE_KEY = 'excalibur-v1-save';
function save() {
  const actors = game.currentScene.actors.filter((a) => a.hasTag('saveable'));
  const json = JSON.stringify({ score, actors: actors.map((a) => ex.Serializer.serializeActor(a)) });
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
button('save', ex.vec(130, 340), save);
button('load', ex.vec(300, 340), load);
button('scramble', ex.vec(470, 340), scramble);

newGame();
game.start();
