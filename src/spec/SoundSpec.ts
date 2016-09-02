/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

const mockData = 'testdata';

class MockAudioImplementation implements ex.IAudioImplementation {
   public responseType = 'test';
   public processData(data: any) {
      return ex.Promise.wrap(data);
   }
   public createInstance(): ex.IAudio {
      return new MockAudioInstance();
   }
}

class MockAudioInstance implements ex.IAudio {
   setVolume(value: number) {}
   setLoop(value: boolean) {}
   isPlaying(): boolean { return false; }
   play() { return ex.Promise.wrap(true); }
   pause() {}
   stop() {}
}

function createFetchSpy(subject: ex.Sound, successful: boolean, data) {

   spyOn(subject, '_fetchResource').and.callFake((onload: Function) => {
      onload.bind(subject, { status: successful ? 200 : 500, response: data })();
   });
}

describe('Sound resource', () => {

   var sut: ex.Sound;
   var audioMock: MockAudioImplementation;   

   beforeEach(() => {

      // set up Mocks
      audioMock = new MockAudioImplementation();

      spyOn(ex.Sound, 'canPlayFile').and.returnValue(true);
      spyOn(ex, 'getAudioImplementation').and.callFake(() => {         
         return audioMock;
      });

      sut = new ex.Sound('test/path.mp3');

      expect(sut.path).toBe('test/path.mp3');
   });

   it('should be able to be constructed', () => {
      expect(sut).toBeDefined();
   });

   it('should be able to load audio implementation with data asynchronously', (done) => {

      createFetchSpy(sut, true, mockData);
      
      spyOn(audioMock, 'processData').and.callThrough();

      sut.load().then(sound => {
         expect(audioMock.processData).toHaveBeenCalledWith(mockData);

         expect(sound).toBe(audioMock);
         expect(sut.isLoaded()).toBe(true);         
         expect(sut.getData()).toBe(mockData);

         done();
      });

   });

});