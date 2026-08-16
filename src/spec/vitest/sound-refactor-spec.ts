import * as ex from '@excalibur';
import { page } from 'vitest/browser';

const PREVIEW = '/src/spec/assets/images/sound-spec/preview.mp3';
const TEST = '/src/spec/assets/images/sound-spec/test.mp3';

describe('Sound refactor: names, pitch, limiter, onPlay, SoundManager', () => {
  beforeAll(async () => {
    // automate user interaction to allow WebAudio to unlock
    await page.elementLocator(document.body).click();
    ex.Logger.getInstance().clearAppenders();
    await ex.WebAudio.unlock();
  });

  describe('name inference & derivation', () => {
    it('derives name from basename-without-extension', () => {
      expect(new ex.Sound('/sfx/coin.mp3').name).toBe('coin');
      expect(new ex.Sound('/a/b/c.mp3?v=2').name).toBe('c');
      expect(new ex.Sound('/x/coin.f74d9d70.mp3').name).toBe('coin.f74d9d70');
      expect(new ex.Sound('c.wav').name).toBe('c');
    });

    it('uses an explicit name option', () => {
      expect(new ex.Sound({ name: 'jump', paths: ['/x/jump.ogg'] }).name).toBe('jump');
    });

    it('infers the name option via the class generic (new Sound)', () => {
      const jump = new ex.Sound({ name: 'jump', paths: ['/x/jump.ogg'] });
      const _check: 'jump' = jump.name;
      void _check;
    });

    it('createSound infers the name from a path literal', () => {
      const coin = ex.createSound('/sfx/coin.mp3');
      expect(coin.name).toBe('coin');
      const _check: 'coin' = coin.name;
      void _check;
    });

    it('getSoundName returns the sound name', () => {
      const s = new ex.Sound('/sfx/coin.mp3');
      expect(ex.getSoundName(s)).toBe('coin');
    });
  });

  describe('Sound defaults', () => {
    it('has pitch 0 and unbounded maxConcurrentTracks by default', () => {
      const s = new ex.Sound('/x/coin.mp3');
      expect(s.pitch).toBe(0);
      expect(s.maxConcurrentTracks).toBeUndefined();
    });

    it('accepts pitch and maxConcurrentTracks options', () => {
      const s = new ex.Sound({ paths: ['/x/coin.mp3'], pitch: 100, maxConcurrentTracks: 3 });
      expect(s.pitch).toBe(100);
      expect(s.maxConcurrentTracks).toBe(3);
    });
  });

  describe('SoundManager auto-integration', () => {
    it('auto-names sounds from filenames in array form', () => {
      const coin = new ex.Sound('/sfx/coin.mp3');
      const jump = new ex.Sound({ name: 'jump', paths: ['/sfx/jump.ogg'] });
      const mgr = ex.createSoundManager({ sounds: [coin, jump] });
      expect(mgr.getSound('coin')).toBe(coin);
      expect(mgr.getSound('jump')).toBe(jump);
    });

    it('accepts a bare Sound in getSound', () => {
      const coin = new ex.Sound('/sfx/coin.mp3');
      const mgr = ex.createSoundManager({ sounds: [coin] });
      expect(mgr.getSound(coin)).toBe(coin);
    });

    it('supports bare-Sound overloads on control methods without throwing (unloaded)', () => {
      const coin = new ex.Sound('/sfx/coin.mp3');
      const mgr = ex.createSoundManager({ sounds: [coin] });
      expect(() => {
        mgr.setVolume(coin, 0.5);
        mgr.getVolume(coin);
        mgr.mute(coin);
        mgr.unmute(coin);
        mgr.toggle(coin);
        mgr.stop(coin);
      }).not.toThrow();
    });

    it('support track(sound) and track(name, sound) overloads', () => {
      const mgr = ex.createSoundManager({ sounds: [] });
      const coin = new ex.Sound('/sfx/coin.mp3');
      mgr.track(coin);
      expect(mgr.getSound('coin')).toBe(coin);

      const alias = new ex.Sound('/sfx/alias.mp3');
      mgr.track('alias', alias);
      expect(mgr.getSound('alias')).toBe(alias);
    });

    it('auto-names via the record form using the record key', () => {
      const coin = new ex.Sound('/sfx/coin.mp3');
      const mgr = new ex.SoundManager({ sounds: { myKey: coin } });
      expect(mgr.getSound('myKey')).toBe(coin);
    });

    it('createSoundManager infers the name union (compile-time)', () => {
      const coin = ex.createSoundManager({ sounds: [ex.createSound('/sfx/coin.mp3')] });
      // The following compiles only because 'coin' is in the inferred name union:
      coin.play('coin');
      // coin.play('coinn'); // would be a compile error
      void coin;
    });
  });

  describe('pitch fan-out', () => {
    it('applies pitch to the playing track', async () => {
      const sut = new ex.Sound(PREVIEW);
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
      const sut = new ex.Sound(PREVIEW);
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
  });

  describe('per-sound maxConcurrentTracks', () => {
    it('drops new plays once the cap is reached', async () => {
      const sut = new ex.Sound(PREVIEW);
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
      const sut = new ex.Sound(PREVIEW);
      sut.loop = true;
      await sut.load();

      await new Promise<void>((done) => {
        sut.once('playbackstart', () => {
          // a second simultaneous play is allowed (default unbounded); track is
          // pushed synchronously so instanceCount is 2 immediately.
          sut.play();
          expect(sut.instanceCount()).toBe(2);
          sut.stop();
          done();
        });
        sut.play();
      });
    });
  });

  describe('SoundManager maxConcurrentTracks', () => {
    it('drops new plays across sounds once the manager cap is reached', async () => {
      const s1 = new ex.Sound(PREVIEW);
      const s2 = new ex.Sound(TEST);
      s1.loop = true;
      s2.loop = true;
      await s1.load();
      await s2.load();

      const mgr = ex.createSoundManager({ sounds: [s1, s2], maxConcurrentTracks: 1 });

      await new Promise<void>((done) => {
        s1.once('playbackstart', async () => {
          expect(s1.instanceCount()).toBe(1);
          // s2 should be dropped by the manager cap (returns false)
          const result = await mgr.play('test');
          expect(result).toBe(false);
          expect(s2.instanceCount()).toBe(0);
          expect(s1.instanceCount()).toBe(1);
          mgr.stop();
          done();
        });
        mgr.play('preview'); // starts s1
      });
    });
  });

  describe('SoundManager bare-Sound alias resolution (bug regression)', () => {
    it('tracks a sound under an alias and resolves bare-Sound overloads by identity', () => {
      const coin = new ex.Sound('/sfx/coin.mp3'); // coin.name === 'coin'
      const mgr = ex.createSoundManager({ sounds: [] });
      mgr.track('gold', coin); // registered under 'gold', not 'coin'

      // bare-Sound lookup should find it (identity-based, not name-based)
      expect(mgr.getSound(coin)).toBe(coin);
      expect(mgr.getSound('gold')).toBe(coin);
      expect(mgr.getSound('coin')).toBeUndefined(); // not registered under its own name

      // setVolume(coin) updates the manager mix (visible via getVolume('gold'))
      mgr.setVolume(coin, 0.25);
      expect(mgr.getVolume('gold')).toBeCloseTo(0.25, 5);

      // untrack(coin) removes the alias entirely; getSound('gold') is now undefined.
      // getSound(coin) returns the sound itself (passthrough), so check by name.
      mgr.untrack(coin);
      expect(mgr.getSound('gold')).toBeUndefined();
      expect(mgr.getSound('coin')).toBeUndefined();
    });
  });

  describe('onPlay custom node graph', () => {
    it('inserts a single returned node into the graph', async () => {
      const sut = new ex.Sound(PREVIEW);
      sut.loop = true;
      await sut.load();
      let built = false;
      sut.onPlay = ({ audioContext }) => {
        built = true;
        return audioContext.createBiquadFilter();
      };

      await new Promise<void>((done) => {
        sut.once('playbackstart', () => {
          expect(built).toBe(true);
          expect(sut.instanceCount()).toBe(1);
          sut.stop();
          done();
        });
        sut.play();
      });
    });

    it('inserts an {input, output} chain', async () => {
      const sut = new ex.Sound(PREVIEW);
      sut.loop = true;
      await sut.load();
      let built = false;
      sut.onPlay = ({ audioContext }) => {
        built = true;
        const input = audioContext.createGain();
        const output = audioContext.createGain();
        return { input, output };
      };

      await new Promise<void>((done) => {
        sut.once('playbackstart', () => {
          expect(built).toBe(true);
          sut.stop();
          done();
        });
        sut.play();
      });
    });

    it('falls back to default graph if the builder is omitted', async () => {
      const sut = new ex.Sound(PREVIEW);
      sut.loop = true;
      await sut.load();

      await new Promise<void>((done) => {
        sut.once('playbackstart', () => {
          expect(sut.instanceCount()).toBe(1);
          sut.stop();
          done();
        });
        sut.play();
      });
    });
  });
});
