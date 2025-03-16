import * as ex from '@excalibur';

export namespace TestUtils {
  /**
   * Builds an engine with testing switches on
   * @param options
   */
  export function engine(options: ex.EngineOptions = {}, flags: string[] = ['suppress-obsolete-message']): ex.Engine {
    options = {
      width: 500,
      height: 500,
      suppressConsoleBootMessage: true,
      enableCanvasTransparency: true,
      suppressMinimumBrowserFeatureDetection: true,
      suppressHiDPIScaling: true,
      suppressPlayButton: true,
      snapToPixel: false,
      antialiasing: false,
      displayMode: ex.DisplayMode.Fixed,
      ...options
    };
    ex.Debug.clear();
    ex.Flags._reset();
    ex.Flags.enable('suppress-obsolete-message');
    flags.forEach((f) => ex.Flags.enable(f));
    const game = new ex.Engine(options);

    // keeps the pointer based tests consistent
    game.canvas.style.display = 'block';
    game.canvas.style.position = 'absolute';
    game.canvas.style.top = '0px';

    // Make all the clocks test clocks in the test utils
    game.clock.stop();
    game.clock = game.clock.toTestClock();

    (ex.WebAudio as any)._UNLOCKED = true;

    return game;
  }

  /**
   * Waits for the internal loader state to be ready by ticking the test clock
   */
  export async function runToReady(engine: ex.Engine, loader?: ex.DefaultLoader) {
    if (!(engine.clock instanceof ex.TestClock)) {
      throw Error('Engine does not have TestClock enabled');
    }
    const clock = engine.clock as ex.TestClock;
    const start = engine.start(loader);
    if (loader) {
      await loader.areResourcesLoaded();
      clock.step(200);
      queueMicrotask(() => {
        clock.step(500);
      });
      await engine.isReady();
    }
    await start;
  }

  /**
   *
   */
  export async function flushMicrotasks(clock: ex.TestClock, times: number) {
    for (let i = 0; i < times; i++) {
      clock.step(0);
      await Promise.resolve();
    }
  }

  /**
   *
   */
  export async function nextMacrotask() {
    const future = new ex.Future<void>();
    setTimeout(() => future.resolve());
    await future.promise;
  }

  /**
   *
   */
  export async function untilMacrotask(filter: () => boolean, max = 20) {
    while (max > 0 && !filter()) {
      max--;
      await nextMacrotask();
      await Promise.resolve();
    }
    if (max <= 0) {
      throw new Error('Failed to wait for macrotask');
    }
  }

  /**
   *
   */
  export function flushWebGLCanvasTo2D(source: HTMLCanvasElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);
    return canvas;
  }

  /**
   *
   */
  export async function runOnWindows(ctx: () => Promise<any>): Promise<boolean> {
    if (navigator.platform === 'Win32' || navigator.platform === 'Win64') {
      await ctx();
      return true;
    }
    return false;
  }

  /**
   *
   */
  export async function runOnLinux(ctx: () => Promise<any>): Promise<boolean> {
    if (navigator.platform.includes('Linux')) {
      await ctx();
      return true;
    }
    return false;
  }
}
