import * as ex from '@excalibur';
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
    const playbutton = document.getElementById('excalibur-play');
    expect(playbutton).toBeTruthy();
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
    const playbutton = document.getElementById('excalibur-play');
    expect(playbutton).toBeFalsy();
  });
});
