import * as ex from '@excalibur';
import { WebAudio } from '../../engine/util/web-audio';
import { page } from 'vitest/browser';

describe('A SoundManager', () => {
  it('exists', () => {
    expect(ex.SoundManager).toBeDefined();
  });

  it('can be constructed', () => {
    expect(() => {
      const sm = new ex.SoundManager({
        channels: ['test'],
        sounds: {
          snd: { sound: new ex.Sound('./../assets/images/sound-spec/test.mp3'), volume: 0.4, channels: ['test'] }
        }
      });
    }).not.toThrow();
  });

  it('can play sounds', async () => {
    const sm = new ex.SoundManager({
      channels: ['test'],
      sounds: {
        snd: { sound: new ex.Sound('./../assets/images/sound-spec/test.mp3'), volume: 0.4, channels: ['test'] }
      }
    });

    await sm.channel.play('test');
  });

  it('can sound volume', () => {
    const sound = new ex.Sound('./../assets/images/sound-spec/test.mp3');

    const sm = new ex.SoundManager({
      channels: ['test'],
      sounds: {
        snd: { sound, volume: 0.4, channels: ['test'] }
      }
    });

    expect(sm.getSounds().length).toBe(1);
    expect(sm.getSoundsForChannel('test').length).toBe(1);
    expect(sm.getVolume('snd')).toBe(0.4);
  });

  it('can play sound at configured sm volume', () => {
    const sound = new ex.Sound('./../assets/images/sound-spec/test.mp3');
    const spy = vi.spyOn(sound, 'play');
    spy.mockResolvedValue(true);

    const sm = new ex.SoundManager({
      channels: ['test'],
      sounds: {
        snd: { sound, volume: 0.4, channels: ['test'] }
      }
    });

    sm.play('snd');

    expect(sound.play).toHaveBeenCalledWith(0.4);
  });

  it('can edit channels', () => {
    const sound = new ex.Sound('./../assets/images/sound-spec/test.mp3');
    const sound2 = new ex.Sound('./../assets/images/sound-spec/test.mp3');
    const spy = vi.spyOn(sound, 'play');
    spy.mockResolvedValue(true);

    const spy2 = vi.spyOn(sound2, 'play');
    spy2.mockResolvedValue(true);

    const sm = new ex.SoundManager({
      channels: ['test', 'test2'],
      sounds: {
        snd1: { sound, volume: 0.4, channels: ['test'] },
        snd2: { sound: sound2, volume: 0.8, channels: ['test', 'test2'] }
      }
    });

    expect(sm.getSoundsForChannel('test')[0]).toEqual(sound);
    expect(sm.getSoundsForChannel('test')[1]).toEqual(sound2);
    expect(sm.getSoundsForChannel('test').length).toEqual(2);

    expect(sm.getSoundsForChannel('test3').length).toEqual(0);
    sm.addChannel('snd2', ['test3']);
    expect(sm.getSoundsForChannel('test3').length).toEqual(1);
    sm.removeChannel('snd2', ['test3']);

    sm.channel.play('test');
    sm.channel.play('test2');

    expect(sound.play).toHaveBeenCalledWith(0.4);
    expect(sound2.play).toHaveBeenCalledWith(0.8);
  });

  it('can override volume', () => {
    const sound = new ex.Sound('./../assets/images/sound-spec/test.mp3');
    const sound2 = new ex.Sound('./../assets/images/sound-spec/test.mp3');
    const spy = vi.spyOn(sound, 'play');
    spy.mockResolvedValue(true);

    const spy2 = vi.spyOn(sound2, 'play');
    spy2.mockResolvedValue(true);

    const sm = new ex.SoundManager({
      channels: ['test', 'test2'],
      sounds: {
        snd1: { sound, volume: 0.4, channels: ['test'] },
        snd2: { sound: sound2, volume: 0.8, channels: ['test', 'test2'] }
      }
    });

    expect(sm.getSoundsForChannel('test')[0]).toEqual(sound);
    expect(sm.getSoundsForChannel('test')[1]).toEqual(sound2);
    expect(sm.getSoundsForChannel('test').length).toEqual(2);
    expect(sm.getSoundsForChannel('test2')[0]).toEqual(sound2);
    expect(sm.getSoundsForChannel('test2').length).toEqual(1);

    sm.channel.play('test', 0.5);
    sm.channel.play('test2', 0.5);

    expect(sound.play).toHaveBeenCalledWith(0.2);
    expect(sound2.play).toHaveBeenCalledWith(0.4);
  });

  it('can add a new channel', () => {
    const sound = new ex.Sound('./../assets/images/sound-spec/test.mp3');
    const sound2 = new ex.Sound('./../assets/images/sound-spec/test.mp3');
    const spy = vi.spyOn(sound, 'play');
    spy.mockResolvedValue(true);

    const spy2 = vi.spyOn(sound2, 'play');
    spy2.mockResolvedValue(true);

    const sm = new ex.SoundManager({
      channels: ['test', 'test2'],
      sounds: {
        snd1: { sound, volume: 0.4, channels: ['test'] },
        snd2: { sound: sound2, volume: 0.8, channels: ['test', 'test2'] }
      }
    });

    expect(sm.getSoundsForChannel('test').length).toEqual(2);
    expect(sm.getSoundsForChannel('test2').length).toEqual(1);

    sm.addChannel('snd1', ['new-channel']);
    sm.addChannel('snd2', ['new-channel']);

    expect(sm.getSoundsForChannel('new-channel').length).toEqual(2);
  });
  describe('registration', () => {
    it('auto-names sounds from filenames in array form', () => {
      const coin = new ex.Sound('/sfx/coin.mp3');
      const jump = new ex.Sound({ name: 'jump', paths: ['/sfx/jump.ogg'] });
      const mgr = ex.createSoundManager({ sounds: [coin, jump] });
      expect(mgr.getSound('coin')).toBe(coin);
      expect(mgr.getSound('jump')).toBe(jump);
      expect(mgr.getSound(coin)).toBe(coin);
    });

    it('uses the record key as the name in record form', () => {
      const coin = new ex.Sound('/sfx/coin.mp3');
      const mgr = new ex.SoundManager({ sounds: { myKey: coin } });
      expect(mgr.getSound('myKey')).toBe(coin);
      expect(mgr.getSound('coin')).toBeUndefined();
    });

    it('supports track(sound), track(config) and track(name, sound)', () => {
      const mgr = ex.createSoundManager({ sounds: [] });
      const coin = new ex.Sound('/sfx/coin.mp3');
      mgr.track(coin);
      expect(mgr.getSound('coin')).toBe(coin);

      const named = new ex.Sound('/sfx/named.mp3');
      mgr.track({ sound: named, name: 'other', volume: 0.5, channels: ['sfx'] });
      expect(mgr.getSound('other')).toBe(named);
      expect(mgr.getVolume(named)).toBe(0.5);
      expect(mgr.getSoundsForChannel('sfx')).toEqual([named]);

      const alias = new ex.Sound('/sfx/alias.mp3');
      mgr.track('aliased', alias);
      expect(mgr.getSound('aliased')).toBe(alias);
    });

    it('resolves bare-Sound overloads by identity so aliases work', () => {
      const coin = new ex.Sound('/sfx/coin.mp3'); // coin.name === 'coin'
      const mgr = ex.createSoundManager({ sounds: [] });
      mgr.track('gold', coin);

      expect(mgr.getSound(coin)).toBe(coin);
      expect(mgr.getSound('gold')).toBe(coin);
      expect(mgr.getSound('coin')).toBeUndefined();

      mgr.setVolume(coin, 0.25);
      expect(mgr.getVolume(coin)).toBeCloseTo(0.25, 5);
      expect(coin.volume).toBeCloseTo(0.25, 5);

      mgr.untrack(coin);
      expect(mgr.getSound('gold')).toBeUndefined();
      expect(mgr.getSounds()).toEqual([]);
    });

    it('untrack removes the sound from its channels', () => {
      const coin = new ex.Sound('/sfx/coin.mp3');
      const mgr = ex.createSoundManager({ channels: ['sfx'], sounds: [{ sound: coin, channels: ['sfx'] }] });
      expect(mgr.getSoundsForChannel('sfx')).toEqual([coin]);
      mgr.untrack('coin');
      expect(mgr.getSoundsForChannel('sfx')).toEqual([]);
    });

    it('removeChannel leaves the channel alone for a sound that is not in it', () => {
      const coin = new ex.Sound('/sfx/coin.mp3');
      const jump = new ex.Sound('/sfx/jump.mp3');
      const mgr = ex.createSoundManager({ channels: ['sfx'], sounds: [{ sound: coin, channels: ['sfx'] }, jump] });
      mgr.removeChannel('jump', ['sfx']);
      expect(mgr.getSoundsForChannel('sfx')).toEqual([coin]);
      mgr.removeChannel('coin', ['sfx', 'nope']);
      expect(mgr.getSoundsForChannel('sfx')).toEqual([]);
    });

    it('createSoundManager infers the sound name and channel unions (compile-time)', () => {
      const coin = ex.createSound('/sfx/coin.mp3');
      const mgr = ex.createSoundManager({
        channels: ['sfx'],
        sounds: [coin, { sound: ex.createSound('/sfx/jump.mp3'), channels: ['sfx'] }]
      });
      mgr.play('coin');
      mgr.play('jump');
      mgr.channel.play('sfx');
      // @ts-expect-error not a registered sound
      void mgr.play('coinn');
      // @ts-expect-error not a declared channel
      void mgr.channel.play('sfxx');
      void ex.createSoundManager({
        channels: ['sfx'],
        // @ts-expect-error not a declared channel
        sounds: [{ sound: coin, channels: ['musik'] }]
      });
      void new ex.SoundManager({
        channels: ['sfx'],
        // @ts-expect-error not a declared channel
        sounds: { coin: { sound: coin, channels: ['musik'] } }
      });
      mgr.stop();
    });
  });

  describe('mute', () => {
    it('does not start sounds that were not playing when unmuted', () => {
      const sound = new ex.Sound('./../assets/images/sound-spec/test.mp3');
      const play = vi.spyOn(sound, 'play').mockResolvedValue(true);
      const mgr = ex.createSoundManager({ sounds: [sound] });

      mgr.mute();
      expect(mgr.isMuted(sound)).toBe(true);
      mgr.unmute();
      expect(mgr.isMuted(sound)).toBe(false);
      expect(play).not.toHaveBeenCalled();

      mgr.toggle();
      mgr.toggle();
      expect(play).not.toHaveBeenCalled();
    });

    it('drops plays of muted sounds', async () => {
      const sound = new ex.Sound('./../assets/images/sound-spec/test.mp3');
      const play = vi.spyOn(sound, 'play').mockResolvedValue(true);
      const mgr = ex.createSoundManager({ sounds: [sound] });
      mgr.mute(sound);
      expect(await mgr.play('test')).toBe(false);
      expect(play).not.toHaveBeenCalled();
    });
  });

  describe('channel volume', () => {
    it('sets the mix of every sound in the channel', () => {
      const sound = new ex.Sound('./../assets/images/sound-spec/test.mp3');
      const sound2 = new ex.Sound('./../assets/images/sound-spec/test.mp3');
      vi.spyOn(sound, 'play').mockResolvedValue(true);
      vi.spyOn(sound2, 'play').mockResolvedValue(true);
      const sm = new ex.SoundManager({
        channels: ['background', 'other'],
        sounds: {
          snd1: { sound, volume: 0.4, channels: ['background'] },
          snd2: { sound: sound2, volume: 0.8, channels: ['other'] }
        }
      });

      sm.channel.setVolume('background', 0.2);
      expect(sm.getVolume('snd1')).toBeCloseTo(0.2);
      expect(sm.getVolume('snd2')).toBeCloseTo(0.8);
      sm.play('snd1');
      expect(sound.play).toHaveBeenCalledWith(expect.closeTo(0.2, 5));
    });
  });

  describe('maxConcurrentTracks', () => {
    const PREVIEW = '/src/spec/assets/images/sound-spec/preview.mp3';
    const TEST = '/src/spec/assets/images/sound-spec/test.mp3';

    beforeAll(async () => {
      await page.elementLocator(document.body).click();
      ex.Logger.getInstance().clearAppenders();
      await WebAudio.unlock();
    });

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
          const result = await mgr.play('test');
          expect(result).toBe(false);
          expect(s2.instanceCount()).toBe(0);
          expect(mgr.playingCount()).toBe(1);
          mgr.stop();
          done();
        });
        mgr.play('preview');
      });
    });

    it('does not count paused (muted) tracks toward the cap', async () => {
      const s1 = new ex.Sound(PREVIEW);
      const s2 = new ex.Sound(TEST);
      s1.loop = true;
      s2.loop = true;
      await s1.load();
      await s2.load();

      const mgr = ex.createSoundManager({ sounds: [s1, s2], maxConcurrentTracks: 1 });

      await new Promise<void>((done) => {
        s1.once('playbackstart', () => {
          mgr.mute(s1);
          expect(s1.isPaused()).toBe(true);
          expect(mgr.playingCount()).toBe(0);

          s2.once('playbackstart', () => {
            expect(s2.isPlaying()).toBe(true);
            mgr.stop();
            done();
          });
          void mgr.play('test');
        });
        mgr.play('preview');
      });
    });
  });
});
