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

   it('produces the correct first number for a specific seed according to original paper', () => {
      // C implemenation output http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/MT2002/emt19937ar.html
      var random = new ex.Random(19650218);
      expect(random.seed).toBe(19650218);
      expect(random.nextInt()).toBe(2325592414);
   });

   it('produces the correct 1000th number for a specific seed according to original paper', () => {
      var random = new ex.Random(19650218);

      for (var i = 0; i < 999; i++) {
         random.nextInt();
      }
      expect(random.nextInt()).toBe(1746987133);
   });

   it('produces the correct 22000th number for a specific seed according to original paper', () => {
      var random = new ex.Random(19650218);

      for (var i = 0; i < 21999; i++) {
         random.nextInt();
      }
      expect(random.nextInt()).toBe(3203887892);
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

   it('can pick an element out of an array', () => {
      var array = ['one', 'two', 'three', 'four'];

      var random1 = new ex.Random(10);

      var one = 0;
      var two = 0;
      var three = 0;
      var four = 0;

      for (var i = 0; i < 1000; i++) {
         let thing = random1.pickOne(array);
         switch (thing) {
            case 'one':
               one++;
               break;
            case 'two':
               two++;
               break;
            case 'three':
               three++;
               break;
            case 'four':
               four++;
               break;
            default:
               throw Error('Invalid element!!!');
         }
      };

      expect(one).toBeGreaterThan(0);
      expect(two).toBeGreaterThan(0);
      expect(three).toBeGreaterThan(0);
      expect(four).toBeGreaterThan(0);

      var ratio = (one / two) / (three / four);
      expect(ratio).toBeCloseTo(1.0, .1, 'Should pick elements equally');

   });

   it('can pick a subset of an array', () => {
      var random1 = new ex.Random(10);
      var array = ['one', 'two', 'three', 'four'];

      expect(() => random1.pickSet(array, 5)).toThrowError('Invalid number of elements to pick, must pick a value 0 < n <= length');
      expect(() => random1.pickSet(array, -1)).toThrowError('Invalid number of elements to pick, must pick a value 0 < n <= length');
      expect(random1.pickSet(array, 0).length).toBe(0);
      expect(random1.pickSet(array, 2).length).toBe(2);
   });

   it('can pick a set of an array with dups', () => {
      var array = ['one', 'two', 'three', 'four'];
      var numCounts = 1000;

      var random1 = new ex.Random(10);

      var counts = {
         one: {
            count: 0,
            lastIndex: -1
         },
         two: {
            count: 0,
            lastIndex: -1
         },
         three: {
            count: 0,
            lastIndex: -1
         },
         four: {
            count: 0,
            lastIndex: -1
         }
      };

      var newSet = random1.pickSet(array, numCounts, true);

      for (let i = 0; i < numCounts; i++) {
         const element = counts[newSet[i]];

         if (!element) {
            throw Error('Invalid element!!!');
         }

         if (element.lastIndex < i) {
            element.count += 1;
            element.lastIndex = i;
         }
      }

      expect(counts.one.count).toBeGreaterThan(0);
      expect(counts.two.count).toBeGreaterThan(0);
      expect(counts.three.count).toBeGreaterThan(0);
      expect(counts.four.count).toBeGreaterThan(0);

      var countsSum = counts.one.count + counts.two.count + counts.three.count + counts.four.count;
      expect(countsSum).toEqual(numCounts);

      var ratio = (counts.one.count / counts.two.count) / (counts.three.count / counts.four.count);
      expect(ratio).toBeCloseTo(1.0, .1, 'Should pick elements equally');
   });

   it('can shuffle arrays', () => {
      var array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

      var random1 = new ex.Random(10);

      var shuffled = random1.shuffle(array);

      expect(array.length).toBe(shuffled.length);
      // to be fair this won't necessarily be true all the time
      // but for the seed it should be consistent
      expect(array[0]).not.toBe(shuffled[0]);

   });

   it('can generate a random range', () => {
      var random1 = new ex.Random(10);

      var randomArray = random1.range(1000, 0, 4);

      expect(randomArray.length).toBe(1000);

      var expectedValue = (0 + 4) / 2;

      var average = randomArray.reduce((acc, curr, i, arr) => {
         return acc + curr;
      }, 0) / 1000;

      expect(average).toBeCloseTo(expectedValue, .01, 'Should pick elements equally');
   });

   it('can do d4 dice rolls', () => {
      var d4min = 900;
      var d4max = -1;

      var random1 = new ex.Random(10);
      for (var i = 0; i < 2000; i++) {
         let roll = random1.d4();
         d4min = Math.min(roll, d4min);
         d4max = Math.max(roll, d4max);
      }

      expect(d4min).toBeGreaterThan(0);
      expect(d4max).toBeLessThan(5);
   });

   it('can do d6 dice rolls', () => {
      var d6min = 900;
      var d6max = -1;

      var random1 = new ex.Random(10);
      for (var i = 0; i < 2000; i++) {
         let roll = random1.d6();
         d6min = Math.min(roll, d6min);
         d6max = Math.max(roll, d6max);
      }

      expect(d6min).toBeGreaterThan(0);
      expect(d6max).toBeLessThan(7);
   });

   it('can do d8 dice rolls', () => {
      var min = 900;
      var max = -1;

      var random1 = new ex.Random(10);
      for (var i = 0; i < 2000; i++) {
         let roll = random1.d8();
         min = Math.min(roll, min);
         max = Math.max(roll, max);
      }

      expect(min).toBeGreaterThan(0);
      expect(max).toBeLessThan(9);
   });

   it('can do d10 dice rolls', () => {
      var min = 900;
      var max = -1;

      var random1 = new ex.Random(10);
      for (var i = 0; i < 2000; i++) {
         let roll = random1.d10();
         min = Math.min(roll, min);
         max = Math.max(roll, max);
      }

      expect(min).toBeGreaterThan(0);
      expect(max).toBeLessThan(11);
   });

   it('can do d12 dice rolls', () => {
      var min = 900;
      var max = -1;

      var random1 = new ex.Random(10);
      for (var i = 0; i < 2000; i++) {
         let roll = random1.d12();
         min = Math.min(roll, min);
         max = Math.max(roll, max);
      }

      expect(min).toBeGreaterThan(0);
      expect(max).toBeLessThan(13);
   });

    it('can do d20 dice rolls', () => {
      var min = 900;
      var max = -1;

      var random1 = new ex.Random(10);
      for (var i = 0; i < 2000; i++) {
         let roll = random1.d20();
         min = Math.min(roll, min);
         max = Math.max(roll, max);
      }

      expect(min).toBeGreaterThan(0);
      expect(max).toBeLessThan(21);
   });

});