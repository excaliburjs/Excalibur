import * as ex from '@excalibur';

describe('A SoundManager', () => {
  it('exists', () => {
    expect(ex.SoundManger).toBeDefined();
  });

  it('can be constructed', () => {
    expect(() => {
      const sm = new ex.SoundManger({
        channels: ['test'],
        sounds: [{ sound: new ex.Sound('./../assets/images/SoundSpec/test.mp3'), volume: 0.4, channels: ['test'] }]
      });
    }).not.toThrow();
  });

  it('can play sounds', async () => {
    const sm = new ex.SoundManger({
      channels: ['test'],
      sounds: [{ sound: new ex.Sound('./../assets/images/SoundSpec/test.mp3'), volume: 0.4, channels: ['test'] }]
    });

    await sm.play(['test']);
  });

  it('can sound volume', () => {
    const sound = new ex.Sound('./../assets/images/SoundSpec/test.mp3');

    const sm = new ex.SoundManger({
      channels: ['test'],
      sounds: [{ sound, volume: 0.4, channels: ['test'] }]
    });

    expect(sm.getSounds().length).toBe(1);
    expect(sm.getSoundsForChannel('test').length).toBe(1);
    expect(sm.getVolume(sound)).toBe(0.4);
  });

  it('can play sound at configured sm volume', () => {
    const sound = new ex.Sound('./../assets/images/SoundSpec/test.mp3');
    const spy = vi.spyOn(sound, 'play');
    spy.mockResolvedValue(true);

    const sm = new ex.SoundManger({
      channels: ['test'],
      sounds: [{ sound, volume: 0.4, channels: ['test'] }]
    });

    sm.play(sound);

    expect(sound.play).toHaveBeenCalledWith(0.4);
  });

  it('can edit channels', () => {
    const sound = new ex.Sound('./../assets/images/SoundSpec/test.mp3');
    const sound2 = new ex.Sound('./../assets/images/SoundSpec/test.mp3');
    const spy = vi.spyOn(sound, 'play');
    spy.mockResolvedValue(true);

    const spy2 = vi.spyOn(sound2, 'play');
    spy2.mockResolvedValue(true);

    const sm = new ex.SoundManger({
      channels: ['test', 'test2'],
      sounds: [
        { sound, volume: 0.4, channels: ['test'] },
        { sound: sound2, volume: 0.8, channels: ['test', 'test2'] }
      ]
    });

    expect(sm.getSoundsForChannel('test')[0]).toEqual(sound);
    expect(sm.getSoundsForChannel('test')[1]).toEqual(sound2);
    expect(sm.getSoundsForChannel('test').length).toEqual(2);

    sm.play(['test', 'test2']);

    expect(sound.play).toHaveBeenCalledWith(0.4);
    expect(sound2.play).toHaveBeenCalledWith(0.8);
  });

  it('can override volume', () => {
    const sound = new ex.Sound('./../assets/images/SoundSpec/test.mp3');
    const sound2 = new ex.Sound('./../assets/images/SoundSpec/test.mp3');
    const spy = vi.spyOn(sound, 'play');
    spy.mockResolvedValue(true);

    const spy2 = vi.spyOn(sound2, 'play');
    spy2.mockResolvedValue(true);

    const sm = new ex.SoundManger({
      channels: ['test', 'test2'],
      sounds: [
        { sound, volume: 0.4, channels: ['test'] },
        { sound: sound2, volume: 0.8, channels: ['test', 'test2'] }
      ]
    });

    expect(sm.getSoundsForChannel('test')[0]).toEqual(sound);
    expect(sm.getSoundsForChannel('test')[1]).toEqual(sound2);
    expect(sm.getSoundsForChannel('test').length).toEqual(2);
    expect(sm.getSoundsForChannel('test2')[0]).toEqual(sound2);
    expect(sm.getSoundsForChannel('test2').length).toEqual(1);

    sm.play(['test', 'test2'], 0.5);

    expect(sound.play).toHaveBeenCalledWith(0.2);
    expect(sound2.play).toHaveBeenCalledWith(0.4);
  });

  it('can add a new channel', () => {
    const sound = new ex.Sound('./../assets/images/SoundSpec/test.mp3');
    const sound2 = new ex.Sound('./../assets/images/SoundSpec/test.mp3');
    const spy = vi.spyOn(sound, 'play');
    spy.mockResolvedValue(true);

    const spy2 = vi.spyOn(sound2, 'play');
    spy2.mockResolvedValue(true);

    const sm = new ex.SoundManger({
      channels: ['test', 'test2'],
      sounds: [
        { sound, volume: 0.4, channels: ['test'] },
        { sound: sound2, volume: 0.8, channels: ['test', 'test2'] }
      ]
    });

    expect(sm.getSoundsForChannel('test').length).toEqual(2);
    expect(sm.getSoundsForChannel('test2').length).toEqual(1);

    sm.addChannel(sound, ['new-channel']);
    sm.addChannel(sound2, ['new-channel']);

    expect(sm.getSoundsForChannel('new-channel').length).toEqual(2);
  });
});
