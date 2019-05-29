## Edge Collision Shape

Excalibur has a [[shape|Shape]] static helper to create [[edges|Edge]] for collisions in your game.

The default shape for a collider is a box, however a custom [[edge|Edge]] shape and [[collider|Collider]] can be created for an [[actor|Actor]] [[body|Body]].

[[Edges|Edge]] are useful for creating walls, barriers, or platforms in your game.

**Keep in mind**, edges are defined local to the [[body|Body]] or [[actor|Actor]]. Meaning that the edge defined below starts at `ex.Vector(100, 100)` and goes to `ex.Vector(130, 400)` in world space. It is recommended when defining edges to leave the first coordinate `ex.Vector.Zero` to avoid confusion.

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
