import { describe, it, expect } from 'vitest';
import * as ex from '@excalibur';

describe('Vector4', () => {
  it('should exist', () => {
    expect(ex.Vector4).toBeDefined();
  });

  it('can be instantiated', () => {
    const v = new ex.Vector4(1, 2, 3, 4);
    expect(v).not.toBeNull();
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
    expect(v.w).toBe(4);
  });

  it('can have values set', () => {
    const v = new ex.Vector4(1, 2, 3, 4);
    v.setTo(10, 20, 30, 40);

    expect(v.x).toEqual(10);
    expect(v.y).toEqual(20);
    expect(v.z).toEqual(30);
    expect(v.w).toEqual(40);
  });

  it('has static constants and homogeneous constructors', () => {
    expect(ex.Vector4.Zero.equals(new ex.Vector4(0, 0, 0, 0))).toBeTruthy();
    expect(ex.Vector4.One.equals(new ex.Vector4(1, 1, 1, 1))).toBeTruthy();

    const v3 = new ex.Vector3(2, 4, 6);
    const point = ex.Vector4.fromPoint(v3);
    expect(point.equals(new ex.Vector4(2, 4, 6, 1))).toBeTruthy();

    const dir = ex.Vector4.fromDirection(v3);
    expect(dir.equals(new ex.Vector4(2, 4, 6, 0))).toBeTruthy();
  });

  it('can convert to Vector3 with perspective divide', () => {
    const p1 = new ex.Vector4(2, 4, 6, 1);
    expect(p1.toVector3().equals(new ex.Vector3(2, 4, 6))).toBeTruthy();

    const p2 = new ex.Vector4(4, 8, 12, 2);
    expect(p2.toVector3().equals(new ex.Vector3(2, 4, 6))).toBeTruthy();

    const dir = new ex.Vector4(2, 4, 6, 0);
    expect(dir.toVector3().equals(new ex.Vector3(2, 4, 6))).toBeTruthy();
  });

  it('can transform by Matrix 4x4', () => {
    const mat = ex.Matrix.identity();
    mat.data[12] = 10; // Translation X
    mat.data[13] = 20; // Translation Y
    mat.data[14] = 30; // Translation Z

    const point = ex.Vector4.fromPoint(new ex.Vector3(1, 2, 3));
    const transformedPoint = point.transform(mat);
    expect(transformedPoint.equals(new ex.Vector4(11, 22, 33, 1))).toBeTruthy();

    const dir = ex.Vector4.fromDirection(new ex.Vector3(1, 2, 3));
    const transformedDir = dir.transform(mat);
    expect(transformedDir.equals(new ex.Vector4(1, 2, 3, 0))).toBeTruthy();
  });

  it('can calculate distance and magnitude', () => {
    const v = new ex.Vector4(2, 3, 6, 0);
    expect(v.magnitude).toBe(7);

    // 3^2 + 4^2 + 12^2 + 0^2 = 9 + 16 + 144 + 0 = 169 (sqrt is 13)
    const v2 = new ex.Vector4(3, 4, 12, 0);
    expect(v2.distance()).toBe(13);
  });

  it('can be normalized', () => {
    const v = new ex.Vector4(0, 0, 10, 0);
    expect(v.normalize().equals(new ex.Vector4(0, 0, 1, 0))).toBeTruthy();
  });

  it('can be added, subtracted, scaled, and dotted', () => {
    const v1 = new ex.Vector4(1, 2, 3, 4);
    const v2 = new ex.Vector4(2, 3, 4, 5);

    expect(v1.add(v2).equals(new ex.Vector4(3, 5, 7, 9))).toBeTruthy();
    expect(v2.sub(v1).equals(new ex.Vector4(1, 1, 1, 1))).toBeTruthy();
    expect(v1.scale(2).equals(new ex.Vector4(2, 4, 6, 8))).toBeTruthy();
    expect(v1.dot(v2)).toBe(1 * 2 + 2 * 3 + 3 * 4 + 4 * 5);
  });

  it('can handle in-place mutators', () => {
    const v = new ex.Vector4(1, 1, 1, 1);

    v.addEqual(new ex.Vector4(1, 2, 3, 4));
    expect(v.equals(new ex.Vector4(2, 3, 4, 5))).toBeTruthy();

    v.subEqual(new ex.Vector4(1, 1, 1, 1));
    expect(v.equals(new ex.Vector4(1, 2, 3, 4))).toBeTruthy();

    v.scaleEqual(2);
    expect(v.equals(new ex.Vector4(2, 4, 6, 8))).toBeTruthy();
  });

  it('can convert to array structures', () => {
    const v = new ex.Vector4(1, 2, 3, 4);
    expect(v.toArray()).toEqual([1, 2, 3, 4]);

    const f32 = v.toFloat32Array();
    expect(f32).toBeInstanceOf(Float32Array);
    expect(f32[3]).toBe(4);

    const restored = ex.Vector4.fromArray([1, 2, 3, 4, 5], 1);
    expect(restored.equals(new ex.Vector4(2, 3, 4, 5))).toBeTruthy();
  });

  it('can be checked for validity', () => {
    expect(ex.Vector4.isValid(new ex.Vector4(0, 0, 0, Infinity))).toBe(false);
    expect(ex.Vector4.isValid(new ex.Vector4(0, NaN, 0, 0))).toBe(false);
    expect(ex.Vector4.isValid(null as any)).toBe(false);
    expect(ex.Vector4.isValid(new ex.Vector4(1, 2, 3, 4))).toBe(true);
  });

  it('can clone and format string', () => {
    const v = new ex.Vector4(1, 2, 3, 4);
    const c = v.clone();
    expect(c.equals(v)).toBeTruthy();

    v.setTo(0, 0, 0, 0);
    expect(c.equals(v)).toBeFalsy();

    const formatted = new ex.Vector4(1.234, 2.345, 3.456, 4.567);
    expect(formatted.toString(2)).toBe('(1.23, 2.35, 3.46, 4.57)');
  });

  it('can lerp between vectors', () => {
    const start = new ex.Vector4(0, 0, 0, 0);
    const end = new ex.Vector4(10, 20, 30, 40);

    const mid = start.lerp(end, 0.5);
    expect(mid.equals(new ex.Vector4(5, 10, 15, 20))).toBeTruthy();
  });
});

describe('vec4 helper', () => {
  it('returns a new ex.Vector4 instance', () => {
    const v1 = ex.vec4(1, 2, 3, 4);
    const v2 = ex.vec4(1, 2, 3, 4);

    expect(v1 instanceof ex.Vector4).toBe(true);
    expect(v1).not.toBe(v2);
    expect(v1.x).toBe(1);
    expect(v1.y).toBe(2);
    expect(v1.z).toBe(3);
    expect(v1.w).toBe(4);
  });
});
