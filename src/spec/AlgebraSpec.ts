/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('Vectors', () => {
   it('should exists', () => {
      expect(ex.Vector).toBeDefined();
   });
   
   it('can be instantiated', () => {
      var v = new ex.Vector(20, 200);
      expect(v).not.toBeNull();
   });
   
   it('can have values set', () => {
      var v = new ex.Vector(20, 200);
      
      expect(v.x).toEqual(20);
      expect(v.y).toEqual(200);
      
      v.x = 200;
      v.y = 20;
      
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
      var v = new ex.Vector(20, 20);
      
      expect(v.equals(v.add(new ex.Vector(.0005, .0005)))).toBeTruthy();
      expect(v.equals(ex.Vector.Zero)).not.toBeTruthy();
   });
   
   it('can be created from an angle', () => {
      var v = ex.Vector.fromAngle(Math.PI / 2);
     
      expect(v.equals(new ex.Vector(0, 1))).toBeTruthy();
   });
   
   it('can be transformed to an angle', () => {
      var v = ex.Vector.fromAngle(Math.PI / 4);
      expect(v.toAngle()).toBe(Math.PI / 4);
   });
   
   it('can calculate distance to origin', () =>  {
      var v = new ex.Vector(20, 0);
      var v2 = new ex.Vector(0, -20);
      
      expect(v.distance()).toBe(20);
      expect(v2.distance()).toBe(20);
   });
   
   it('can calculate the distance to another vector', () => {
     var v = new ex.Vector(-10, 0);
     var v2 = new ex.Vector(10, 0);
     expect(v.distance(v2)).toBe(20); 
   });
   
   it('can be normalized to a lenght of 1', () => {
      var v = new ex.Vector(10, 0);
      
      expect(v.distance()).toBe(10);
      expect(v.normalize().distance()).toBe(1);
   });
   
   it('can be scaled', () => {
      var v = new ex.Vector(10, 0);
      
      expect(v.distance()).toBe(10);
      expect(v.scale(10).distance()).toBe(100);
   });
   
   it('can be added to another', () => {
      var v = new ex.Vector(10, 0);
      var v2 = new ex.Vector(0, 10);
      
      expect(v.add(v2).equals(new ex.Vector(10, 10))).toBeTruthy();
   });
   
   it('can be subracted from another', () => {
      var v = new ex.Vector(10, 0);
      var v2 = new ex.Vector(0, 10);
      
      expect(v.sub(v2).equals(new ex.Vector(10, -10))).toBeTruthy();
   });
   
   it('can be added and set at the same time', () => {
      var v = new ex.Vector(10, 0);
      var v2 = new ex.Vector(0, 10);
      
      v.addEqual(v2);
      
      expect(v.x).toBe(10);
      expect(v.y).toBe(10);
   });
   
   it('can be subracted and set at the same time', () => {
      var v = new ex.Vector(10, 0);
      var v2 = new ex.Vector(0, 10);
      
      v.subEqual(v2);
      
      expect(v.x).toBe(10);
      expect(v.y).toBe(-10);
   });
   
   it('can be scaled and set at the same time', () => {
      var v = new ex.Vector(10, 0);
      v.scaleEqual(10);      
      expect(v.x).toBe(100);
   });
   
   it('can be negated', () => {
      var v = new ex.Vector(10, 0);
      expect(v.negate().x).toBe(-10);
   });
   
   it('can be dotted with another 2d vector', () => {
      var v = new ex.Vector(1, 0);
      var v2 = new ex.Vector(-1, 0);
      
      // vectors in opposite directions are negative
      expect(v.dot(v2)).toBeLessThan(0);
      // vectors in the same direction are positive
      expect(v.dot(v2.negate())).toBeGreaterThan(0);
      // vectors that are perpendicular are zero
      expect(v.dot(v.perpendicular())).toBe(0);
      // dot product indicates the directionness of vectors
      // if 2 vectors in the same dir 1 at 45 degress should
      // be cos(45) in the same direction
      expect(v.dot(ex.Vector.fromAngle(Math.PI / 4))).toBe(Math.cos(Math.PI / 4));
   });
   
   it('can be rotated by an angle about the origin', () => {
      var v = new ex.Vector(1, 0);
      var rotated = v.rotate(Math.PI);
      expect(rotated.equals(new ex.Vector(-1, 0))).toBeTruthy();
   });
   
   it('can be rotated by an angle about a point', () => {
      var v = new ex.Vector(1, 0);
      var rotate = v.rotate(Math.PI, new ex.Vector(2, 0));
      expect(rotate.equals(new ex.Vector(3, 0))).toBeTruthy();
   });
   
   it('can be cloned', () => {
      var v = new ex.Vector(1, 0);
      var c = v.clone();
      
      expect(c.x).toBe(v.x);
      expect(c.y).toBe(v.y);
      
      v.setTo(20, 20);
      
      expect(c.x).not.toBe(v.x);
      expect(c.y).not.toBe(v.y);
   });
   
});

describe('Rays', () => {
   it('exists', () => {
      expect(ex.Ray).toBeDefined();
   });
   
   it('can be constructed', () => {
      var ray = new ex.Ray(ex.Vector.Zero.clone(), new ex.Vector(1, 0));
      expect(ray).toBeTruthy();
      expect(ray.dir.equals(new ex.Vector(1, 0)));
   });
   
   it('can intersect with lines', () => {
      var ray = new ex.Ray(ex.Vector.Zero.clone(), new ex.Vector(1, 0));
      var line = new ex.Line(new ex.Vector(1, -1), new ex.Vector(1, 1));
      var intersection = ray.intersect(line);
      
      expect(intersection).toBeGreaterThan(0);
      
      var point = ray.getPoint(intersection);
      
      expect(point.equals(new ex.Vector(1, 0))).toBeTruthy();
   });
   
});

describe('Lines', () => {
   it('exist', () => {
      expect(ex.Line).toBeDefined();
   });
   
   it('can be constructed', () => {
      var line = new ex.Line(new ex.Vector(1, -1), new ex.Vector(1, 1));
      expect(line).toBeTruthy();
   });
   
   it('can have a slope', () => {
      var line = new ex.Line(new ex.Vector(1, -1), new ex.Vector(1, 1));
      var slope = line.getSlope();
      
      expect(slope.equals(new ex.Vector(0, 1))).toBeTruthy();
   });
   
   it('can have a length', () => {
      var line = new ex.Line(new ex.Vector(1, -1), new ex.Vector(1, 1));
      expect(line.getLength()).toBe(2);
   });
});

describe('Projections', () => {
   it('exists', () => {
      expect(ex.Projection).toBeDefined();
   });
   
   it('can be constructed', () => {
      var proj = new ex.Projection(5, 10);
      expect(proj).toBeTruthy();
   });
   
   it('can detect overlap between projections', () => {
      var proj = new ex.Projection(5, 10);
      var proj2 = new ex.Projection(7, 12);
      expect(proj.getOverlap(proj2)).toBe(3);
   });
   
   it('can detect overlap between projections across zero', () => {
      var proj = new ex.Projection(-5, 2);
      var proj2 = new ex.Projection(-2, 5);
      expect(proj.getOverlap(proj2)).toBe(4);
   });
   
   it('can detect no overlap between projections', () => {
      var proj = new ex.Projection(5, 10);
      var proj2 = new ex.Projection(10, 12);
      expect(proj.getOverlap(proj2)).toBe(0);
   });
   
   it('can detect no overlap between projections with separation', () => {
      var proj = new ex.Projection(5, 10);
      var proj2 = new ex.Projection(11, 12);
      expect(proj.getOverlap(proj2)).toBe(0);
   });
   
});