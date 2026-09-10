import * as ex from '@excalibur';
import { WebAudio } from '../../engine/util/web-audio';
import { TestUtils } from '../__util__/test-utils';
import { page } from 'vitest/browser';

const TEST = '/src/spec/assets/images/sound-spec/test.mp3';
const PREVIEW = '/src/spec/assets/images/sound-spec/preview.mp3';

describe('A SoundManager', () => {
  let audioContext: AudioContext;

  beforeAll(async () => {
    // automate user interaction to allow WebAudio to unlock
    await page.elementLocator(document.body).click();
    ex.Logger.getInstance().clearAppenders();
    await WebAudio.unlock();
  });

  beforeEach(() => {
    audioContext = ex.AudioContextFactory.create();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Spy on connect() of every gain node created from here on, returns the created nodes
   */
  const captureGains = () => {
    const created: GainNode[] = [];
    const createGain = audioContext.createGain.bind(audioContext);
    vi.spyOn(audioContext, 'createGain').mockImplementation(() => {
      const gain = createGain();
      vi.spyOn(gain, 'connect');
      vi.spyOn(gain, 'disconnect');
      created.push(gain);
      return gain;
    });
    return created;
  };

  it('exists', () => {
    expect(ex.SoundManager).toBeDefined();
    expect(ex.SoundChannel).toBeDefined();
  });

  it('can be constructed', () => {
    expect(() => {
      const sm = new ex.SoundManager({
        channels: ['test'],
        sounds: {
          snd: { sound: new ex.Sound(TEST), volume: 0.4, channel: 'test' }
        }
      });
      void sm;
    }).not.toThrow();
  });

  describe('mixer graph', () => {
    it('routes sound → mix → channel → master → speakers', () => {
      const sound = new ex.Sound(TEST);
      const soundOutput = sound.output;
      vi.spyOn(soundOutput, 'connect');
      vi.spyOn(soundOutput, 'disconnect');
      const gains = captureGains();

      const sm = new ex.SoundManager({
        channels: ['sfx'],
        sounds: { snd: { sound, volume: 0.4, channel: 'sfx' } }
      });
      const sfx = sm.getChannel('sfx');
      const [masterInput, master, channelInput, channelOutput, mix] = gains;

      expect(masterInput).toBe(sm.input);
      expect(master).toBe(sm.output);
      expect(masterInput.connect).toHaveBeenCalledWith(master);
      expect(master.connect).toHaveBeenCalledWith(audioContext.destination);
      expect(channelInput).toBe(sfx.input);
      expect(channelOutput).toBe(sfx.output);
      expect(channelInput.connect).toHaveBeenCalledWith(channelOutput);
      expect(channelOutput.connect).toHaveBeenCalledWith(masterInput);

      expect(soundOutput.disconnect).toHaveBeenCalled();
      expect(soundOutput.connect).toHaveBeenCalledWith(mix);
      expect(mix.connect).toHaveBeenCalledWith(channelInput);
      expect(mix.gain.value).toBeCloseTo(0.4);
      expect(sfx.sounds).toEqual([sound]);
    });

    it('routes sounds without a channel straight to the master output', () => {
      const sound = new ex.Sound(TEST);
      const gains = captureGains();
      const sm = ex.createSoundManager({ sounds: [sound] });
      const [masterInput, , mix] = gains;
      expect(mix.connect).toHaveBeenCalledWith(masterInput);
      expect(sm.getChannels()).toEqual([]);
    });

    it('creates declared channels eagerly and others on first use', () => {
      const sm = ex.createSoundManager({ channels: ['music', 'sfx'], sounds: [] });
      expect(sm.getChannels().map((c) => c.name)).toEqual(['music', 'sfx']);
      const music = sm.getChannel('music');
      expect(sm.channel.get('music')).toBe(music);
      expect(music).toBeInstanceOf(ex.SoundChannel);
      expect(music.audioContext).toBe(audioContext);
    });

    it('moves a sound between channels with setChannel', () => {
      const sound = new ex.Sound(TEST);
      void sound.output; // create the sound's own gain before capturing the manager's
      const gains = captureGains();
      const sm = ex.createSoundManager({ channels: ['music', 'sfx'], sounds: [{ sound, channel: 'music' }] });
      const mix = gains[gains.length - 1];

      expect(sm.getSoundsForChannel('music')).toEqual([sound]);
      sm.setChannel(sound, 'sfx');
      expect(sm.getSoundsForChannel('music')).toEqual([]);
      expect(sm.getSoundsForChannel('sfx')).toEqual([sound]);
      expect(mix.disconnect).toHaveBeenCalled();
      expect(mix.connect).toHaveBeenLastCalledWith(sm.getChannel('sfx').input);

      sm.setChannel('test', undefined);
      expect(sm.getSoundsForChannel('sfx')).toEqual([]);
      expect(mix.connect).toHaveBeenLastCalledWith(sm.input);
    });

    it('restores a sound to the speakers when untracked', () => {
      const sound = new ex.Sound(TEST);
      const soundOutput = sound.output;
      vi.spyOn(soundOutput, 'connect');
      const sm = ex.createSoundManager({ channels: ['sfx'], sounds: [{ sound, channel: 'sfx' }] });

      sm.untrack(sound);
      expect(soundOutput.connect).toHaveBeenLastCalledWith(audioContext.destination);
      expect(sm.getSounds()).toEqual([]);
      expect(sm.getSoundsForChannel('sfx')).toEqual([]);
      expect(sm.getSound('test')).toBeUndefined();
    });

    it('re-routes a sound that is tracked by a second manager', () => {
      const sound = new ex.Sound(TEST);
      const first = ex.createSoundManager({ channels: ['a'], sounds: [{ sound, channel: 'a' }] });
      const second = ex.createSoundManager({ channels: ['b'], sounds: [{ sound, channel: 'b' }] });
      expect(first.getSoundsForChannel('a')).toEqual([sound]);
      expect(second.getSoundsForChannel('b')).toEqual([sound]);
      // the sound's output only feeds the most recent manager
      first.untrack(sound);
      expect(second.getSound('test')).toBe(sound);
    });
  });

  describe('volume and mute', () => {
    it('tracks mix, channel and master volumes separately from Sound.volume', () => {
      const sound = new ex.Sound(TEST);
      const sm = new ex.SoundManager({
        volume: 0.8,
        channels: ['test'],
        sounds: { snd: { sound, volume: 0.4, channel: 'test' } }
      });

      expect(sm.volume).toBe(0.8);
      expect(sm.getVolume('snd')).toBe(0.4);
      expect(sm.channel.getVolume('test')).toBe(1);
      expect(sound.volume).toBe(1);

      sm.setVolume('snd', 0.2);
      sm.channel.setVolume('test', 0.5);
      sm.volume = 2;
      expect(sm.getVolume('snd')).toBeCloseTo(0.2);
      expect(sm.getChannel('test').volume).toBe(0.5);
      expect(sm.volume).toBe(1);
      expect(sound.volume, 'the mixer never writes Sound.volume').toBe(1);
    });

    it('passes the play options through to the sound untouched', () => {
      const sound = new ex.Sound(TEST);
      const start = vi.spyOn(sound, 'start').mockReturnValue(undefined);
      const sm = new ex.SoundManager({
        channels: ['test'],
        sounds: { snd: { sound, volume: 0.4, channel: 'test' } }
      });

      sm.play('snd');
      expect(start).toHaveBeenLastCalledWith(undefined);
      sm.play('snd', 0.5);
      expect(start).toHaveBeenLastCalledWith(0.5);
      sm.channel.play('test', { volume: 0.25, pitch: 100 });
      expect(start).toHaveBeenLastCalledWith({ volume: 0.25, pitch: 100 });
      sm.start('snd', { loop: true });
      expect(start).toHaveBeenLastCalledWith({ loop: true });
    });

    it('composes sound, channel and master mutes', () => {
      const sound = new ex.Sound(TEST);
      const other = new ex.Sound(PREVIEW);
      const sm = ex.createSoundManager({
        channels: ['music', 'sfx'],
        sounds: [
          { sound, channel: 'music' },
          { sound: other, channel: 'sfx' }
        ]
      });

      expect(sm.isMuted(sound)).toBe(false);
      sm.mute(sound);
      expect(sm.isMuted('test')).toBe(true);
      expect(sm.isMuted(other)).toBe(false);
      sm.unmute(sound);
      expect(sm.isMuted(sound)).toBe(false);

      sm.channel.mute('music');
      expect(sm.channel.isMuted('music')).toBe(true);
      expect(sm.isMuted(sound)).toBe(true);
      expect(sm.isMuted(other)).toBe(false);
      sm.channel.toggle('music');
      expect(sm.isMuted(sound)).toBe(false);

      sm.mute();
      expect(sm.muted).toBe(true);
      expect(sm.isMuted(sound)).toBe(true);
      expect(sm.isMuted(other)).toBe(true);
      sm.toggle();
      expect(sm.muted).toBe(false);
      expect(sm.isMuted(other)).toBe(false);

      sm.toggle(sound);
      expect(sm.isMuted(sound)).toBe(true);
      sm.toggle(sound);
      expect(sm.isMuted(sound)).toBe(false);
    });

    it('keeps playing (silently) while muted and never pauses or starts sounds', async () => {
      const sound = new ex.Sound(TEST);
      const start = vi.spyOn(sound, 'start').mockReturnValue({ done: Promise.resolve(true) } as any);
      const pause = vi.spyOn(sound, 'pause');
      const sm = ex.createSoundManager({ sounds: [sound] });

      sm.mute();
      expect(await sm.play('test')).toBe(true);
      expect(start).toHaveBeenCalledTimes(1);
      expect(pause).not.toHaveBeenCalled();

      sm.unmute();
      sm.toggle();
      sm.toggle();
      expect(start).toHaveBeenCalledTimes(1);
    });

    it('stops every sound in a channel', () => {
      const sound = new ex.Sound(TEST);
      const other = new ex.Sound(PREVIEW);
      const stop = vi.spyOn(sound, 'stop');
      const otherStop = vi.spyOn(other, 'stop');
      const sm = ex.createSoundManager({
        channels: ['music', 'sfx'],
        sounds: [
          { sound, channel: 'music' },
          { sound: other, channel: 'sfx' }
        ]
      });
      sm.channel.stop('music');
      expect(stop).toHaveBeenCalled();
      expect(otherStop).not.toHaveBeenCalled();
      sm.stop();
      expect(otherStop).toHaveBeenCalled();
    });
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
      const mgr = ex.createSoundManager({ channels: ['sfx'], sounds: [] });
      const coin = new ex.Sound('/sfx/coin.mp3');
      mgr.track(coin);
      expect(mgr.getSound('coin')).toBe(coin);

      const named = new ex.Sound('/sfx/named.mp3');
      mgr.track({ sound: named, name: 'other', volume: 0.5, channel: 'sfx' });
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

      mgr.untrack(coin);
      expect(mgr.getSound('gold')).toBeUndefined();
      expect(mgr.getSounds()).toEqual([]);
    });

    it('createSoundManager infers the sound name and channel unions (compile-time)', () => {
      const coin = ex.createSound('/sfx/coin.mp3');
      const mgr = ex.createSoundManager({
        channels: ['sfx', { name: 'music', volume: 0.5 }],
        sounds: [
          coin,
          { sound: ex.createSound('/sfx/jump.mp3'), channel: 'sfx' },
          { sound: ex.createSound('/theme.mp3'), channel: 'music' }
        ]
      });
      mgr.play('coin');
      mgr.play('jump', { volume: 0.5 });
      mgr.channel.play('sfx');
      mgr.getChannel('sfx');
      mgr.getChannel('music');
      mgr.start('theme');
      // @ts-expect-error not a registered sound
      void mgr.play('coinn');
      // @ts-expect-error not a declared channel
      void mgr.channel.play('sfxx');
      // @ts-expect-error not a declared channel
      void mgr.getChannel('sfxx');
      void ex.createSoundManager({
        channels: ['sfx'],
        // @ts-expect-error not a declared channel
        sounds: [{ sound: coin, channel: 'musik' }]
      });
      void new ex.SoundManager({
        channels: ['sfx'],
        // @ts-expect-error not a declared channel
        sounds: { coin: { sound: coin, channel: 'musik' } }
      });
      mgr.stop();
    });
  });

  describe('loading', () => {
    it('is Loadable and loads every managed sound', async () => {
      const s1 = new ex.Sound(TEST);
      const s2 = new ex.Sound(PREVIEW);
      const mgr = ex.createSoundManager({ sounds: [s1, s2] });
      expect(mgr.isLoaded()).toBe(false);

      const data = await mgr.load();
      expect(mgr.isLoaded()).toBe(true);
      expect(mgr.data).toBe(data);
      expect(data.length).toBe(2);
      expect(s1.isLoaded()).toBe(true);
      expect(s2.isLoaded()).toBe(true);
    });

    it('wires every sound to the engine, including sounds tracked later', () => {
      const engine = TestUtils.engine();
      try {
        const s1 = new ex.Sound(TEST);
        const s2 = new ex.Sound(PREVIEW);
        const wire1 = vi.spyOn(s1, 'wireEngine');
        const wire2 = vi.spyOn(s2, 'wireEngine');
        const mgr = ex.createSoundManager({ sounds: [s1] });

        mgr.wireEngine(engine);
        expect(wire1).toHaveBeenCalledWith(engine);

        mgr.track(s2);
        expect(wire2).toHaveBeenCalledWith(engine);
      } finally {
        engine.dispose();
      }
    });

    it('can be added to a loader', () => {
      const mgr = ex.createSoundManager({ sounds: [new ex.Sound(TEST)] });
      const loader = new ex.DefaultLoader();
      loader.addResource(mgr);
      expect(loader.resources).toContain(mgr);
    });
  });

  describe('bus wiring hooks', () => {
    it('wires a channel through its onConnect hook instead of the default edge', () => {
      const onConnect = vi.fn(({ input, output, audioContext: ctx }: ex.AudioBusContext) => {
        const filter = ctx.createBiquadFilter();
        input.connect(filter).connect(output);
      });
      const gains = captureGains();
      const sm = ex.createSoundManager({
        channels: [{ name: 'music', volume: 0.5, maxConcurrentTracks: 2, onConnect }],
        sounds: []
      });
      const music = sm.getChannel('music');
      expect(onConnect).toHaveBeenCalledWith({ audioContext, input: music.input, output: music.output });
      expect(music.input.connect).not.toHaveBeenCalledWith(music.output);
      expect(music.volume).toBe(0.5);
      expect(music.output.gain.value).toBeCloseTo(0.5);
      expect(music.maxConcurrentTracks).toBe(2);
      expect(gains).toContain(music.input);
    });

    it('wires the master bus through the manager onConnect hook', () => {
      const onConnect = vi.fn(({ input, output }: ex.AudioBusContext) => input.connect(output));
      captureGains();
      const sm = ex.createSoundManager({ onConnect, sounds: [] });
      expect(onConnect).toHaveBeenCalledWith({ audioContext, input: sm.input, output: sm.output });
      expect(sm.input.connect).toHaveBeenCalledTimes(1);
    });

    it('logs and falls back to the default edge when a hook throws', () => {
      const error = vi.spyOn(ex.Logger.getInstance(), 'error');
      captureGains();
      const sm = ex.createSoundManager({
        channels: [
          {
            name: 'music',
            onConnect: () => {
              throw new Error('boom');
            }
          }
        ],
        sounds: []
      });
      const music = sm.getChannel('music');
      expect(error).toHaveBeenCalled();
      expect(music.input.connect).toHaveBeenCalledWith(music.output);
    });
  });

  describe('channel maxConcurrentTracks and voice stealing', () => {
    it('drops plays over the channel cap', async () => {
      const s1 = new ex.Sound(PREVIEW);
      const s2 = new ex.Sound(TEST);
      const mgr = ex.createSoundManager({
        channels: [{ name: 'sfx', maxConcurrentTracks: 1 }, 'music'],
        sounds: [
          { sound: s1, channel: 'sfx' },
          { sound: s2, channel: 'music' }
        ]
      });
      await mgr.load();

      const first = mgr.start('preview', { loop: true })!;
      expect(first).toBeInstanceOf(ex.SoundTrack);
      expect(mgr.getChannel('sfx').playingCount()).toBe(1);
      expect(mgr.start('preview'), 'over the sfx cap').toBeUndefined();
      expect(mgr.start('test', { loop: true }), 'music channel is not capped').toBeInstanceOf(ex.SoundTrack);
      expect(first.isPlaying()).toBe(true);
      mgr.stop();
    });

    it('stops the oldest track in scope to make room when voiceStealing is on', async () => {
      const s1 = new ex.Sound(PREVIEW);
      const s2 = new ex.Sound(TEST);
      const mgr = ex.createSoundManager({
        voiceStealing: true,
        maxConcurrentTracks: 2,
        channels: [{ name: 'sfx', maxConcurrentTracks: 1 }, 'music'],
        sounds: [
          { sound: s1, channel: 'sfx' },
          { sound: s2, channel: 'music' }
        ]
      });
      await mgr.load();

      const oldest = mgr.start('preview', { loop: true })!;
      const newer = mgr.start('preview', { loop: true })!;
      expect(newer).toBeDefined();
      expect(oldest.isStopped(), 'stolen by the channel cap').toBe(true);
      expect(newer.isPlaying()).toBe(true);
      expect(mgr.getChannel('sfx').playingCount()).toBe(1);

      const music = mgr.start('test', { loop: true })!;
      expect(mgr.playingCount()).toBe(2);
      const second = mgr.start('test', { loop: true })!;
      expect(second).toBeDefined();
      expect(newer.isStopped(), 'the manager cap steals the oldest across channels').toBe(true);
      expect(music.isPlaying()).toBe(true);
      expect(second.isPlaying()).toBe(true);
      expect(mgr.playingCount()).toBe(2);
      mgr.stop();
    });
  });

  describe('maxConcurrentTracks', () => {
    it('drops new plays across sounds once the manager cap is reached', async () => {
      const s1 = new ex.Sound(PREVIEW);
      const s2 = new ex.Sound(TEST);
      s1.loop = true;
      s2.loop = true;
      const mgr = ex.createSoundManager({ sounds: [s1, s2], maxConcurrentTracks: 1 });
      await mgr.load();

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

    it('does not count paused tracks toward the cap', async () => {
      const s1 = new ex.Sound(PREVIEW);
      const s2 = new ex.Sound(TEST);
      s1.loop = true;
      s2.loop = true;
      const mgr = ex.createSoundManager({ sounds: [s1, s2], maxConcurrentTracks: 1 });
      await mgr.load();

      await new Promise<void>((done) => {
        s1.once('playbackstart', () => {
          s1.pause();
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
