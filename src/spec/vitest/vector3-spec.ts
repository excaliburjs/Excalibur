import { describe, it, expect } from 'vitest';
import * as ex from '@excalibur';

describe('Vector3', () => {
  it('should exist', () => {
    expect(ex.Vector3).toBeDefined();
  });

  it('can be instantiated', () => {
    const v = new ex.Vector3(20, 200, 50);
    expect(v).not.toBeNull();
  });

  it('can have values set', () => {
    const v = new ex.Vector3(20, 200, 50);

    expect(v.x).toEqual(20);
    expect(v.y).toEqual(200);
    expect(v.z).toEqual(50);

    v.setTo(200, 20, 10);

    expect(v.x).toEqual(200);
    expect(v.y).toEqual(20);
    expect(v.z).toEqual(10);

    v.setTo(0, 0, 0);

    expect(v.x).toEqual(0);
    expect(v.y).toEqual(0);
    expect(v.z).toEqual(0);
  });

  it('has static direction and zero constants', () => {
    expect(ex.Vector3.Zero.equals(new ex.Vector3(0, 0, 0))).toBeTruthy();
    expect(ex.Vector3.One.equals(new ex.Vector3(1, 1, 1))).toBeTruthy();
    expect(ex.Vector3.Right.equals(new ex.Vector3(1, 0, 0))).toBeTruthy();
    expect(ex.Vector3.Left.equals(new ex.Vector3(-1, 0, 0))).toBeTruthy();
    expect(ex.Vector3.Up.equals(new ex.Vector3(0, -1, 0))).toBeTruthy();
    expect(ex.Vector3.Down.equals(new ex.Vector3(0, 1, 0))).toBeTruthy();
    expect(ex.Vector3.Forward.equals(new ex.Vector3(0, 0, 1))).toBeTruthy();
    expect(ex.Vector3.Back.equals(new ex.Vector3(0, 0, -1))).toBeTruthy();
  });

  it('can test against equality within tolerance', () => {
    const v = new ex.Vector3(20, 20, 20);

    expect(v.equals(v.add(new ex.Vector3(0.0005, 0.0005, 0.0005)))).toBeTruthy();
    expect(v.equals(ex.Vector3.Zero)).not.toBeTruthy();
  });

  it('can calculate distance to origin', () => {
    const v = new ex.Vector3(20, 0, 0);
    const v2 = new ex.Vector3(0, -20, 0);
    const v3 = new ex.Vector3(0, 0, 20);

    expect(v.distance()).toBe(20);
    expect(v2.distance()).toBe(20);
    expect(v3.distance()).toBe(20);
  });

  it('can have a magnitude', () => {
    const v = new ex.Vector3(20, 0, 0);
    const v2 = new ex.Vector3(2, 3, 6);

    expect(v.magnitude).toBe(20);
    expect(v2.magnitude).toBe(7);
  });

  it('can have magnitude set', () => {
    const v = new ex.Vector3(20, 0, 0);
    const v2 = new ex.Vector3(2, 3, 6);

    v.magnitude = 10;
    v2.magnitude = 14;

    expect(v.equals(new ex.Vector3(10, 0, 0))).toBeTruthy();
    expect(v2.equals(new ex.Vector3(4, 6, 12))).toBeTruthy();
  });

  it('can calculate the distance to another vector', () => {
    const v = new ex.Vector3(-10, 0, 0);
    const v2 = new ex.Vector3(10, 0, 0);
    expect(v.distance(v2)).toBe(20);
  });

  it('can calculate the distance between two vectors', () => {
    const v1 = new ex.Vector3(-10, 0, 0);
    const v2 = new ex.Vector3(10, 0, 0);
    expect(ex.Vector3.distance(v1, v2)).toBe(20);
  });

  it('can be normalized to a length of 1', () => {
    const v = new ex.Vector3(10, 0, 0);

    expect(v.distance()).toBe(10);
    expect(v.normalize().distance()).toBe(1);
  });

  it('can be scaled', () => {
    const v = new ex.Vector3(10, 0, 0);

    expect(v.distance()).toBe(10);
    expect(v.scale(10).distance()).toBe(100);

    const scaledVector = v.scale(new ex.Vector3(2, 3, 4));
    expect(scaledVector.equals(new ex.Vector3(20, 0, 0))).toBeTruthy();
  });

  it('can be added to another', () => {
    const v = new ex.Vector3(10, 0, 5);
    const v2 = new ex.Vector3(0, 10, 5);

    expect(v.add(v2).equals(new ex.Vector3(10, 10, 10))).toBeTruthy();
  });

  it('can be subtracted from another', () => {
    const v = new ex.Vector3(10, 0, 5);
    const v2 = new ex.Vector3(0, 10, 2);

    expect(v.sub(v2).equals(new ex.Vector3(10, -10, 3))).toBeTruthy();
  });

  it('can be added and set at the same time', () => {
    const v = new ex.Vector3(10, 0, 1);
    const v2 = new ex.Vector3(0, 10, 2);

    v.addEqual(v2);

    expect(v.x).toBe(10);
    expect(v.y).toBe(10);
    expect(v.z).toBe(3);
  });

  it('can be subtracted and set at the same time', () => {
    const v = new ex.Vector3(10, 0, 5);
    const v2 = new ex.Vector3(0, 10, 2);

    v.subEqual(v2);

    expect(v.x).toBe(10);
    expect(v.y).toBe(-10);
    expect(v.z).toBe(3);
  });

  it('can be scaled and set at the same time', () => {
    const v = new ex.Vector3(10, 2, 3);

    v.scaleEqual(10);

    expect(v.x).toBe(100);
    expect(v.y).toBe(20);
    expect(v.z).toBe(30);
  });

  it('can be negated', () => {
    const v = new ex.Vector3(10, -5, 2);
    expect(v.negate().equals(new ex.Vector3(-10, 5, -2))).toBeTruthy();
  });

  it('can be dotted with another 3d vector', () => {
    const v = new ex.Vector3(1, 0, 0);
    const v2 = new ex.Vector3(-1, 0, 0);
    const v3 = new ex.Vector3(0, 1, 0);

    expect(v.dot(v2)).toBeLessThan(0);
    expect(v.dot(v2.negate())).toBeGreaterThan(0);
    expect(v.dot(v3)).toBe(0);
  });

  it('can perform 3D cross product correctly', () => {
    const xAxis = new ex.Vector3(1, 0, 0);
    const yAxis = new ex.Vector3(0, 1, 0);

    const zAxis = xAxis.cross(yAxis);
    expect(zAxis.equals(new ex.Vector3(0, 0, 1))).toBeTruthy();

    const dest = new ex.Vector3(0, 0, 0);
    yAxis.cross(xAxis, dest);
    expect(dest.equals(new ex.Vector3(0, 0, -1))).toBeTruthy();
  });

  it('can convert to and from array structures', () => {
    const v = new ex.Vector3(1, 2, 3);
    const arr = v.toArray();
    expect(arr).toEqual([1, 2, 3]);

    const f32 = v.toFloat32Array();
    expect(f32).toBeInstanceOf(Float32Array);
    expect(f32[0]).toBe(1);
    expect(f32[1]).toBe(2);
    expect(f32[2]).toBe(3);

    const restored = ex.Vector3.fromArray([10, 20, 30, 40], 1);
    expect(restored.equals(new ex.Vector3(20, 30, 40))).toBeTruthy();
  });

  it('can be checked for validity', () => {
    expect(ex.Vector3.isValid(new ex.Vector3(Infinity, 0, 0))).toBe(false);
    expect(ex.Vector3.isValid(new ex.Vector3(0, NaN, 0))).toBe(false);
    expect(ex.Vector3.isValid(null as any)).toBe(false);
    expect(ex.Vector3.isValid(undefined as any)).toBe(false);
    expect(ex.Vector3.isValid(new ex.Vector3(1, 2, 3))).toBe(true);
  });

  it('can be cloned', () => {
    const v = new ex.Vector3(1, 2, 3);
    const c = v.clone();

    expect(c.x).toBe(v.x);
    expect(c.y).toBe(v.y);
    expect(c.z).toBe(v.z);

    v.setTo(20, 20, 20);

    expect(c.x).not.toBe(v.x);
  });

  it('can be printed toString(fixed)', () => {
    const v = new ex.Vector3(1.2345, 2.345, 3.4567);
    expect(v.toString(2)).toBe('(1.23, 2.35, 3.46)');
  });

  it('can find the min and max between vectors', () => {
    const v1 = new ex.Vector3(0, 5, 2);
    const v2 = new ex.Vector3(2, 1, 8);

    expect(ex.Vector3.min(v1, v2).equals(new ex.Vector3(0, 1, 2))).toBeTruthy();
    expect(ex.Vector3.max(v1, v2).equals(new ex.Vector3(2, 5, 8))).toBeTruthy();
  });

  it('can clamp magnitude', () => {
    const sut = new ex.Vector3(10, 0, 0);
    sut.clampMagnitude(5);
    expect(sut.magnitude).toBe(5);
    expect(sut.x).toBe(5);
  });

  it('can lerp between vectors and clamp t', () => {
    const start = new ex.Vector3(0, 0, 0);
    const end = new ex.Vector3(10, 20, 30);

    const mid = start.lerp(end, 0.5);
    expect(mid.equals(new ex.Vector3(5, 10, 15))).toBeTruthy();

    const clampedOver = start.lerp(end, 2);
    expect(clampedOver.equals(end)).toBeTruthy();

    const clampedUnder = start.lerp(end, -1);
    expect(clampedUnder.equals(start)).toBeTruthy();
  });
});

describe('vec3 helper', () => {
  it('returns a new ex.Vector3 instance', () => {
    const v1 = ex.vec3(1, 2, 3);
    const v2 = ex.vec3(1, 2, 3);

    expect(v1 instanceof ex.Vector3).toBe(true);
    expect(v1).not.toBe(v2);
    expect(v1.x).toBe(1);
    expect(v1.y).toBe(2);
    expect(v1.z).toBe(3);
  });
});
