/// <reference path="jasmine.d.ts" />

/// <reference path="Mocks.ts" />
/// <reference path="Stubs.ts" />

describe('Sound resource', () => {

   var sut: ex.Sound;

   beforeAll(() => {
      ex.Logger.getInstance().clearAppenders();
   });

   beforeEach(() => {
      sut = new ex.Sound('/sample/test.mp3');

      expect(sut.path).toBe('/sample/test.mp3');
   });

   it('should be able to be constructed', () => {
      expect(sut).toBeDefined();
   });

   describe('with data', () => {

      describe('type of arraybuffer', () => {
         beforeEach(() => {
            sut.setData(_base64ToArrayBuffer());
         });

         it('should return the processed data', () => {
            expect(sut.processData(sut.getData())).toBeDefined();
         });

         it('should fire playbackstart event', (done) => {
            let trigger = false;

            sut.on('playbackstart', () => {
               trigger = true;
            });

            sut.loop = false;
            sut.play().then(() => {
               expect(trigger).toBeTruthy();
               done();
            });

            expect(trigger).toBeFalsy();
         });

         it('should fire playbackend event', (done) => {
            let trigger = false;

            sut.on('playbackend', () => {
               trigger = true;
            });

            sut.loop = false;
            sut.play().then(() => {
               expect(trigger).toBeTruthy();
               done();
            });

            expect(trigger).toBeFalsy();
         });

         it('should fire resume event', (done) => {
            let trigger = false;

            sut.on('resume', () => {
               trigger = true;
            });

            sut.on('playbackstart', () => {
               sut.pause();
               sut.play();
            });

            sut.loop = false;
            sut.play().then(() => {
               expect(trigger).toBeTruthy();
               done();
            });

            expect(trigger).toBeFalsy();
         });

         it('should fire volumechange event', () => {
            let trigger = false;

            sut.on('volumechange', () => {
               trigger = true;
            });

            sut.volume = 0.3;

            expect(trigger).toBeTruthy();
         });

         it('should fire pause event', (done) => {
            let trigger = false;

            sut.on('pause', () => {
               trigger = true;
            });

            sut.on('playbackstart', () => {
               sut.pause();

               expect(trigger).toBeTruthy();
               done();
            });

            sut.play();
         });

         it('should fire stop event', (done) => {
            let trigger = false;

            sut.on('stop', () => {
               trigger = true;
            });

            sut.on('playbackstart', () => {
               sut.stop();

               expect(trigger).toBeTruthy();
               done();
            });

            sut.play();
         });

         it('should fire emptied event', () => {
            let trigger = false;

            sut.on('emptied', () => {
               trigger = true;
            });

            sut.setData(_base64ToArrayBuffer());

            expect(trigger).toBeTruthy();
         });

         it('should create a new audio instance when played', (done) => {
            spyOn(sut, 'instanceCount').and.callThrough();

            const initialInstancesCnt = sut.instanceCount();

            sut.on('playbackstart', () => {
               expect(sut.instanceCount()).toBeGreaterThan(initialInstancesCnt);
               done();
            });

            sut.loop = false;
            sut.play();
         });

         it('should set tracks loop value same as own', (done) => {
            sut.loop = true;

            sut.on('playbackstart', () => {
               expect(sut.instances[0].loop).toBe(sut.loop);
               done();
            });

            sut.play();
         });

         it('should set tracks volume value same as own', (done) => {
            sut.volume = 0.5;

            sut.on('playbackstart', () => {
               expect(sut.instances[0].volume).toBe(sut.volume);
               done();
            });

            sut.play();
         });

         it('should set volume with argument sent to play', (done) => {
            sut.on('playbackstart', () => {
               expect(sut.volume).toBe(0.5);
               expect(sut.instances[0].volume).toBe(sut.volume);
               done();
            });

            sut.play(0.5);
         });

         it('should play once and then finish if loop set to false', (done) => {
            sut.loop = false;

            sut.on('playbackstart', () => {
               expect(sut.isPlaying()).toBe(true);
            });

            sut.play().then(() => {
               expect(sut.isPlaying()).toBe(false);

               done();
            });
         });

         it('should play more than once and should be playing until all are done', (done) => {
            let firstDone = false;
            sut.loop = false;

            // play 1st track
            sut.play().then(() => {
               firstDone = true;
            });

            setTimeout(() => {
               expect(firstDone).toBe(false, 'first track should not be done when second starts');
               expect(sut.isPlaying()).toBe(true, 'first track should be playing');

               // play 2nd track
               sut.play().then(() => {
                  expect(firstDone).toBe(true, 'first track should be done when second finishes');
                  expect(sut.isPlaying()).toBe(false, 'all tracks should be done playing');

                  done();
               });
            }, 250);

            // second instance should still be playing after 650ms
            setTimeout(() => {
               expect(firstDone).toBe(true, 'first track should be done playing after 150ms');
               expect(sut.isPlaying()).toBe(true, 'second track should still be playing');
            }, 650);
         });

         it('should stop all currently playing tracks', (done) => {
            sut.play();

            sut.on('playbackstart', () => {
               expect(sut.isPlaying()).toBe(true, 'track should be playing');

               sut.stop();
               expect(sut.isPlaying()).toBe(false, 'track should be stopped');

               done();
            });
         });

         it('should do nothing if already stopped', () => {
            expect(sut.isPlaying()).toBe(false, 'nothing should be playing');

            sut.stop();
         });

         it('should not have any tracks when stopped', (done) => {
            sut.play();

            sut.on('playbackstart', () => {
               expect(sut.instanceCount()).toBe(1, 'should be one track');

               sut.stop();

               expect(sut.instanceCount()).toBe(0, 'should be no tracks');

               done();
            });
         });

         it('should not remove instance if paused', (done) => {
            sut.play();


            sut.on('playbackstart', () => {
               expect(sut.instanceCount()).toBe(1, 'should be one track');

               sut.pause();

               expect(sut.instanceCount()).toBe(1, 'should be one track');

               done();
            });
         });

         it('should remove tracks as they are done when multiple are playing', (done) => {
            sut.loop = false;
            // start playing first track
            sut.play().then(() => {
               expect(sut.instanceCount()).toBe(1, 'should be one track');
            });

            // wait 250ms then play 2nd track
            setTimeout(() => {
               sut.on('playbackstart', () => {
                  expect(sut.instanceCount()).toBe(2, 'should be two simultaneous tracks');
               });

               sut.play().then(() => {
                  expect(sut.instanceCount()).toBe(0, 'should be no tracks');
                  done();
               });
            }, 250);
         });

         it('should remove multiple tracks when stopped', (done) => {
            sut.loop = false;
            // start playing first track

            sut.on('playbackstart', (ev: ex.NativeSoundEvent) => {
               if (sut.getTrackId(ev.track) === 0) {
                  sut.play();
               }
               sut.stop();

               expect(sut.instanceCount()).toBe(0, 'should be no tracks');

               done();
            });

            sut.play();
         });
      });
   });

});

function _base64ToArrayBuffer() {
   const mockData = Stubs.AudioStub.base64StubData;

   const binary_string = window.atob(mockData);
   const len = binary_string.length;
   const bytes = new Uint8Array( len );

   for (let i = 0; i < len; i++)        {
       bytes[i] = binary_string.charCodeAt(i);
   }

   return bytes.buffer;
}