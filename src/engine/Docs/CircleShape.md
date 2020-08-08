## Circle Collision Shape

Excalibur has a [[CollisionShape|Shape]] static helper to create [[Circle|circles]] for collisions in your game.

The default shape for a collider is a box, however a custom [[Circle|circle]] shape and [[Collider|collider]] can be created for an [[Actor|actor]] [[Body|body]].

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
