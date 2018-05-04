/// <reference path="jasmine.d.ts" />

/// <reference path="Mocks.ts" />

const mockData = "testdata";

describe("Sound resource", () => {
  var sut: ex.Sound;
  var audioMock: MockAudioImplementation;

  beforeAll(() => {
    ex.Logger.getInstance().clearAppenders();
  });

  beforeEach(() => {
    // set up Mocks
    audioMock = new MockAudioImplementation();

    spyOn(ex.Sound, "canPlayFile").and.returnValue(true);

    sut = new ex.Sound("test/path.mp3");
    sut.sound = audioMock;

    expect(sut.path).toBe("test/path.mp3");
  });

  it("should be able to be constructed", () => {
    expect(sut).toBeDefined();
  });

  it("should be able to load audio implementation with data asynchronously", done => {
    createFetchSpy(sut, true, mockData);

    spyOn(audioMock, "processData").and.callThrough();

    sut.load().then(sound => {
      expect(audioMock.processData).toHaveBeenCalledWith(mockData);

      expect(sound).toBe(audioMock);
      expect(sut.isLoaded()).toBe(true);
      expect(sut.getData()).toBe(mockData);

      done();
    });
  });

  it("should call oncomplete callback when loaded async on success", done => {
    createFetchSpy(sut, true, mockData);

    sut.oncomplete = () => done();

    sut.load();
  });

  it("should call onerror callback when loaded async on request error", done => {
    createFetchSpy(sut, false, null);

    sut.onerror = () => done();

    sut.load();
  });

  it("should call onerror callback when loaded async on general error", done => {
    spyOn(<any>sut, "_fetchResource").and.throwError("fatal");

    sut.onerror = (e: Error) => {
      expect(e.message).toBe("fatal");
      done();
    };

    sut.load();
  });

  describe("with data", () => {
    beforeEach(() => {
      sut.setData(mockData);
    });

    it("should be loaded immediately", () => {
      expect(sut.isLoaded()).toBe(true);
    });

    it("should return the processed data", () => {
      expect(sut.getData()).toBe(mockData);
    });

    it("should not trigger an XHR request when loaded", done => {
      var fetchSpy = createFetchSpy(sut, true, mockData);

      sut.load().then(sound => {
        expect(fetchSpy).not.toHaveBeenCalled();

        expect(sut.isLoaded()).toBe(true);
        expect(sut.getData()).toBe(mockData);

        done();
      });
    });

    it("should call oncomplete callback when loaded", done => {
      sut.oncomplete = () => done();

      sut.load();
    });

    it("should create a new audio instance when played", done => {
      var audioInstance = new MockAudioInstance();

      spyOn(audioMock, "createInstance").and.returnValue(audioInstance);
      spyOn(audioInstance, "play").and.callThrough();

      sut.play().then(() => {
        expect(audioMock.createInstance).toHaveBeenCalledTimes(1);
        expect(audioInstance.play).toHaveBeenCalled();

        done();
      });
    });

    it("should set tracks to loop", () => {
      var audioInstance = new MockAudioInstance();

      spyOn(audioMock, "createInstance").and.returnValue(audioInstance);

      sut.setLoop(true);
      sut.play();

      expect(audioInstance.loop).toBe(true);
    });

    it("should set tracks volume", () => {
      var audioInstance = new MockAudioInstance();

      spyOn(audioMock, "createInstance").and.returnValue(audioInstance);

      sut.setVolume(0.5);
      sut.play();

      expect(audioInstance.volume).toBe(0.5);
    });

    it("should set volume with argument sent to play", () => {
      var audioInstance = new MockAudioInstance();

      spyOn(audioMock, "createInstance").and.returnValue(audioInstance);

      sut.play(0.5);

      expect(audioInstance.volume).toBe(0.5);
    });

    it("should play once and then finish", done => {
      sut.play().then(() => {
        expect(sut.isPlaying()).toBe(false);

        done();
      });

      expect(sut.isPlaying()).toBe(true);
    });

    it("should play more than once and should be playing until all are done", done => {
      var firstDone = false;

      // play 1st track
      sut.play().then(() => {
        firstDone = true;
      });

      setTimeout(() => {
        expect(firstDone).toBe(
          false,
          "first track should not be done when second starts"
        );
        expect(sut.isPlaying()).toBe(true, "first track should be playing");

        // play 2nd track
        sut.play().then(() => {
          expect(firstDone).toBe(
            true,
            "first track should be done when second finishes"
          );
          expect(sut.isPlaying()).toBe(
            false,
            "all tracks should be done playing"
          );

          done();
        });
      }, 50);

      // second instance should still be playing after 150ms
      setTimeout(() => {
        expect(firstDone).toBe(
          true,
          "first track should be done playing after 150ms"
        );
        expect(sut.isPlaying()).toBe(
          true,
          "second track should still be playing"
        );
      }, 150);

      expect(sut.isPlaying()).toBe(true, "first track should be playing");
    });

    it("should resume any paused tracks if played", done => {
      // start 2 tracks
      sut.play();
      sut.play();

      expect(sut.isPlaying()).toBe(true, "tracks should be playing");

      setTimeout(() => {
        // pause both tracks
        sut.pause();

        expect(sut.isPlaying()).toBe(false, "tracks should be paused");

        // resume
        // promise should be done when all tracks are done
        sut.play().then(() => {
          expect(sut.isPlaying()).toBe(false, "resumed tracks are not done");

          done();
        });

        expect(sut.isPlaying()).toBe(true, "tracks should resume playing");
      }, 50);
    });

    it("should stop all currently playing tracks", () => {
      sut.play();

      expect(sut.isPlaying()).toBe(true, "track should be playing");

      sut.stop();

      expect(sut.isPlaying()).toBe(false, "track should be stopped");
    });

    it("should do nothing if already stopped", () => {
      expect(sut.isPlaying()).toBe(false, "nothing should be playing");

      sut.stop();
    });

    it("should not have any tracks when stopped", () => {
      sut.play();

      expect(sut.instanceCount()).toBe(1, "should be one track");

      sut.stop();

      expect(sut.instanceCount()).toBe(0, "should be no tracks");
    });

    it("should remove tracks as they are done when multiple are playing", done => {
      // start playing first track
      sut.play().then(() => {
        expect(sut.instanceCount()).toBe(1, "should be one track");
      });

      // wait 50ms then play 2nd track
      setTimeout(() => {
        sut.play().then(() => {
          expect(sut.instanceCount()).toBe(0, "should be one track");

          done();
        });

        expect(sut.instanceCount()).toBe(
          2,
          "should be two simultaneous tracks"
        );
      }, 50);
    });

    it("should remove multiple tracks when stopped", done => {
      // start playing first track
      sut.play();

      // wait 50ms then play 2nd track
      setTimeout(() => {
        sut.play();
      }, 50);

      // stop both playing tracks
      setTimeout(() => {
        sut.stop();

        expect(sut.instanceCount()).toBe(0, "should be no tracks");

        done();
      }, 60);
    });
  });
});

class MockAudioImplementation implements ex.IAudioImplementation {
  public responseType: ex.ExResponseType = "arraybuffer";
  public processData(data: any): ex.Promise<any> {
    return ex.Promise.resolve(data);
  }
  public createInstance(): ex.IAudio {
    return new MockAudioInstance();
  }
}

class MockAudioInstance implements ex.IAudio {
  private _isPlaying = false;
  private _isPaused = false;
  private _currentOffset = 0;
  private _startTime = 0;
  private _duration = 100;
  private _playComplete: ex.Promise<boolean>;
  private _playing: NodeJS.Timer;

  public loop = false;
  public volume = 1.0;

  setVolume(value: number) {
    this.volume = ex.Util.clamp(value, 0, 1);
  }

  setLoop(value: boolean) {
    this.loop = value;
  }

  isPlaying(): boolean {
    return this._isPlaying;
  }

  play(): ex.Promise<boolean> {
    if (!this._isPlaying) {
      this._isPlaying = true;
      this._currentOffset = 0;
      this._startTime = new Date().getTime();

      this._playComplete = new ex.Promise<boolean>();

      this._playing = setTimeout(() => {
        this._isPlaying = false;
        this._playComplete.resolve(true);
      }, this._duration);
    } else if (this._isPaused) {
      this._isPlaying = true;
      this._isPaused = false;
      this._currentOffset = new Date().getTime() - this._startTime;

      clearTimeout(this._playing);
      this._playing = setTimeout(() => {
        this._isPlaying = false;
        this._playComplete.resolve(true);
      }, this._duration - this._currentOffset);
    }

    return this._playComplete;
  }

  pause() {
    this._isPlaying = false;
    clearTimeout(this._playing);
  }

  stop() {
    if (!this._isPlaying) {
      return;
    }

    clearTimeout(this._playing);
    this._isPaused = false;
    this._isPlaying = false;
    this._currentOffset = 0;
    this._playComplete.resolve(false);
  }
}

function createFetchSpy(subject: ex.Sound, successful: boolean, data) {
  return spyOn(<any>subject, "_fetchResource").and.callFake(
    (onload: Function) => {
      onload.bind(subject, {
        status: successful ? 200 : 500,
        response: data
      })();
    }
  );
}
