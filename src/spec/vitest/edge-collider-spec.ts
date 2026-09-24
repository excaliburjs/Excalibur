import * as ex from '@excalibur';

describe('An EdgeCollider as a separating axis shape', () => {
  it('exposes two local points (offset applied) and two opposing normals', () => {
    const edge = new ex.EdgeCollider({ begin: ex.vec(0, 0), end: ex.vec(10, 0), offset: ex.vec(5, 5) });

    expect(edge.points.length).toBe(2);
    expect(edge.points[0]).toBeVector(ex.vec(5, 5));
    expect(edge.points[1]).toBeVector(ex.vec(15, 5));

    expect(edge.normals.length).toBe(2);
    expect(edge.normals[0].distance()).toBeCloseTo(1, 4);
    expect(edge.normals[1]).toBeVector(edge.normals[0].negate());
    // normals are perpendicular to the edge
    expect(edge.normals[0].dot(ex.vec(1, 0))).toBeCloseTo(0, 4);

    // changing the edge refreshes the shape
    edge.end = ex.vec(0, 10);
    expect(edge.points[1]).toBeVector(ex.vec(5, 15));
    expect(edge.normals[0].dot(ex.vec(0, 1))).toBeCloseTo(0, 4);
  });

  it('produces a 2 point manifold for a box resting on it without allocating temporary colliders', () => {
    const floor = new ex.Actor({ x: 0, y: 0, collisionType: ex.CollisionType.Fixed });
    const edge = floor.collider.useEdgeCollider(ex.vec(-100, 0), ex.vec(100, 0));
    floor.collider.update();

    // 40x40 box overlapping the edge by 2px
    const box = new ex.Actor({ x: 0, y: -18, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    box.collider.update();

    const idsBefore = (ex.Collider as any)._ID;
    const contacts = box.collider.collide(floor.collider);
    expect((ex.Collider as any)._ID, 'polygon/edge collision must not allocate colliders').toBe(idsBefore);

    expect(contacts.length).toBe(1);
    const contact = contacts[0];
    expect(contact.colliderA).toBe(box.collider.get());
    expect(contact.colliderB).toBe(edge);
    expect(contact.id).toBe(ex.Pair.calculatePairHash(box.collider.get()!.id, edge.id));

    // normal points away from the box (A) towards the edge (B)
    expect(contact.normal).toBeVector(ex.vec(0, 1));
    expect(contact.mtv).toBeVector(ex.vec(0, 2));

    const xs = contact.points.map((p) => p.x).sort((a, b) => a - b);
    expect(contact.points.length).toBe(2);
    expect(xs[0]).toBeCloseTo(-20, 2);
    expect(xs[1]).toBeCloseTo(20, 2);
    for (const p of contact.points) {
      expect(p.y).toBeCloseTo(2, 2);
    }
  });

  it('is two sided, a box pushing up from below is separated downwards', () => {
    const floor = new ex.Actor({ x: 0, y: 0, collisionType: ex.CollisionType.Fixed });
    const edge = floor.collider.useEdgeCollider(ex.vec(-100, 0), ex.vec(100, 0));
    floor.collider.update();

    const box = new ex.Actor({ x: 0, y: 18, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    box.collider.update();

    const contact = box.collider.collide(floor.collider)[0];
    expect(contact).toBeDefined();
    expect(contact.colliderB).toBe(edge);
    expect(contact.normal).toBeVector(ex.vec(0, -1));
    expect(contact.mtv).toBeVector(ex.vec(0, -2));
    expect(contact.points.length).toBe(2);
  });

  it('separates along the edge normal even near the end of a very long edge', () => {
    const floor = new ex.Actor({ x: 0, y: 0, collisionType: ex.CollisionType.Fixed });
    floor.collider.useEdgeCollider(ex.vec(-2000, 0), ex.vec(2000, 0));
    floor.collider.update();

    // far from the edge center, the old extruded proxy polygon degenerated into a sliver here
    const box = new ex.Actor({ x: 1980, y: -18, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    box.collider.update();

    const contact = box.collider.collide(floor.collider)[0];
    expect(contact).toBeDefined();
    expect(contact.normal).toBeVector(ex.vec(0, 1));
    expect(contact.mtv).toBeVector(ex.vec(0, 2));
    expect(contact.points.length).toBe(2);
  });

  it('returns the same contact regardless of which collider initiates the collision', () => {
    const floor = new ex.Actor({ x: 0, y: 0, collisionType: ex.CollisionType.Fixed });
    const edge = floor.collider.useEdgeCollider(ex.vec(-100, 0), ex.vec(100, 0));
    floor.collider.update();

    const box = new ex.Actor({ x: 0, y: -18, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    box.collider.update();

    const fromBox = box.collider.get()!.collide(edge)[0];
    const fromEdge = edge.collide(box.collider.get()!)[0];
    expect(fromEdge.colliderA).toBe(fromBox.colliderA);
    expect(fromEdge.colliderB).toBe(fromBox.colliderB);
    expect(fromEdge.normal).toBeVector(fromBox.normal);
    expect(fromEdge.id).toBe(fromBox.id);
  });

  it('does not grow the separating axis cache when the same pair collides repeatedly', () => {
    const floor = new ex.Actor({ x: 0, y: 0, collisionType: ex.CollisionType.Fixed });
    floor.collider.useEdgeCollider(ex.vec(-100, 0), ex.vec(100, 0));
    floor.collider.update();

    const box = new ex.Actor({ x: 0, y: -18, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    box.collider.update();

    const cache: Map<number, number> = (ex.SeparatingAxis as any)._SEPARATION_CACHE;
    box.collider.collide(floor.collider);
    const sizeAfterFirst = cache.size;
    for (let i = 0; i < 50; i++) {
      box.collider.collide(floor.collider);
    }
    expect(cache.size).toBe(sizeAfterFirst);
  });
});
