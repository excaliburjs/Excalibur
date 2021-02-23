import * as ex from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';

describe('A Matrix', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('exists', () => {
    expect(ex.Matrix).toBeDefined();
  });

  it('can be constructed', () => {
    const matrix = new ex.Matrix();
    expect(matrix).toBeDefined();
  });

  it('can make an identity matrix', () => {
    const identity = ex.Matrix.identity();
    expect(identity.isIdentity()).toBeTrue();
  });

  it('can make a translation matrix', () => {
    const mat = ex.Matrix.translation(100, -200);
    expect(mat.getPosition()).toBeVector(ex.vec(100, -200));
    expect(mat.data[12]).toBe(100);
    expect(mat.data[13]).toBe(-200);
  });

  it('can make a rotation matrix', () => {
    const mat = ex.Matrix.rotation(Math.PI / 4);
    expect(mat.getRotation()).toBe(Math.PI / 4);
  });

  it('can make a scale matrix', () => {
    const mat = ex.Matrix.scale(2, 3);
    expect(mat.getScale()).toBeVector(ex.vec(2, 3));
    expect(mat.getScaleX()).toBe(2);
    expect(mat.getScaleY()).toBe(3);
  });

  it('can rotate a matrix', () => {
    const mat = ex.Matrix.identity().rotate(Math.PI / 4);
    const rotation = ex.Matrix.rotation(Math.PI / 4);
    expect(rotation.getRotation()).toBe(mat.getRotation());
  });

  it('can translate a matrix', () => {
    const mat = ex.Matrix.identity().translate(100, -200);
    const translation = ex.Matrix.translation(100, -200);
    expect(translation.getPosition()).toBeVector(mat.getPosition());
  });

  it('can scale a matrix', () => {
    const mat = ex.Matrix.identity().scale(2, 3);
    const scale = ex.Matrix.scale(2, 3);
    expect(scale.getScale()).toBeVector(mat.getScale());
  });

  it('can transform a point', () => {
    const mat = ex.Matrix.rotation(Math.PI / 4);
    const point: [number, number] = [0, 1];
    const newPoint = mat.multv(point);
    expect(newPoint[0]).toBeCloseTo(-Math.cos(Math.PI / 4));
    expect(newPoint[1]).toBeCloseTo(Math.sin(Math.PI / 4));
  });

  it('can set a rotation and preserve scale', () => {
    const mat = ex.Matrix.scale(3, 5);
    mat.rotate(Math.PI / 2);
    expect(mat.getScaleX()).toBe(5);
    expect(mat.getScaleY()).toBe(3);
  });

  it('can find the affine inverse', () => {
    const mat = ex.Matrix.identity()
      .translate(100, -200)
      .scale(2, 4);

    const inv = mat.getAffineInverse();
    expect(mat.multm(inv).isIdentity()).toBeTrue();
    expect(inv.multm(mat).isIdentity()).toBeTrue();
  });

  it('can print a matrix', () => {
    const mat = ex.Matrix.identity();
    expect(mat.toString()).toBe(`
[1 0 0 0]
[0 1 0 0]
[0 0 1 0]
[0 0 0 1]
`);
  });
});