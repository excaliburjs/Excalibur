import * as ex from 'excalibur';

const game = new ex.Engine({
  width: 600,
  height: 400,
  backgroundColor: ex.Color.fromHex('#1e1e2e')
});

const statusEl = document.getElementById('status')!;
const setStatus = (msg: string) => {
  statusEl.textContent = msg;
};

class PatternActor extends ex.Actor {
  constructor(x: number, y: number, color: ex.Color, name: string) {
    super({ pos: ex.vec(x, y), width: 48, height: 48, color, name });
  }

  // Class generator method typed with CoroutineIterator
  *patrol(this: PatternActor): ex.CoroutineIterator {
    const startX = this.pos.x;
    for (const dir of [1, -1]) {
      let remaining = 600;
      while (remaining > 0) {
        const elapsed = yield;
        remaining -= elapsed;
        this.pos.x += dir * 0.15 * elapsed;
      }
      // Nested engine-less coroutine across real RAF preframe ticks (relies on engine.scope)
      yield* ex.coroutine(function* () {
        const currentEngine = ex.Engine.useEngine();
        if (currentEngine !== game) {
          throw new Error('Engine.useEngine() did not match active engine!');
        }
        yield 250;
      });
    }
    this.pos.x = startX;
  }

  *dash(delta: ex.Vector, durationMs: number): ex.CoroutineIterator {
    const start = this.pos.clone();
    let elapsedTotal = 0;
    while (elapsedTotal < durationMs) {
      const elapsed = yield;
      elapsedTotal = Math.min(durationMs, elapsedTotal + elapsed);
      const t = elapsedTotal / durationMs;
      this.pos = start.add(delta.scale(t));
    }
  }

  *pulseScale(this: PatternActor, pulses: number): ex.CoroutineIterator {
    for (let i = 0; i < pulses; i++) {
      let t = 0;
      while (t < 300) {
        const elapsed = yield;
        t += elapsed;
        const s = 1 + 0.35 * Math.sin((t / 300) * Math.PI);
        this.scale = ex.vec(s, s);
      }
      this.scale = ex.vec(1, 1);
    }
  }

  override onInitialize() {
    // 1. Polymorphic `this` binding inside an Actor subclass
    ex.coroutine(this, function* () {
      while (true) {
        setStatus('1) Bound `this` + nested `yield*` patrol (engine.scope on preframe)');
        // Spawn a parallel coroutine from inside a coroutine via explicit `{ autostart: true }`
        ex.coroutine(this, this.pulseScale.bind(this, 3), { autostart: true });
        yield* ex.coroutine(this, this.patrol);

        setStatus('2) Arrow-function wrapper capturing lexical `this` + args');
        yield* ex.coroutine(() => this.dash(ex.vec(0, -100), 400));
        yield* ex.coroutine(() => this.dash(ex.vec(0, 100), 400));
        yield 300;
      }
    });
  }
}

const actor = new PatternActor(220, 220, ex.Color.fromHex('#89b4fa'), 'PatternActor');
game.add(actor);

game.start();
