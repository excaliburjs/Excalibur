import * as ex from '@excalibur';

describe('A webaudio instance', () => {
  let webaudio: ex.WebAudioInstance;
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
        setTargetAtTime: vi.fn()
      }
    };

    mockBufferSource = {
      buffer: null,
      loop: null,
      connect: () => {
        /*empty*/
      },
      playbackRate: {
        setValueAtTime: () => {
          /*empty*/
        }
      },
      start: () => {
        /*empty*/
      },
      stop: () => {
        /*empty*/
      }
    };

    mockAudioContext = {
      currentTime: 0,
      createGain: vi.fn(() => mockGainNode),
      createBufferSource: vi.fn(() => mockBufferSource)
    };

    ex.AudioContextFactory.create = vi.fn(() => mockAudioContext);

    webaudio = new ex.WebAudioInstance(RealAudioContext.createBuffer(1, 1, 22050));
  });

  it('should be defined', () => {
    expect(webaudio).toBeDefined();
  });

  it('should set volume immediately', () => {
    webaudio.volume = 0.5;
    expect(mockGainNode.gain.value).toEqual(0.5);
    expect(mockGainNode.gain.setTargetAtTime).not.toHaveBeenCalled();
  });

  it('should ramp volume when set during playback', () => {
    webaudio.play();
    webaudio.volume = 0.25;
    expect(mockGainNode.gain.setTargetAtTime).toHaveBeenCalledWith(webaudio.volume, 0, 0.1);
  });
});
