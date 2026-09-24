import * as ex from '@excalibur';
import { delay } from '../../engine/util/util';
import { WebAudio } from '../../engine/util/web-audio';
import { page } from 'vitest/browser';

describe('A SoundTrack', () => {
  let audioContext: AudioContext;
  let destination: GainNode;
  let buffer: AudioBuffer;
  let sources: AudioBufferSourceNode[];

  beforeAll(async () => {
    // automate user interaction to allow WebAudio to unlock
    await page.elementLocator(document.body).click();
    ex.Logger.getInstance().clearAppenders();
    await WebAudio.unlock();
  });

  beforeEach(() => {
    audioContext = ex.AudioContextFactory.create();
    destination = audioContext.createGain();
    // a tenth of a second of silence
    buffer = audioContext.createBuffer(1, audioContext.sampleRate / 10, audioContext.sampleRate);
    sources = [];
    const createBufferSource = audioContext.createBufferSource.bind(audioContext);
    vi.spyOn(audioContext, 'createBufferSource').mockImplementation(() => {
      const source = createBufferSource();
      vi.spyOn(source, 'connect');
      vi.spyOn(source, 'disconnect');
      sources.push(source);
      return source;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is exported as a runtime class', () => {
    expect(ex.SoundTrack).toBeDefined();
    expect(new ex.SoundTrack(buffer, destination)).toBeInstanceOf(ex.SoundTrack);
  });

  it('starts stopped with no source allocated', () => {
    const track = new ex.SoundTrack(buffer, destination);
    expect(track.isStopped()).toBe(true);
    expect(sources.length).toBe(0);
  });

  it('has increasing ids', () => {
    const a = new ex.SoundTrack(buffer, destination);
    const b = new ex.SoundTrack(buffer, destination);
    expect(b.id).toBeGreaterThan(a.id);
  });

  it('wires bufferSource → track gain → destination by default', () => {
    const track = new ex.SoundTrack(buffer, destination);
    const gain = (track as any)._gain as GainNode;
    vi.spyOn(gain, 'connect');
    vi.spyOn(gain, 'disconnect');
    track.loop = true;
    track.play();

    expect(sources.length).toBe(1);
    expect(sources[0].connect).toHaveBeenCalledWith(gain);
    expect(gain.connect).toHaveBeenCalledWith(destination);

    track.stop();
    expect(gain.disconnect).toHaveBeenCalled();
  });

  it('applies per-track volume to the track gain', () => {
    const track = new ex.SoundTrack(buffer, destination);
    const gain = (track as any)._gain as GainNode;
    track.volume = 0.25;
    expect(gain.gain.value).toBeCloseTo(0.25);
    track.volume = 4;
    expect(track.volume).toBe(1);
  });

  it('lets the onPlay hook wire the graph instead', () => {
    const effect = audioContext.createBiquadFilter();
    const hook = vi.fn(({ source, destination: dest }: ex.AudioGraphContext) => {
      source.connect(effect).connect(dest);
    });
    const track = new ex.SoundTrack(buffer, destination, hook);
    track.loop = true;
    track.play();

    const gain = (track as any)._gain as GainNode;
    expect(hook).toHaveBeenCalledWith({ audioContext, source: gain, bufferSource: sources[0], destination, track });
    // identity checks, vitest deep-equals any two GainNodes
    const connects = (sources[0].connect as any).mock.calls;
    expect(connects).toHaveLength(1);
    expect(connects[0][0]).toBe(gain);
    track.stop();
  });

  it('allocates a fresh configured source and re-runs the hook on every (re)start', () => {
    const hook = vi.fn(({ source, destination: dest }: ex.AudioGraphContext) => source.connect(dest));
    const track = new ex.SoundTrack(buffer, destination, hook);
    track.loop = true;
    track.playbackRate = 1.5;
    track.pitch = 700;

    track.play();
    track.pause();
    track.play();
    track.seek(0.05);
    track.play();

    expect(sources.length).toBe(3);
    expect(hook).toHaveBeenCalledTimes(3);
    for (const source of sources) {
      expect(source.loop).toBe(true);
      expect(source.playbackRate.value).toBe(1.5);
      expect(source.detune.value).toBe(700);
    }
    // previous single-use sources are disconnected
    expect(sources[0].disconnect).toHaveBeenCalled();
    expect(sources[1].disconnect).toHaveBeenCalled();
    expect(sources[2].disconnect).not.toHaveBeenCalled();
    track.stop();
  });

  it('applies loop, playbackRate and pitch to the live source', () => {
    const track = new ex.SoundTrack(buffer, destination);
    track.loop = true;
    track.play();

    track.playbackRate = 2;
    track.pitch = 1200;
    track.loop = false;
    expect(sources[0].playbackRate.value).toBe(2);
    expect(sources[0].detune.value).toBe(1200);
    expect(sources[0].loop).toBe(false);
    track.stop();
  });

  it('reports the seeked position, keeps it across pause, and rewinds on stop', () => {
    const track = new ex.SoundTrack(buffer, destination);
    track.loop = true;
    expect(track.getPlaybackPosition()).toBe(0);

    track.seek(0.05);
    expect(track.isPaused()).toBe(true);
    expect(track.getPlaybackPosition()).toBe(0.05);

    track.play();
    expect(track.isPlaying()).toBe(true);
    expect(track.getPlaybackPosition()).toBeGreaterThanOrEqual(0.05);
    expect(sources[0].start).toBeDefined();

    track.pause();
    expect(track.isPaused()).toBe(true);
    expect(track.getPlaybackPosition()).toBeGreaterThanOrEqual(0.05);

    track.stop();
    expect(track.isStopped()).toBe(true);
    expect(track.getPlaybackPosition()).toBe(0);
  });

  it('stops and resolves play() when the source ends naturally', async () => {
    const track = new ex.SoundTrack(buffer, destination);
    const started = vi.fn();
    const done = track.play(started);
    expect(started).toHaveBeenCalled();
    expect(track.isPlaying()).toBe(true);
    expect(track.done).toBe(done);

    await expect(done).resolves.toBe(true);
    expect(track.isStopped()).toBe(true);
    expect(sources[0].disconnect).toHaveBeenCalled();
  });

  it('resolves play() when stopped explicitly', async () => {
    const track = new ex.SoundTrack(buffer, destination);
    track.loop = true;
    const done = track.play();
    await delay(10);
    expect(track.isPlaying()).toBe(true);
    track.stop();
    await expect(done).resolves.toBe(true);
  });

  it('honors the duration when not looping', () => {
    const track = new ex.SoundTrack(buffer, destination);
    expect(track.duration).toBe(buffer.duration);
    track.duration = 0.05;
    expect(track.duration).toBe(0.05);
    track.duration = undefined;
    expect(track.duration).toBe(buffer.duration);
  });

  it('logs and falls back to the default graph when the hook throws', () => {
    const error = vi.spyOn(ex.Logger.getInstance(), 'error');
    const track = new ex.SoundTrack(buffer, destination, () => {
      throw new Error('boom');
    });
    track.loop = true;
    track.play();

    expect(error).toHaveBeenCalled();
    expect(sources[0].connect).toHaveBeenCalledWith((track as any)._gain);
    expect(track.isPlaying()).toBe(true);
    track.stop();
  });
});
