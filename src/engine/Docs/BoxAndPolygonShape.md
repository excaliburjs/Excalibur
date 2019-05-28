## Box and ConvexPolygon Collision Shapes

Excalibur has a [[shape|Shape]] static helper to create boxes and [[polygons|ConvexPolygon]] for collisions in your game.

The default shape for a collider is a box, a custom box shape and [[collider|Collider]] can be created for an [[actor|Actor]] [[body|Body]]. The `ex.Shape.Box` helper actually creates a [[ConvexPolygon]] shape in Excalibur.

```typescript
const block = new ex.Actor({
  pos: new ex.Vector(400, 400),
  color: ex.Color.Red,
  body: new ex.Body({
    collider: new ex.Collider({
      shape: ex.Shape.Box(50, 50)
      type: ex.CollisionType.Active;
    })
  })
});
```

Creating a custom [[convex polygon|ConvexPolygon]] shape is just as simple. Excalibur only supports arbitrary convex shapes as a ConvexPolygon, this means no "cavities" in the shape, for example "pac-man" is not a convex shape.

The `points` in a [[convex polygon|ConvexPolygon]] have counter-clockwise winding by default, this means the points must be listed in counter-clockwise order around the shape to work. This can be switched by supplying `true` or `false` to the winding argument `ex.Shape.Polygon([...], true)` for clockwise winding.

**Keep in mind**, points are defined local to the [[body|Body]] or [[actor|Actor]]. Meaning that the triangle defined below is centered around `ex.Vector(400, 400)` in world space.

```typescript
const triangle = new ex.Actor({
  pos: new ex.Vector(400, 400),
  color: ex.Color.Red,
  body: new ex.Body({
    collider: new ex.Collider({
      shape: ex.Shape.Polygon([new ex.Vector(0, -100), new ex.Vector(-100, 50), new ex.Vector(100, 50)])
      type: ex.CollisionType.Active;
    })
  })
});
```
