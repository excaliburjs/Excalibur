import * as ex from '@excalibur';

describe('A Matrix', () => {
  it('exists', () => {
    expect(ex.Matrix).toBeDefined();
  });

  it('can be constructed', () => {
    const matrix = new ex.Matrix();
    expect(matrix).toBeDefined();
  });

  it('can make an identity matrix', () => {
    const identity = ex.Matrix.identity();
    expect(identity.isIdentity()).toBe(true);
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
    const newPoint = mat.multiply(ex.vec(0, 1));
    expect(newPoint.x).toBeCloseTo(-Math.cos(Math.PI / 4));
    expect(newPoint.y).toBeCloseTo(Math.sin(Math.PI / 4));
  });

  it('can set a rotation and preserve scale', () => {
    const mat = ex.Matrix.identity();
    mat.setScale(ex.vec(3, 5));
    mat.setRotation(Math.PI / 2);
    expect(mat.getScaleX()).toBe(3);
    expect(mat.getScaleY()).toBe(5);
  });

  it('can set scale with rotation in the mix', () => {
    const mat = ex.Matrix.identity();
    mat.setScale(ex.vec(-1, -1));
    expect(mat.getScaleX(), 'getScaleX()').toBe(-1);
    expect(mat.getScaleY(), 'getScaleY()').toBe(-1);
    mat.setScale(ex.vec(-2, -5));
    expect(mat.getScaleX(), 'getScaleX()').toBe(-2);
    expect(mat.getScaleY(), 'getScaleY()').toBe(-5);

    mat.setScale(ex.vec(5, 11));
    expect(mat.getScaleX(), 'getScaleX()').toBe(5);
    expect(mat.getScaleY(), 'getScaleY()').toBe(11);
    expect(mat.data[0]).toBe(5);
    expect(mat.data[5]).toBe(11);

    mat.setScale(ex.vec(1, -1));
    expect(mat.getScaleX(), 'getScaleX()').toBe(1);
    expect(mat.getScaleY(), 'getScaleY()').toBe(-1);

    mat.setRotation(Math.PI / 3);
    expect(mat.getScaleX(), 'rotated PI/3 getScaleX()').toBeCloseTo(1, 2);
    expect(mat.getScaleY(), 'rotated PI/3 getScaleY()').toBeCloseTo(-1, 2);
    expect(mat.getRotation(), 'rotated PI/3 getRotation()').toBeCloseTo(Math.PI / 3, 2);

    mat.setRotation(Math.PI);
    expect(mat.getScaleX(), 'rotated PI getScaleX()').toBeCloseTo(1, 2);
    expect(mat.getScaleY(), 'rotated PI getScaleY()').toBeCloseTo(-1, 2);
    expect(mat.getRotation(), 'rotated PI getRotation()').toBeCloseTo(Math.PI, 2);

    mat.setRotation(Math.PI * 2);
    expect(mat.getScaleX(), 'rotated 2 PI getScaleX()').toBeCloseTo(1, 2);
    expect(mat.getScaleY(), 'rotated 2 PI getScaleY()').toBeCloseTo(-1, 2);
    expect(mat.getRotation(), 'rotated 2 PI getRotation()').toBeCloseTo(0, 2);

    mat.setRotation(Math.PI * 3);
    expect(mat.getScaleX(), 'rotated 3 PI getScaleX()').toBeCloseTo(1, 2);
    expect(mat.getScaleY(), 'rotated 3 PI getScaleY()').toBeCloseTo(-1, 2);
    expect(mat.getRotation(), 'rotated 3 * PI getRotation()').toBeCloseTo(Math.PI, 2);
  });

  it('can set the rotation', () => {
    const mat = ex.Matrix.identity();
    mat.setRotation(0);
    expect(mat.getRotation(), 'rotation 0').toBeCloseTo(0, 2);

    mat.setRotation(Math.PI / 3);
    expect(mat.getRotation(), 'rotation PI/3').toBeCloseTo(Math.PI / 3, 2);

    mat.setRotation(Math.PI);
    expect(mat.getRotation(), 'rotation PI').toBeCloseTo(Math.PI, 2);

    mat.setRotation(Math.PI * 2);
    expect(mat.getRotation(), 'rotation 2 PI').toBeCloseTo(0, 2);

    mat.setRotation(Math.PI * 3);
    expect(mat.getRotation(), 'roation 3 PI').toBeCloseTo(Math.PI, 2);
  });

  it('can find the affine inverse', () => {
    const mat = ex.Matrix.identity().translate(100, -200).scale(2, 4);

    const inv = mat.getAffineInverse();
    expect(mat.multiply(inv).isIdentity()).toBe(true);
    expect(inv.multiply(mat).isIdentity()).toBe(true);
  });

  it('can find the affine inverse and store it into a target', () => {
    const target = ex.Matrix.identity();
    const mat = ex.Matrix.identity().translate(100, -200).scale(2, 4);

    vi.spyOn(ex.Matrix, 'identity');
    const inv = mat.getAffineInverse(target);
    expect(mat.multiply(inv).isIdentity()).toBe(true);
    expect(inv.multiply(mat).isIdentity()).toBe(true);
    expect(target).toBe(inv);
    expect(ex.Matrix.identity, 'using a target doesnt create a new mat').not.toHaveBeenCalledWith();
  });

  it('can be created from a float32array', () => {
    const mat = ex.Matrix.identity().translate(1, 2).rotate(Math.PI).scale(3, 4);
    const newData = new Float32Array(mat.data);
    const mat2 = ex.Matrix.fromFloat32Array(newData);
    expect(mat.toString()).toEqual(mat2.toString());
  });

  it('can set position', () => {
    const mat = new ex.Matrix();
    expect(mat.getPosition()).toBeVector(ex.vec(0, 0));
    mat.setPosition(10, 43);
    expect(mat.getPosition()).toBeVector(ex.vec(10, 43));
  });

  it('can clone into a target matrix', () => {
    const source = ex.Matrix.identity().scale(5, 5);
    const destination = ex.Matrix.identity();

    source.clone(destination);

    expect(destination.data).toEqual(new Float32Array([5, 0, 0, 0, 0, 5, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
  });

  it('can reset to identity', () => {
    const mat = ex.Matrix.identity().translate(100, -200).scale(2, 4);

    mat.reset();
    expect(mat.isIdentity()).toBe(true);
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
