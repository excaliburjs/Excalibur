Excalibur comes built in with two physics systems. The first system is [[CollisionResolutionStrategy.Box|Box physics]], and is a 
simple axis-aligned way of doing basic collision detection for non-rotated rectangular areas, defined by an actor's 
[[BoundingBox|bounding box]].

## Collision Types

Actors have the default collision type of [[CollisionType.PreventCollision]], this is so actors don't accidentally opt into something computationally expensive. **In order for actors to participate in collisions** and the global physics system, actors **must** have a collision type of [[CollisionType.Active]] or [[CollisionType.Fixed]].

### Prevent
Actors with the [[CollisionType.PreventCollision]] setting do not participate in any
collisions and do not raise collision events.

### Passive
Actors with the [[CollisionType.Passive]] setting only raise collision events, but are not
influenced or moved by other actors and do not influence or move other actors.

### Active
Actors with the [[CollisionType.Active]] setting raise collision events and participate
in collisions with other actors and will be push or moved by actors sharing
the [[CollisionType.Active]] or [[CollisionType.Fixed]] setting.

### Fixed 
Actors with the [[CollisionType.Fixed]] setting raise collision events and participate in
collisions with other actors. Actors with the [[CollisionType.Fixed]] setting will not be
pushed or moved by other actors sharing the [[CollisionType.Fixed]]. 

Think of `Fixed` actors as "immovable/onstoppable" objects. If two [[CollisionType.Fixed]] actors 
meet they will not be pushed or moved by each other, they will not interact except to throw
collision events.

## Enabling Excalibur physics

To enable physics in your game it is as simple as setting [[Physics.enabled]] to true and picking your 
[[CollisionResolutionStrategy]]

Excalibur supports 3 different types of collision area shapes in its physics simulation: [[PolygonArea|polygons]], 
[[CircleArea|circles]], and [[EdgeArea|edges]]. To use any one of these areas on an actor there are convenience methods off of 
the [[Actor|actor]] [[Body|physics body]]: [[Body.useBoxCollision|useBoxCollision]], 
[[Body.usePolygonCollision|usePolygonCollision]], [[Body.useCircleCollision|useCircleCollision]], and [[Body.useEdgeCollision]]

```ts
// setup game
var game = new ex.Engine({
    width: 600,
    height: 400
 });
// use rigid body
ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;
// set global acceleration simulating gravity pointing down
ex.Physics.acc.setTo(0, 700);

var block = new ex.Actor({
  x: 300,
  y: 0,
  width: 20, 
  height: 20, 
  color: ex.Color.Blue.clone(),
  collisionType: ex.CollisionType.Active
});
block.body.useBoxCollision(); // useBoxCollision is the default, technically optional
game.add(block);


var circle = new ex.Actor({
  x: 301, 
  y: 100, 
  width: 20, 
  height: 20, 
  color: ex.Color.Red.clone(),
  collisionType: ex.CollisionType.Active
});
circle.body.useCircleCollision(10); 
game.add(circle);

var ground = new ex.Actor({
  x: 300, 
  y: 380, 
  width: 600, 
  height: 10, 
  color: ex.Color.Black.clone(),
  collisionType: ex.CollisionType.Fixed
});

ground.body.useBoxCollision(); // optional 


game.add(ground);
// start the game

game.start();
```

## Limitations

Currently Excalibur only supports single contact point collisions and non-sleeping physics bodies. This has some negative stability 
and performance implications. Single contact point collisions can have odd oscillating behavior. Non-sleeping bodies will recalculate
collisions whether they need to or not. We fully intend to add these features into Excalibur in future releases.
