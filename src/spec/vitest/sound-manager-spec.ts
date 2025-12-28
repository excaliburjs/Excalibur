import * as ex from '@excalibur';

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
});
