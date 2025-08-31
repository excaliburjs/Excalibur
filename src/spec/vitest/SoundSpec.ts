import * as ex from '@excalibur';
import { canPlayFile } from '../../engine/Util/Sound';
import { delay } from '../../engine/Util/Util';
import { WebAudio } from '../../engine/Util/WebAudio';
import { TestUtils } from '../__util__/TestUtils';

import { page } from '@vitest/browser/context';

// beware if running firefox/webkit, audio will play. not sure how to mute those browsers
// also note that webkit cant play ogg files so only use supported formats here!
describe('Sound resource', () => {
  let sut: ex.Sound;

  beforeAll(async () => {
    // automate user interaction to allow WebAudio to unlock
    await page.elementLocator(document.body).click();
    ex.Logger.getInstance().clearAppenders();
    await WebAudio.unlock();
  });

  beforeEach(() => {
    sut = new ex.Sound('/src/spec/assets/images/SoundSpec/test.mp3');
    expect(sut.path).toBe('/src/spec/assets/images/SoundSpec/test.mp3');
  });

  it('should be able to be constructed', () => {
    expect(sut).toBeDefined();
  });

  it('can detect playability of files', () => {
    expect(canPlayFile('coin.mp3')).toBe(true);
  });

  it('can detect playability of files', () => {
    expect(canPlayFile('coin.mp3?12234')).toBe(true);
  });

  it('can detect playability of files with multiple dots', () => {
    expect(canPlayFile('coin.f74d9d70.mp3')).toBe(true);
  });

  it('can detect playability of files with querystrings', () => {
    expect(canPlayFile('coin.f74d9d70.mp3?1678266496281')).toBe(true);
  });

  it('can detect playability of files with hash', () => {
    expect(canPlayFile('coin.f74d9d70.mp3#1678266496281')).toBe(true);
  });

  it('can detect playability of files with querystring and hash', () => {
    expect(canPlayFile('coin.f74d9d70.mp3?_=1234#1678266496281')).toBe(true);
  });

  it('should fire processed event', async () => {
    const processedSpy = vi.fn();
    sut.once('processed', processedSpy);
    await sut.load();
    expect(processedSpy).toHaveBeenCalledTimes(1);
  });

  it('should have duration', async () => {
    sut = new ex.Sound('/src/spec/assets/images/SoundSpec/preview.mp3');
    sut.duration = 5.0;
    await sut.load();
    expect(sut.duration).toBeDefined();
    expect(sut.duration).toBe(5);
  });

  it('should have duration (new ctor)', async () => {
    sut = new ex.Sound({ paths: ['/src/spec/assets/images/SoundSpec/preview.mp3'] });
    sut.duration = 5.0;
    await sut.load();
    expect(sut.duration).toBeDefined();
    expect(sut.duration).toBe(5);
  });

  it('should fire playbackstart event', async () => {
    const playbackSpy = vi.fn();

    sut.on('playbackstart', playbackSpy);

    sut.loop = false;

    await sut.load();
    await sut.play();

    expect(playbackSpy).toHaveBeenCalledTimes(1);
  });

  it('should fire playbackstart event (new ctor)', async () => {
    sut = new ex.Sound({
      paths: ['/src/spec/assets/images/SoundSpec/test.mp3'],
      loop: false
    });
    const playbackSpy = vi.fn();

    sut.on('playbackstart', playbackSpy);

    await sut.load();
    await sut.play();

    expect(playbackSpy).toHaveBeenCalledTimes(1);
  });

  it('should fire playbackend event', async () => {
    const playbackEndSpy = vi.fn();

    sut.on('playbackend', playbackEndSpy);

    sut.loop = false;
    await sut.load();
    await sut.play();
    expect(playbackEndSpy).toHaveBeenCalledTimes(1);
  });

  it('should fire resume event', async () => {
    const resumeSpy = vi.fn();
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
    const volumenChangeSpy = vi.fn();

    sut.once('volumechange', volumenChangeSpy);

    sut.volume = 0.3;
    expect(volumenChangeSpy).toHaveBeenCalledTimes(1);
  });

  it('should fire pause event', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        const pauseSpy = vi.fn();

        sut.once('pause', pauseSpy);

        sut.once('playbackstart', () => {
          sut.pause();
          expect(pauseSpy).toHaveBeenCalledTimes(1);
          done();
        });
        sut.play();
      });
    }));

  it('should fire stop event', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        const stopSpy = vi.fn();

        sut.once('stop', stopSpy);

        sut.once('playbackstart', () => {
          sut.stop();

          expect(stopSpy).toHaveBeenCalledTimes(1);
          done();
        });

        sut.play();
      });
    }));

  it('should create a new audio instance when played', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        vi.spyOn(sut, 'instanceCount');

        const initialInstancesCnt = sut.instanceCount();

        sut.once('playbackstart', () => {
          expect(sut.instanceCount()).toBeGreaterThan(initialInstancesCnt);
          done();
        });

        sut.loop = false;
        sut.play();
      });
    }));

  it('should set tracks loop value same as own', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        sut.loop = true;

        sut.once('playbackstart', () => {
          expect(sut.instances[0].loop).toBe(sut.loop);
          done();
        });

        sut.play();
      });
    }));

  it('should not provide a duration if looping', async () => {
    await sut.load();

    const webaudio = new ex.WebAudioInstance(sut.data);
    vi.spyOn(webaudio as any, '_createNewBufferSource').mockImplementation(() => void 0);
    const instance = {
      start: vi.fn()
    } as any;
    (webaudio as any)._instance = instance;
    webaudio.loop = true;
    webaudio.play();

    expect((webaudio as any)._createNewBufferSource).toHaveBeenCalled();
    expect(instance.start).toHaveBeenCalledWith(0, 0);
  });

  it('should provide a duration if not looping', async () => {
    await sut.load();

    const webaudio = new ex.WebAudioInstance(sut.data);
    vi.spyOn(webaudio as any, '_createNewBufferSource').mockImplementation(() => void 0);
    const instance = {
      start: vi.fn()
    } as any;
    (webaudio as any)._instance = instance;
    webaudio.loop = false;
    webaudio.play();

    expect((webaudio as any)._createNewBufferSource).toHaveBeenCalled();
    expect(instance.start).toHaveBeenCalledWith(0, 0, sut.duration);
  });

  it('should set tracks volume value same as own', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        sut.volume = 0.5;

        sut.once('playbackstart', () => {
          expect(sut.instances[0].volume).toBe(sut.volume);
          done();
        });

        sut.play();
      });
    }));

  it('should set volume with argument sent to play', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        sut.once('playbackstart', () => {
          expect(sut.volume).toBe(0.5);
          expect(sut.instances[0].volume).toBe(sut.volume);
          done();
        });

        sut.play(0.5);
      });
    }));

  it('should play once and then finish if loop set to false', () =>
    new Promise<void>((done) => {
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
    }));

  it('should stop all currently playing tracks', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        sut.once('playbackstart', () => {
          expect(sut.isPlaying(), 'track should be playing').toBe(true);

          sut.stop();
          expect(sut.isPlaying(), 'track should be stopped').toBe(false);

          done();
        });

        sut.play();
      });
    }));

  it('should return the current playback position of the audio track', async () => {
    sut = new ex.Sound('/src/spec/assets/images/SoundSpec/preview.mp3');
    await sut.load();
    sut.play();
    await delay(1000);
    // appveyor is a little fast for some reason
    expect(sut.getPlaybackPosition()).toBeGreaterThanOrEqual(0.98);
  });

  it('should variable playback rate of the audio track', async () => {
    sut = new ex.Sound('/src/spec/assets/images/SoundSpec/preview.mp3');
    await sut.load();
    sut.playbackRate = 2.0;
    sut.play();
    await delay(1000);
    // appveyor is a little fast for some reason
    expect(sut.getPlaybackPosition(), 'Twice the speed will be at 2 seconds').toBeGreaterThanOrEqual(1.8);
  });

  // FIXME: issue for flakey test https://github.com/excaliburjs/Excalibur/issues/1547
  it.skip('should stop all tracks even when paused', () =>
    new Promise<void>((done) => {
      sut.play();

      setTimeout(() => {
        sut.once('stop', () => {
          done();
        });

        expect(sut.isPlaying(), 'should be playing').toBe(true);

        // pause
        sut.pause();

        expect(sut.isPlaying(), 'should not be playing').toBe(false);

        // stop and rewind
        sut.stop();
      }, 500);
    }));

  it('should not have any tracks when stopped', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        sut.once('playbackstart', () => {
          expect(sut.instanceCount(), 'should be one track').toBe(1);

          sut.stop();

          expect(sut.instanceCount(), 'should be no tracks').toBe(0);

          done();
        });
        sut.play();
      });
    }));

  it('should not remove instance if paused', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        sut.once('playbackstart', () => {
          expect(sut.instanceCount(), 'should be one track').toBe(1);

          sut.pause();

          expect(sut.instanceCount(), 'should be one track').toBe(1);

          done();
        });
        sut.play();
      });
    }));

  it('should remove tracks as they are done when multiple are playing', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        sut.loop = false;
        // start playing first track
        sut.play().then(() => {
          expect(sut.instanceCount(), 'should be on track').toBe(1);
        });

        // wait 250ms then play 2nd track
        setTimeout(() => {
          sut.on('playbackstart', () => {
            expect(sut.instanceCount(), 'should be two simultaneous tracks').toBe(2);
          });

          sut.play().then(() => {
            expect(sut.instanceCount(), 'should be no tracks').toBe(0);
            done();
          });
        }, 250);
      });
    }));

  it('should remove multiple tracks when stopped', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        sut.loop = false;
        // start playing first track

        sut.once('playbackstart', (ev: ex.NativeSoundEvent) => {
          if (sut.getTrackId(ev.track) === 0) {
            sut.play();
          }
          sut.stop();

          expect(sut.instanceCount(), 'should be no tracks').toBe(0);

          done();
        });

        sut.play();
      });
    }));

  it('can seek to a position in the sound', async () => {
    sut = new ex.Sound('/src/spec/assets/images/SoundSpec/preview.mp3');
    await sut.load();
    expect(sut.getPlaybackPosition()).toBe(0);
    sut.seek(6.5);
    expect(sut.getPlaybackPosition()).toBe(6.5);
  });

  it('can get the total duration of the sound', async () => {
    sut = new ex.Sound('/src/spec/assets/images/SoundSpec/preview.mp3');
    await sut.load();
    expect(sut.getTotalPlaybackDuration()).toBeCloseTo(13.01, 1);
  });

  it('can set/get the playback rate', async () => {
    sut = new ex.Sound('/src/spec/assets/images/SoundSpec/preview.mp3');
    expect(sut.playbackRate).toBe(1.0);
    sut.playbackRate = 2.5;
    await sut.load();
    expect(sut.playbackRate).toBe(2.5);
  });

  it('can set the playback rate and seek to the right position', async () => {
    sut = new ex.Sound('/src/spec/assets/images/SoundSpec/preview.mp3');
    expect(sut.playbackRate).toBe(1.0);
    sut.playbackRate = 2.5;
    await sut.load();
    sut.seek(6.5);
    expect(sut.getPlaybackPosition()).toBe(6.5);
  });

  describe('wire engine', () => {
    let engine: ex.Engine;

    beforeEach(() => {
      engine = TestUtils.engine();
      engine.start();
    });

    afterEach(() => {
      engine.stop();
      engine.dispose();
      engine = null;
    });

    it('should stop all tracks when engine is stopped', () =>
      new Promise<void>((done) => {
        sut.load().then(() => {
          sut.wireEngine(engine);

          sut.once('playbackstart', () => {
            expect(sut.instanceCount(), 'should be one track').toBe(1);

            engine.stop();

            expect(sut.instanceCount(), 'should be no tracks').toBe(0);
            expect(sut.isPlaying(), 'should not be playing').toBe(false);

            done();
          });
          sut.play();
        });
      }));

    it('should not allow playing tracks when engine is stopped', () =>
      new Promise<void>((done) => {
        sut.load().then(() => {
          sut.wireEngine(engine);
          sut.once('playbackstart', () => {
            expect(sut.isPlaying(), 'should be playing').toBe(true);

            engine.stop();

            sut.play();

            expect(sut.isPlaying(), 'should not allow playing').toBe(false);

            done();
          });
          sut.play();
        });
      }));

    it('should pause tracks when game is hidden and pauseAudioWhenHidden is true', () =>
      new Promise<void>((done) => {
        sut.load().then(() => {
          engine.pauseAudioWhenHidden = true;
          sut.wireEngine(engine);

          sut.once('playbackstart', () => {
            expect(sut.isPlaying(), 'should be playing').toBe(true);

            setTimeout(() => {
              engine.emit('hidden', new ex.HiddenEvent(engine));
            }, 100);
          });

          sut.play();

          engine.once('hidden', () => {
            expect(sut.isPlaying(), 'should pause when hidden').toBe(false);
            done();
          });
        });
      }));

    it('should resume tracks when game is visible from hidden and pauseAudioWhenHidden is true', () =>
      new Promise<void>((done) => {
        sut.load().then(() => {
          engine.pauseAudioWhenHidden = true;
          sut.wireEngine(engine);

          sut.once('playbackstart', () => {
            expect(sut.isPlaying(), 'should be playing').toBe(true);

            setTimeout(() => {
              engine.emit('hidden', new ex.HiddenEvent(engine));
            }, 100);
          });

          sut.play();

          engine.once('hidden', () => {
            setTimeout(() => {
              engine.emit('visible', new ex.VisibleEvent(engine));
            }, 100);
          });

          engine.once('visible', () => {
            expect(sut.isPlaying(), 'should resume when visible').toBe(true);
            done();
          });
        });
      }));
  });
});
