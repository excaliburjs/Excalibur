import * as ex from '@excalibur';

describe('A ColliderComponent', () => {
  it('exists', () => {
    expect(ex.ColliderComponent).toBeDefined();
  });

  it('can be built with a collider', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    expect(comp).toBeDefined();
  });

  it('can collide with other components', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    const comp2 = new ex.ColliderComponent(ex.Shape.Circle(50));
    const contacts = comp.collide(comp2);

    expect(contacts.length).toBe(1);
  });

  it('can be cloned', () => {
    const collider = new ex.ColliderComponent(ex.Shape.Circle(50));
    const owner = new ex.Entity([collider]);

    const originalCollisionHandler = vi.fn();
    owner.on('collisionstart', originalCollisionHandler);

    const clone = owner.clone();

    const cloneCollisionHandler = vi.fn();
    clone.on('collisionstart', cloneCollisionHandler);

    const sut = clone.get(ex.ColliderComponent);

    // Should be same value
    expect(sut.get().bounds).toEqual(collider.get().bounds);
    expect(sut.bounds).toEqual(collider.bounds);

    // Should be new refs
    expect(sut).not.toBe(collider);

    // Should have a new owner
    expect(sut.owner).toBe(clone);

    // Original handler should fire not the clone
    collider
      .get()
      .events.emit('collisionstart', new ex.CollisionStartEvent<ex.Collider>(ex.Shape.Circle(50), ex.Shape.Circle(50), null, null));

    expect(originalCollisionHandler).toHaveBeenCalledTimes(1);
    expect(cloneCollisionHandler).not.toHaveBeenCalled();
  });

  it('can handle composite components', () => {
    const compCollider = new ex.CompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(200, 10)]);

    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    const comp2 = new ex.ColliderComponent(compCollider);
    const contacts = comp.collide(comp2);

    expect(contacts.length).toBe(2);
  });

  it('wires up collision events to the owner onAdd', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    vi.spyOn(comp.events, 'on');

    const e = new ex.Entity();
    e.addComponent(comp);

    expect(comp.events.on).toHaveBeenCalledWith('precollision', expect.anything());
    expect(comp.events.on).toHaveBeenCalledWith('postcollision', expect.anything());
    expect(comp.events.on).toHaveBeenCalledWith('collisionstart', expect.anything());
    expect(comp.events.on).toHaveBeenCalledWith('collisionend', expect.anything());
  });

  it('clears out collision events on the owner onRemove', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    vi.spyOn(comp.events, 'clear');

    const e = new ex.Entity();
    e.addComponent(comp);
    e.removeComponent(ex.ColliderComponent, true);

    expect(comp.events.clear).toHaveBeenCalled();
  });

  it('clear a collider', () => {
    const collider = ex.Shape.Circle(50);
    const comp = new ex.ColliderComponent(collider);
    vi.spyOn(collider.events, 'unpipe');
    vi.spyOn(comp.$colliderRemoved, 'notifyAll');
    const e = new ex.Entity();
    e.addComponent(comp);
    expect(collider.owner).not.toBeNull();

    comp.clear();
    comp.processColliderRemoval();

    expect(comp.get()).toBeNull();
    expect(collider.events.unpipe).toHaveBeenCalled();
    expect(comp.$colliderRemoved.notifyAll).toHaveBeenCalled();
    expect(collider.owner).toBeNull();
  });

  it('returns null and warns once when set() is called with no collider on an owned component', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    const e = new ex.Entity();
    e.addComponent(comp);

    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warnOnce');

    const result = comp.set(undefined);

    expect(result).toBeNull();
    expect(comp.get()).toBeNull();
    expect(logger.warnOnce).toHaveBeenCalled();
  });

  it('returns null and does not warn when set() is called with no collider and no owner', () => {
    const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warnOnce');

    const result = comp.set(undefined);

    expect(result).toBeNull();
    expect(logger.warnOnce).not.toHaveBeenCalled();
  });

  it('bounds and localBounds default to an empty BoundingBox with no collider set', () => {
    const comp = new ex.ColliderComponent();

    expect(comp.bounds).toEqual(new ex.BoundingBox());
    expect(comp.localBounds).toEqual(new ex.BoundingBox());
  });

  it('collide() returns no contacts if either side has no collider', () => {
    const empty = new ex.ColliderComponent();
    const withCollider = new ex.ColliderComponent(ex.Shape.Circle(50));

    expect(empty.collide(withCollider)).toEqual([]);
    expect(withCollider.collide(empty)).toEqual([]);
  });

  describe('update()', () => {
    it('is a no-op with no collider set', () => {
      const comp = new ex.ColliderComponent();
      expect(() => comp.update()).not.toThrow();
    });

    it('updates the collider transform when the owner has a TransformComponent', () => {
      const collider = ex.Shape.Circle(10);
      const comp = new ex.ColliderComponent(collider);
      const e = new ex.Entity([new ex.TransformComponent(), comp]);
      e.get(ex.TransformComponent).pos = ex.vec(50, 75);

      comp.update();

      expect(collider.center).toBeVector(ex.vec(50, 75));
    });
  });

  describe('use*Collider factory methods', () => {
    it('useBoxCollider sets a box-shaped polygon collider', () => {
      const comp = new ex.ColliderComponent();
      const collider = comp.useBoxCollider(100, 50);

      expect(comp.get()).toBe(collider);
      expect(collider).toBeInstanceOf(ex.PolygonCollider);
      expect(collider.bounds.width).toBe(100);
      expect(collider.bounds.height).toBe(50);
    });

    it('usePolygonCollider sets a polygon collider', () => {
      const comp = new ex.ColliderComponent();
      const points = [ex.vec(0, 0), ex.vec(10, 0), ex.vec(10, 10)];
      const collider = comp.usePolygonCollider(points);

      expect(comp.get()).toBe(collider);
      expect(collider).toBeInstanceOf(ex.PolygonCollider);
    });

    it('useCircleCollider sets a circle collider', () => {
      const comp = new ex.ColliderComponent();
      const collider = comp.useCircleCollider(25);

      expect(comp.get()).toBe(collider);
      expect(collider).toBeInstanceOf(ex.CircleCollider);
      expect(collider.radius).toBe(25);
    });

    it('useEdgeCollider sets an edge collider', () => {
      const comp = new ex.ColliderComponent();
      const collider = comp.useEdgeCollider(ex.vec(0, 0), ex.vec(100, 0));

      expect(comp.get()).toBe(collider);
      expect(collider).toBeInstanceOf(ex.EdgeCollider);
    });

    it('useCompositeCollider sets a composite collider', () => {
      const comp = new ex.ColliderComponent();
      const collider = comp.useCompositeCollider([ex.Shape.Circle(10), ex.Shape.Box(10, 10)]);

      expect(comp.get()).toBe(collider);
      expect(collider).toBeInstanceOf(ex.CompositeCollider);
    });
  });

  describe('serialize()/deserialize()', () => {
    it('round-trips a circle collider', () => {
      const comp = new ex.ColliderComponent();
      comp.useCircleCollider(30, ex.vec(1, 2));
      const data = comp.serialize();

      expect(data.colliderType).toBe('circle');

      const roundTripped = new ex.ColliderComponent();
      roundTripped.deserialize(data);

      const original = comp.get() as ex.CircleCollider;
      const restored = roundTripped.get() as ex.CircleCollider;
      expect(restored.radius).toBe(original.radius);
      expect(restored.offset).toEqual(original.offset);
    });

    it('round-trips a polygon collider', () => {
      const comp = new ex.ColliderComponent();
      comp.usePolygonCollider([ex.vec(0, 0), ex.vec(10, 0), ex.vec(10, 10), ex.vec(0, 10)]);
      const data = comp.serialize();

      expect(data.colliderType).toBe('polygon');

      const roundTripped = new ex.ColliderComponent();
      roundTripped.deserialize(data);

      const original = comp.get() as ex.PolygonCollider;
      const restored = roundTripped.get() as ex.PolygonCollider;
      expect(restored.points).toEqual(original.points);
    });

    it('round-trips a composite collider made of circle and polygon parts', () => {
      const comp = new ex.ColliderComponent();
      comp.useCompositeCollider([ex.Shape.Circle(15), ex.Shape.Polygon([ex.vec(0, 0), ex.vec(5, 0), ex.vec(5, 5)])]);
      const data = comp.serialize();

      expect(data.colliderType).toBe('composite');

      const roundTripped = new ex.ColliderComponent();
      roundTripped.deserialize(data);

      const restored = roundTripped.get() as ex.CompositeCollider;
      expect(restored).toBeInstanceOf(ex.CompositeCollider);
      expect(restored.getColliders().length).toBe(2);
    });

    it('serialize() with no collider set produces null collider type/data', () => {
      const comp = new ex.ColliderComponent();
      const data = comp.serialize();

      expect(data.colliderType).toBeNull();
      expect(data.colliderData).toBeNull();
    });

    // BUG: EdgeCollider extends Collider directly (not PolygonCollider), so none of
    // serialize()'s instanceof checks (PolygonCollider/CircleCollider/CompositeCollider)
    // match it. An actor with useEdgeCollider() silently loses its collider on
    // serialize -- no error, no warning, just null data. Documenting current behavior.
    it('BUG: serialize() silently drops edge colliders (colliderType stays null)', () => {
      const comp = new ex.ColliderComponent();
      comp.useEdgeCollider(ex.vec(0, 0), ex.vec(100, 0));
      const data = comp.serialize();

      expect(data.colliderType).toBeNull();
      expect(data.colliderData).toBeNull();
    });
  });

  describe('event wiring on add', () => {
    it('propagates precollision/postcollision/collisionstart/collisionend to the owning entity', () => {
      const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
      const e = new ex.Entity([comp]);

      const precollision = vi.fn();
      const postcollision = vi.fn();
      const collisionstart = vi.fn();
      const collisionend = vi.fn();
      e.events.on('precollision', precollision);
      e.events.on('postcollision', postcollision);
      e.events.on('collisionstart', collisionstart);
      e.events.on('collisionend', collisionend);

      const other = ex.Shape.Circle(50);
      const self = comp.get()!;

      comp.events.emit('precollision', new ex.PreCollisionEvent(self, other, ex.Side.None, ex.Vector.Zero, null as any));
      comp.events.emit('postcollision', new ex.PostCollisionEvent(self, other, ex.Side.None, ex.Vector.Zero, null as any));
      comp.events.emit('collisionstart', new ex.CollisionStartEvent(self, other, ex.Side.None, null as any));
      comp.events.emit('collisionend', new ex.CollisionEndEvent(self, other, ex.Side.None, null as any));

      expect(precollision).toHaveBeenCalledTimes(1);
      expect(postcollision).toHaveBeenCalledTimes(1);
      expect(collisionstart).toHaveBeenCalledTimes(1);
      expect(collisionend).toHaveBeenCalledTimes(1);
    });

    it('calls the Actor-specific collision resolve hooks when the owner is an Actor', () => {
      const comp = new ex.ColliderComponent(ex.Shape.Circle(50));
      const actor = new ex.Actor({ collider: comp.get()! });
      actor.removeComponent(ex.ColliderComponent, true);
      actor.addComponent(comp);

      vi.spyOn(actor, 'onPreCollisionResolve');
      vi.spyOn(actor, 'onPostCollisionResolve');
      vi.spyOn(actor, 'onCollisionStart');
      vi.spyOn(actor, 'onCollisionEnd');

      const other = ex.Shape.Circle(50);
      const self = comp.get()!;
      comp.events.emit('precollision', new ex.PreCollisionEvent(self, other, ex.Side.None, ex.Vector.Zero, null as any));
      comp.events.emit('postcollision', new ex.PostCollisionEvent(self, other, ex.Side.None, ex.Vector.Zero, null as any));
      comp.events.emit('collisionstart', new ex.CollisionStartEvent(self, other, ex.Side.None, null as any));
      comp.events.emit('collisionend', new ex.CollisionEndEvent(self, other, ex.Side.None, null as any));

      expect(actor.onPreCollisionResolve).toHaveBeenCalledTimes(1);
      expect(actor.onPostCollisionResolve).toHaveBeenCalledTimes(1);
      expect(actor.onCollisionStart).toHaveBeenCalledTimes(1);
      expect(actor.onCollisionEnd).toHaveBeenCalledTimes(1);
    });
  });
});
