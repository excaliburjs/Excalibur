import * as ex from 'excalibur';

// An auto-save plugin: the scene hooks tell it when to snapshot and when to restore, the Serializer
// does the work. Walk around, collect gems, change scenes, then reload the page: you are where you left off.
// Art and audio are from Gem Jam, our Ludum Dare 58 entry: https://excaliburjs.com/ludum-58/

interface AutoSaveOptions {
  /** localStorage key prefix, one entry per scene */
  key: string;
  /** Only actors with this tag are saved */
  tag: string;
  /** Milliseconds between periodic saves of the active scene */
  interval: number;
}

type AutoSaveEvents = { save: { scene: string; bytes: number }; restore: { scene: string; actors: number } };

class AutoSavePlugin extends ex.Plugin {
  events = new ex.EventEmitter<AutoSaveEvents>();
  lastSavedAt = 0;
  /** Set false to stop saving, for example right before wiping and reloading */
  enabled = true;
  private _engine!: ex.Engine;

  constructor(private _options: AutoSaveOptions) {
    super('auto-save');
  }

  override onEnginePreInitialize(engine: ex.Engine) {
    // Pre, not post: the director activates the first scene before onEnginePostInitialize fires
    this._engine = engine;
    // Tabs get closed and pages get refreshed, catch the current scene on the way out
    window.addEventListener('pagehide', () => this.save(engine.currentScene));
  }

  override onScenePostInitialize(scene: ex.Scene) {
    // Runs once per scene: a periodic save while the scene is active
    const timer = new ex.Timer({ interval: this._options.interval, repeats: true, action: () => this.save(scene) });
    scene.add(timer);
    timer.start();
  }

  override onScenePostActivate(scene: ex.Scene) {
    this.restore(scene);
  }

  override onScenePreDeactivate(scene: ex.Scene) {
    this.save(scene);
  }

  private _storageKey(scene: ex.Scene) {
    return `${this._options.key}:${this._engine.director.getSceneName(scene)}`;
  }

  save(scene: ex.Scene) {
    if (!this.enabled) {
      return;
    }
    const name = this._engine.director.getSceneName(scene)!;
    const actors = scene.actors.filter((actor) => actor.hasTag(this._options.tag));
    const json = JSON.stringify(actors.map((actor) => ex.Serializer.serializeActor(actor)));
    localStorage.setItem(this._storageKey(scene), json);
    this.lastSavedAt = Date.now();
    this.events.emit('save', { scene: name, bytes: json.length });
  }

  restore(scene: ex.Scene) {
    const json = localStorage.getItem(this._storageKey(scene));
    if (!json) {
      return;
    }
    // Remove immediately (not deferred to end of frame) so the stand-ins never get a frame to act
    scene.actors.filter((actor) => actor.hasTag(this._options.tag)).forEach((actor) => scene.world.remove(actor, false));
    const data = JSON.parse(json) as ex.EntityData[];
    let count = 0;
    for (const actorData of data) {
      const actor = ex.Serializer.deserializeActor(actorData);
      if (actor) {
        scene.add(actor);
        count++;
      }
    }
    this.events.emit('restore', { scene: this._engine.director.getSceneName(scene)!, actors: count });
  }

  wipe() {
    this.enabled = false;
    for (const name of Object.keys(this._engine.director.scenes)) {
      localStorage.removeItem(`${this._options.key}:${name}`);
    }
  }
}

// --- Game setup
const gemJam = 'https://excaliburjs.com/ludum-58/';
const images = {
  grass: new ex.ImageSource(gemJam + 'images/grass.png'),
  dirtFront: new ex.ImageSource(gemJam + 'images/dirt_front.png'),
  dirtBack: new ex.ImageSource(gemJam + 'images/dirt_back.png'),
  chest: new ex.ImageSource(gemJam + 'images/chest.png'),
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

ex.Serializer.init();
type GemKind = 'emerald' | 'ruby' | 'gold';
const gemValues: Record<GemKind, number> = { emerald: 1, ruby: 3, gold: 5 };
const gemSprites: Record<GemKind, ex.Sprite> = {
  emerald: images.emerald.toSprite({ destSize: { width: 36, height: 36 } }),
  ruby: images.ruby.toSprite({ destSize: { width: 36, height: 36 } }),
  gold: images.gold.toSprite({ destSize: { width: 36, height: 36 } })
};
ex.Serializer.registerGraphics({ ...gemSprites, dwarf: images.dwarf.toSprite() });

class LootComponent extends ex.Component {
  value = 1;
}
// The hero carries progress as a component, so it round-trips with the actor
class ProgressComponent extends ex.Component {
  score = 0;
  gems = 0;
}
ex.Serializer.registerComponents([LootComponent, ProgressComponent]);

class Gem extends ex.Actor {
  constructor(options?: ex.ActorOptions & { kind?: GemKind }) {
    const { kind = 'emerald', ...actorOptions } = options ?? {};
    super({ name: 'gem', ...actorOptions });
    this.addTag('saveable');
    for (const [name, sprite] of Object.entries(gemSprites)) {
      this.graphics.add(name, sprite);
    }
    this.graphics.use(kind);
    const loot = new LootComponent();
    loot.value = gemValues[kind];
    this.addComponent(loot);
  }

  override onPostUpdate() {
    if (this.pos.distance(hero.pos) < 30) {
      const progress = hero.get(ProgressComponent);
      const value = this.get(LootComponent).value;
      progress.score += value;
      progress.gems++;
      (value >= 5 ? sounds.legendary : value >= 3 ? sounds.rare : sounds.common).play();
      this.kill(); // gone from the scene, so gone from the next save
    }
  }
}

class Hero extends ex.Actor {
  constructor(options?: ex.ActorOptions) {
    super({ name: 'hero', pos: ex.vec(300, 300), z: 1, ...options });
    this.graphics.add('dwarf', images.dwarf.toSprite());
    this.graphics.use('dwarf');
    this.addComponent(new ProgressComponent());
  }
}
ex.Serializer.registerCustomActors([Gem, Hero]);

const fontOptions: ex.FontOptions & ex.GraphicOptions & ex.RasterOptions = { size: 15, family: 'sans-serif', color: ex.Color.fromHex('#e8f5e9'), shadow: { blur: 2, color: ex.Color.Black } };
const random = new ex.Random(99);

// Two scenes with gems to collect, each saved under its own key
class Level extends ex.Scene {
  constructor(
    private _config: { sky: ex.Color; tile: ex.ImageSource; door: { pos: ex.Vector; label: string; to: string } }
  ) {
    super();
  }

  override onInitialize() {
    this.backgroundColor = this._config.sky;
    const ground = new ex.Actor({ name: 'ground', pos: ex.vec(300, 316), z: -1 });
    ground.graphics.use(new ex.TiledSprite({ image: this._config.tile, width: 600, height: 168 }));
    this.add(ground);

    const door = new ex.Actor({ name: 'door', pos: this._config.door.pos, width: 64, height: 64 });
    door.graphics.use(images.chest.toSprite());
    door.addChild(new ex.Label({ text: this._config.door.label, pos: ex.vec(0, -44), font: new ex.Font({ ...fontOptions, textAlign: ex.TextAlign.Center }) }));
    door.on('pointerdown', () => this.engine.goToScene(this._config.door.to));
    this.add(door);

    const kinds: GemKind[] = ['emerald', 'emerald', 'emerald', 'ruby', 'ruby', 'gold'];
    for (let i = 0; i < 10; i++) {
      this.add(new Gem({ pos: ex.vec(random.floating(30, 570), random.floating(250, 380)), kind: random.pickOne(kinds) }));
    }
  }

  override onActivate() {
    // The hero travels between scenes; it is not tagged, so the plugin leaves it to us
    this.add(hero);
  }

  override onDeactivate() {
    this.remove(hero);
  }
}

const autoSave = new AutoSavePlugin({ key: 'excalibur-v1-autosave', tag: 'saveable', interval: 2000 });

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  pixelArt: true,
  plugins: [autoSave],
  scenes: {
    surface: new Level({ sky: ex.Color.fromHex('#7fb7e6'), tile: images.grass, door: { pos: ex.vec(540, 200), label: 'to the mine', to: 'mine' } }),
    mine: new Level({ sky: ex.Color.fromHex('#1b1612'), tile: images.dirtBack, door: { pos: ex.vec(60, 200), label: 'to the surface', to: 'surface' } })
  }
});

// Hero and current scene are saved alongside each scene snapshot
const HERO_KEY = 'excalibur-v1-autosave:hero';
let hero: Hero;
const heroSave = localStorage.getItem(HERO_KEY);
const startScene = heroSave ? (JSON.parse(heroSave).scene as 'surface' | 'mine') : 'surface';
hero = heroSave ? (ex.Serializer.deserializeActor(JSON.parse(heroSave).hero) as Hero) : new Hero();

let status = heroSave ? 'restored from your last visit' : 'no save yet';
autoSave.events.on('save', ({ scene, bytes }) => {
  localStorage.setItem(HERO_KEY, JSON.stringify({ scene, hero: ex.Serializer.serializeActor(hero) }));
  status = `saved ${scene} (${(bytes / 1024).toFixed(1)} KB)`;
});
autoSave.events.on('restore', ({ scene, actors }) => (status = `restored ${actors} actors in ${scene}`));

game.input.pointers.primary.on('down', (evt) => {
  if (evt.worldPos.y > 230) {
    hero.graphics.flipHorizontal = evt.worldPos.x > hero.pos.x;
    hero.actions.clearActions();
    hero.actions.moveTo({ pos: evt.worldPos, duration: 700 });
  }
});

// HUD on every scene: progress, save status, and the two buttons that prove it works
class Hud extends ex.ScreenElement {
  private _label = new ex.Label({ pos: ex.vec(12, 10), font: new ex.Font(fontOptions) });
  private _state = new ex.Label({ pos: ex.vec(12, 32), font: new ex.Font({ ...fontOptions, color: ex.Color.fromHex('#9fd8f5') }) });

  constructor() {
    super({ name: 'hud', z: 100 });
    this.graphics.use(new ex.Rectangle({ width: 600, height: 56, color: ex.Color.fromRGB(0, 0, 0, 0.45) }));
    this.addChild(this._label);
    this.addChild(this._state);
    this.addChild(this._button('reload page', ex.vec(430, 24), () => location.reload()));
    this.addChild(
      this._button('wipe save', ex.vec(530, 24), () => {
        autoSave.wipe(); // also disables saving, so the pagehide save does not undo it
        localStorage.removeItem(HERO_KEY);
        location.reload();
      })
    );
  }

  private _button(text: string, pos: ex.Vector, onClick: () => void) {
    const button = new ex.Actor({ pos, width: 94, height: 28, color: ex.Color.fromHex('#3b6d3b') });
    button.addChild(new ex.Label({ text, font: new ex.Font({ ...fontOptions, size: 13, textAlign: ex.TextAlign.Center, baseAlign: ex.BaseAlign.Middle }) }));
    button.on('pointerdown', onClick);
    return button;
  }

  override onPostUpdate() {
    const progress = hero.get(ProgressComponent);
    const ago = autoSave.lastSavedAt ? `${((Date.now() - autoSave.lastSavedAt) / 1000).toFixed(0)}s ago` : 'not yet';
    this._label.text = `score ${progress.score}, ${progress.gems} gems, autosaved ${ago}`;
    this._state.text = status;
  }
}
for (const scene of Object.values(game.director.scenes)) {
  if (scene instanceof ex.Scene) {
    scene.add(new Hud());
  }
}

game.start(startScene, { loader: new ex.Loader([...Object.values(images), ...Object.values(sounds)]) });
