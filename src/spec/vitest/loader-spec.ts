import * as ex from '@excalibur';

import { TestUtils } from '../__util__/test-utils';

describe('A loader', () => {
  let engine: ex.Engine;

  const reset = () => {
    engine.stop();
    engine.dispose();
    engine = null;
    (<any>window).devicePixelRatio = 1;
    const playButton = document.getElementById('excalibur-play');
    if (playButton) {
      const body = playButton.parentNode.parentNode;
      body.removeChild(playButton.parentNode);
    }
  };
  beforeEach(() => {
    engine = TestUtils.engine();
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('exists', () => {
    expect(ex.Loader).toBeDefined();
  });

  it('can be constructed', () => {
    const loader = new ex.Loader();
    expect(loader).toBeTruthy();
  });

  it('can report progress, empty loaders are done', () => {
    const loader = new ex.Loader();
    expect(loader.progress).toBe(1);
  });

  it('can report progress, loader start at 0', () => {
    const loader = new ex.Loader([, , ,]);
    expect(loader.progress).toBe(0);
  });

  it('can report progress', () => {
    const loader = new ex.Loader([, , , ,]);
    expect(loader.progress).toBe(0);
    loader.markResourceComplete();
    expect(loader.progress).toBe(0.25);
    loader.markResourceComplete();
    expect(loader.progress).toBe(0.5);
    loader.markResourceComplete();
    expect(loader.progress).toBe(0.75);
    loader.markResourceComplete();
    expect(loader.progress).toBe(1);
  });

  it('can be drawn at 0', () =>
    new Promise<void>((done) => {
      const loader = new ex.Loader([, , , ,]);
      (loader as any)._image.onload = () => {
        loader.onInitialize(engine);
        loader.onDraw(loader.canvas.ctx);
        expect(loader.canvas.ctx.canvas)
          .toHaveLoadedImages(['/src/spec/assets/images/loader-spec/zero.png'])
          .then(() => {
            done();
          });
      };
    }));

  it('can be drawn at 50', () =>
    new Promise<void>((done) => {
      const loader = new ex.Loader([, , , ,]);
      (loader as any)._image.onload = () => {
        loader.markResourceComplete();
        loader.markResourceComplete();

        loader.onInitialize(engine);
        loader.onDraw(loader.canvas.ctx);
        expect(loader.canvas.ctx.canvas)
          .toHaveLoadedImages(['/src/spec/assets/images/loader-spec/fifty.png'])
          .then(() => {
            done();
          });
      };
    }));

  it('can be drawn at 100', () =>
    new Promise<void>((done) => {
      const loader = new ex.Loader([, , , ,]);
      (loader as any)._image.onload = () => {
        loader.markResourceComplete();
        loader.markResourceComplete();
        loader.markResourceComplete();
        loader.markResourceComplete();

        loader.onInitialize(engine);
        loader.onDraw(loader.canvas.ctx);
        expect(loader.canvas.ctx.canvas)
          .toHaveLoadedImages(['/src/spec/assets/images/loader-spec/100.png'])
          .then(() => {
            done();
          });
      };
    }));

  it('does not show progress when the play button is shown', () =>
    new Promise<void>((done) => {
      const loader = new ex.Loader([, , , ,]);
      (loader as any)._image.onload = () => {
        loader.markResourceComplete();
        loader.markResourceComplete();
        loader.markResourceComplete();
        loader.markResourceComplete();
        loader.onInitialize(engine);
        loader.showPlayButton();

        loader.onDraw(loader.canvas.ctx);
        expect(loader.canvas.ctx.canvas)
          .toHaveLoadedImages(['/src/spec/assets/images/loader-spec/playbuttonshown-noprogressbar.png'])
          .then(() => {
            done();
          });
      };
    }));

  it('can have the play button position customized', () => {
    const loader = new ex.Loader([, , , ,]);
    loader.onInitialize(engine);
    loader.playButtonPosition = ex.vec(42, 77);
    loader.showPlayButton();
    loader.onDraw(loader.canvas.ctx);
    // there is some dom pollution want to be sure we get the RIGHT root element
    const playbutton = (loader as any)._playButtonRootElement as HTMLDivElement;
    expect(playbutton.style.left).toBe('42px');
    expect(playbutton.style.top).toBe('77px');
  });

  it('can have the logo position customized', () =>
    new Promise<void>((done) => {
      const loader = new ex.Loader([, , , ,]);
      (loader as any)._image.onload = () => {
        loader.onInitialize(engine);
        loader.logoPosition = ex.vec(0, 0);
        loader.showPlayButton();
        loader.onDraw(loader.canvas.ctx);
        expect(loader.canvas.ctx.canvas)
          .toHaveLoadedImages(['/src/spec/assets/images/loader-spec/logo-position.png'])
          .then(() => {
            done();
          });
      };
    }));

  it('can have the loader customized', () =>
    new Promise<void>((done) => {
      const loader = new ex.Loader([, , , ,]);
      loader.loadingBarPosition = ex.vec(0, 0);
      loader.loadingBarColor = ex.Color.Red;
      (loader as any)._image.onload = () => {
        loader.markResourceComplete();
        loader.markResourceComplete();
        loader.markResourceComplete();
        loader.markResourceComplete();
        loader.onInitialize(engine);
        loader.onDraw(loader.canvas.ctx);
        expect(loader.canvas.ctx.canvas)
          .toHaveLoadedImages(['/src/spec/assets/images/loader-spec/loader-position-color.png'])
          .then(() => {
            done();
          });
      };
    }));

  it('play button shows up after done loading', () => {
    const loader = new ex.Loader([, , , ,]);
    loader.loadingBarPosition = ex.vec(0, 0);
    loader.loadingBarColor = ex.Color.Red;
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.showPlayButton();

    expect(loader.playButtonRootElement).toBeTruthy();
  });

  it('play button is cleaned up on dispose', () => {
    const loader = new ex.Loader([, , , ,]);
    loader.loadingBarPosition = ex.vec(0, 0);
    loader.loadingBarColor = ex.Color.Red;
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.showPlayButton();
    loader.dispose();
    expect(loader.playButtonRootElement).toBeFalsy();
  });

  it('can have the enter key pressed to start', () =>
    new Promise<void>((done) => {
      const loader = new ex.Loader([, , , ,]);
      loader.onInitialize(engine);
      loader.loadingBarPosition = ex.vec(0, 0);
      loader.loadingBarColor = ex.Color.Red;
      loader.markResourceComplete();
      loader.markResourceComplete();
      loader.markResourceComplete();
      loader.markResourceComplete();
      loader.showPlayButton().then(() => {
        done();
        loader.dispose();
      });
      document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
    }));

  it('can reload without building root elements', () => {
    const loader = new ex.Loader([, , ,]);
    loader.showPlayButton();
    loader.showPlayButton();
    loader.showPlayButton();
    const roots = document.querySelectorAll('#excalibur-play-root');
    const buttons = document.querySelectorAll('#excalibur-play');
    expect(roots.length).toBe(1);
    expect(buttons.length).toBe(1);
  });

  /**
   *
   */
  function executeMouseEvent(type: string, target: HTMLElement, button: ex.NativePointerButton = null, x: number = 0, y: number = 0) {
    const evt = new PointerEvent(type, {
      clientX: x,
      clientY: y,
      button: button,
      bubbles: true
    });

    target.dispatchEvent(evt);
  }

  it('does not propagate the start button click to pointers', async () => {
    engine.dispose();
    engine = null;
    engine = new ex.Engine({ width: 1000, height: 1000 });
    (ex.WebAudio as any)._UNLOCKED = true;
    const clock = (engine.clock = engine.clock.toTestClock());
    const pointerHandler = vi.fn();
    engine.input.pointers.primary.on('up', pointerHandler);
    const loader = new ex.Loader([new ex.ImageSource('/src/spec/assets/images/graphics-text-spec/spritefont.png')]);
    const start = engine.start(loader);

    await loader.areResourcesLoaded();
    clock.step(200);

    const btn = (loader as any)._playButton;
    const btnClickHandler = vi.fn();
    btn.addEventListener('pointerup', btnClickHandler);
    const rect = btn.getBoundingClientRect();
    executeMouseEvent('pointerup', btn as any, ex.NativePointerButton.Left, rect.x + rect.width / 2, rect.y + rect.height / 2);

    expect(pointerHandler).not.toHaveBeenCalled();
    expect(btnClickHandler).toHaveBeenCalled();
  });

  it('updates the play button position on resize', () => {
    engine.dispose();
    engine = null;
    engine = new ex.Engine({ width: 1000, height: 1000 });
    const loader = new ex.Loader([, , , ,]);
    loader.onInitialize(engine);
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.showPlayButton();

    expect(loader.playButtonRootElement).toBeTruthy();

    engine.browser.window.nativeComponent.dispatchEvent(new Event('resize'));

    const oldPos = [loader.playButtonRootElement.style.left, loader.playButtonRootElement.style.top];

    engine.screen.viewport = { width: 100, height: 100 };

    engine.browser.window.nativeComponent.dispatchEvent(new Event('resize'));

    const newPos = [loader.playButtonRootElement.style.left, loader.playButtonRootElement.style.top];

    expect(oldPos).not.toEqual(newPos);
  });

  it('should not load more than once when added to the engine and scene', async () => {
    const img = new ex.ImageSource(
      'data:image/png;base64,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'
    );

    const loader = new ex.DefaultLoader();

    const onBeforeLoad = vi.spyOn(loader, 'onBeforeLoad').mockImplementation(async () => await Promise.resolve());
    const onAfterLoad = vi.spyOn(loader, 'onAfterLoad').mockImplementation(async () => await Promise.resolve());
    const onUserAction = vi.spyOn(loader, 'onUserAction').mockImplementation(async () => await Promise.resolve());

    loader.addResource(img);

    engine.addScene('scene', { scene: ex.Scene, loader });
    await engine.start('scene', { loader });
    expect(onBeforeLoad).toHaveBeenCalledOnce();
    expect(onAfterLoad).toHaveBeenCalledOnce();
    expect(onUserAction).toHaveBeenCalledOnce();
  });

  it('does not throw when more than 256 images are being loaded', () =>
    new Promise<void>((done) => {
      /**
       *
       */
      function drawRandomCircleOnContext(ctx) {
        const x = Math.floor(Math.random() * 100);
        const y = Math.floor(Math.random() * 100);
        const radius = Math.floor(Math.random() * 20);

        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);

        ctx.beginPath();
        ctx.arc(x, y, radius, Math.PI * 2, 0, false);
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
        ctx.fill();
        ctx.closePath();
      }

      /**
       *
       */
      function generateRandomImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 100, 100);

        for (let i = 0; i < 20; i++) {
          drawRandomCircleOnContext(ctx);
        }
        return canvas.toDataURL('image/png');
      }

      const logger = ex.Logger.getInstance();
      vi.spyOn(logger, 'error');
      const game = TestUtils.engine({
        width: 100,
        height: 100
      });
      const testClock = game.clock as ex.TestClock;

      const loader = new ex.Loader();

      const srcs = [];
      for (let i = 0; i < 800; i++) {
        srcs.push(generateRandomImage());
      }
      const images = srcs.map((src) => new ex.ImageSource(src));
      images.forEach((image) => {
        image.ready.then(() => {
          testClock.step(1);
        });
      });
      loader.addResources(images);

      const ready = TestUtils.runToReady(game, loader)
        .then(() => {
          expect(logger.error).not.toHaveBeenCalled();
          game.dispose();
          done();
        })
        .catch(() => {
          fail();
        });
    }));

  describe('@visual', () => {
    it('should not show the play button when suppressPlayButton is turned on', () =>
      new Promise<void>((done, reject) => {
        reset();
        engine = TestUtils.engine({ suppressPlayButton: false });
        engine.currentScene.add(
          new ex.Actor({
            pos: new ex.Vector(250, 250),
            width: 20,
            height: 20,
            color: ex.Color.Red
          })
        );

        const testClock = engine.clock as ex.TestClock;
        const loader = new ex.Loader([new ex.ImageSource('/src/spec/assets/images/sprite-spec/icon.png')]);
        loader.suppressPlayButton = true;

        TestUtils.runToReady(engine, loader).then(() => {
          // With suppress play there is another 500 ms delay in engine load()
          testClock.step(1);
          engine.graphicsContext.flush();
          expect(engine.canvas)
            .toEqualImage('/src/spec/assets/images/engine-spec/engine-suppress-play.png')
            .then(() => {
              done();
            })
            .catch(reject);
        });
      }));
  });
});
