import * as ex from 'excalibur';

const game = new ex.Engine({
  width: 600,
  height: 360,
  backgroundColor: ex.Color.fromHex('#1e1e2e')
});

const baseColor = ex.Color.fromHex('#a6e3a1');
const activeColor = ex.Color.fromHex('#f9e2af');
const errorColor = ex.Color.fromHex('#f38ba8');

const actor = new ex.Actor({
  pos: ex.vec(300, 180),
  width: 80,
  height: 80,
  color: baseColor
});
game.add(actor);

const stateEl = document.getElementById('state')!;
let activeCo: ex.CoroutineInstance | undefined;
let lastNote = 'Idle';

const renderState = () => {
  stateEl.textContent = `${lastNote} | isRunning=${activeCo?.isRunning ?? false} | isComplete=${activeCo?.isComplete ?? false}`;
};

const runPulse = () => {
  activeCo?.cancel();
  lastNote = 'Running (autostart: false -> .start())';
  activeCo = ex.coroutine(
    actor,
    game,
    function* pulseAnimation() {
      this.color = activeColor;
      try {
        let angle = 0;
        let remaining = 4000;
        while (remaining > 0) {
          const elapsed = yield;
          remaining -= elapsed;
          angle += elapsed * 0.008;
          const s = 1 + 0.3 * Math.sin(angle);
          this.scale = ex.vec(s, s);
          this.rotation = angle * 0.5;
        }
        lastNote = 'Completed normally';
      } finally {
        // Runs both on normal completion AND on cancel()
        this.color = baseColor;
        this.scale = ex.vec(1, 1);
        this.rotation = 0;
      }
    },
    { autostart: false }
  );
  activeCo.start();
  activeCo.done.then(() => renderState());
  renderState();
};

document.getElementById('start')!.addEventListener('click', runPulse);

document.getElementById('cancel')!.addEventListener('click', () => {
  if (!activeCo) {
    return;
  }
  activeCo.cancel();
  lastNote = 'Cancelled immediately (finally restored actor)';
  renderState();
});

document.getElementById('promise-ok')!.addEventListener('click', () => {
  activeCo?.cancel();
  lastNote = 'Waiting on 800ms Promise...';
  activeCo = ex.coroutine(actor, game, function* () {
    this.color = ex.Color.fromHex('#89dceb');
    try {
      const elapsed = yield new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 800));
      lastNote = `Promise resolved! Resumed frame elapsed=${elapsed.toFixed(1)}ms`;
    } finally {
      this.color = baseColor;
    }
  });
  activeCo.done.then(() => renderState());
  renderState();
});

document.getElementById('promise-catch')!.addEventListener('click', () => {
  activeCo?.cancel();
  lastNote = 'Waiting on rejecting Promise (caught)...';
  activeCo = ex.coroutine(actor, game, function* () {
    this.color = activeColor;
    try {
      yield new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Simulated failure')), 500));
    } catch (e) {
      this.color = errorColor;
      lastNote = `Caught inside generator: ${(e as Error).message}`;
      yield 600;
    } finally {
      this.color = baseColor;
    }
  });
  activeCo.done.then(() => renderState());
  renderState();
});

document.getElementById('promise-uncaught')!.addEventListener('click', () => {
  activeCo?.cancel();
  lastNote = 'Waiting on rejecting Promise (uncaught)...';
  activeCo = ex.coroutine(actor, game, function* () {
    this.color = errorColor;
    try {
      yield new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Uncaught rejection')), 500));
    } finally {
      this.color = baseColor;
    }
  });
  activeCo.done.then(
    () => renderState(),
    (err) => {
      lastNote = `Coroutine rejected cleanly: ${(err as Error).message}`;
      renderState();
    }
  );
  renderState();
});

game.on('postframe', renderState);
game.start();
