import * as ex from '@excalibur';
import { SoundTrack } from '../../engine/resources/sound/sound-track';
import { canPlayFile, canPlayMime } from '../../engine/util/sound';
import { delay } from '../../engine/util/util';
import { WebAudio } from '../../engine/util/web-audio';
import { TestUtils } from '../__util__/test-utils';

import { page } from 'vitest/browser';

// beware if running firefox/webkit, audio will play. not sure how to mute those browsers
// also note that webkit cant play ogg files so only use supported formats here!
describe('Sound resource', () => {
  let sut: ex.Sound;

  /**
   * Play and resolve once the given event fires, handing back the (unawaited) completion promise
   */
  const playAndAwait = async (event: 'playbackstart' | 'resume', config?: number | ex.PlayOptions) => {
    const fired = new Promise<void>((done) => sut.once(event, () => done()));
    const complete = event === 'resume' ? sut.resume() : sut.play(config as ex.PlayOptions);
    await fired;
    return { complete };
  };

  beforeAll(async () => {
    // automate user interaction to allow WebAudio to unlock
    await page.elementLocator(document.body).click();
    ex.Logger.getInstance().clearAppenders();
    await WebAudio.unlock();
  });

  beforeEach(() => {
    sut = new ex.Sound('/src/spec/assets/images/sound-spec/test.mp3');
    expect(sut.path).toBe('/src/spec/assets/images/sound-spec/test.mp3');
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
    sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
    sut.duration = 5.0;
    await sut.load();
    expect(sut.duration).toBeDefined();
    expect(sut.duration).toBe(5);
  });

  it('should have duration (new ctor)', async () => {
    sut = new ex.Sound({ paths: ['/src/spec/assets/images/sound-spec/preview.mp3'] });
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
      paths: ['/src/spec/assets/images/sound-spec/test.mp3'],
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
      sut.resume();
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

    const track = new SoundTrack(sut.data, ex.AudioContextFactory.create().createGain());
    const source = {
      start: vi.fn()
    } as any;
    vi.spyOn(track as any, '_createSource').mockImplementation(() => source);
    track.loop = true;
    track.play();

    expect((track as any)._createSource).toHaveBeenCalled();
    expect(source.start).toHaveBeenCalledWith(0, 0);
  });

  it('should provide a duration if not looping', async () => {
    await sut.load();

    const track = new SoundTrack(sut.data, ex.AudioContextFactory.create().createGain());
    const source = {
      start: vi.fn()
    } as any;
    vi.spyOn(track as any, '_createSource').mockImplementation(() => source);
    track.loop = false;
    track.play();

    expect((track as any)._createSource).toHaveBeenCalled();
    expect(source.start).toHaveBeenCalledWith(0, 0, sut.duration);
  });

  it('should apply its volume to the output gain', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        sut.volume = 0.5;

        sut.once('playbackstart', () => {
          expect((sut as any)._output.gain.value).toBeCloseTo(0.5);
          done();
        });

        sut.play();
      });
    }));

  it('should apply a volume argument sent to play to that track only', () =>
    new Promise<void>((done) => {
      sut.load().then(() => {
        sut.once('playbackstart', () => {
          expect(sut.volume).toBe(1);
          expect(sut.instances[0].volume).toBe(0.5);
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
    sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
    await sut.load();
    sut.play();
    await delay(1000);
    // appveyor is a little fast for some reason
    expect(sut.getPlaybackPosition()).toBeGreaterThanOrEqual(0.98);
  });

  it('should variable playback rate of the audio track', async () => {
    sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
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
    sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
    await sut.load();
    expect(sut.getPlaybackPosition()).toBe(0);
    sut.seek(6.5);
    expect(sut.getPlaybackPosition()).toBe(6.5);
  });

  it('can get the total duration of the sound', async () => {
    sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
    await sut.load();
    expect(sut.getTotalPlaybackDuration()).toBeCloseTo(13.01, 1);
  });

  it('can set/get the playback rate', async () => {
    sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
    expect(sut.playbackRate).toBe(1.0);
    sut.playbackRate = 2.5;
    await sut.load();
    expect(sut.playbackRate).toBe(2.5);
  });

  it('can set the playback rate and seek to the right position', async () => {
    sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
    expect(sut.playbackRate).toBe(1.0);
    sut.playbackRate = 2.5;
    await sut.load();
    sut.seek(6.5);
    expect(sut.getPlaybackPosition()).toBe(6.5);
  });

  describe('name derivation', () => {
    it('derives name from basename-without-extension', () => {
      expect(new ex.Sound('/sfx/coin.mp3').name).toBe('coin');
      expect(new ex.Sound('/a/b/c.mp3?v=2').name).toBe('c');
      expect(new ex.Sound('/a/b/c.mp3#frag').name).toBe('c');
      expect(new ex.Sound('/x/coin.f74d9d70.mp3').name).toBe('coin.f74d9d70');
      expect(new ex.Sound('c.wav').name).toBe('c');
      expect(new ex.Sound('/sfx/.hidden').name).toBe('.hidden');
      expect(new ex.Sound('/sfx/.hidden.mp3').name).toBe('.hidden');
    });

    it('uses an explicit name option', () => {
      expect(new ex.Sound({ name: 'jump', paths: ['/x/jump.ogg'] }).name).toBe('jump');
    });

    it('infers the name type from the name option (new Sound)', () => {
      const jump = new ex.Sound({ name: 'jump', paths: ['/x/jump.ogg'] });
      const check: 'jump' = jump.name;
      void check;
    });

    it('createSound infers the name type from a path literal', () => {
      const coin = ex.createSound('/sfx/coin.mp3');
      expect(coin.name).toBe('coin');
      const check: 'coin' = coin.name;
      void check;

      const hashed = ex.createSound('/x/coin.f74d9d70.mp3?v=2');
      const check2: 'coin.f74d9d70' = hashed.name;
      void check2;

      const hidden = ex.createSound('/sfx/.hidden.mp3');
      const check3: '.hidden' = hidden.name;
      void check3;
    });
  });

  describe('pitch', () => {
    it('has pitch 0 and unbounded maxConcurrentTracks by default', () => {
      expect(sut.pitch).toBe(0);
      expect(sut.maxConcurrentTracks).toBeUndefined();
    });

    it('accepts pitch and maxConcurrentTracks options', () => {
      const s = new ex.Sound({ paths: ['/x/coin.mp3'], pitch: 100, maxConcurrentTracks: 3 });
      expect(s.pitch).toBe(100);
      expect(s.maxConcurrentTracks).toBe(3);
    });

    it('applies pitch to the playing track', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.loop = true;
      await sut.load();
      sut.pitch = 100;

      await new Promise<void>((done) => {
        sut.once('playbackstart', () => {
          expect(sut.instances[0].pitch).toBe(100);
          sut.stop();
          done();
        });
        sut.play();
      });
    });

    it('applies a per-play pitch override', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.loop = true;
      sut.pitch = 50;
      await sut.load();

      await new Promise<void>((done) => {
        sut.once('playbackstart', () => {
          expect(sut.instances[0].pitch).toBe(200);
          sut.stop();
          done();
        });
        sut.play({ pitch: 200 });
      });
    });

    it('accounts for pitch in the playback position', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      await sut.load();
      sut.pitch = 1200; // one octave up doubles the speed
      sut.play();
      await delay(500);
      const position = sut.getPlaybackPosition();
      expect(position, 'an octave up plays twice as fast').toBeGreaterThanOrEqual(0.9);

      sut.pause();
      expect(sut.getPlaybackPosition(), 'pause keeps the pitched position').toBeGreaterThanOrEqual(position);
      sut.stop();
    });
  });

  describe('maxConcurrentTracks', () => {
    it('drops new plays once the cap is reached', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.loop = true;
      sut.maxConcurrentTracks = 1;
      await sut.load();

      await new Promise<void>((done) => {
        sut.once('playbackstart', async () => {
          expect(sut.instanceCount()).toBe(1);
          const result = await sut.play();
          expect(result).toBe(false);
          expect(sut.instanceCount()).toBe(1);
          sut.stop();
          done();
        });
        sut.play();
      });
    });

    it('is unbounded by default', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.loop = true;
      await sut.load();

      await new Promise<void>((done) => {
        sut.once('playbackstart', () => {
          // a second simultaneous play is allowed, the track is pushed synchronously
          sut.play();
          expect(sut.instanceCount()).toBe(2);
          sut.stop();
          done();
        });
        sut.play();
      });
    });
  });

  describe('position and seeking', () => {
    it('starts a single new track from the configured position', async () => {
      sut = new ex.Sound({ paths: ['/src/spec/assets/images/sound-spec/preview.mp3'], position: 5, loop: true });
      await sut.load();

      await new Promise<void>((done) => {
        sut.once('playbackstart', () => {
          expect(sut.instanceCount()).toBe(1);
          expect(sut.isPaused()).toBe(false);
          expect(sut.getPlaybackPosition()).toBeGreaterThanOrEqual(5);
          sut.stop();
          done();
        });
        sut.play();
      });
    });

    it('resumes a seeked track with a single track', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.loop = true;
      await sut.load();
      sut.seek(6.5);
      expect(sut.isPaused()).toBe(true);

      await new Promise<void>((done) => {
        sut.once('resume', () => {
          expect(sut.instanceCount()).toBe(1);
          expect(sut.isPlaying()).toBe(true);
          expect(sut.getPlaybackPosition()).toBeGreaterThanOrEqual(6.5);
          sut.stop();
          done();
        });
        sut.resume();
      });
    });

    it('stops a track when it ends naturally', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.duration = 0.2;
      await sut.load();
      const track = await new Promise<ex.SoundTrack>((done) => {
        sut.once('playbackstart', (evt) => done(evt.track!));
        sut.play();
      });
      await delay(500);
      expect(track.isStopped()).toBe(true);
      expect(sut.instanceCount()).toBe(0);
    });
  });

  describe('track bookkeeping', () => {
    it('keeps a live track when a paused-and-resumed sibling ends', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      await sut.load();

      sut.duration = 0.5;
      const { complete: first } = await playAndAwait('playbackstart');
      const firstTrack = sut.instances[0];

      sut.duration = 3;
      await playAndAwait('playbackstart');
      const secondTrack = sut.instances[1];
      expect(sut.instanceCount()).toBe(2);

      sut.pause();
      expect(sut.isPaused()).toBe(true);
      sut.resume();

      await first;
      expect(firstTrack.isStopped()).toBe(true);
      expect(sut.instanceCount(), 'the second track must survive the first ending').toBe(1);
      expect(sut.instances[0]).toBe(secondTrack);
      expect(sut.isPlaying()).toBe(true);
      sut.stop();
    });
  });

  describe('one-off play options', () => {
    it('snapshots the sound config overlaid with the options without mutating the sound', async () => {
      sut = new ex.Sound({ paths: ['/src/spec/assets/images/sound-spec/preview.mp3'], volume: 0.8, pitch: 100, loop: true });
      await sut.load();

      const track = sut.start({ volume: 0.5, pitch: -200, playbackRate: 2, loop: false, duration: 3, position: 1 })!;
      expect(track).toBeInstanceOf(ex.SoundTrack);
      expect(track.volume).toBe(0.5);
      expect(track.pitch).toBe(-200);
      expect(track.playbackRate).toBe(2);
      expect(track.loop).toBe(false);
      expect(track.duration).toBe(3);
      expect(track.getPlaybackPosition()).toBeGreaterThanOrEqual(1);

      expect(sut.volume).toBe(0.8);
      expect(sut.pitch).toBe(100);
      expect(sut.playbackRate).toBe(1);
      expect(sut.loop).toBe(true);
      expect(sut.position).toBeUndefined();
      sut.stop();
    });

    it('falls back to the sound config for unset options', async () => {
      sut = new ex.Sound({ paths: ['/src/spec/assets/images/sound-spec/preview.mp3'], pitch: 100, loop: true, playbackRate: 1.5 });
      await sut.load();
      const track = sut.start({ volume: 0.25 })!;
      expect(track.volume).toBe(0.25);
      expect(track.pitch).toBe(100);
      expect(track.loop).toBe(true);
      expect(track.playbackRate).toBe(1.5);
      sut.stop();
    });

    it('start() returns the track whose done promise matches play()', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      await sut.load();
      const track = sut.start({ duration: 0.2 })!;
      expect(sut.instances).toEqual([track]);
      expect(track.isPlaying()).toBe(true);
      await expect(track.done).resolves.toBe(true);
      expect(sut.instanceCount()).toBe(0);

      const stopped = sut.start()!;
      stopped.stop();
      await expect(stopped.done).resolves.toBe(true);
    });

    it('start() returns undefined when the play is dropped', () => {
      expect(sut.start(), 'not loaded').toBeUndefined();
    });

    it('play() always starts a new track, even while another is paused', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.loop = true;
      await sut.load();
      const first = sut.start()!;
      sut.pause();
      expect(first.isPaused()).toBe(true);

      const second = sut.start()!;
      expect(second).not.toBe(first);
      expect(first.isPaused()).toBe(true);
      expect(second.isPlaying()).toBe(true);
      expect(sut.instanceCount()).toBe(2);
      sut.stop();
    });

    it('resume() resolves false when nothing is paused', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      await sut.load();
      expect(await sut.resume()).toBe(false);
    });
  });

  describe('onPlay audio graph hook', () => {
    it('hands the hook the source, destination, context and track', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.loop = true;
      await sut.load();
      let ctx: ex.AudioGraphContext | undefined;
      sut.onPlay = (c) => {
        ctx = c;
        c.source.connect(c.destination);
      };

      await new Promise<void>((done) => {
        sut.once('playbackstart', () => {
          expect(ctx).toBeDefined();
          expect(ctx!.audioContext).toBe(ex.AudioContextFactory.create());
          expect(ctx!.source).toBeInstanceOf(GainNode);
          expect(ctx!.bufferSource).toBeInstanceOf(AudioBufferSourceNode);
          expect(ctx!.destination).toBe(sut.output);
          expect(ctx!.track).toBe(sut.instances[0]);
          expect(sut.instances[0]).toBeInstanceOf(ex.SoundTrack);
          sut.stop();
          done();
        });
        sut.play();
      });
    });

    it('configures the source before the hook runs', async () => {
      sut = new ex.Sound({ paths: ['/src/spec/assets/images/sound-spec/preview.mp3'], loop: true, playbackRate: 2, pitch: 100 });
      await sut.load();
      let seen: { rate: number; detune: number; loop: boolean; trackRate: number } | undefined;
      sut.onPlay = ({ source, bufferSource, destination, track }) => {
        seen = {
          rate: bufferSource.playbackRate.value,
          detune: bufferSource.detune.value,
          loop: bufferSource.loop,
          trackRate: track.playbackRate
        };
        source.connect(destination);
      };

      await new Promise<void>((done) => {
        sut.once('playbackstart', () => {
          expect(seen).toEqual({ rate: 2, detune: 100, loop: true, trackRate: 2 });
          sut.stop();
          done();
        });
        sut.play();
      });
    });

    it('runs the hook again when a paused track resumes', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.loop = true;
      await sut.load();
      const hook = vi.fn(({ source, destination }: ex.AudioGraphContext) => {
        source.connect(destination);
      });
      sut.onPlay = hook;

      await playAndAwait('playbackstart');
      expect(hook).toHaveBeenCalledTimes(1);

      sut.pause();
      await playAndAwait('resume');
      expect(hook).toHaveBeenCalledTimes(2);
      expect(sut.instanceCount()).toBe(1);
      sut.stop();
    });

    it('uses a per-play hook for that track, including on resume', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.loop = true;
      await sut.load();
      const soundHook = vi.fn(({ source, destination }: ex.AudioGraphContext) => source.connect(destination));
      const playHook = vi.fn(({ source, destination }: ex.AudioGraphContext) => source.connect(destination));
      sut.onPlay = soundHook;

      await playAndAwait('playbackstart', { onPlay: playHook });
      sut.pause();
      await playAndAwait('resume');

      expect(playHook).toHaveBeenCalledTimes(2);
      expect(soundHook).not.toHaveBeenCalled();
      sut.stop();
    });

    it('never disconnects nodes the hook wired, so shared effects survive other tracks stopping', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.loop = true;
      await sut.load();
      const shared = ex.AudioContextFactory.create().createGain();
      const disconnect = vi.spyOn(shared, 'disconnect');
      sut.onPlay = ({ source, destination }) => {
        source.connect(shared).connect(destination);
      };

      await playAndAwait('playbackstart');
      await playAndAwait('playbackstart');
      expect(sut.instanceCount()).toBe(2);

      sut.instances[0].stop();
      expect(disconnect).not.toHaveBeenCalled();
      sut.stop();
      expect(disconnect).not.toHaveBeenCalled();
    });

    it('logs and falls back to the default graph if the hook throws', async () => {
      sut = new ex.Sound('/src/spec/assets/images/sound-spec/preview.mp3');
      sut.loop = true;
      await sut.load();
      const error = vi.spyOn(ex.Logger.getInstance(), 'error');
      sut.onPlay = () => {
        throw new Error('boom');
      };

      await new Promise<void>((done) => {
        sut.once('playbackstart', () => {
          expect(error).toHaveBeenCalled();
          expect(sut.isPlaying()).toBe(true);
          sut.stop();
          done();
        });
        sut.play();
      });
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

  describe('createFromBlob()', () => {
    let testBlob: Blob;
    let arrayBuffer: ArrayBuffer;
    let audioContext: AudioContext;
    let duration: number;
    let mockBuffer: AudioBuffer;

    beforeEach(() => {
      testBlob = new Blob();
      arrayBuffer = new ArrayBuffer(8);
      audioContext = new AudioContext();
      duration = 512;
      mockBuffer = vi.mockObject({
        duration,
        length: 1,
        numberOfChannels: 2,
        sampleRate: 3,
        copyFromChannel: vi.fn(),
        copyToChannel: vi.fn(),
        getChannelData: vi.fn()
      });

      vi.spyOn(testBlob, 'type', 'get').mockReturnValue('audio/ogg; coded=test');
      vi.spyOn(testBlob, 'arrayBuffer').mockReturnValue(Promise.resolve(arrayBuffer));
      vi.spyOn(ex.AudioContextFactory, 'create').mockReturnValue(audioContext);
      vi.spyOn(audioContext, 'decodeAudioData').mockReturnValue(Promise.resolve(mockBuffer));
    });

    it('Allows ogg type', () => {
      expect(canPlayMime('audio/ogg; codec=test')).toBe(true);
      expect(canPlayMime('audio/ogg')).toBe(true);
      expect(canPlayMime('audio/ogg;')).toBe(true);
    });

    it('Allows wav type', () => {
      expect(canPlayMime('audio/wav; coded=test')).toBe(true);
    });

    it('Allows mp3 type', () => {
      expect(canPlayMime('audio/mp3; coded=test')).toBe(true);
    });

    it('Warns for an unsupported type', () => {
      expect(canPlayMime('audio/unsupported; codec=test')).toBe(false);
      expect(canPlayMime('none')).toBe(false);
    });

    it('Creates an instance', async () => {
      const instance = await ex.Sound.fromBlob(testBlob);

      expect(instance).toBeDefined();
    });

    it('Populates relevant properties of the Sound instance', async () => {
      const instance = await ex.Sound.fromBlob(testBlob);

      expect(instance.data).toEqual(mockBuffer);
      expect(instance._duration).toEqual(duration);
    });
  });
});
