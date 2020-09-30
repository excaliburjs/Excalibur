import * as ex from '@excalibur';
import { Stubs } from './util/Stubs';
import { TestUtils } from './util/TestUtils';

describe('Sound resource', () => {
  let sut: ex.Sound;

  beforeAll(() => {
    ex.Logger.getInstance().clearAppenders();
  });

  beforeEach(() => {
    sut = new ex.Sound('/sample/test.mp3');

    expect(sut.path).toBe('/sample/test.mp3');
  });

  it('should be able to be constructed', () => {
    expect(sut).toBeDefined();
  });

  describe('with data', () => {
    describe('type of arraybuffer', () => {
      beforeEach(() => {
        sut.setData(_base64ToArrayBuffer());
      });

      it('should return the processed data', () => {
        expect(sut.processData(sut.getData())).toBeDefined();
      });

      it('should fire processed event', (done) => {
        sut.once('processed', (e: ex.NativeSoundProcessedEvent) => {
          expect(e.data).toBeDefined();
          done();
        });
        sut.processData(sut.getData());
      });

      it('should have duration', (done) => {
        sut.processData(sut.getData()).then(() => {
          expect(sut.duration).toBeDefined();
          expect(sut.duration).toBeGreaterThan(0);
          done();
        });
      });

      it('should fire playbackstart event', (done) => {
        let trigger = false;

        sut.on('playbackstart', () => {
          trigger = true;
        });

        sut.loop = false;
        sut.play().then(() => {
          expect(trigger).toBeTruthy();
          done();
        });

        expect(trigger).toBeFalsy();
      });

      it('should fire playbackend event', (done) => {
        let trigger = false;

        sut.on('playbackend', () => {
          trigger = true;
        });

        sut.loop = false;
        sut.play().then(() => {
          expect(trigger).toBeTruthy();
          done();
        });

        expect(trigger).toBeFalsy();
      });

      it('should fire resume event', (done) => {
        let trigger = false;

        sut.once('resume', () => {
          trigger = true;
        });

        sut.once('playbackstart', () => {
          sut.pause();
          sut.play();
        });

        sut.loop = false;
        sut.play().then(() => {
          expect(trigger).toBeTruthy();
          done();
        });

        expect(trigger).toBeFalsy();
      });

      it('should fire volumechange event', () => {
        let trigger = false;

        sut.once('volumechange', () => {
          trigger = true;
        });

        sut.volume = 0.3;

        expect(trigger).toBeTruthy();
      });

      it('should fire pause event', (done) => {
        let trigger = false;

        sut.once('pause', () => {
          trigger = true;
        });

        sut.once('playbackstart', () => {
          sut.pause();

          expect(trigger).toBeTruthy();
          done();
        });

        sut.play();
      });

      it('should fire stop event', (done) => {
        let trigger = false;

        sut.once('stop', () => {
          trigger = true;
        });

        sut.once('playbackstart', () => {
          sut.stop();

          expect(trigger).toBeTruthy();
          done();
        });

        sut.play();
      });

      it('should fire emptied event', () => {
        let trigger = false;

        sut.once('emptied', () => {
          trigger = true;
        });

        sut.setData(_base64ToArrayBuffer());

        expect(trigger).toBeTruthy();
      });

      it('should create a new audio instance when played', (done) => {
        spyOn(sut, 'instanceCount').and.callThrough();

        const initialInstancesCnt = sut.instanceCount();

        sut.once('playbackstart', () => {
          expect(sut.instanceCount()).toBeGreaterThan(initialInstancesCnt);
          done();
        });

        sut.loop = false;
        sut.play();
      });

      it('should set tracks loop value same as own', (done) => {
        sut.loop = true;

        sut.once('playbackstart', () => {
          expect(sut.instances[0].loop).toBe(sut.loop);
          done();
        });

        sut.play();
      });

      it('should set tracks volume value same as own', (done) => {
        sut.volume = 0.5;

        sut.once('playbackstart', () => {
          expect(sut.instances[0].volume).toBe(sut.volume);
          done();
        });

        sut.play();
      });

      it('should set volume with argument sent to play', (done) => {
        sut.once('playbackstart', () => {
          expect(sut.volume).toBe(0.5);
          expect(sut.instances[0].volume).toBe(sut.volume);
          done();
        });

        sut.play(0.5);
      });

      it('should play once and then finish if loop set to false', (done) => {
        sut.loop = false;

        sut.once('playbackstart', () => {
          expect(sut.isPlaying()).toBe(true);
        });

        sut.play().then(() => {
          expect(sut.isPlaying()).toBe(false);

          done();
        });
      });

      it('should play more than once and should be playing until all are done', (done) => {
        let firstDone = false;
        sut.loop = false;

        // play 1st track
        sut.play().then(() => {
          firstDone = true;
        });

        setTimeout(() => {
          expect(firstDone).toBe(false, 'first track should not be done when second starts');
          expect(sut.isPlaying()).toBe(true, 'first track should be playing');

          // play 2nd track
          sut.play().then(() => {
            expect(firstDone).toBe(true, 'first track should be done when second finishes');
            expect(sut.isPlaying()).toBe(false, 'all tracks should be done playing');

            done();
          });
        }, 250);

        // second instance should still be playing after 650ms
        setTimeout(() => {
          expect(firstDone).toBe(true, 'first track should be done playing after 150ms');
          expect(sut.isPlaying()).toBe(true, 'second track should still be playing');
        }, 650);
      });

      it('should stop all currently playing tracks', (done) => {
        sut.play();

        sut.once('playbackstart', () => {
          expect(sut.isPlaying()).toBe(true, 'track should be playing');

          sut.stop();
          expect(sut.isPlaying()).toBe(false, 'track should be stopped');

          done();
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
        sut.play();

        sut.once('playbackstart', () => {
          expect(sut.instanceCount()).toBe(1, 'should be one track');

          sut.stop();

          expect(sut.instanceCount()).toBe(0, 'should be no tracks');

          done();
        });
      });

      it('should not remove instance if paused', (done) => {
        sut.play();

        sut.once('playbackstart', () => {
          expect(sut.instanceCount()).toBe(1, 'should be one track');

          sut.pause();

          expect(sut.instanceCount()).toBe(1, 'should be one track');

          done();
        });
      });

      it('should remove tracks as they are done when multiple are playing', (done) => {
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

      it('should remove multiple tracks when stopped', (done) => {
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

        it('should not allow playing tracks when engine is stopped', (done) => {
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

        it('should pause tracks when game is hidden and pauseAudioWhenHidden is true', (done) => {
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

        it('should resume tracks when game is visible from hidden and pauseAudioWhenHidden is true', (done) => {
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
});

/**
 * Creates a buffer of mock data
 */
function _base64ToArrayBuffer() {
  const mockData = Stubs.AudioStub.base64StubData;

  const binary_string = window.atob(mockData);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }

  return bytes.buffer;
}
