## Circle Collision Shape

Excalibur has a [[shape|Shape]] static helper to create [[circles|Circle]] for collisions in your game.

The default shape for a collider is a box, however a custom [[circle|Circle]] shape and [[collider|Collider]] can be created for an [[actor|Actor]] [[body|Body]].

This example creates a circle of `radius = 50`.

```typescript
const circle = new ex.Actor({
  pos: new ex.Vector(400, 400),
  color: ex.Color.Red,
  body: new ex.Body({
    collider: new ex.Collider({
      shape: ex.Shape.Circle(50)
      type: ex.CollisionType.Active;
    })
  })
});
```
