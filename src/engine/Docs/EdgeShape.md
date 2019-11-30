## Edge Collision Shape

Excalibur has a [[CollisionShape|Shape]] static helper to create [[Edge|edges]] for collisions in your game.

The default shape for a collider is a box, however a custom [[Edge|edge]] shape and [[collider|Collider]] can be created for an [[Actor|actor]] [[Body|body]].

[[Edge|Edges]] are useful for creating walls, barriers, or platforms in your game.

**Keep in mind**, edges are defined local to the [[Body|body]] or [[Actor|actor]]. Meaning that the edge defined below starts at `ex.Vector(100, 100)` and goes to `ex.Vector(130, 400)` in world space. It is recommended when defining edges to leave the first coordinate `ex.Vector.Zero` to avoid confusion.

```typescript
const wall = new ex.Actor({
  pos: new ex.Vector(100, 300),
  color: ex.Color.Blue,
  body: new ex.Body({
    collider: new ex.Collider({
      shape: ex.Shape.Edge(new ex.Vector.Zero(), new ex.Vector(30, 100))
    })
  })
});
```
