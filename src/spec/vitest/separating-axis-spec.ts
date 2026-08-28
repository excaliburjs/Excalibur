import * as ex from '@excalibur';
import { SeparatingAxis } from '../../engine/collision/colliders/separating-axis';

function makeCircle(x: number, y: number, radius: number): ex.CircleCollider {
  const actor = new ex.Actor({ x, y, radius });
  actor.collider.update();
  return actor.collider.get() as ex.CircleCollider;
}

function makeBox(x: number, y: number, width: number, height: number): ex.PolygonCollider {
  const actor = new ex.Actor({ x, y, width, height });
  actor.collider.update();
  return actor.collider.get() as ex.PolygonCollider;
}

describe('SeparatingAxis', () => {
  it('exists', () => {
    expect(SeparatingAxis).toBeDefined();
  });

  describe('findCirclePolygonSeparation', () => {
    it('returns a separating vector when the circle overlaps the polygon', () => {
      const circle = makeCircle(0, 0, 20);
      const box = makeBox(10, 0, 40, 40);

      const separation = SeparatingAxis.findCirclePolygonSeparation(circle, box);

      expect(separation).not.toBeNull();
      expect(separation!.magnitude).toBeGreaterThan(0);
    });

    it('returns null when the circle does not overlap the polygon', () => {
      const circle = makeCircle(0, 0, 10);
      const box = makeBox(1000, 0, 40, 40);

      const separation = SeparatingAxis.findCirclePolygonSeparation(circle, box);

      expect(separation).toBeNull();
    });
  });

  describe('findPolygonPolygonSeparation', () => {
    it('finds a negative separation (overlap) for intersecting polygons', () => {
      const boxA = makeBox(0, 0, 40, 40);
      const boxB = makeBox(20, 0, 40, 40);

      const result = SeparatingAxis.findPolygonPolygonSeparation(boxA, boxB);

      expect(result.collider).toBe(boxA);
      expect(result.separation).toBeLessThan(0);
      expect(result.axis.magnitude).toBeCloseTo(1, 5);
      expect(result.side).toBeDefined();
      expect(result.point).toBeDefined();
    });

    it('finds a positive separation for non-overlapping polygons', () => {
      const boxA = makeBox(0, 0, 40, 40);
      const boxB = makeBox(1000, 0, 40, 40);

      const result = SeparatingAxis.findPolygonPolygonSeparation(boxA, boxB);

      expect(result.collider).toBe(boxA);
      expect(result.separation).toBeGreaterThan(0);
    });

    it('reports the separation from the perspective of whichever collider is passed first', () => {
      const boxA = makeBox(0, 0, 40, 40);
      const boxB = makeBox(20, 0, 40, 40);

      const resultA = SeparatingAxis.findPolygonPolygonSeparation(boxA, boxB);
      const resultB = SeparatingAxis.findPolygonPolygonSeparation(boxB, boxA);

      expect(resultA.collider).toBe(boxA);
      expect(resultB.collider).toBe(boxB);
    });

    it('automatically falls back to the degenerate path when a polygon has zero scale', () => {
      const boxA = makeBox(0, 0, 40, 40);
      const boxB = makeBox(20, 0, 40, 40);
      boxB.transform.scale = ex.vec(0, 0);

      expect(boxB.transform.matrix.determinant()).toBe(0);

      const result = SeparatingAxis.findPolygonPolygonSeparation(boxA, boxB);

      expect(result.collider).toBe(boxA);
      expect(typeof result.separation).toBe('number');
    });
  });

  describe('findPolygonPolygonSeparationDegenerate', () => {
    it('finds the maximum separating side between two overlapping polygons', () => {
      const boxA = makeBox(0, 0, 40, 40);
      const boxB = makeBox(20, 0, 40, 40);

      const result = SeparatingAxis.findPolygonPolygonSeparationDegenerate(boxA, boxB);

      expect(result.collider).toBe(boxA);
      expect(result.axis).toBeDefined();
      expect(result.side).toBeDefined();
      expect(typeof result.separation).toBe('number');
    });

    it('finds a large positive separation for far apart polygons', () => {
      const boxA = makeBox(0, 0, 40, 40);
      const boxB = makeBox(1000, 0, 40, 40);

      const result = SeparatingAxis.findPolygonPolygonSeparationDegenerate(boxA, boxB);

      expect(result.separation).toBeGreaterThan(0);
    });
  });
});
