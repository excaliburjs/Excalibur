import * as ex from 'excalibur';

const game = new ex.Engine({
  width: 600,
  height: 360,
  backgroundColor: ex.Color.fromHex('#1e1e2e')
});

const orderEl = document.getElementById('order')!;
const toggleBtn = document.getElementById('toggle-clock') as HTMLButtonElement;
const testClockBtn = document.getElementById('test-clock') as HTMLButtonElement;
const stepBtn = document.getElementById('step') as HTMLButtonElement;

const timings: ex.ScheduledCallbackTiming[] = ['preframe', 'preupdate', 'postupdate', 'predraw', 'postdraw', 'postframe'];
const frameOrder: string[] = [];

const spinner = new ex.Actor({
  pos: ex.vec(300, 180),
  width: 64,
  height: 64,
  color: ex.Color.fromHex('#cba6f7')
});
game.add(spinner);

let activeCoroutines: ex.CoroutineInstance[] = [];

const startTimingCoroutines = () => {
  for (const co of activeCoroutines) {
    co.cancel();
  }
  activeCoroutines = [];

  for (const timing of timings) {
    activeCoroutines.push(
      ex.coroutine(
        game,
        function* () {
          while (true) {
            const elapsed = yield;
            if (timing === 'preframe') {
              frameOrder.length = 0;
            }
            frameOrder.push(timing);
            if (timing === 'postframe') {
              orderEl.textContent = `Order: ${frameOrder.join(' -> ')} (elapsed=${elapsed.toFixed(1)}ms)`;
            }
          }
        },
        { timing }
      )
    );
  }

  activeCoroutines.push(
    ex.coroutine(spinner, game, function* () {
      while (true) {
        const elapsed = yield;
        this.rotation += elapsed * 0.003;
      }
    })
  );
};

toggleBtn.addEventListener('click', () => {
  if (game.clock.isRunning) {
    game.clock.stop();
    toggleBtn.textContent = 'Resume Clock';
  } else {
    game.clock.start();
    toggleBtn.textContent = 'Pause Clock';
  }
});

testClockBtn.addEventListener('click', () => {
  const testClock = game.clock.toTestClock();
  game.clock.stop();
  game.clock = testClock;
  testClock.start();
  // Re-start coroutines on the new TestClock (exercises cancelling schedules on the old StandardClock)
  startTimingCoroutines();
  stepBtn.disabled = false;
  testClockBtn.disabled = true;
  toggleBtn.disabled = true;
  orderEl.textContent = 'Switched to TestClock — click "Step +100ms"';
});

stepBtn.addEventListener('click', () => {
  if (game.clock instanceof ex.TestClock) {
    game.clock.step(100);
  }
});

game.start().then(() => {
  startTimingCoroutines();
});
