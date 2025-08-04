import * as ex from '@excalibur';

describe('Vectors', () => {
  it('should exists', () => {
    expect(ex.Vector).toBeDefined();
  });

  it('can be instantiated', () => {
    const v = new ex.Vector(20, 200);
    expect(v).not.toBeNull();
  });

  it('can have values set', () => {
    const v = new ex.Vector(20, 200);

    expect(v).toBeVector(new ex.Vector(20, 200));
    expect(v.x).toEqual(20);
    expect(v.y).toEqual(200);

    v.setTo(200, 20);

    expect(v.x).toEqual(200);
    expect(v.y).toEqual(20);

    v.setTo(0, 0);

    expect(v.x).toEqual(0);
    expect(v.y).toEqual(0);
  });

  it('has a Zero constant', () => {
    expect(ex.Vector.Zero.x).toEqual(0);
    expect(ex.Vector.Zero.y).toEqual(0);
  });

  it('can test against equality within tolerance', () => {
    const v = new ex.Vector(20, 20);

    expect(v.equals(v.add(new ex.Vector(0.0005, 0.0005)))).toBeTruthy();
    expect(v.equals(ex.Vector.Zero)).not.toBeTruthy();
  });

  it('can be created from an angle', () => {
    const v = ex.Vector.fromAngle(Math.PI / 2);

    expect(v.equals(new ex.Vector(0, 1))).toBeTruthy();
  });

  it('can be transformed to an angle', () => {
    const target = Math.PI / 4;
    const v = ex.Vector.fromAngle(target);
    expect(v.toAngle()).toBeCloseTo(target, 4);
  });

  it('will return toAngle between 0 and 2PI', () => {
    const zero = ex.vec(1, 0);
    expect(zero.toAngle()).toBeCloseTo(0);

    const fortyFive = ex.vec(1, 1);
    expect(fortyFive.toAngle()).toBeCloseTo(Math.PI / 4);

    const ninety = ex.vec(0, 1);
    expect(ninety.toAngle()).toBeCloseTo(Math.PI / 2);

    const oneThirtyFive = ex.vec(-1, 1);
    expect(oneThirtyFive.toAngle()).toBeCloseTo((Math.PI * 3) / 4);

    const oneEighty = ex.vec(-1, 0);
    expect(oneEighty.toAngle()).toBeCloseTo(Math.PI);

    const twoTwentyFive = ex.vec(-1, -1);
    expect(twoTwentyFive.toAngle()).toBeCloseTo((Math.PI * 5) / 4);

    const twoSeventy = ex.vec(0, -1);
    expect(twoSeventy.toAngle()).toBeCloseTo((Math.PI * 3) / 2);

    const threeFifteen = ex.vec(1, -1);
    expect(threeFifteen.toAngle()).toBeCloseTo((Math.PI * 7) / 4);

    const threeSixty = ex.vec(1, -0.0001);
    expect(threeSixty.toAngle()).toBeCloseTo(Math.PI * 2);
  });

  it('can calculate distance to origin', () => {
    const v = new ex.Vector(20, 0);
    const v2 = new ex.Vector(0, -20);

    expect(v.distance()).toBe(20);
    expect(v2.distance()).toBe(20);
  });

  it('can have a magnitude', () => {
    const v = new ex.Vector(20, 0);
    const v2 = new ex.Vector(0, -20);

    expect(v.magnitude).toBe(20);
    expect(v2.magnitude).toBe(20);
  });

  it('can have magnitude set', () => {
    const v = new ex.Vector(20, 0);
    const v2 = new ex.Vector(3, 4);

    v.magnitude = 10;
    v2.magnitude = 13;

    expect(v.equals(new ex.Vector(10, 0))).toBeTruthy();
    expect(v2.equals(new ex.Vector(7.8, 10.4))).toBeTruthy();
  });

  it('can calculate the distance to another vector', () => {
    const v = new ex.Vector(-10, 0);
    const v2 = new ex.Vector(10, 0);
    expect(v.distance(v2)).toBe(20);
  });

  it('can calculate the distance between two vectors', () => {
    const v1 = new ex.Vector(-10, 0);
    const v2 = new ex.Vector(10, 0);
    expect(ex.Vector.distance(v1, v2)).toBe(20);
  });

  describe('angleBetween', () => {
    type TestCaseParameters = {
      description: string;
      vector: ex.Vector;
      angle: number;
      rotationType: ex.RotationType;
      expected: number;
    };
    const tc = (
      description: string,
      vector: ex.Vector,
      angle: number,
      rotationType: ex.RotationType,
      expected: number
    ): TestCaseParameters => ({
      vector,
      description,
      angle,
      rotationType,
      expected
    });
    const description = (tc: TestCaseParameters) =>
      `${tc.description}: ${tc.vector.toAngle()} -> ${ex.canonicalizeAngle(tc.angle)} ${tc.rotationType} expected: ${tc.expected}`;
    const downRight = ex.vec(1, 1);
    const downLeft = ex.vec(-1, 1);
    const upLeft = ex.vec(-1, -1);
    const upRight = ex.vec(1, -1);
    const downRightAngle = downRight.toAngle();
    const downLeftAngle = downLeft.toAngle();
    const upLeftAngle = upLeft.toAngle();
    const upRightAngle = upRight.toAngle();

    const testCases: TestCaseParameters[] = [
      tc('returns 0 when the new angle is the same as vectors angle', ex.Vector.Right, 0, ex.RotationType.Clockwise, 0),
      tc('knows that 2*PI is same as 0', ex.Vector.Right, ex.TwoPI, ex.RotationType.Clockwise, 0),
      tc('rotates from I to IV quadrant', upRight, downRightAngle, ex.RotationType.Clockwise, Math.PI / 2),
      tc('rotates from I to IV quadrant the shortest way', upRight, downRightAngle, ex.RotationType.ShortestPath, Math.PI / 2),
      tc('rotates from I to IV quadrant counterclockwise', upRight, downRightAngle, ex.RotationType.CounterClockwise, -(3 * Math.PI) / 2),
      tc('rotates from I to IV quadrant the longest way', upRight, downRightAngle, ex.RotationType.LongestPath, -(3 * Math.PI) / 2),
      tc('rotates from I to II quadrant', upRight, upLeftAngle, ex.RotationType.Clockwise, (3 * Math.PI) / 2),
      tc('rotates from I to II quadrant the shortest way', upRight, upLeftAngle, ex.RotationType.ShortestPath, -Math.PI / 2),
      tc('rotates from I to II quadrant counterclockwise', upRight, upLeftAngle, ex.RotationType.CounterClockwise, -Math.PI / 2),
      tc('rotates from I to II quadrant the longest way', upRight, upLeftAngle, ex.RotationType.LongestPath, (3 * Math.PI) / 2)
    ];

    testCases.forEach((testCase) => {
      it(description(testCase), () => {
        const result = testCase.vector.angleBetween(testCase.angle, testCase.rotationType);
        expect(result).toBeCloseTo(testCase.expected);
      });
    });
  });

  it('can be normalized to a length of 1', () => {
    const v = new ex.Vector(10, 0);

    expect(v.distance()).toBe(10);
    expect(v.normalize().distance()).toBe(1);
  });

  it('can be scaled', () => {
    const v = new ex.Vector(10, 0);

    expect(v.distance()).toBe(10);
    expect(v.scale(10).distance()).toBe(100);
  });

  it('can be added to another', () => {
    const v = new ex.Vector(10, 0);
    const v2 = new ex.Vector(0, 10);

    expect(v.add(v2).equals(new ex.Vector(10, 10))).toBeTruthy();
  });

  it('can be subtracted from another', () => {
    const v = new ex.Vector(10, 0);
    const v2 = new ex.Vector(0, 10);

    expect(v.sub(v2).equals(new ex.Vector(10, -10))).toBeTruthy();
  });

  it('can be added and set at the same time', () => {
    const v = new ex.Vector(10, 0);
    const v2 = new ex.Vector(0, 10);

    v.addEqual(v2);

    expect(v.x).toBe(10);
    expect(v.y).toBe(10);
  });

  it('can be subtracted and set at the same time', () => {
    const v = new ex.Vector(10, 0);
    const v2 = new ex.Vector(0, 10);

    v.subEqual(v2);

    expect(v.x).toBe(10);
    expect(v.y).toBe(-10);
  });

  it('can be scaled and set at the same time', () => {
    const v = new ex.Vector(10, 0);

    v.scaleEqual(10);

    expect(v.x).toBe(100);
  });

  it('can be negated', () => {
    const v = new ex.Vector(10, 0);
    expect(v.negate().x).toBe(-10);
  });

  it('can be dotted with another 2d vector', () => {
    const v = new ex.Vector(1, 0);
    const v2 = new ex.Vector(-1, 0);

    // vectors in opposite directions are negative
    expect(v.dot(v2)).toBeLessThan(0);
    // vectors in the same direction are positive
    expect(v.dot(v2.negate())).toBeGreaterThan(0);
    // vectors that are perpendicular are zero
    expect(v.dot(v.perpendicular())).toBe(0);
    // dot product measures how close two vectors are to being parallel
    // the dot product of two vectors, where the second vector is at a
    // 45 degree angle to the first, should be cos(45) in the same direction.
    expect(v.dot(ex.Vector.fromAngle(Math.PI / 4))).toBe(Math.cos(Math.PI / 4));
  });

  it('can be rotated by an angle about the origin', () => {
    const v = new ex.Vector(1, 0);
    const rotated = v.rotate(Math.PI);
    expect(rotated.equals(new ex.Vector(-1, 0))).toBeTruthy();
  });

  it('can be rotated by positive angle clockwise', () => {
    const v = ex.Vector.Up;
    const rotated = v.rotate(Math.PI / 2);
    expect(rotated.equals(ex.Vector.Right)).toBeTruthy();
  });

  it('can be rotated by an angle about a point', () => {
    const v = new ex.Vector(1, 0);
    const rotate = v.rotate(Math.PI, new ex.Vector(2, 0));
    expect(rotate.equals(new ex.Vector(3, 0))).toBeTruthy();
  });

  it('can be checked for validity on infinity vectors', () => {
    const invalidTest1 = new ex.Vector(Infinity, Infinity);
    const invalidTest2 = new ex.Vector(-Infinity, -Infinity);
    const invalidTest3 = new ex.Vector(Infinity, -Infinity);
    const invalidTest4 = new ex.Vector(-Infinity, Infinity);
    const oneComponentInvalidTest1 = new ex.Vector(Infinity, -2);
    const oneComponentInvalidTest2 = new ex.Vector(-Infinity, 2);
    const oneComponentInvalidTest3 = new ex.Vector(1, Infinity);
    const oneComponentInvalidTest4 = new ex.Vector(1, -Infinity);

    expect(ex.Vector.isValid(invalidTest1), 'Infinity vectors should be invalid').toBe(false);
    expect(ex.Vector.isValid(invalidTest2), 'Infinity vectors should be invalid').toBe(false);
    expect(ex.Vector.isValid(invalidTest3), 'Infinity vectors should be invalid').toBe(false);
    expect(ex.Vector.isValid(invalidTest4), 'Infinity vectors should be invalid').toBe(false);
    expect(ex.Vector.isValid(oneComponentInvalidTest1), 'Infinity vectors with one component at +/-Infinity should be invalid').toBe(false);
    expect(ex.Vector.isValid(oneComponentInvalidTest2), 'Infinity vectors with one component at +/-Infinity should be invalid').toBe(false);
    expect(ex.Vector.isValid(oneComponentInvalidTest3), 'Infinity vectors with one component at +/-Infinity should be invalid').toBe(false);
    expect(ex.Vector.isValid(oneComponentInvalidTest4), 'Infinity vectors with one component at +/-Infinity should be invalid').toBe(false);
  });

  it('can be checked for validity on NaN vectors', () => {
    const invalid = new ex.Vector(NaN, NaN);
    const oneComponentInvalid = new ex.Vector(NaN, 2);

    expect(ex.Vector.isValid(invalid), 'NaN vectors should be invalid').toBe(false);
    expect(ex.Vector.isValid(oneComponentInvalid), 'NaN vectors with one component should be invalid').toBe(false);
  });

  it('can be checked for validity on null or undefined vectors', () => {
    const invalidNull: ex.Vector = null;
    const invalidUndef: ex.Vector = undefined;

    expect(ex.Vector.isValid(invalidNull), 'Null vectors should be invalid').toBe(false);
    expect(ex.Vector.isValid(invalidUndef), 'undefined vectors should be invalid').toBe(false);
  });

  it('can be cloned', () => {
    const v = new ex.Vector(1, 0);
    const c = v.clone();

    expect(c.x).toBe(v.x);
    expect(c.y).toBe(v.y);

    v.setTo(20, 20);

    expect(c.x).not.toBe(v.x);
    expect(c.y).not.toBe(v.y);
  });

  it('can be printed toString(fixed)', () => {
    const v = new ex.Vector(1.2345, 2.345);

    expect(v.toString(2)).toBe('(1.23, 2.35)');
  });

  it('can find the min between vectors', () => {
    const v1 = new ex.Vector(0, 1);
    const v2 = new ex.Vector(2, 0);

    const sut = ex.Vector.min(v1, v2);

    expect(sut).toBeVector(ex.vec(0, 0));
  });

  it('can find the max between vectors', () => {
    const v1 = new ex.Vector(0, 1);
    const v2 = new ex.Vector(2, 0);

    const sut = ex.Vector.max(v1, v2);

    expect(sut).toBeVector(ex.vec(2, 1));
  });

  it('can clamp the vectors magnitude', () => {
    const sut = new ex.Vector(10, 5);
    const before = sut.normalize();

    sut.clampMagnitude(5);

    const after = sut.normalize();
    expect(before.x).toBeCloseTo(after.x, 4);
    expect(before.y).toBeCloseTo(after.y, 4);
    expect(sut.magnitude).toBe(5);
  });

  it('can lerp between vectors', () => {
    const startingVector = new ex.Vector(0, 0);
    const endingVector = new ex.Vector(4, 4);

    const lerpVector = startingVector.lerp(endingVector, 0.5);
    expect(lerpVector.x).toBeCloseTo(2);
    expect(lerpVector.y).toBeCloseTo(2);

    const lerpVector2 = startingVector.lerp(endingVector, 0.25);
    expect(lerpVector2.x).toBeCloseTo(1);
    expect(lerpVector2.y).toBeCloseTo(1);

    const lerpVector3 = startingVector.lerp(endingVector, 0.75);
    expect(lerpVector3.x).toBeCloseTo(3);
    expect(lerpVector3.y).toBeCloseTo(3);

    const lerpVector4 = startingVector.lerp(endingVector, 1);
    expect(lerpVector4.x).toBeCloseTo(4);
    expect(lerpVector4.y).toBeCloseTo(4);
  });

  it('can accept oob numbers in lerp and clamp them', () => {
    const startingVector = new ex.Vector(0, 0);
    const endingVector = new ex.Vector(4, 4);

    const lerpVector = startingVector.lerp(endingVector, 10);
    expect(lerpVector.x).toBeCloseTo(4);
    expect(lerpVector.y).toBeCloseTo(4);

    const lerpVector2 = startingVector.lerp(endingVector, -10);
    expect(lerpVector2.x).toBeCloseTo(0);
    expect(lerpVector2.y).toBeCloseTo(0);
  });
});

describe('helpers', () => {
  describe('vec', () => {
    it('returns a new Vector instance on each call', () => {
      const vector1 = ex.vec(1, 0);
      const vector2 = ex.vec(1, 0);
      const vector3 = ex.vec(NaN, Number.NEGATIVE_INFINITY);
      expect(vector1 instanceof ex.Vector).toBe(true);
      expect(vector2 instanceof ex.Vector).toBe(true);
      expect(vector3 instanceof ex.Vector).toBe(true);
      expect(vector1).not.toBe(vector2);
    });

    it('returns a Vector instance with the specified properties', () => {
      const [x, y] = [Date.now(), Math.random()];
      const vector = ex.vec(x, y);
      expect(vector.x).toBe(x);
      expect(vector.y).toBe(y);
    });
  });
});
