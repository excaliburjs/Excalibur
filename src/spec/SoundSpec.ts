import * as ex from '@excalibur';
import { WebAudio } from '../engine/Util/WebAudio';
import { TestUtils } from './util/TestUtils';

describe('Sound resource', () => {
  let sut: ex.Sound;

  beforeAll(async () => {
    ex.Logger.getInstance().clearAppenders();
    await WebAudio.unlock();
  });

  beforeEach(() => {
    sut = new ex.Sound('base/src/spec/images/SoundSpec/test.mp3');
    expect(sut.path).toBe('base/src/spec/images/SoundSpec/test.mp3');
  });


  it('should be able to be constructed', () => {
    expect(sut).toBeDefined();
  });

  it('should fire processed event', async () => {
    const processedSpy = jasmine.createSpy('fake');
    sut.once('processed', processedSpy);
    await sut.load();
    expect(processedSpy).toHaveBeenCalledTimes(1);
  });

  it('should have duration', async () => {
    await sut.load();
    expect(sut.duration).toBeDefined();
    expect(sut.duration).toBeGreaterThan(0);
  });

  it('should fire playbackstart event', async () => {

    const playbackSpy = jasmine.createSpy('playbackstart');

    sut.on('playbackstart', playbackSpy);

    sut.loop = false;
    await sut.load();
    await sut.play();
    expect(playbackSpy).toHaveBeenCalledTimes(1);
  });

  it('should fire playbackend event', async () => {
    const playbackEndSpy = jasmine.createSpy();

    sut.on('playbackend', playbackEndSpy);

    sut.loop = false;
    await sut.load();
    await sut.play();
    expect(playbackEndSpy).toHaveBeenCalledTimes(1);
  });

  it('should fire resume event', async () => {
    const resumeSpy = jasmine.createSpy('resume');
    await sut.load();

    sut.once('resume', resumeSpy);

    sut.once('playbackstart', () => {
      sut.pause();
      sut.play();
    });

    sut.loop = false;
    await sut.play();
    expect(resumeSpy).toHaveBeenCalledTimes(1);
  });

  it('should fire volumechange event', () => {
    const volumenChangeSpy = jasmine.createSpy('volume');

    sut.once('volumechange',  volumenChangeSpy);

    sut.volume = 0.3;
    expect(volumenChangeSpy).toHaveBeenCalledTimes(1);
  });

  it('should fire pause event', (done) => {
    sut.load().then(() => {

      const pauseSpy = jasmine.createSpy('pause');

      sut.once('pause', pauseSpy);

      sut.once('playbackstart', () => {
        sut.pause();
        expect(pauseSpy).toHaveBeenCalledTimes(1);
        done();

      });
      sut.play();
    });
  });

  it('should fire stop event', (done) => {
    sut.load().then(() => {

      const stopSpy = jasmine.createSpy('stop');

      sut.once('stop', stopSpy);

      sut.once('playbackstart', () => {
        sut.stop();

        expect(stopSpy).toHaveBeenCalledTimes(1);
        done();
      });

      sut.play();
    });
  });

  it('should create a new audio instance when played', (done) => {
    sut.load().then(() => {

      spyOn(sut, 'instanceCount').and.callThrough();

      const initialInstancesCnt = sut.instanceCount();

      sut.once('playbackstart', () => {
        expect(sut.instanceCount()).toBeGreaterThan(initialInstancesCnt);
        done();
      });

      sut.loop = false;
      sut.play();
    });
  });

  it('should set tracks loop value same as own', (done) => {
    sut.load().then(() => {

      sut.loop = true;

      sut.once('playbackstart', () => {
        expect(sut.instances[0].loop).toBe(sut.loop);
        done();
      });

      sut.play();
    });
  });

  it('should set tracks volume value same as own', (done) => {
    sut.load().then(() => {

      sut.volume = 0.5;

      sut.once('playbackstart', () => {
        expect(sut.instances[0].volume).toBe(sut.volume);
        done();
      });

      sut.play();
    });
  });

  it('should set volume with argument sent to play', (done) => {
    sut.load().then(() => {

      sut.once('playbackstart', () => {
        expect(sut.volume).toBe(0.5);
        expect(sut.instances[0].volume).toBe(sut.volume);
        done();
      });

      sut.play(0.5);
    });
  });

  it('should play once and then finish if loop set to false', (done) => {
    sut.load().then(() => {

      sut.loop = false;

      sut.once('playbackstart', () => {
        expect(sut.isPlaying()).toBe(true);
      });

      sut.play().then(() => {
        expect(sut.isPlaying()).toBe(false);

        done();
      });
    });
  });


  it('should stop all currently playing tracks', (done) => {
    sut.load().then(() => {

      sut.play();

      sut.once('playbackstart', () => {
        expect(sut.isPlaying()).toBe(true, 'track should be playing');

        sut.stop();
        expect(sut.isPlaying()).toBe(false, 'track should be stopped');

        done();
      });
    });
  });

  // FIXME: issue for flakey test https://github.com/excaliburjs/Excalibur/issues/1547
  xit('should stop all tracks even when paused', (done) => {
    sut.play();

    setTimeout(() => {
      sut.once('stop', () => {
        done();
      });

      expect(sut.isPlaying()).toBe(true, 'should be playing');

      // pause
      sut.pause();

      expect(sut.isPlaying()).toBe(false, 'should not be playing');

      // stop and rewind
      sut.stop();
    }, 500);
  });

  it('should not have any tracks when stopped', (done) => {
    sut.load().then(() => {

      sut.play();

      sut.once('playbackstart', () => {
        expect(sut.instanceCount()).toBe(1, 'should be one track');

        sut.stop();

        expect(sut.instanceCount()).toBe(0, 'should be no tracks');

        done();
      });
    });
  });

  it('should not remove instance if paused', (done) => {
    sut.load().then(() => {

      sut.play();

      sut.once('playbackstart', () => {
        expect(sut.instanceCount()).toBe(1, 'should be one track');

        sut.pause();

        expect(sut.instanceCount()).toBe(1, 'should be one track');

        done();
      });
    });
  });

  it('should remove tracks as they are done when multiple are playing', (done) => {
    sut.load().then(() => {

      sut.loop = false;
      // start playing first track
      sut.play().then(() => {
        expect(sut.instanceCount()).toBe(1, 'should be one track');
      });

      // wait 250ms then play 2nd track
      setTimeout(() => {
        sut.on('playbackstart', () => {
          expect(sut.instanceCount()).toBe(2, 'should be two simultaneous tracks');
        });

        sut.play().then(() => {
          expect(sut.instanceCount()).toBe(0, 'should be no tracks');
          done();
        });
      }, 250);
    });
  });

  it('should remove multiple tracks when stopped', (done) => {
    sut.load().then(() => {

      sut.loop = false;
      // start playing first track

      sut.once('playbackstart', (ev: ex.NativeSoundEvent) => {
        if (sut.getTrackId(ev.track) === 0) {
          sut.play();
        }
        sut.stop();

        expect(sut.instanceCount()).toBe(0, 'should be no tracks');

        done();
      });

      sut.play();
    });
  });

  describe('wire engine', () => {
    let engine: ex.Engine;

    beforeEach(() => {
      engine = TestUtils.engine();
      engine.start();
    });

    afterEach(() => {
      engine.stop();
      engine = null;
    });

    it('should stop all tracks when engine is stopped', (done) => {
      sut.load().then(() => {

        sut.wireEngine(engine);
        sut.play();

        sut.once('playbackstart', () => {
          expect(sut.instanceCount()).toBe(1, 'should be one track');

          engine.stop();

          expect(sut.instanceCount()).toBe(0, 'should be no tracks');
          expect(sut.isPlaying()).toBe(false, 'should not be playing');

          done();
        });
      });
    });

    it('should not allow playing tracks when engine is stopped', (done) => {
      sut.load().then(() => {

        sut.wireEngine(engine);
        sut.play();

        sut.once('playbackstart', () => {
          expect(sut.isPlaying()).toBe(true, 'should be playing');

          engine.stop();

          sut.play();

          expect(sut.isPlaying()).toBe(false, 'should not allow playing');

          done();
        });
      });
    });

    it('should pause tracks when game is hidden and pauseAudioWhenHidden is true', (done) => {
      sut.load().then(() => {

        engine.pauseAudioWhenHidden = true;
        sut.wireEngine(engine);
        sut.play();

        sut.once('playbackstart', () => {
          expect(sut.isPlaying()).toBe(true, 'should be playing');

          setTimeout(() => {
            engine.emit('hidden', new ex.HiddenEvent(engine));
          }, 100);
        });

        engine.once('hidden', () => {
          expect(sut.isPlaying()).toBe(false, 'should pause when hidden');
          done();
        });
      });
    });

    it('should resume tracks when game is visible from hidden and pauseAudioWhenHidden is true', (done) => {
      sut.load().then(() => {

        engine.pauseAudioWhenHidden = true;
        sut.wireEngine(engine);
        sut.play();

        sut.once('playbackstart', () => {
          expect(sut.isPlaying()).toBe(true, 'should be playing');

          setTimeout(() => {
            engine.emit('hidden', new ex.HiddenEvent(engine));
          }, 100);
        });

        engine.once('hidden', () => {
          setTimeout(() => {
            engine.emit('visible', new ex.VisibleEvent(engine));
          }, 100);
        });

        engine.once('visible', () => {
          expect(sut.isPlaying()).toBe(true, 'should resume when visible');
          done();
        });
      });
    });
  });
});
