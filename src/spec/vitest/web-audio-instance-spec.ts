import * as ex from '@excalibur';

describe('A webaudio instance', () => {
  let webaudio: ex.WebAudioInstance;
  let mockAudioContext: any;
  let mockGainNode: any;
  let mockBufferSource: any;
  let mockPannerNode: any;
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

    mockPannerNode = {
      connect: vi.fn(),
      positionX: { value: 0 },
      positionY: { value: 0 },
      positionZ: { value: 0 },
      orientationX: { value: 0 },
      orientationY: { value: 0 },
      orientationZ: { value: 0 },
      panningModel: 'HRTF',
      distanceModel: 'inverse',
      refDistance: 1,
      maxDistance: 10000,
      rolloffFactor: 1,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 0
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
      createPanner: vi.fn(() => mockPannerNode),
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

  it('should create a panner node when spatial options are set', () => {
    webaudio.setSpatialOptions({
      position: { x: 1, y: 2, z: 3 },
      orientation: { x: 0, y: 1, z: 0 },
      panningModel: 'HRTF',
      distanceModel: 'linear',
      refDistance: 2,
      maxDistance: 50,
      rolloffFactor: 0.5,
      coneInnerAngle: 30,
      coneOuterAngle: 60,
      coneOuterGain: 0.2
    });

    webaudio.play();

    expect(mockAudioContext.createPanner).toHaveBeenCalled();
    expect(mockPannerNode.positionX.value).toBe(1);
    expect(mockPannerNode.positionY.value).toBe(2);
    expect(mockPannerNode.positionZ.value).toBe(3);
  });
});
