import { expect, test } from '@playwright/test';
import type { Frame, Page } from '@playwright/test';
import { SANDBOX_CASES } from './manifest';

// Installed via page.addInitScript in every frame (including same-origin child iframes used
// by the iframe/ tests), before any page script runs. It does two things to make these
// otherwise wall-clock/RNG-driven scenes reproducible:
//
// 1. Seeds Math.random with a fixed PRNG. Some scenes (particle emitters, camera shake -
//    see src/engine/math/util.ts and src/engine/camera.ts) fall back to raw Math.random()
//    for velocity/color/lifetime variance when no seeded ex.Random is passed in, which is
//    otherwise genuinely nondeterministic between runs.
// 2. Installs window.__exStep(steps), which freezes ex.Engine's real-time clock (every
//    engine registers itself as window.___EXCALIBUR_DEVTOOL - see src/engine/engine.ts) the
//    first time it's called and, from then on, advances it a fixed number of simulated
//    frames per call. Deliberately drives the *same* Clock instance (via its protected
//    update() - see src/engine/util/clock.ts) rather than swapping in a fresh TestClock:
//    swapping instances would silently drop anything already scheduled via
//    clock.schedule() on the original clock, e.g. the Loader's own 200ms "show play button"
//    delay (Loader.onUserAction) or a coroutine's next step, leaving those permanently
//    stuck. Steps are paced with a real rAF yield every few steps (see YIELD_EVERY below) so
//    GPU-heavy shader scenes get a chance to actually flush their draw calls instead of
//    backing up the command queue - only the simulated elapsed time handed to the engine is
//    deterministic, not the real-world pacing between steps.
const INSTALL_DETERMINISM_HOOKS = `
  (function () {
    let seed = 0x2f6e2b1;
    Math.random = function () {
      seed |= 0;
      seed = (seed + 0x9e3779b9) | 0;
      let t = Math.imul(seed ^ (seed >>> 16), 0x21f0aaad);
      t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
      return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
    };
  })();
  window.__exStep = async function (steps, stepMs) {
    const engine = window.___EXCALIBUR_DEVTOOL;
    if (!engine || !engine.clock) {
      return false;
    }
    if (!engine.clock.__isFrozen) {
      if (engine.clock.isRunning()) {
        engine.clock.stop();
      }
      engine.clock.__isFrozen = true;
      // Belt-and-suspenders: some engine paths (e.g. regaining window focus) call
      // clock.start() again, which would resume the real rAF loop and undo the freeze.
      engine.clock.start = function () {};
    }
    // Yielding to a real rAF after every single simulated step (rather than batching several
    // together) is what keeps GPU-heavy shader scenes (polychrome, tiling) from backing up
    // their WebGL command queue into an unresponsive tab - but it's real wall-clock cost paid
    // by every scene, most of which don't need it. Batch a few steps per yield as a
    // middle ground.
    var YIELD_EVERY = 3;
    for (let i = 0; i < steps; i++) {
      engine.clock.update(stepMs || 16.6);
      if ((i + 1) % YIELD_EVERY === 0 || i === steps - 1) {
        await new Promise(function (resolve) {
          requestAnimationFrame(resolve);
        });
      }
    }
    return true;
  };
`;

async function stepEngineClock(frame: Frame, steps: number) {
  // window.__exStep is installed by page.addInitScript(INSTALL_DETERMINISM_HOOKS) before any
  // page script runs, in every frame (including same-origin child iframes). Silently a no-op
  // if called before the engine has constructed itself.
  await frame.evaluate((steps) => (window as any).__exStep?.(steps), steps);
}

// A couple of tests (iframe/, input/iframe.html) embed their actual engine canvas inside a
// same-origin child <iframe> rather than the top-level page. Try the top-level frame first
// (the common case) and fall back to the first child frame otherwise.
async function findGameFrame(page: Page): Promise<Frame> {
  const mainFrame = page.mainFrame();
  try {
    await mainFrame.locator('canvas').first().waitFor({ state: 'visible', timeout: 5_000 });
    return mainFrame;
  } catch {
    const childFrame = page.frames().find((f) => f !== mainFrame);
    if (!childFrame) {
      throw new Error('No canvas found in the top-level page or any child iframe');
    }
    await childFrame.locator('canvas').first().waitFor({ state: 'visible', timeout: 10_000 });
    return childFrame;
  }
}

for (const sandboxCase of SANDBOX_CASES) {
  const file = sandboxCase.file ?? 'index.html';
  const name = sandboxCase.name ?? sandboxCase.dir;

  test(`${name} matches golden master`, async ({ page }) => {
    test.skip(!!sandboxCase.skip, sandboxCase.skip);

    await page.addInitScript(INSTALL_DETERMINISM_HOOKS);
    await page.goto(`/tests/${sandboxCase.dir}/${file}`);

    const frame = await findGameFrame(page);
    const canvas = frame.locator('canvas').first();

    // Freeze frame timing as early as possible - safe to do before the Loader's play button
    // ever appears since we drive the original clock instance in place (see comment above).
    await stepEngineClock(frame, 1);

    // Scenes booted with a Loader draw a loading bar directly onto the canvas and show a
    // real DOM "Play game" button (#excalibur-play-root) once ready, which must be clicked
    // before the game actually starts. The root element's aria-busy attribute reflects
    // readiness precisely (see src/engine/director/loader.ts): "true" while loading/waiting
    // out the aesthetic delay, "false" once it's safe to click, and the element doesn't
    // exist at all for scenes with no Loader - so one attribute check replaces guessing how
    // many simulated frames the delay needs.
    let playButtonReady = false;
    for (let i = 0; i < 30 && !playButtonReady; i++) {
      playButtonReady = (await frame.evaluate(() => document.getElementById('excalibur-play-root')?.getAttribute('aria-busy'))) === 'false';
      if (!playButtonReady) {
        await stepEngineClock(frame, 2);
      }
    }
    const playButton = frame.locator('#excalibur-play-root button');
    if (playButtonReady) {
      await playButton.click();
    }
    // We should never end up screenshotting the boot screen (Excalibur logo / loading bar /
    // play button) - fail loudly instead of silently capturing it. hidePlayButton() flips
    // aria-busy back to "true" synchronously on click, so this never needs its own step loop.
    await expect(playButton, 'loader play button should be dismissed before capturing').toBeHidden();

    if (sandboxCase.action) {
      await sandboxCase.action(page, canvas);
    }

    // Deterministically advance a handful more frames so the action's effects (and any
    // steady-state animation) are reflected in the render before capturing. Scenes with a
    // longer scripted delay before their documented visual state appears (e.g. an
    // actions.delay(...)) opt into more steps via manifest.ts rather than this default
    // growing for everyone.
    await stepEngineClock(frame, sandboxCase.settleSteps ?? 10);

    // A number of scenes animate continuously (particles, shaders, looping sprites) and
    // never produce two consecutive identical frames, which trips up toHaveScreenshot's
    // built-in "wait until stable" retry loop. Capture a single frame directly instead -
    // this is a boot-and-shoot golden master, not a wait-for-animation-to-settle one.
    // A single real frame can still elapse between page script execution and our clock
    // freeze (see stepEngineClock/__exStep above); for most scenes that's imperceptible, so
    // the default tolerance stays tight (comparable to the ~0.5% used by the Vitest visual
    // suite's toEqualImage). A few scenes where that residual drift compounds into a
    // materially different frame (chaotic multi-body physics, elapsed-time-driven shaders)
    // opt into a looser per-case tolerance via manifest.ts instead of loosening this for
    // everyone.
    const screenshot = await page.screenshot();
    expect(screenshot).toMatchSnapshot(`${name}.png`, { maxDiffPixelRatio: sandboxCase.tolerance ?? 0.01 });
  });
}
