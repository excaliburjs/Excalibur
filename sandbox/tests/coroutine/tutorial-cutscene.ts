import * as ex from 'excalibur';

const game = new ex.Engine({
  width: 640,
  height: 400,
  backgroundColor: ex.Color.fromHex('#181825'),
  pointerScope: ex.PointerScope.Canvas
});

const statusEl = document.getElementById('step-status')!;
const setStatus = (text: string) => {
  statusEl.textContent = text;
};

// Reusable coroutine helpers typed with ex.CoroutineIterator
function* moveTo(actor: ex.Actor, target: ex.Vector, durationMs: number): ex.CoroutineIterator {
  const start = actor.pos.clone();
  let elapsedTotal = 0;
  while (elapsedTotal < durationMs) {
    const elapsed = yield;
    elapsedTotal = Math.min(durationMs, elapsedTotal + elapsed);
    const t = ex.easeInOutCubic(elapsedTotal / durationMs);
    actor.pos = ex.vec(ex.lerp(start.x, target.x, t), ex.lerp(start.y, target.y, t));
  }
  actor.pos = target.clone();
}

function* pulseActor(this: ex.Actor, pulses: number, pulseMs = 350): ex.CoroutineIterator {
  try {
    for (let i = 0; i < pulses; i++) {
      let t = 0;
      while (t < pulseMs) {
        const elapsed = yield;
        t += elapsed;
        const scale = 1 + 0.3 * Math.sin((Math.min(t, pulseMs) / pulseMs) * Math.PI);
        this.scale = ex.vec(scale, scale);
      }
    }
  } finally {
    this.scale = ex.vec(1, 1);
  }
}

function onAdvance(engine: ex.Engine, cb: () => void): () => void {
  const keySub = engine.input.keyboard.on('press', (evt) => {
    if (evt.key === ex.Keys.Space || evt.key === ex.Keys.Enter) {
      cb();
    }
  });
  const ptrSub = engine.input.pointers.primary.on('down', cb);
  return () => {
    keySub.close();
    ptrSub.close();
  };
}

class DialogueBox extends ex.ScreenElement {
  private speakerText: ex.Text;
  private bodyText: ex.Text;
  private promptText: ex.Text;
  private promptActor: ex.ScreenElement;
  private panel: ex.Rectangle;

  constructor() {
    super({
      x: 20,
      y: 268,
      width: 600,
      height: 112,
      z: 100
    });

    this.panel = new ex.Rectangle({
      width: 600,
      height: 112,
      color: ex.Color.fromRGB(30, 30, 46, 0.94),
      strokeColor: ex.Color.fromHex('#89b4fa'),
      lineWidth: 2
    });
    this.graphics.use(this.panel);

    this.speakerText = new ex.Text({
      text: '',
      font: new ex.Font({
        family: 'sans-serif',
        size: 16,
        bold: true,
        unit: ex.FontUnit.Px,
        color: ex.Color.fromHex('#f9e2af')
      })
    });
    const speakerActor = new ex.ScreenElement({ x: 18, y: 12 });
    speakerActor.graphics.use(this.speakerText);
    this.addChild(speakerActor);

    this.bodyText = new ex.Text({
      text: '',
      maxWidth: 564,
      font: new ex.Font({
        family: 'monospace',
        size: 15,
        unit: ex.FontUnit.Px,
        color: ex.Color.fromHex('#cdd6f4')
      })
    });
    const bodyActor = new ex.ScreenElement({ x: 18, y: 38 });
    bodyActor.graphics.use(this.bodyText);
    this.addChild(bodyActor);

    this.promptText = new ex.Text({
      text: '[Space / Click to continue ▾]',
      font: new ex.Font({
        family: 'sans-serif',
        size: 12,
        unit: ex.FontUnit.Px,
        color: ex.Color.fromHex('#a6adc8')
      })
    });
    this.promptActor = new ex.ScreenElement({ x: 408, y: 88 });
    this.promptActor.graphics.use(this.promptText);
    this.addChild(this.promptActor);

    this.setVisible(false);
  }

  setVisible(visible: boolean) {
    this.graphics.isVisible = visible;
    for (const child of this.children) {
      if (child instanceof ex.Actor) {
        child.graphics.isVisible = visible;
      }
    }
  }

  /**
   * Typewrites a line of dialogue, allowing Space/Click to finish typing early,
   * then waits for Space/Click to advance to the next cutscene beat.
   */
  *say(this: DialogueBox, speaker: string, fullText: string, msPerChar = 28): ex.CoroutineIterator {
    const engine = ex.Engine.useEngine();
    this.setVisible(true);
    this.speakerText.text = speaker;
    this.bodyText.text = '';
    this.promptActor.graphics.isVisible = false;

    // Allow skipping the typewriter animation on Space/Enter/Click
    let finishEarly = false;
    const stopSkip = onAdvance(engine, () => {
      finishEarly = true;
    });

    try {
      let charCount = 0;
      let accumulator = 0;
      while (charCount < fullText.length) {
        const elapsed = yield;
        if (finishEarly) {
          this.bodyText.text = fullText;
          break;
        }
        accumulator += elapsed;
        while (accumulator >= msPerChar && charCount < fullText.length) {
          accumulator -= msPerChar;
          charCount++;
        }
        this.bodyText.text = fullText.slice(0, charCount);
      }
    } finally {
      stopSkip();
    }

    // Show blinking continue prompt and yield a Promise waiting for user input
    this.promptActor.graphics.isVisible = true;
    const blinkCo = ex.coroutine(
      this.promptActor,
      function* () {
        let t = 0;
        try {
          while (true) {
            const elapsed = yield;
            t += elapsed;
            this.graphics.opacity = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.004));
          }
        } finally {
          this.graphics.opacity = 1;
        }
      },
      { autostart: true }
    );

    let stopAdvance: (() => void) | undefined;
    try {
      yield new Promise<void>((resolve) => {
        stopAdvance = onAdvance(engine, () => {
          stopAdvance?.();
          resolve();
        });
      });
    } finally {
      stopAdvance?.();
      blinkCo.cancel();
      this.promptActor.graphics.isVisible = false;
    }
  }
}

class TutorialScene extends ex.Scene {
  hero!: ex.Actor;
  guide!: ex.Actor;
  gem!: ex.Actor;
  dialogue!: DialogueBox;
  activeCutscene?: ex.CoroutineInstance;

  override onInitialize() {
    // Subtle arena floor markers
    for (let x = 80; x <= 560; x += 80) {
      const tile = new ex.Actor({
        pos: ex.vec(x, 180),
        width: 60,
        height: 60,
        color: ex.Color.fromHex('#24273a'),
        z: -1
      });
      this.add(tile);
    }

    this.guide = new ex.Actor({
      pos: ex.vec(140, 170),
      width: 44,
      height: 44,
      color: ex.Color.fromHex('#f9e2af')
    });
    this.guide.rotation = Math.PI / 4;
    this.add(this.guide);

    this.hero = new ex.Actor({
      pos: ex.vec(280, 170),
      width: 44,
      height: 44,
      color: ex.Color.fromHex('#89b4fa')
    });
    this.add(this.hero);

    this.gem = new ex.Actor({
      pos: ex.vec(500, 170),
      width: 34,
      height: 34,
      color: ex.Color.fromHex('#a6e3a1')
    });
    this.gem.rotation = Math.PI / 4;
    this.add(this.gem);

    this.dialogue = new DialogueBox();
    this.add(this.dialogue);

    this.startCutscene();
  }

  startCutscene() {
    this.activeCutscene?.cancel();
    // Stop any camera zoom/move tween started by the previous cutscene's finally block
    void this.camera.zoomOverTime(1, 0);
    this.camera.pos = ex.vec(320, 200);

    // Reset actors for clean replay
    this.hero.pos = ex.vec(280, 170);
    this.hero.scale = ex.vec(1, 1);
    this.guide.scale = ex.vec(1, 1);
    this.gem.graphics.opacity = 1;
    this.gem.scale = ex.vec(1, 1);

    this.activeCutscene = ex.coroutine(this, this.engine, this.playCutscene);
  }

  skipCutscene() {
    if (this.activeCutscene && this.activeCutscene.isRunning) {
      this.activeCutscene.cancel();
      setStatus('Cutscene skipped (finally cleaned up camera & dialogue)');
    }
  }

  *playCutscene(this: TutorialScene): ex.CoroutineIterator {
    const parallelEffects: ex.CoroutineInstance[] = [];
    try {
      // --- STEP 1: Focus on the Guide ---
      setStatus('Step 1 / 3 — Meet the Guide');
      yield this.camera.move(ex.vec(180, 190), 500, ex.easeInOutCubic);
      yield this.camera.zoomOverTime(1.25, 350);
      parallelEffects.push(ex.coroutine(this.guide, pulseActor.bind(this.guide, 2), { autostart: true }));
      yield* this.dialogue.say(
        'Guide (Step 1/3)',
        'Welcome, adventurer! This tutorial cutscene is orchestrated with Excalibur coroutines. Click or press Space to continue.'
      );

      // --- STEP 2: Demonstrate Hero movement ---
      setStatus('Step 2 / 3 — Hero Movement');
      yield this.camera.move(ex.vec(320, 190), 500, ex.easeInOutCubic);
      yield* moveTo(this.hero, ex.vec(380, 130), 450);
      yield* moveTo(this.hero, ex.vec(360, 170), 400);
      parallelEffects.push(ex.coroutine(this.hero, pulseActor.bind(this.hero, 2), { autostart: true }));
      yield* this.dialogue.say(
        'Guide (Step 2/3)',
        'Each beat uses yield* to compose camera pans, actor movement, and typewriter dialogue cleanly in straight-line code.'
      );

      // --- STEP 3: Highlight & collect the Gem ---
      setStatus('Step 3 / 3 — Collect the Emerald Gem');
      yield this.camera.move(ex.vec(460, 190), 500, ex.easeInOutCubic);
      yield* pulseActor.call(this.gem, 3, 280);
      yield* this.dialogue.say('Guide (Step 3/3)', 'Grab the emerald gem ahead to finish the tutorial! Watch the hero dash over now.');

      yield* moveTo(this.hero, this.gem.pos, 500);
      this.gem.graphics.opacity = 0.2;
      yield* pulseActor.call(this.hero, 2, 250);
      yield 200;

      setStatus('Tutorial complete! Click Replay to watch again.');
    } finally {
      // Runs on normal completion AND immediately when Skip calls cancel()
      for (const fx of parallelEffects) {
        fx.cancel();
      }
      this.dialogue.setVisible(false);
      void this.camera.move(ex.vec(320, 200), 350, ex.easeInOutCubic);
      void this.camera.zoomOverTime(1, 350);
    }
  }
}

const scene = new TutorialScene();
game.addScene('tutorial', scene);

document.getElementById('replay')!.addEventListener('click', () => {
  scene.startCutscene();
});

document.getElementById('skip')!.addEventListener('click', () => {
  scene.skipCutscene();
});

game.start().then(() => {
  game.goToScene('tutorial');
});
