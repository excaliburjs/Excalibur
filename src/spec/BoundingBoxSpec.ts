/// <reference path="jasmine.d.ts" />
/// <reference path="../engine/Collision/BoundingBox.ts" />

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
});