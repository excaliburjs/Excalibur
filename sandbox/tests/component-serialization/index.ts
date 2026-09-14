// Demonstrates ex.Serializer round-tripping an Actor + its components (Transform, a custom
// TextInputComponent) through localStorage, rehydrating on scene init instead of always
// building a fresh default actor.

/**
 * Accumulates typed characters into `text` while `focused` is true.
 *
 * This component does not listen to keyboard events itself. Feed it events from
 * `engine.input.keyboard.on('press', evt => component.handleKeyEvent(evt))` - callers decide
 * when an entity should be focused (e.g. clicking it), keeping this component Engine-independent
 * and safe to construct/serialize before it has an owner in a scene.
 */
class TextInputComponent extends ex.Component {
  public text: string;
  public focused: boolean;
  public maxLength: number;

  constructor(options?: { text?: string; focused?: boolean; maxLength?: number }) {
    super();
    this.text = options?.text ?? '';
    this.focused = options?.focused ?? false;
    this.maxLength = options?.maxLength ?? Infinity;
  }

  /**
   * Feed a keyboard press event to this input, appending/removing characters. No-ops unless `focused`.
   *
   * `Enter` unfocuses (submits), `Backspace` removes the last character, any other single
   * printable character is appended up to `maxLength`.
   */
  handleKeyEvent(evt: ex.KeyEvent): void {
    if (!this.focused) {
      return;
    }

    if (evt.key === ex.Keys.Enter) {
      this.focused = false;
      return;
    }

    if (evt.key === ex.Keys.Backspace) {
      this.text = this.text.slice(0, -1);
      return;
    }

    const value = evt.value;
    if (value && value.length === 1 && this.text.length < this.maxLength) {
      this.text += value;
    }
  }
}

const STORAGE_KEY = 'component-serialization-demo';

ex.Serializer.init();
ex.Serializer.registerComponent(TextInputComponent);
// GraphicsComponent's serialize/deserialize only stores a `current` graphic key and looks it up
// in the registry on deserialize - register a throwaway placeholder so that lookup never throws.
// The actual visual is always rebuilt from TextInputComponent.text below, so its content is unused.
ex.Serializer.registerGraphic('default', new ex.Rectangle({ width: 1, height: 1 }));

const game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});

function buildVisual(graphics: ex.GraphicsComponent, textInput: TextInputComponent) {
  const box = new ex.Rectangle({
    width: 240,
    height: 60,
    color: textInput.focused ? ex.Color.fromHex('#fff59d') : ex.Color.White,
    strokeColor: ex.Color.Black,
    lineWidth: 2
  });
  const label = new ex.Text({
    text: textInput.text || '(click and type)',
    color: textInput.text ? ex.Color.Black : ex.Color.Gray,
    font: new ex.Font({ size: 16, family: 'sans-serif' })
  });
  graphics.use(
    new ex.GraphicsGroup({
      useAnchor: false,
      members: [
        { graphic: box, offset: ex.vec(-120, -30) },
        { graphic: label, offset: ex.vec(-110, -8) }
      ]
    })
  );
}

function createDefaultActor(): ex.Actor {
  const actor = new ex.Actor({ pos: ex.vec(300, 200) });
  actor.addComponent(new TextInputComponent());
  return actor;
}

let actor: ex.Actor;
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  actor = ex.Serializer.deserializeActor(JSON.parse(saved)) ?? createDefaultActor();
} else {
  actor = createDefaultActor();
}

const textInput = actor.get(TextInputComponent)!;
// GraphicsComponent may not have survived deserialization (see registerGraphic comment above) -
// ensure one is attached rather than trusting actor.graphics, which can be stale in that case.
let graphics = actor.get(ex.GraphicsComponent);
if (!graphics) {
  graphics = new ex.GraphicsComponent();
  actor.addComponent(graphics);
}
actor.graphics = graphics;
buildVisual(graphics, textInput);

game.add(actor);

actor.on('pointerdown', () => {
  textInput.focused = true;
  buildVisual(graphics!, textInput);
});

game.input.keyboard.on('press', (evt) => {
  textInput.handleKeyEvent(evt);
  buildVisual(graphics!, textInput);
});

document.getElementById('save')!.addEventListener('click', () => {
  const data = ex.Serializer.serializeActor(actor);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
});

document.getElementById('clear')!.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
});

game.start();
