Excalibur comes built in with two physics systems. The first system is [[CollisionResolutionStrategy.Box|Box physics]], and is a 
simple axis-aligned way of doing basic collision detection for non-rotated rectangular areas, defined by an actor's 
[[BoundingBox|bounding box]].

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
var block = new ex.Actor(300, 0, 20, 20, ex.Color.Blue.clone());
block.body.useBoxCollision(); // useBoxCollision is the default, technically optional
game.add(block);
var circle = new ex.Actor(300, 100, 20, 20, ex.Color.Red.clone());
circle.body.useCircleCollision(10); 
game.add(circle);

var ground = new ex.Actor(300, 380, 600, 10, ex.Color.Black.clone());
ground.collisionType = ex.CollisionType.Fixed;
ground.body.useBoxCollision(); // optional 
game.add(ground);
// start the game
game.start();
```

## Limitations

Currently Excalibur only supports single contact point collisions and non-sleeping physics bodies. This has some negative stability 
and performance implications. Single contact point collisions can have odd oscillating behavior. Non-sleeping bodies will recalculate
collisions whether they need to or not. We fully intend to add these features into Excalibur in future releases.