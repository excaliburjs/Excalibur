/// <reference path="TestUtils.ts" />

describe('A webaudio instance', () => {
  let webaudio: ex.WebAudioInstance;
  let mockAudioContext: any;
  let mockGainNode: any;
  let mockBufferSource: any;
  let RealAudioContextCreate = ex.AudioContextFactory.create;
  let RealAudioContext = ex.AudioContextFactory.create();

  afterEach(() => {
    ex.AudioContextFactory.create = RealAudioContextCreate;
  });

  beforeEach(() => {
    ex.AudioContextFactory.create = <any>jasmine.createSpy('create');
    mockGainNode = jasmine.createSpyObj('GainNode', ['connect']);

    mockGainNode.gain = {
      setTargetAtTime: jasmine.createSpy('setTargetAtTime')
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
      }
    };

    mockAudioContext = {
      currentTime: 0,
      createGain: jasmine.createSpy('createGain'),
      createBufferSource: jasmine.createSpy('createBufferSource')
    };
    mockAudioContext.createGain.and.returnValue(mockGainNode);
    mockAudioContext.createBufferSource.and.returnValue(mockBufferSource);

    (<any>ex.AudioContextFactory.create).and.returnValue(mockAudioContext);

    webaudio = new ex.WebAudioInstance(RealAudioContext.createBuffer(1, 1, 22050));
  });

  it('should be defined', () => {
    expect(webaudio).toBeDefined();
  });

  it('should use specific settings for volume', () => {
    webaudio.volume = 1;
    expect(mockGainNode.gain.setTargetAtTime).toHaveBeenCalledWith(webaudio.volume, 0, 0.1);
  });
});
