import * as ex from '@excalibur';
import { Loader } from '@excalibur';
import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import { TestUtils } from './util/TestUtils';

describe('A loader', () => {
  let engine: ex.Engine;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine();
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
      loader.wireEngine(engine);
      loader.draw(engine.ctx);
      ensureImagesLoaded(engine.canvas, 'src/spec/images/LoaderSpec/zero.png').then(([canvas, image]) => {
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

      loader.wireEngine(engine);
      loader.draw(engine.ctx);
      ensureImagesLoaded(engine.canvas, 'src/spec/images/LoaderSpec/fifty.png').then(([canvas, image]) => {
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

      loader.wireEngine(engine);
      loader.draw(engine.ctx);
      ensureImagesLoaded(engine.canvas, 'src/spec/images/LoaderSpec/100.png').then(([canvas, image]) => {
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
      loader.wireEngine(engine);
      loader.showPlayButton();

      loader.draw(engine.ctx);
      ensureImagesLoaded(engine.canvas, 'src/spec/images/LoaderSpec/playbuttonshown-noprogressbar.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    };
  });

  it('can have the play button position customized', () => {
    const loader = new ex.Loader([, , , ,]);
    loader.wireEngine(engine);
    loader.playButtonPosition = ex.vec(42, 77);
    loader.showPlayButton();
    loader.draw(engine.ctx);
    // there is some dom pollution want to be sure we get the RIGHT root element
    const playbutton = (loader as any)._playButtonRootElement as HTMLDivElement;
    expect(playbutton.style.left).toBe('42px');
    expect(playbutton.style.top).toBe('77px');
  });

  it('can have the logo position customized', (done) => {
    const loader = new ex.Loader([, , , ,]);
    (loader as any)._image.onload = () => {
      loader.wireEngine(engine);
      loader.logoPosition = ex.vec(0, 0);
      loader.showPlayButton();
      loader.draw(engine.ctx);
      ensureImagesLoaded(engine.canvas, 'src/spec/images/LoaderSpec/logo-position.png').then(([canvas, image]) => {
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
      loader.wireEngine(engine);
      loader.draw(engine.ctx);
      ensureImagesLoaded(engine.canvas, 'src/spec/images/LoaderSpec/loader-position-color.png').then(([canvas, image]) => {
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
  function executeMouseEvent(type: string, target: HTMLElement, button: ex.Input.NativePointerButton = null, x: number = 0, y: number = 0) {
    const evt = new PointerEvent(type, {
      clientX: x,
      clientY: y,
      button: button,
      bubbles: true
    });

    target.dispatchEvent(evt);
  }

  it('does not propagate the start button click to pointers', (done) => {
    const engine = new ex.Engine({ width: 1000, height: 1000 });
    const pointerHandler = jasmine.createSpy('pointerHandler');
    engine.input.pointers.primary.on('up', pointerHandler);
    const loader = new Loader([new ex.Graphics.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png')]);
    engine.start(loader);

    setTimeout(() => {
      const btn = (loader as any)._playButton;
      const btnClickHandler = jasmine.createSpy('btnClickHandler');
      btn.addEventListener('pointerup', btnClickHandler);
      const rect = btn.getBoundingClientRect();
      executeMouseEvent('pointerup', btn as any, ex.Input.NativePointerButton.Left, rect.x + rect.width / 2, rect.y + rect.height / 2);

      expect(pointerHandler).not.toHaveBeenCalled();
      expect(btnClickHandler).toHaveBeenCalled();
      done();
    }, 1000);
  });
});
