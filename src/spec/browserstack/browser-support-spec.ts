/**
 * Browser-support smoke tests, run on real browsers via BrowserStack (see vitest.config.browserstack.ts).
 *
 * These deliberately exercise the built bundle through the `ex` global — exactly what a
 * script-tag consumer gets — instead of importing the vite-transformed source.
 */

// type-only import: erased at runtime, the tests use the bundle's `ex` global exclusively
import type * as excalibur from '../../engine';

declare global {
  interface Window {
    ex: typeof excalibur;
  }
}

describe('Browser integration test', () => {
  const engines: excalibur.Engine[] = [];

  beforeAll(async () => {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/build/dist/excalibur.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load /build/dist/excalibur.js — run "npm run build" first'));
      document.head.appendChild(script);
    });
  });

  afterEach(() => {
    for (const engine of engines.splice(0)) {
      engine.dispose();
    }
  });

  it('should boot on browser', async () => {
    const ex = window.ex;
    const game = new ex.Engine({
      width: 800,
      height: 800
    });
    engines.push(game);

    // a constructor throw or start() rejection fails the test
    await game.start();

    expect(game.ready).toBe(true);
  });

  it('should allow pointers', async () => {
    const ex = window.ex;
    const downSpy = vi.fn();

    const game = new ex.Engine({ width: 600, height: 400 });
    engines.push(game);

    const player = new ex.Actor({ x: 0, y: 0, width: 100, height: 100, color: ex.Color.Red });
    player.z = 10;
    player.on('pointerdown', downSpy);
    game.add(player);

    await game.start();
    game.input.pointers.triggerEvent('down', ex.vec(0, 0));

    expect(downSpy).toHaveBeenCalledTimes(1);
  });
});
