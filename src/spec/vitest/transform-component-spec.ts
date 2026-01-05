import * as ex from '@excalibur';
import { TransformComponent } from '@excalibur';
import { EulerIntegrator } from '../../engine/collision/integrator';

describe('A TransformComponent', () => {
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

    // Internal transform parentage is correct
    expect(childTx.get().parent).toBe(parentTx.get());

    // Changing a parent position influences the child global position
    parentTx.pos = ex.vec(100, 200);
    expect(childTx.pos).toBeVector(ex.vec(0, 0));
    expect(childTx.globalPos).toBeVector(ex.vec(100, 200));

    // Changing a child global pos affects childs local and not parent position
    childTx.globalPos = ex.vec(0, 0);
    expect(parentTx.pos).toBeVector(ex.vec(100, 200));
    expect(childTx.pos).toBeVector(ex.vec(-100, -200));

    // Can change pos by prop
    childTx.globalPos.x = 200;
    childTx.globalPos.y = 300;
    expect(childTx.globalPos.x).toBe(200);
    expect(childTx.globalPos.y).toBe(300);
    expect(parentTx.pos).toBeVector(ex.vec(100, 200));
    expect(childTx.pos).toBeVector(ex.vec(100, 100));

    // Can change global pos by vec
    childTx.globalPos = ex.vec(200, 300);
    expect(childTx.globalPos.x).toBe(200);
    expect(childTx.globalPos.y).toBe(300);
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
    expect(childTx.scale).toBeVector(ex.vec(1 / 2, 1 / 3));

    // can change scale by prop
    childTx.globalScale.x = 3;
    childTx.globalScale.y = 4;
    expect(parentTx.scale).toBeVector(ex.vec(2, 3));
    expect(childTx.scale).toBeVector(ex.vec(3 / 2, 4 / 3));

    // Can change scale by vec
    childTx.globalScale = ex.vec(3, 4);
    expect(parentTx.scale).toBeVector(ex.vec(2, 3));
    expect(childTx.scale).toBeVector(ex.vec(3 / 2, 4 / 3));
  });

  it('can have parent/child relationships with rotation', () => {
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

  it('can have parent/child relationships with z', () => {
    const parent = new ex.Entity([new ex.TransformComponent()]);
    const child = new ex.Entity([new ex.TransformComponent()]);
    parent.addChild(child);

    const parentTx = parent.get(ex.TransformComponent);
    const childTx = child.get(ex.TransformComponent);

    // Changing a parent z influences the child global z
    parentTx.z = 100;
    expect(childTx.z).toBe(0);
    expect(childTx.globalZ).toBe(100);

    // Changing a child global z affects childs local and not parent z
    parentTx.z = 100;
    childTx.globalZ = 50;
    expect(parentTx.z).toBe(100);
    expect(childTx.z).toBe(-50);
  });

  it('can retrieve the global transform', () => {
    const parent = new ex.Entity([new ex.TransformComponent()]);
    const child = new ex.Entity([new ex.TransformComponent()]);
    parent.addChild(child);

    const parentTx = parent.get(ex.TransformComponent);
    const childTx = child.get(ex.TransformComponent);

    // Changing a parent position influences the child global position
    parentTx.pos = ex.vec(100, 200);
    parentTx.rotation = Math.PI;
    parentTx.scale = ex.vec(2, 3);

    expect(childTx.pos).toBeVector(ex.vec(0, 0));
    expect(childTx.get().globalPos).toBeVector(ex.vec(100, 200));
    expect(childTx.get().globalRotation).toBe(Math.PI);
    expect(childTx.get().globalScale).toBeVector(ex.vec(2, 3));
  });

  it('can observe a z index change', () => {
    const tx = new ex.TransformComponent();
    const zSpy = vi.fn();
    tx.zIndexChanged$.subscribe(zSpy);

    tx.z = 19;

    expect(zSpy).toHaveBeenCalledWith(19);
    expect(tx.z).toBe(19);
  });

  it('will only flag the transform dirty once during integration', () => {
    const transform = new ex.TransformComponent();
    vi.spyOn(transform.get(), 'flagDirty');
    const motion = new ex.MotionComponent();

    EulerIntegrator.integrate(transform, motion, ex.Vector.Zero, 16);

    expect(transform.get().flagDirty).toHaveBeenCalledTimes(1);
  });

  it('will only flag dirty if the pos coord is different', () => {
    const transform = new ex.TransformComponent();
    vi.spyOn(transform.get(), 'flagDirty');

    expect(transform.globalPos).toBeVector(ex.vec(0, 0));
    transform.pos.x = 0;
    transform.pos.y = 0;
    transform.globalPos.x = 0;
    transform.globalPos.y = 0;
    expect(transform.get().flagDirty).not.toHaveBeenCalled();

    transform.globalPos.x = 1;
    expect(transform.get().flagDirty).toHaveBeenCalled();
  });

  it('will only flag dirty if the rotation coord is different', () => {
    const transform = new ex.TransformComponent();
    vi.spyOn(transform.get(), 'flagDirty');

    expect(transform.globalRotation).toBe(0);
    transform.rotation = 0;
    transform.globalRotation = 0;
    expect(transform.get().flagDirty).not.toHaveBeenCalled();

    transform.globalRotation = 1;
    expect(transform.get().flagDirty).toHaveBeenCalled();
  });

  it('will only flag dirty if the scale coord is different', () => {
    const transform = new ex.TransformComponent();
    vi.spyOn(transform.get(), 'flagDirty');

    expect(transform.globalScale).toBeVector(ex.vec(1, 1));
    transform.scale.x = 1;
    transform.scale.y = 1;
    transform.globalScale.x = 1;
    transform.globalScale.y = 1;
    expect(transform.get().flagDirty).not.toHaveBeenCalled();

    transform.globalScale.x = 2;
    expect(transform.get().flagDirty).toHaveBeenCalled();
  });

  it('can be parented/unparented as a Transform', () => {
    const child1 = new ex.Transform();
    const child2 = new ex.Transform();
    const parent = new ex.Transform();
    const grandParent = new ex.Transform();

    child1.parent = parent;
    child2.parent = parent;
    parent.parent = grandParent;

    expect(child1.children).toEqual([]);
    expect(parent.children).toEqual([child1, child2]);
    expect(grandParent.children).toEqual([parent]);

    child2.parent = null;
    expect(parent.children).toEqual([child1]);
  });

  it('can be parented/unparented as a TransformComponent', () => {
    const child1 = new ex.Entity([new TransformComponent()]);
    const child2 = new ex.Entity([new TransformComponent()]);
    const parent = new ex.Entity([new TransformComponent()]);
    const grandParent = new ex.Entity([new TransformComponent()]);

    parent.addChild(child1);
    parent.addChild(child2);
    grandParent.addChild(parent);

    expect(child1.children).toEqual([]);
    expect(parent.children).toEqual([child1, child2]);
    expect(grandParent.children).toEqual([parent]);

    parent.removeChild(child2);
    expect(parent.children).toEqual([child1]);
    expect(parent.get(TransformComponent).get().children).toEqual([child1.get(TransformComponent).get()]);
    expect(child2.get(TransformComponent).get().parent).toBe(null);
  });

  it('can be parented to a previously deleted entity with transform component', () => {
    const entityManager = new ex.EntityManager(new ex.World(null));

    const child1 = new ex.Entity([new TransformComponent()]);
    const child2 = new ex.Entity([new TransformComponent()]);
    const parent = new ex.Entity([new TransformComponent()]);

    parent.get(TransformComponent).pos = ex.vec(100, 500);
    parent.addChild(child1);

    entityManager.addEntity(parent);
    entityManager.removeEntity(parent, false);

    entityManager.addEntity(parent);
    parent.addChild(child2);

    expect(child1.get(TransformComponent).globalPos).toBeVector(ex.vec(100, 500));
    expect(child2.get(TransformComponent).globalPos).toBeVector(ex.vec(100, 500));
  });

  it('children inherit the top most parent coordinate plane', () => {
    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warn');
    const child1 = new ex.Entity([new TransformComponent()]);
    const child2 = new ex.Entity([new TransformComponent()], 'child2');
    const parent = new ex.Entity([new TransformComponent()]);
    const grandParent = new ex.Entity([new TransformComponent()]);

    parent.addChild(child1);
    parent.addChild(child2);
    grandParent.addChild(parent);

    expect(child1.children).toEqual([]);
    expect(parent.children).toEqual([child1, child2]);
    expect(grandParent.children).toEqual([parent]);

    // inherits top most parent
    grandParent.get(TransformComponent).coordPlane = ex.CoordPlane.World;
    expect(parent.get(TransformComponent).coordPlane).toBe(ex.CoordPlane.World);
    expect(child1.get(TransformComponent).coordPlane).toBe(ex.CoordPlane.World);
    expect(child2.get(TransformComponent).coordPlane).toBe(ex.CoordPlane.World);

    // inherits top most parent
    grandParent.get(TransformComponent).coordPlane = ex.CoordPlane.Screen;
    expect(parent.get(TransformComponent).coordPlane).toBe(ex.CoordPlane.Screen);
    expect(child1.get(TransformComponent).coordPlane).toBe(ex.CoordPlane.Screen);
    expect(child2.get(TransformComponent).coordPlane).toBe(ex.CoordPlane.Screen);

    // Can't change and logs warning
    child2.get(TransformComponent).coordPlane = ex.CoordPlane.World;
    expect(child2.get(TransformComponent).coordPlane).toBe(ex.CoordPlane.Screen);
    expect(logger.warn).toHaveBeenCalledWith(
      'Cannot set coordinate plane on child entity child2, children inherit their coordinate plane from their parents.'
    );
  });

  it('can be cloned', () => {
    const transform = new TransformComponent();
    const owner = new ex.Entity([transform]);
    transform.pos = ex.vec(1, 2);
    transform.rotation = 3;
    transform.scale = ex.vec(3, 4);
    transform.z = 5;

    const clone = owner.clone();

    const sut = clone.get(TransformComponent);

    // Should be same value
    expect(sut.pos).toBeVector(transform.pos);
    expect(sut.rotation).toBe(transform.rotation);
    expect(sut.scale).toBeVector(transform.scale);
    expect(sut.z).toBe(transform.z);

    // Should be new refs
    expect(sut).not.toBe(transform);
    expect(sut.pos).not.toBe(transform.pos);
    expect(sut.scale).not.toBe(transform.scale);

    // Should have a new owner
    expect(sut.owner).toBe(clone);
  });
});
