import * as ex from '@excalibur';

describe('Collider world geometry sync', () => {
  it('reflects owner transform changes without an explicit update()', () => {
    const actor = new ex.Actor({ x: 0, y: 0, width: 40, height: 40 });
    const collider = actor.collider.get() as ex.PolygonCollider;
    actor.collider.update();
    expect(collider.center).toBeVector(ex.vec(0, 0));

    // no collider.update() call, the world geometry follows the owner transform lazily
    actor.pos = ex.vec(100, 50);
    expect(collider.center).toBeVector(ex.vec(100, 50));
    expect(collider.bounds.left).toBeCloseTo(80, 4);
    expect(collider.transform.pos).toBeVector(ex.vec(100, 50));
  });

  it('only bumps worldVersion when the owner transform or offset actually changes', () => {
    const actor = new ex.Actor({ x: 10, y: 10, width: 40, height: 40 });
    const collider = actor.collider.get()!;
    actor.collider.update();
    const version = collider.worldVersion;

    // repeated updates without any change are free
    actor.collider.update();
    actor.collider.update();
    expect(collider.worldVersion).toBe(version);

    actor.pos = ex.vec(20, 10);
    expect(collider.worldVersion).toBeGreaterThan(version);

    const afterMove = collider.worldVersion;
    (collider as ex.PolygonCollider).offset = ex.vec(5, 0);
    expect(collider.worldVersion).toBeGreaterThan(afterMove);
    expect(collider.center).toBeVector(ex.vec(25, 10));
  });

  it('applies a mirrored owner scale to the geometry exactly once', () => {
    const actor = new ex.Actor({ x: 0, y: 0, width: 40, height: 20 });
    actor.scale = ex.vec(-1, 1);
    const collider = actor.collider.get() as ex.PolygonCollider;
    actor.collider.update();
    const first = collider.getTransformedPoints().map((p) => [p.x, p.y]);

    // previously every update re-flipped the local points, now it is idempotent
    actor.collider.update();
    actor.collider.update();
    expect(collider.getTransformedPoints().map((p) => [p.x, p.y])).toEqual(first);
    expect(collider.bounds.width).toBeCloseTo(40, 4);
    expect(collider.bounds.height).toBeCloseTo(20, 4);

    // and unmirroring restores the original geometry (winding order differs, the point set doesn't)
    actor.scale = ex.vec(1, 1);
    expect(collider.bounds.width).toBeCloseTo(40, 4);
    const sorted = (pts: number[][]) => [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    expect(sorted(collider.getTransformedPoints().map((p) => [p.x, p.y]))).toEqual(sorted(first));
  });

  it('circle and edge colliders sync lazily too', () => {
    const circleActor = new ex.Actor({ x: 0, y: 0, radius: 10 });
    const circle = circleActor.collider.get() as ex.CircleCollider;
    circleActor.collider.update();
    circleActor.pos = ex.vec(30, 0);
    expect(circle.center).toBeVector(ex.vec(30, 0));

    const edgeActor = new ex.Actor({ x: 0, y: 0 });
    const edge = edgeActor.collider.useEdgeCollider(ex.vec(0, 0), ex.vec(10, 0));
    edgeActor.collider.update();
    edgeActor.pos = ex.vec(0, 5);
    expect(edge.center).toBeVector(ex.vec(5, 5));
  });

  it('lets the hash grid skip proxies whose colliders did not change', () => {
    const processor = new ex.SparseHashGridCollisionProcessor({ size: 100 });
    const actor = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    const collider = actor.collider.get()!;
    actor.collider.update();
    processor.track(collider);

    const proxy = processor.hashGrid.objectToProxy.get(collider)!;
    expect(processor.update([collider])).toBe(0);
    // unchanged transform: no bounds refresh, no cell comparison
    expect(proxy.hasChanged()).toBe(false);

    // moving into a new cell is still picked up
    actor.pos = ex.vec(500, 500);
    expect(proxy.hasChanged()).toBe(true);
  });
});
