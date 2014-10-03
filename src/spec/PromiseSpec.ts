// Promise Tests 
/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../engine/Promises.ts" />

describe('A promise', ()=>{
   var promise;
   beforeEach(()=>{
      promise = new ex.Promise();
   });

   it('should be loaded', ()=>{
      expect(ex.Promise).toBeTruthy();
   });

   it('should be defaulted to pending', ()=>{
      expect(promise.state()).toBe(ex.PromiseState.Pending);
   });

   it('can be resolved without a callback', ()=>{
      expect(promise.state()).toBe(ex.PromiseState.Pending);
      promise.resolve();
      expect(promise.state()).toBe(ex.PromiseState.Resolved);
   });

   it('can be rejected without a callback', ()=>{
      expect(promise.state()).toBe(ex.PromiseState.Pending);
      promise.reject();
      expect(promise.state()).toBe(ex.PromiseState.Rejected);
   });

   it('can be resolved with a callback async', ()=>{
      var value = false;
      runs(()=>{
         promise.then((v)=>{
            value = v;
         });
         setTimeout(()=>{
            promise.resolve(true);
         }, 300);
      });

      waitsFor(()=>{
         return value;
      }, 'The value should be true', 500);

      runs(()=>{
         expect(value).toBe(true);
      });
   });

   it('can be rejected with a callback async', ()=>{
      var value = false;
      runs(()=>{
         promise.then(()=>{}, (v)=>{
            value = v;
         });
         setTimeout(()=>{
            promise.reject(true);
         }, 300);
      });

      waitsFor(()=>{
         return value;
      }, 'The value should be true', 500);

      runs(()=>{
         expect(value).toBe(true);
      });
   });

   it('can be resolved with multiple callbacks in order', ()=>{
      var val1 = 0;
      var val2 = 0;
      var val3 = 0;
      var isResolved = false;

      runs(()=>{
         // Test that they are added in the right order
         promise.then(()=>{
            val1 = 1;
         }).then(()=>{
            val2 = val1 + 1;
         }).then(()=>{
            val3 = val2 + 1;
         });

         setTimeout(()=>{
            promise.resolve();
            isResolved = true
         }, 300);
      });
      waitsFor(()=>{
         return isResolved;
      }, 'the promise was never resolved', 500);

      runs(()=>{
         expect(val1).toBe(1);
         expect(val2).toBe(2);
         expect(val3).toBe(3);
      });
   });

   it('can catch errors in callbacks', ()=>{
      var isResolved = false;
      var caughtError = false;
      runs(()=>{
         promise.then((v)=>{
            throw new Error("Catch!");
         }).error(()=>{
            caughtError = true;
         });
         setTimeout(()=>{
            promise.resolve(true);
            isResolved = true;
         }, 300);
      });

      waitsFor(()=>{
         return isResolved;
      }, 'the promise was never resolved', 500);

      runs(()=>{
         expect(caughtError).toBe(true);
      });
   });

   it('should throw an error if resolved when not in a pending state', ()=>{
      promise.resolve();
      expect(()=>{promise.resolve()}).toThrow();
      expect(()=>{promise.reject()}).toThrow();
      expect(()=>{promise.resolve()}).toThrow();
      expect(()=>{promise.reject()}).toThrow();
   });

   it('should throw an error if rejected when not in a pending state', ()=>{
      promise.reject();
      expect(()=>{promise.reject()}).toThrow();
      expect(()=>{promise.resolve()}).toThrow();
      expect(()=>{promise.reject()}).toThrow();
      expect(()=>{promise.resolve()}).toThrow();
   });

   it('should be able to wrap a value in a promise', ()=>{
      var p;
      var value : number;
      runs(()=>{
         p = ex.Promise.wrap<number>(12);
         expect(p.state()).toBe(ex.PromiseState.Resolved);

         p.then((v)=>{
            value = v;
         });
      });

      waitsFor(()=>{
         return !!p;
      }, 'the promise was never created', 500);

      runs(()=>{
         expect(value).toBe(12);
      });
   });

   it('can join promises and resovle when all resolve', ()=>{
      var p1 = new ex.Promise();
      var p2 = new ex.Promise();
      var p3 = new ex.Promise();

      var composite = ex.Promise.join(p1, p2, p3);

      expect(composite.state()).toBe(ex.PromiseState.Pending);

      p1.resolve();

      expect(composite.state()).toBe(ex.PromiseState.Pending);

      p2.resolve();

      expect(composite.state()).toBe(ex.PromiseState.Pending);

      p3.resolve();

      expect(composite.state()).toBe(ex.PromiseState.Resolved);
   });

   it('can join promises and resovle when some reject', ()=>{
      var p1 = new ex.Promise();
      var p2 = new ex.Promise();
      var p3 = new ex.Promise();

      var composite = ex.Promise.join(p1, p2, p3);

      expect(composite.state()).toBe(ex.PromiseState.Pending);

      p1.reject();

      expect(composite.state()).toBe(ex.PromiseState.Pending);

      p2.resolve();

      expect(composite.state()).toBe(ex.PromiseState.Pending);

      p3.resolve();

      expect(composite.state()).toBe(ex.PromiseState.Rejected);
   });

   it('does not swallow errors if no error callback is supplied', ()=>{
      var promise = new ex.Promise();
      promise.then(()=>{
         throw new Error("ERROR!!!!!");
      });
      
      expect(function(){promise.resolve();}).toThrow();

   });
});