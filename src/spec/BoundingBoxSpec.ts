import * as ex from '@excalibur';

describe('A Bounding Box constructed with no parameters', () => {
  const bb = new ex.BoundingBox();

  it('has a left', () => {
    expect(bb.left).toBe(0);
  });

  it('has a top', () => {
    expect(bb.top).toBe(0);
  });

  it('has a right', () => {
    expect(bb.right).toBe(0);
  });

  it('has a bottom', () => {
    expect(bb.bottom).toBe(0);
  });
});

describe('A Bounding Box', function() {
  /**
   *
   */
  function createBBFromOption() {
    return new ex.BoundingBox({ left: 0, top: 0, right: 10, bottom: 10 });
  }

  /**
   *
   */
  function createBBFromParameters() {
    return new ex.BoundingBox(0, 0, 10, 10);
  }

  runBoundingBoxTests('Constructed from option object', createBBFromOption);
  runBoundingBoxTests('Constructed from parameters', createBBFromParameters);
});

/**
 *
 */
function runBoundingBoxTests(creationType: string, createBoundingBox: Function) {
  describe(creationType, function() {
    let bb: ex.BoundingBox;

    beforeEach(function() {
      //create an instance by invoking the constructor function
      bb = createBoundingBox();
    });

    it('has a width', () => {
      expect(bb.width).toBe(10);
      bb.right = 20;
      expect(bb.width).toBe(20);
      bb.left = -20;
      expect(bb.width).toBe(40);
      bb.top = -20;
      expect(bb.width).toBe(40);
    });

    it('has a height', () => {
      expect(bb.height).toBe(10);
      bb.right = 20;
      expect(bb.height).toBe(10);
      bb.bottom = 20;
      expect(bb.height).toBe(20);
      bb.top = -20;
      expect(bb.height).toBe(40);
    });

    it('can contain points', () => {
      expect(bb.left).toBe(0);
      expect(bb.right).toBe(10);
      bb.right = 20;
      bb.bottom = 20;

      expect(bb.contains(new ex.Vector(10, 10))).toBe(true);

      expect(bb.contains(new ex.Vector(0, 0))).toBe(true);

      expect(bb.contains(new ex.Vector(20, 20))).toBe(true);

      expect(bb.contains(new ex.Vector(21, 20))).toBe(false);
      expect(bb.contains(new ex.Vector(20, 21))).toBe(false);

      expect(bb.contains(new ex.Vector(0, -1))).toBe(false);
      expect(bb.contains(new ex.Vector(-1, 0))).toBe(false);
      expect(bb.contains(new ex.Vector(10, 0))).toBe(true);
      expect(bb.contains(new ex.Vector(10, 20))).toBe(true);
    });

    it('can collide with other bounding boxes', () => {
      const b2 = new ex.BoundingBox(2, 0, 20, 10);
      const b3 = new ex.BoundingBox(12, 0, 28, 10);

      // bb should resolve by being displaced -8 to the left against b2
      expect(bb.intersect(b2).x).toBe(-8);

      // b2 should resolve by being displaced -8 to the left against b3
      expect(b2.intersect(b3).x).toBe(-8);

      // bb should not collide with b3, they are only touching
      expect(bb.intersect(b3)).toBeFalsy();

      b2.top = 5;
      b2.left = 6;
      b2.right = 15;
      b2.bottom = 15;

      // bb should be displaced up and out by -5 against b2
      expect(bb.intersect(b2).x).toBe(-4);
    });

    it('can collide with other bounding boxes with width/height (0,0)', () => {
      const bb = new ex.BoundingBox(18, 15, 18, 15); // point bounding box
      const bb2 = new ex.BoundingBox(0, 0, 20, 20); // square bounding box;

      expect(bb2.intersect(bb)).not.toBe(null, 'Point bounding boxes should still collide');
      expect(bb2.intersect(bb).x).toBe(-2);
      expect(bb2.intersect(bb).y).toBe(0);
    });

    describe('when in full containment', () => {
      it('closest right', () => {
        const bb = new ex.BoundingBox(0, 0, 50, 50);
        const bb1 = new ex.BoundingBox(40, 8, 49, 12);
        expect(bb.intersect(bb1)).not.toBe(null);
        expect(bb.intersect(bb1).x).toBe(-10, 'X should be -10');
        expect(bb.intersect(bb1).y).toBe(0, 'Y should be 0');
      });

      it('closet left', () => {
        const bb = new ex.BoundingBox(0, 0, 50, 50);
        const bb1 = new ex.BoundingBox(1, 15, 10, 20);
        expect(bb.intersect(bb1)).not.toBe(null);
        expect(bb.intersect(bb1).x).toBe(10, 'X should be 10');
        expect(bb.intersect(bb1).y).toBe(0, 'Y should be 0');
      });

      it('closest top', () => {
        const bb = new ex.BoundingBox(0, 0, 50, 50);
        const bb1 = new ex.BoundingBox(10, 1, 12, 10);
        expect(bb.intersect(bb1)).not.toBe(null);
        expect(bb.intersect(bb1).x).toBe(0, 'X should be 0');
        expect(bb.intersect(bb1).y).toBe(10, 'Y should be 0');
      });

      it('closest bottom', () => {
        const bb = new ex.BoundingBox(0, 0, 50, 50);
        const bb1 = new ex.BoundingBox(10, 40, 12, 49);
        expect(bb.intersect(bb1)).not.toBe(null);
        expect(bb.intersect(bb1).x).toBe(0, 'X should be 0');
        expect(bb.intersect(bb1).y).toBe(-10, 'Y should be -10');
      });
    });

    it('can collide with other bounding boxes of the same width/height', () => {
      const bb1 = new ex.BoundingBox(0, 0, 10, 10);
      const bb2 = new ex.BoundingBox(0, 0, 10, 10);

      expect(bb2.intersect(bb1)).not.toBe(null);
      expect(bb2.intersect(bb1).x).toBe(0);
      expect(bb2.intersect(bb1).y).toBe(-10);
    });

    it('can combine with other bounding boxes', () => {
      const b2 = new ex.BoundingBox(2, 0, 20, 10);
      const b3 = new ex.BoundingBox(12, 0, 28, 10);
      const newBB = b2.combine(b3);

      expect(newBB.width).toBe(26);
      expect(newBB.height).toBe(10);

      expect(newBB.left).toBe(2);
      expect(newBB.right).toBe(28);
      expect(newBB.top).toBe(0);
      expect(newBB.bottom).toBe(10);
    });

    it('ray cast can hit a bounding box', () => {
      const bb = new ex.BoundingBox(0, 0, 10, 10);

      const ray = new ex.Ray(new ex.Vector(-10, 5), ex.Vector.Right);

      expect(bb.rayCast(ray)).toBe(true);
    });

    it('ray cast can miss a bounding box', () => {
      const bb = new ex.BoundingBox(0, 0, 10, 10);

      const ray = new ex.Ray(new ex.Vector(-10, 5), ex.Vector.Left);

      expect(bb.rayCast(ray)).toBe(false);
    });

    it('ray cast can miss a box far away', () => {
      const bb = new ex.BoundingBox(1176, 48, 1200, 72);

      const ray = new ex.Ray(new ex.Vector(48, 72), ex.Vector.Down);
      expect(bb.rayCast(ray)).toBe(false);
    });

    it('ray cast can hit bounding box on the edge', () => {
      const bb = new ex.BoundingBox(0, 0, 10, 10);

      const ray = new ex.Ray(new ex.Vector(0, -5), ex.Vector.Down);

      expect(bb.rayCast(ray)).toBe(true);
    });

    it('ray cast can originate from inside the box', () => {
      const bb = new ex.BoundingBox(0, 0, 10, 10);

      const ray = new ex.Ray(new ex.Vector(5, 5), ex.Vector.Down);

      expect(bb.rayCast(ray)).toBe(true);
    });

    it('ray cast in the correct direction but that are not long enough dont hit', () => {
      const bb = new ex.BoundingBox(0, 0, 10, 10);

      const ray = new ex.Ray(new ex.Vector(-10, 5), ex.Vector.Right);

      expect(bb.rayCast(ray, ray.dir.size)).toBe(false);
    });

    it('ray cast when the origin is on the boundary', () => {
      const bb = new ex.BoundingBox(0, 0, 10, 10);

      const ray = new ex.Ray(new ex.Vector(0, 5), ex.Vector.Right);

      expect(bb.rayCast(ray)).toBe(true);
    });

    it('can ray cast and get the intersection time', () => {
      const bb = new ex.BoundingBox(0, 0, 10, 10);

      const ray = new ex.Ray(new ex.Vector(0, -5), ex.Vector.Down);

      expect(bb.rayCastTime(ray)).toBe(5);
    });

    it('can ray cast but if past far clip returns -1', () => {
      const bb = new ex.BoundingBox(0, 0, 10, 10);

      const ray = new ex.Ray(new ex.Vector(0, -5), ex.Vector.Down);

      expect(bb.rayCastTime(ray, 4)).toBe(-1);
    });
  });
}
