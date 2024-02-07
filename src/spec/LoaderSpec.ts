import * as ex from '@excalibur';
import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import { TestUtils } from './util/TestUtils';

describe('A loader', () => {
  let engine: ex.Engine;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine();
  });

  afterEach(() => {
    engine.dispose();
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

  it('can be drawn at 0', (done) => {
    const loader = new ex.Loader([, , , ,]);
    (loader as any)._image.onload = () => {
      loader.onInitialize(engine);
      loader.onDraw(loader.canvas.ctx);
      ensureImagesLoaded(loader.canvas.ctx.canvas, 'src/spec/images/LoaderSpec/zero.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    };
  });

  it('can be drawn at 50', (done) => {
    const loader = new ex.Loader([, , , ,]);
    (loader as any)._image.onload = () => {
      loader.markResourceComplete();
      loader.markResourceComplete();

      loader.onInitialize(engine);
      loader.onDraw(loader.canvas.ctx);
      ensureImagesLoaded(loader.canvas.ctx.canvas, 'src/spec/images/LoaderSpec/fifty.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    };
  });

  it('can be drawn at 100', (done) => {
    const loader = new ex.Loader([, , , ,]);
    (loader as any)._image.onload = () => {
      loader.markResourceComplete();
      loader.markResourceComplete();
      loader.markResourceComplete();
      loader.markResourceComplete();

      loader.onInitialize(engine);
      loader.onDraw(loader.canvas.ctx);
      ensureImagesLoaded(loader.canvas.ctx.canvas, 'src/spec/images/LoaderSpec/100.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    };
  });

  it('does not show progress when the play button is shown', (done) => {
    const loader = new ex.Loader([, , , ,]);
    (loader as any)._image.onload = () => {
      loader.markResourceComplete();
      loader.markResourceComplete();
      loader.markResourceComplete();
      loader.markResourceComplete();
      loader.onInitialize(engine);
      loader.showPlayButton();

      loader.onDraw(loader.canvas.ctx);
      ensureImagesLoaded(loader.canvas.ctx.canvas, 'src/spec/images/LoaderSpec/playbuttonshown-noprogressbar.png')
        .then(([canvas, image]) => {
          expect(canvas).toEqualImage(image);
          done();
        });
    };
  });

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

  it('can have the logo position customized', (done) => {
    const loader = new ex.Loader([, , , ,]);
    (loader as any)._image.onload = () => {
      loader.onInitialize(engine);
      loader.logoPosition = ex.vec(0, 0);
      loader.showPlayButton();
      loader.onDraw(loader.canvas.ctx);
      ensureImagesLoaded(loader.canvas.ctx.canvas, 'src/spec/images/LoaderSpec/logo-position.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    };
  });

  it('can have the loader customized', (done) => {
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
      ensureImagesLoaded(loader.canvas.ctx.canvas, 'src/spec/images/LoaderSpec/loader-position-color.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    };
  });

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

  it('can have the enter key pressed to start', (done) => {
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
  });

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
    const engine = new ex.Engine({ width: 1000, height: 1000 });
    (ex.WebAudio as any)._UNLOCKED = true;
    const clock = engine.clock = engine.clock.toTestClock();
    const pointerHandler = jasmine.createSpy('pointerHandler');
    engine.input.pointers.primary.on('up', pointerHandler);
    const loader = new ex.Loader([new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png')]);
    const start = engine.start(loader);

    await loader.areResourcesLoaded();
    clock.step(200);

    const btn = (loader as any)._playButton;
    const btnClickHandler = jasmine.createSpy('btnClickHandler');
    btn.addEventListener('pointerup', btnClickHandler);
    const rect = btn.getBoundingClientRect();
    executeMouseEvent('pointerup', btn as any, ex.NativePointerButton.Left, rect.x + rect.width / 2, rect.y + rect.height / 2);

    expect(pointerHandler).not.toHaveBeenCalled();
    expect(btnClickHandler).toHaveBeenCalled();
  });

  it('updates the play button position on resize', () => {
    const engine = new ex.Engine({width: 1000, height: 1000});
    const loader = new ex.Loader([, , , ,]);
    loader.onInitialize(engine);
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.markResourceComplete();
    loader.showPlayButton();

    expect(loader.playButtonRootElement).toBeTruthy();

    engine.browser.window.nativeComponent.dispatchEvent(new Event('resize'));

    const oldPos = [
      loader.playButtonRootElement.style.left,
      loader.playButtonRootElement.style.top];

    engine.screen.viewport = {width: 100, height: 100};

    engine.browser.window.nativeComponent.dispatchEvent(new Event('resize'));

    const newPos = [
      loader.playButtonRootElement.style.left,
      loader.playButtonRootElement.style.top];

    expect(oldPos).not.toEqual(newPos);
  });

  it('does not throw when more than 256 images are being loaded', (done) => {
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
    spyOn(logger, 'error').and.callThrough();
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
    const images = srcs.map(src => new ex.ImageSource(src));
    images.forEach((image) => {
      image.ready.then(() => {
        testClock.step(1);
      });
    });
    loader.addResources(images);

    const ready = TestUtils.runToReady(game, loader).then(() => {
      expect(logger.error).not.toHaveBeenCalled();
      done();
    })
      .catch(() => {
        fail();
      });
  });
});
