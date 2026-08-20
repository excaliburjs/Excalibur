import type { Locator, Page } from '@playwright/test';

export interface SandboxCase {
  /** Directory under sandbox/tests/ */
  dir: string;
  /** HTML file within the directory, defaults to 'index.html' */
  file?: string;
  /** Snapshot name, defaults to `dir` (set explicitly for directories with multiple pages) */
  name?: string;
  /** Optional interaction to run (scripted from the page's own on-page directions) before the screenshot */
  action?: (page: Page, canvas: Locator) => Promise<void>;
  /** If set, the case is skipped with this reason instead of run */
  skip?: string;
  /**
   * Overrides the default maxDiffPixelRatio (see sandbox.spec.ts). Use sparingly - only for
   * scenes where even the small residual drift from stepEngineClock's one-real-frame boot
   * window compounds into a materially different frame (many chaotically-interacting bodies,
   * or a shader driven by elapsed time), not as a general flakiness workaround.
   */
  tolerance?: number;
}

async function clickCanvasCenter(page: Page, canvas: Locator) {
  const box = await canvas.boundingBox();
  if (box) {
    await canvas.click({ position: { x: box.width / 2, y: box.height / 2 } });
  }
}

export const SANDBOX_CASES: SandboxCase[] = [
  { dir: '9-slice' },
  { dir: 'action-flash' },
  { dir: 'animation-events' },
  { dir: 'arcadecollider' },
  { dir: 'arcadeseam' },
  { dir: 'bezier' },
  {
    dir: 'boundingbox',
    file: 'bbtester.html',
    action: async (page, canvas) => {
      // "Click to drag the red square" - block2 renders centered on the canvas
      const box = await canvas.boundingBox();
      if (!box) return;
      const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const end = { x: start.x + 60, y: start.y + 40 };
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(end.x, end.y, { steps: 5 });
      await page.mouse.up();
    }
  },
  { dir: 'camera', file: 'lerp.html', name: 'camera-lerp', action: (page) => page.click('#move-xy') },
  { dir: 'camera', file: 'strategy.html', name: 'camera-strategy', action: (page) => page.click('#lockToActor') },
  { dir: 'camera', file: 'zoom.html', name: 'camera-zoom' },
  { dir: 'camera-animation', skip: 'index.html has an empty body with no script tag - nothing renders' },
  { dir: 'clip-canvas' },
  { dir: 'clonebehavior' },
  { dir: 'collision', file: 'index.html', name: 'collision' },
  { dir: 'collision', file: 'passive.html', name: 'collision-passive' },
  { dir: 'collision', file: 'touching.html', name: 'collision-touching' },
  { dir: 'collisionvelocity', file: 'vel.html' },
  { dir: 'composite-collider' },
  { dir: 'contentarea' },
  { dir: 'coordinates' },
  { dir: 'coroutine' },
  { dir: 'culling', file: 'culling.html', name: 'culling', action: (page) => page.keyboard.press('d') },
  { dir: 'culling', file: 'culling2.html', name: 'culling-zoom' },
  { dir: 'debug', file: 'boundingbox.html', name: 'debug-boundingbox', action: (page) => page.keyboard.press('d') },
  { dir: 'debug', file: 'stats.html', name: 'debug-stats' },
  { dir: 'decode-many' },
  { dir: 'drawcalls', action: (page) => page.click('#add') },
  { dir: 'ecs' },
  { dir: 'emitter' },
  { dir: 'engine', file: 'timescale.html', action: (page) => page.keyboard.press('w') },
  { dir: 'fitscreen' },
  { dir: 'flash-shader' },
  { dir: 'gif', file: 'animatedGif.html' },
  { dir: 'gotoscene' },
  { dir: 'gpu-particles' },
  { dir: 'graphics' },
  { dir: 'graphicscontext' },
  { dir: 'graphics-group' },
  // Many chaotically-colliding bodies: tiny residual drift from the boot-time real frame
  // (see stepEngineClock in sandbox.spec.ts) compounds into materially different layouts.
  { dir: 'group', tolerance: 0.2 },
  // Many chaotically-interacting bodies under high gravity - see 'group' above.
  { dir: 'high-gravity-arcade', tolerance: 0.2 },
  { dir: 'iframe', file: 'index.html', name: 'iframe' },
  {
    dir: 'iframe',
    file: 'xorigin.html',
    name: 'iframe-xorigin',
    skip: 'requires a second manually-started server on port 1234 (see on-page instructions)'
  },
  { dir: 'imageloading' },
  // Custom fire shader driven by elapsed time - a fraction of a frame's drift at boot
  // shifts the whole pattern.
  { dir: 'imagewrapping', tolerance: 0.2 },
  { dir: 'incorrectside' },
  { dir: 'input', file: 'index.html', name: 'input' },
  { dir: 'input', file: 'keyboard.html', name: 'input-keyboard' },
  { dir: 'input', file: 'iframe.html', name: 'input-iframe' },
  {
    dir: 'input',
    file: 'gamepad.html',
    name: 'input-gamepad',
    skip: 'requires real gamepad hardware, not available under Playwright'
  },
  {
    dir: 'input',
    file: 'pointer.html',
    name: 'input-pointer',
    action: async (page, canvas) => {
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.6);
      }
    }
  },
  { dir: 'input-mapper' },
  { dir: 'isometric' },
  { dir: 'kill', file: 'kill.html' },
  { dir: 'label', file: 'label.html', name: 'label' },
  { dir: 'label', file: 'fonts.html', name: 'label-fonts' },
  {
    dir: 'lighting',
    action: async (page, canvas) => {
      // "move mouse to aim the cone light"
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.75);
      }
    }
  },
  { dir: 'linebounds' },
  { dir: 'loader-lockup' },
  { dir: 'loader-scene' },
  // Performance-stress test with many chaotically-interacting bodies - see 'group' above.
  { dir: 'many-colliders', tolerance: 0.15 },
  { dir: 'material' },
  { dir: 'material-override-bug' },
  {
    dir: 'memory-leaker',
    skip: 'exercises a 60s texture-cleanup interval - too slow for a golden-master boot screenshot'
  },
  { dir: 'multi-engine' },
  { dir: 'occluder' },
  { dir: 'onpreload' },
  { dir: 'opacity' },
  { dir: 'parallax' },
  { dir: 'parallel' },
  { dir: 'physics', file: 'index.html', name: 'physics' },
  { dir: 'physics', file: 'fastphysics.html', name: 'physics-fast' },
  { dir: 'physics', file: 'physics2.html', name: 'physics2' },
  { dir: 'pointer' },
  // Custom card shader with per-pixel color cycling driven by elapsed time - see 'imagewrapping' above.
  { dir: 'polychrome', tolerance: 0.2 },
  { dir: 'polygon' },
  { dir: 'polygon-rendering' },
  // CRT post-process shader driven by elapsed time - see 'imagewrapping' above.
  { dir: 'postprocessor', tolerance: 0.1 },
  { dir: 'raycast' },
  { dir: 'rotation', file: 'rotation.html' },
  { dir: 'router' },
  { dir: 'scale', file: 'scale.html' },
  { dir: 'scene', file: 'lifecycle.html', name: 'scene-lifecycle' },
  { dir: 'scene-input' },
  { dir: 'scene-keyboard' },
  { dir: 'scenepredraw' },
  { dir: 'screen' },
  { dir: 'screenelement' },
  {
    dir: 'screenelementpointer',
    action: async (page, canvas) => {
      // "Click the ScreenElement an alert should fire" - dismiss the native alert() so the test doesn't hang
      page.once('dialog', (dialog) => dialog.dismiss());
      await clickCanvasCenter(page, canvas);
    }
  },
  { dir: 'side-collision' },
  { dir: 'side-collision2' },
  { dir: 'sleep' },
  { dir: 'sound' },
  { dir: 'sound-loop' },
  {
    dir: 'sound-manager',
    action: async (page, canvas) => {
      // "Toggle Music" label rendered near world (100, 100) on a 300x300 canvas
      await canvas.click({ position: { x: 130, y: 105 } });
    }
  },
  { dir: 'sound-sync' },
  { dir: 'sprite', file: 'sprite.html' },
  { dir: 'spritefont', file: 'spritefont.html' },
  { dir: 'spritefontalign' },
  { dir: 'spritefont-measuring' },
  { dir: 'spritefont-rendering' },
  { dir: 'spritesampling' },
  { dir: 'sprite-tint' },
  { dir: 'text-bounds', skip: 'no HTML entry point exists under sandbox/tests/text-bounds (index.ts only)' },
  { dir: 'text-centering' },
  { dir: 'textcrash' },
  { dir: 'text-wrapping' },
  { dir: 'tilemap', file: 'tilemap.html' },
  { dir: 'tilemap-custom-edge-collider' },
  { dir: 'tilemap-pack' },
  { dir: 'tiling' },
  { dir: 'transition' },
  { dir: 'triangulation' },
  { dir: 'trigger', file: 'trigger.html' },
  { dir: 'ui' },
  { dir: 'uniform-buffer' },
  { dir: 'updating-text' },
  { dir: 'within', file: 'within.html' },
  {
    dir: 'zoom',
    file: 'zoom.html',
    action: async (page, canvas) => {
      // "Use +/- keys to zoom in/out" and "Click on the box to make it green"
      await clickCanvasCenter(page, canvas);
      await page.keyboard.press('NumpadAdd');
      await page.keyboard.press('NumpadAdd');
    }
  }
];
