import * as ex from '../../build/dist/excalibur';

describe('A Bounding Box', () => {
  // left, top, right, bottom
  var bb: ex.BoundingBox;
  beforeEach(() => {
    bb = new ex.BoundingBox(0, 0, 10, 10);
  });

  it('has a width', () => {
    expect(bb.getWidth()).toBe(10);
    bb.right = 20;
    expect(bb.getWidth()).toBe(20);
    bb.left = -20;
    expect(bb.getWidth()).toBe(40);
    bb.top = -20;
    expect(bb.getWidth()).toBe(40);
  });

  it('has a height', () => {
    expect(bb.getHeight()).toBe(10);
    bb.right = 20;
    expect(bb.getHeight()).toBe(10);
    bb.bottom = 20;
    expect(bb.getHeight()).toBe(20);
    bb.top = -20;
    expect(bb.getHeight()).toBe(40);
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
    var b2 = new ex.BoundingBox(2, 0, 20, 10);
    var b3 = new ex.BoundingBox(12, 0, 28, 10);

    // bb should resolve by being displaced -8 to the left against b2
    expect(bb.collides(b2).x).toBe(-8);

    // b2 should resolve by being displaced -8 to the left against b3
    expect(b2.collides(b3).x).toBe(-8);

    // bb should not collide with b3, they are only touching
    expect(bb.collides(b3)).toBeFalsy();

    b2.top = 5;
    b2.left = 6;
    b2.right = 15;
    b2.bottom = 15;

    // bb should be displaced up and out by -5 against b2
    expect(bb.collides(b2).x).toBe(-4);
  });

  it('can collide with other bounding boxes with width/height (0,0)', () => {
    var bb = new ex.BoundingBox(18, 15, 18, 15); // point bounding box
    var bb2 = new ex.BoundingBox(0, 0, 20, 20); // square bounding box;

    expect(bb2.collides(bb)).not.toBe(null, 'Point bounding boxes should still collide');
    expect(bb2.collides(bb).x).toBe(-2);
    expect(bb2.collides(bb).y).toBe(0);
  });

  describe('when in full containment', () => {
    it('closest right', () => {
      var bb = new ex.BoundingBox(0, 0, 50, 50);
      var bb1 = new ex.BoundingBox(40, 8, 49, 12);
      expect(bb.collides(bb1)).not.toBe(null);
      expect(bb.collides(bb1).x).toBe(-10, 'X should be -10');
      expect(bb.collides(bb1).y).toBe(0, 'Y should be 0');
    });

    it('closet left', () => {
      var bb = new ex.BoundingBox(0, 0, 50, 50);
      var bb1 = new ex.BoundingBox(1, 15, 10, 20);
      expect(bb.collides(bb1)).not.toBe(null);
      expect(bb.collides(bb1).x).toBe(10, 'X should be 10');
      expect(bb.collides(bb1).y).toBe(0, 'Y should be 0');
    });

    it('closest top', () => {
      var bb = new ex.BoundingBox(0, 0, 50, 50);
      var bb1 = new ex.BoundingBox(10, 1, 12, 10);
      expect(bb.collides(bb1)).not.toBe(null);
      expect(bb.collides(bb1).x).toBe(0, 'X should be 0');
      expect(bb.collides(bb1).y).toBe(10, 'Y should be 0');
    });

    it('closest bottom', () => {
      var bb = new ex.BoundingBox(0, 0, 50, 50);
      var bb1 = new ex.BoundingBox(10, 40, 12, 49);
      expect(bb.collides(bb1)).not.toBe(null);
      expect(bb.collides(bb1).x).toBe(0, 'X should be 0');
      expect(bb.collides(bb1).y).toBe(-10, 'Y should be -10');
    });
  });

  it('can collide with other bounding boxes of the same width/height', () => {
    var bb1 = new ex.BoundingBox(0, 0, 10, 10);
    var bb2 = new ex.BoundingBox(0, 0, 10, 10);

    expect(bb2.collides(bb1)).not.toBe(null);
    expect(bb2.collides(bb1).x).toBe(0);
    expect(bb2.collides(bb1).y).toBe(-10);
  });

  it('can combine with other bounding boxes', () => {
    var b2 = new ex.BoundingBox(2, 0, 20, 10);
    var b3 = new ex.BoundingBox(12, 0, 28, 10);
    var newBB = b2.combine(b3);

    expect(newBB.getWidth()).toBe(26);
    expect(newBB.getHeight()).toBe(10);

    expect(newBB.left).toBe(2);
    expect(newBB.right).toBe(28);
    expect(newBB.top).toBe(0);
    expect(newBB.bottom).toBe(10);
  });

  it('ray cast can hit a bounding box', () => {
    var bb = new ex.BoundingBox(0, 0, 10, 10);

    var ray = new ex.Ray(new ex.Vector(-10, 5), ex.Vector.Right);

    expect(bb.rayCast(ray)).toBe(true);
  });

  it('ray cast can miss a bounding box', () => {
    var bb = new ex.BoundingBox(0, 0, 10, 10);

    var ray = new ex.Ray(new ex.Vector(-10, 5), ex.Vector.Left);

    expect(bb.rayCast(ray)).toBe(false);
  });

  it('ray cast can miss a box far away', () => {
    var bb = new ex.BoundingBox(1176, 48, 1200, 72);

    var ray = new ex.Ray(new ex.Vector(48, 72), ex.Vector.Down);
    expect(bb.rayCast(ray)).toBe(false);
  });

  it('ray cast can hit bounding box on the edge', () => {
    var bb = new ex.BoundingBox(0, 0, 10, 10);

    var ray = new ex.Ray(new ex.Vector(0, -5), ex.Vector.Down);

    expect(bb.rayCast(ray)).toBe(true);
  });

  it('ray cast can originate from inside the box', () => {
    var bb = new ex.BoundingBox(0, 0, 10, 10);

    var ray = new ex.Ray(new ex.Vector(5, 5), ex.Vector.Down);

    expect(bb.rayCast(ray)).toBe(true);
  });

  it('ray cast in the correct direction but that are not long enough dont hit', () => {
    var bb = new ex.BoundingBox(0, 0, 10, 10);

    var ray = new ex.Ray(new ex.Vector(-10, 5), ex.Vector.Right);

    expect(bb.rayCast(ray, ray.dir.magnitude())).toBe(false);
  });

  it('ray cast when the origin is on the boundary', () => {
    var bb = new ex.BoundingBox(0, 0, 10, 10);

    var ray = new ex.Ray(new ex.Vector(0, 5), ex.Vector.Right);

    expect(bb.rayCast(ray)).toBe(true);
  });

  it('can ray cast and get the intersection time', () => {
    var bb = new ex.BoundingBox(0, 0, 10, 10);

    var ray = new ex.Ray(new ex.Vector(0, -5), ex.Vector.Down);

    expect(bb.rayCastTime(ray)).toBe(5);
  });

  it('can ray cast but if past far clip returns -1', () => {
    var bb = new ex.BoundingBox(0, 0, 10, 10);

    var ray = new ex.Ray(new ex.Vector(0, -5), ex.Vector.Down);

    expect(bb.rayCastTime(ray, 4)).toBe(-1);
  });
});
