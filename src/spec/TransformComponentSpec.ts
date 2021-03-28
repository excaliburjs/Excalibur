import * as ex from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';


describe('A TransformComponent', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('exists', () => {
    expect(ex.TransformComponent).toBeDefined();
  });

  it('can be constructed', () => {
    const tx = new ex.TransformComponent();
    expect(tx).toBeDefined();
  });

  it('can set the position by vec and by prop', () => {
    const tx = new ex.TransformComponent();

    tx.pos = ex.vec(24, 42);

    expect(tx.pos).toBeVector(ex.vec(24, 42));
    expect(tx.globalPos).toBeVector(ex.vec(24, 42));

    tx.pos.x = -1;
    tx.pos.y = 1;

    expect(tx.pos).toBeVector(ex.vec(-1, 1));
    expect(tx.globalPos).toBeVector(ex.vec(-1, 1));
  });

  it('can set the scale by vec and by prop', () => {
    const tx = new ex.TransformComponent();

    tx.scale = ex.vec(2, 3);

    expect(tx.scale).toBeVector(ex.vec(2, 3));
    expect(tx.globalScale).toBeVector(ex.vec(2, 3));

    tx.globalScale.x = 1;
    tx.globalScale.y = -1;
    expect(tx.scale).toBeVector(ex.vec(1, -1));
    expect(tx.globalScale).toBeVector(ex.vec(1, -1));

    tx.globalScale.x = 1;
    tx.globalScale.y = -1;
    expect(tx.scale).toBeVector(ex.vec(1, -1));
    expect(tx.globalScale).toBeVector(ex.vec(1, -1));
  });

  it('can set the scale negative', () => {
    const tx = new ex.TransformComponent();
    tx.rotation = Math.PI / 2;
    tx.globalScale.x = -2;
    tx.globalScale.y = -5;
    expect(tx.scale).toBeVector(ex.vec(-2, -5));
    expect(tx.globalScale).toBeVector(ex.vec(-2, -5));
  });

  it('can have parent/child relationships with position', () => {
    const parent = new ex.Entity([new ex.TransformComponent()]);
    const child = new ex.Entity([new ex.TransformComponent()]);
    parent.addChild(child);

    const parentTx = parent.get(ex.TransformComponent);
    const childTx = child.get(ex.TransformComponent);

    // Changing a parent position influences the child global position
    parentTx.pos = ex.vec(100, 200);
    expect(childTx.pos).toBeVector(ex.vec(0, 0));
    expect(childTx.globalPos).toBeVector(ex.vec(100, 200));

    // Changing a child global pos affects childs local and not parent position
    childTx.globalPos = ex.vec(0, 0);
    expect(parentTx.pos).toBeVector(ex.vec(100, 200));
    expect(childTx.pos).toBeVector(ex.vec(-100, -200));

    // can change pos by prop
    childTx.globalPos.x = 200;
    childTx.globalPos.y = 300;
    expect(parentTx.pos).toBeVector(ex.vec(100, 200));
    expect(childTx.pos).toBeVector(ex.vec(100, 100));
  });

  it('can have parent/child relationships with scale', () => {
    const parent = new ex.Entity([new ex.TransformComponent()]);
    const child = new ex.Entity([new ex.TransformComponent()]);
    parent.addChild(child);

    const parentTx = parent.get(ex.TransformComponent);
    const childTx = child.get(ex.TransformComponent);

    // Changing a parent scale influences the child global scale
    parentTx.scale = ex.vec(2, 3);
    expect(childTx.scale).toBeVector(ex.vec(1, 1));
    expect(childTx.globalScale).toBeVector(ex.vec(2, 3));

    // Changing a child global scale affects childs local and not parent scale
    childTx.globalScale = ex.vec(1, 1);
    expect(parentTx.scale).toBeVector(ex.vec(2, 3));
    expect(childTx.scale).toBeVector(ex.vec(1/2, 1/3));

    // can change scale by prop
    childTx.globalScale.x = 3;
    childTx.globalScale.y = 4;
    expect(parentTx.scale).toBeVector(ex.vec(2, 3));
    expect(childTx.scale).toBeVector(ex.vec(3/2, 4/3));
  });

  it('can have parent/child relations with rotation', () => {
    const parent = new ex.Entity([new ex.TransformComponent()]);
    const child = new ex.Entity([new ex.TransformComponent()]);
    parent.addChild(child);

    const parentTx = parent.get(ex.TransformComponent);
    const childTx = child.get(ex.TransformComponent);

    // Changing a parent rotation influences the child global rotation
    parentTx.rotation = Math.PI;
    expect(childTx.rotation).toBeCloseTo(0);
    expect(childTx.globalRotation).toBeCloseTo(Math.PI);

    // Changing a child global rotation affects childs local and not parent rotation
    childTx.globalRotation = 0;
    expect(parentTx.rotation).toBeCloseTo(Math.PI);
    expect(childTx.rotation).toBeCloseTo(Math.PI); // Math.PI + Math.PI = 2PI = 0 global
  });

});