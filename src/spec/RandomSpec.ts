// Random Tests 
/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />


describe('A random number', () => {
   it('exists', () => {
      expect(ex.Random).toBeDefined();
   });

   it('can be constructed', () => {
      var random = new ex.Random();
      expect(random).not.toBeNull();
   });

   it('can be seeded to produce the same sequence', () => {
      var random1 = new ex.Random(10);
      var random2 = new ex.Random(10);

      expect(random1.seed).toBe(random2.seed);
      for (var i = 0; i < 9000; i++) {
         expect(random1.next()).toBe(random2.next());
      }
   });

   xit('produces the correct first number for a specific seed', () => {
      var random = new ex.Random(10);
      expect(random.seed).toBe(10);
      expect(random.nextInt()).toBe(3312796937);
   });

   it('can be seeded to produce the different sequences', () => {
      var random1 = new ex.Random(10);
      var random2 = new ex.Random(50);

      expect(random1.seed).not.toBe(random2.seed);
      for (var i = 0; i < 9000; i++) {
         expect(random1.next()).not.toBe(random2.next());
      }
   });

   it('can be seeded to produce numbers between [0, 1)', () => {
      var random1 = new ex.Random(10);
      for (var i = 0; i < 9000; i++) {
         var r = random1.next(); 
         var inrange = 0 <= r && r < 1.0;
         expect(inrange).toBe(true, `Random ${r} not in range [0, 1). Seed [${random1.seed}] Iteration [${i}]`);
      }
   });

   it('can be seeded to produce numbers in an arbitrary floating point range', () => {
      var random1 = new ex.Random(10);
      for (var i = 0; i < 9000; i++) {
         var r = random1.floating(-88, 1900); 
         var inrange = -88 <= r && r < 1900;
         expect(inrange).toBe(true, `Random ${r} not in range [-88, 1900). Seed [${random1.seed}] Iteration [${i}]`);
      }
   });

   it('can be seeded to produce numbers in an arbitrary integer range', () => {
      var random1 = new ex.Random(10);
      for (var i = 0; i < 9000; i++) {
         var r = random1.integer(-10, 10); 
         var inrange = -10 <= r && r <= 10;
         expect(inrange).toBe(true, `Random ${r} not in range [-10, 10]. Seed [${random1.seed}] Iteration [${i}]`);
      }
   });

   it('can do coin flips', () => {
      var random1 = new ex.Random(10);
      var truthCount = 0;
      var falseCount = 0;

      for (var i = 0; i < 9000; i++) {
         var b = random1.bool(); 
         if (b) {
            truthCount++;
         } else {
            falseCount++;
         }
      }
      var ratio = truthCount / falseCount;
      expect(ratio).toBeCloseTo(1.0, .1, `Bool did not appear to be 50/50 Ratio true/false [${ratio}]`);
   });

   it('can do dice rolls', () => {
      // pass      
   });

});