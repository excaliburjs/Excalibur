import * as ex from '@excalibur';
import { SoundTrack } from '../../engine/resources/sound/sound-track';

describe('A SoundTrack (internal)', () => {
  let track: SoundTrack;
  let mockAudioContext: any;
  let mockGainNode: any;
  let mockBufferSource: any;
  const RealAudioContextCreate = ex.AudioContextFactory.create;
  const RealAudioContext = ex.AudioContextFactory.create();

  afterEach(() => {
    ex.AudioContextFactory.create = RealAudioContextCreate;
  });

  beforeEach(() => {
    vi.spyOn(ex.AudioContextFactory, 'create');
    mockGainNode = {
      connect: vi.fn(),
      gain: {
        value: 1,
        setTargetAtTime: vi.fn()
      }
    };

    mockBufferSource = {
      buffer: null,
      loop: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      stop: vi.fn(),
      onended: null,
      playbackRate: {
        value: 1,
        setValueAtTime: vi.fn()
      },
      detune: {
        value: 0
      },
      start: vi.fn()
    };

    mockAudioContext = {
      currentTime: 0,
      createGain: vi.fn(() => mockGainNode),
      createBufferSource: vi.fn(() => mockBufferSource)
    };

    ex.AudioContextFactory.create = vi.fn(() => mockAudioContext);

    track = new SoundTrack(RealAudioContext.createBuffer(1, 1, 22050));
  });

  it('should be defined', () => {
    expect(track).toBeDefined();
  });

  it('should set volume immediately', () => {
    track.volume = 0.5;
    expect(mockGainNode.gain.value).toEqual(0.5);
    expect(mockGainNode.gain.setTargetAtTime).not.toHaveBeenCalled();
  });

  it('should ramp volume when set during playback', () => {
    track.play();
    track.volume = 0.25;
    expect(mockGainNode.gain.setTargetAtTime).toHaveBeenCalledWith(track.volume, 0, 0.1);
  });

  it('should apply pitch to the source detune', () => {
    track.pitch = 1200;
    // setting pitch updates the live AudioBufferSourceNode.detune
    expect(mockBufferSource.detune.value).toBe(1200);
    expect(track.pitch).toBe(1200);
  });

  it('should not throw when setting playbackRate with no live source', () => {
    // After stop/complete the single-use source is nulled; playbackRate must not throw.
    expect(() => {
      track.playbackRate = 2.0;
      void track.playbackRate;
    }).not.toThrow();
  });

  it('should use the default graph (source → volumeNode) when no builder is supplied', () => {
    // source → volumeNode is wired in the constructor
    expect(mockBufferSource.connect).toHaveBeenCalledWith(mockGainNode);
  });

  it('should insert a single returned node as source → node → volumeNode', () => {
    const inserted = { connect: vi.fn(), disconnect: vi.fn() } as any;
    track = new SoundTrack(RealAudioContext.createBuffer(1, 1, 22050), () => inserted);

    // source → inserted (wired when source is created in the constructor)
    expect(mockBufferSource.connect).toHaveBeenCalledWith(inserted);
    // inserted → volumeNode (wired once in the builder pass)
    expect(inserted.connect).toHaveBeenCalledWith(mockGainNode);
  });

  it('should wire an {input, output} chain as source → input … output → volumeNode', () => {
    const input = { connect: vi.fn(), disconnect: vi.fn() } as any;
    const output = { connect: vi.fn(), disconnect: vi.fn() } as any;
    track = new SoundTrack(RealAudioContext.createBuffer(1, 1, 22050), () => ({ input, output }));

    expect(mockBufferSource.connect).toHaveBeenCalledWith(input);
    expect(output.connect).toHaveBeenCalledWith(mockGainNode);
  });

  it('should fall back to the default graph if the builder throws', () => {
    track = new SoundTrack(RealAudioContext.createBuffer(1, 1, 22050), () => {
      throw new Error('boom');
    });

    expect(mockBufferSource.connect).toHaveBeenCalledWith(mockGainNode);
  });

  it('should run the builder ONCE per track, reusing effect nodes across pause/resume', () => {
    const createPanner = vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() }) as any);
    track = new SoundTrack(RealAudioContext.createBuffer(1, 1, 22050), ({ audioContext }) => {
      void audioContext;
      return createPanner();
    });

    track.play();
    track.pause();
    // resume: a new single-use source is created, but the builder must NOT run again
    track.play();

    // The single-use AudioBufferSourceNode is re-allocated on every restart, but
    // the persistent effect graph (builder) must be built exactly once.
    expect(createPanner).toHaveBeenCalledTimes(1);
  });

  it('should disconnect inserted effect nodes when stopped', () => {
    const inserted = { connect: vi.fn(), disconnect: vi.fn() } as any;
    track = new SoundTrack(RealAudioContext.createBuffer(1, 1, 22050), () => inserted);

    track.play();
    track.stop();

    expect(inserted.disconnect).toHaveBeenCalled();
  });
});
