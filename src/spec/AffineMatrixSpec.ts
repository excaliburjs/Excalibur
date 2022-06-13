import * as ex from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';

describe('A AffineMatrix', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('exists', () => {
    expect(ex.AffineMatrix).toBeDefined();
  });

  it('can be constructed', () => {
    const matrix = new ex.AffineMatrix();
    expect(matrix).toBeDefined();
  });

  it('can make an identity matrix', () => {
    const identity = ex.AffineMatrix.identity();
    expect(identity.isIdentity()).toBeTrue();
  });

  it('can make a translation matrix', () => {
    const mat = ex.AffineMatrix.translation(100, -200);
    expect(mat.getPosition()).toBeVector(ex.vec(100, -200));
    expect(mat.data[4]).toBe(100);
    expect(mat.data[5]).toBe(-200);
  });

  it('can make a rotation matrix', () => {
    const mat = ex.AffineMatrix.rotation(Math.PI / 4);
    expect(mat.getRotation()).toBe(Math.PI / 4);
  });

  it('can make a scale matrix', () => {
    const mat = ex.AffineMatrix.scale(2, 3);
    expect(mat.getScale()).toBeVector(ex.vec(2, 3));
    expect(mat.getScaleX()).toBe(2);
    expect(mat.getScaleY()).toBe(3);
  });

  it('can rotate a matrix', () => {
    const mat = ex.AffineMatrix.identity().rotate(Math.PI / 4);
    const rotation = ex.AffineMatrix.rotation(Math.PI / 4);
    expect(rotation.getRotation()).toBe(mat.getRotation());
  });

  it('can translate a matrix', () => {
    const mat = ex.AffineMatrix.identity().translate(100, -200);
    const translation = ex.AffineMatrix.translation(100, -200);
    expect(translation.getPosition()).toBeVector(mat.getPosition());
  });

  it('can scale a matrix', () => {
    const mat = ex.AffineMatrix.identity().scale(2, 3);
    const scale = ex.AffineMatrix.scale(2, 3);
    expect(scale.getScale()).toBeVector(mat.getScale());
  });

  it('can transform a point', () => {
    const mat = ex.AffineMatrix.rotation(Math.PI / 4);
    const newPoint = mat.multiply(ex.vec(0, 1));
    expect(newPoint.x).toBeCloseTo(-Math.cos(Math.PI / 4));
    expect(newPoint.y).toBeCloseTo(Math.sin(Math.PI / 4));
  });

  it('can set a rotation and preserve scale', () => {
    const mat = ex.AffineMatrix.identity();
    mat.setScale(ex.vec(3, 5));
    mat.setRotation(Math.PI / 2);
    expect(mat.getScaleX()).toBe(3);
    expect(mat.getScaleY()).toBe(5);
  });

  it('can set scale with rotation in the mix', () => {
    const mat = ex.AffineMatrix.identity();
    mat.setScale(ex.vec(-1, -1));
    expect(mat.getScaleX()).toBe(-1, 'getScaleX()');
    expect(mat.getScaleY()).toBe(-1, 'getScaleY()');
    mat.setScale(ex.vec(-2, -5));
    expect(mat.getScaleX()).toBe(-2, 'getScaleX()');
    expect(mat.getScaleY()).toBe(-5, 'getScaleY()');

    mat.setScale(ex.vec(5, 11));
    expect(mat.getScaleX()).toBe(5, 'getScaleX()');
    expect(mat.getScaleY()).toBe(11, 'getScaleY()');
    expect(mat.data[0]).toBe(5);
    expect(mat.data[3]).toBe(11);

    mat.setScale(ex.vec(1, -1));
    expect(mat.getScaleX()).toBe(1, 'getScaleX()');
    expect(mat.getScaleY()).toBe(-1, 'getScaleY()');

    mat.setRotation(Math.PI / 3);
    expect(mat.getScaleX()).toBeCloseTo(1, 2, 'rotated PI/3 getScaleX()');
    expect(mat.getScaleY()).toBeCloseTo(-1, 2, 'rotated PI/3 getScaleY()');
    expect(mat.getRotation()).toBeCloseTo(Math.PI / 3, 2, 'rotated PI/3 getRotation()');

    mat.setRotation(Math.PI);
    expect(mat.getScaleX()).toBeCloseTo(1, 2, 'rotated PI getScaleX()');
    expect(mat.getScaleY()).toBeCloseTo(-1, 2, 'rotated PI getScaleY()');
    expect(mat.getRotation()).toBeCloseTo(Math.PI, 2, 'rotated PI getRotation()');

    mat.setRotation(Math.PI * 2);
    expect(mat.getScaleX()).toBeCloseTo(1, 2, 'rotated 2 PI getScaleX()');
    expect(mat.getScaleY()).toBeCloseTo(-1, 2, 'rotated 2 PI getScaleY()');
    expect(mat.getRotation()).toBeCloseTo(Math.PI * 2, 2, 'rotated 2 PI getRotation()');

    mat.setRotation(Math.PI * 3);
    expect(mat.getScaleX()).toBeCloseTo(1, 2, 'rotated 3 PI getScaleX()');
    expect(mat.getScaleY()).toBeCloseTo(-1, 2, 'rotated 3 PI getScaleY()');
    expect(mat.getRotation()).toBeCloseTo(Math.PI, 2, 'rotated 3 * PI getRotation()');
  });

  it('can set the rotation', () => {
    const mat = ex.AffineMatrix.identity();
    mat.setRotation(0);
    expect(mat.getRotation()).toBeCloseTo(0, 2, 'rotation 0');

    mat.setRotation(Math.PI / 3);
    expect(mat.getRotation()).toBeCloseTo(Math.PI / 3, 2, 'rotation PI/3');

    mat.setRotation(Math.PI);
    expect(mat.getRotation()).toBeCloseTo(Math.PI, 2, 'rotation PI');

    mat.setRotation(Math.PI * 2);
    expect(mat.getRotation()).toBeCloseTo(Math.PI * 2, 2, 'rotation 2 PI');

    mat.setRotation(Math.PI * 3);
    expect(mat.getRotation()).toBeCloseTo(Math.PI, 2, 'roation 3 PI');
  });

  it('can find the affine inverse', () => {
    const mat = ex.AffineMatrix.identity()
      .translate(100, -200)
      .scale(2, 4);
    const inv = mat.inverse();
    expect(mat.multiply(inv).isIdentity()).toBeTrue();
    expect(inv.multiply(mat).isIdentity()).toBeTrue();
  });

  it('can find the affine inverse and store it into a target', () => {
    const target = ex.AffineMatrix.identity();
    const mat = ex.AffineMatrix.identity()
      .translate(100, -200)
      .scale(2, 4);

    spyOn(ex.AffineMatrix, 'identity');
    const inv = mat.inverse(target);
    expect(mat.multiply(inv).isIdentity()).toBeTrue();
    expect(inv.multiply(mat).isIdentity()).toBeTrue();
    expect(target).toBe(inv);
    expect(ex.AffineMatrix.identity).withContext('using a target doesnt create a new mat')
      .not.toHaveBeenCalledWith();
  });

  it('can clone into a target matrix', () => {
    const source = ex.AffineMatrix.identity().scale(5, 5);
    const destination = ex.AffineMatrix.identity();

    source.clone(destination);

    expect(destination.data).toEqual(new Float64Array([
      5, 0,
      0, 5,
      0, 0
    ]));
  });

  it('can set position', () => {
    const mat = new ex.AffineMatrix();
    expect(mat.getPosition()).toBeVector(ex.vec(0, 0));
    mat.setPosition(10, 43);
    expect(mat.getPosition()).toBeVector(ex.vec(10, 43));
  });

  it('can convert to a 4x4 matrix', () => {
    const mat = ex.AffineMatrix.identity().translate(1,2).rotate(Math.PI).scale(3, 4);
    expect(mat.getPosition()).toBeVector(ex.vec(1, 2));
    expect(mat.getRotation()).toBe(Math.PI);
    expect(mat.getScale()).toBeVector(ex.vec(3, 4));

    const mat4x4 = mat.to4x4();
    expect(mat4x4.getPosition()).toBeVector(ex.vec(1, 2));
    expect(mat4x4.getRotation()).toBe(Math.PI);
    expect(mat4x4.getScale()).toBeVector(ex.vec(3, 4));
  });

  it('can reset to identity', () => {
    const mat = ex.AffineMatrix.identity()
      .translate(100, -200)
      .scale(2, 4);

    mat.reset();
    expect(mat.isIdentity()).toBe(true);
  });

  it('can print a matrix', () => {
    const mat = ex.AffineMatrix.identity();
    expect(mat.toString()).toBe(`
[1 0 0]
[0 1 0]
[0 0 1]
`);
  });
});