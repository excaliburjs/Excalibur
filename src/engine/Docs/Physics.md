Excalibur comes built in with two physics systems. The first system is [[CollisionResolutionStrategy.Box|Box physics]], and is a
simple axis-aligned way of doing basic collision detection for non-rotated rectangular areas, defined by an actor's
[[BoundingBox|bounding box]].

## Physics hierarchy

Excalibur physics are organized into a hierarchy, each has a specific single role in the collision system.

```
Actor (game entity)
  -> Body (transform infomation)
     -> Collider (collision related information)
        -> Shape (geometry for collision)
```

For example:

```typescript
const actor = new ex.Actor({
  pos: new ex.Vector(100, 100),
  body: new ex.Body({
    vel: new ex.Vector(20, 0), // velocity
    acc: new ex.Vector(0, 100), // acceleration
    collider: new ex.Collider({
      mass: 100, // mass of 100
      type: ex.CollisionType.Active, // active collision type
      shape: ex.Shape.Circle(50) // circle geometry of radius 50
    })
  })
});
```

### Actor/Body

Actor's have position, velocity, and acceleration in physical space, all of these positional physical attributes are contained inside the [[Body]]. Only 1 actor can be associated with a [[Body]].

**[[Body]]** is the container for all transform related information for physics and any associated colliders.

This looks like this:

```typescript
const actor = new ex.Actor({
    // actor's position is stored on a default body
    pos: new ex.Vector(40, 40);
});

// actor position is stored on the body, actor.pos is a convenience
actor.pos === actor.body.pos

// actor velocity is stored on the body, actor.vel is a convenience
actor.vel === actor.body.vel

// actor acceleration is stored on the body, actor.acc is a convenience
actor.acc === actor.body.acc
```

### Collider

[[Body]]'s have a default box collider that is derived from the width and height of the [[Actor]] associated. Only 1 [[Collider]] can be associated with a [[Body]], and by extension an [[Actor]]. (Collision events are re-emitted onto [[Actor]])

**[[Collider]]** is the container of all collision related information, collision type, collision events, mass, inertia, friction, bounciness, shape, etc.

### Shape

[[Collider]]'s have [[CollisionShape]]'s that represent physical geometry. The possible shapes in Excalibur are [[Circle]], [[Edge]], and [[ConvexPolygon]]. A collider can only have 1 [[CollisionShape]] associated with them at a time.

## Collision Types

Colliders have the default collision type of [[CollisionType.PreventCollision]], this is so colliders don't accidentally opt into something computationally expensive. **In order for colliders to participate in collisions** and the global physics system, colliders **must** have a collision type of [[CollisionType.Active]] or [[CollisionType.Fixed]].

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

## Collision Type Behavior Matrix

This matrix shows what will happen with 2 actors of any collision type.

| Collision Type | Prevent |   Passive   |       Active        |        Fixed        |
| -------------- | :-----: | :---------: | :-----------------: | :-----------------: |
| Prevent        |  None   |    None     |        None         |        None         |
| Passive        |  None   | Events Only |     Events Only     |     Events Only     |
| Active         |  None   | Events Only | Resolution & Events | Resolution & Events |
| Fixed          |  None   | Events Only | Resolution & Events |        None         |

- None = No collision resolution and no collision events
- Events Only = No resolution is performed, only collision events are fired on colliders, except for `postcollision` which only fires if resolution was performed.
- Resolution & Events = Collider positions are resolved according to their collision type and collision events are fired on both colliders

## Enabling Excalibur physics

To enable physics in your game it is as simple as setting [[Physics.enabled]] to true and picking your
[[CollisionResolutionStrategy]]

Excalibur supports 3 different types of collision area shapes in its physics simulation: [[ConvexPolygon|polygons]],
[[Circle|circles]], and [[Edge|edges]]. To use any one of these areas on an actor there are convenience methods off of
the [[Actor|actor]] [[Body|physics body]]: [[Body.useBoxCollider|useBoxCollider]],
[[Body.usePolygonCollider|usePolygonCollider]], [[Body.useCircleCollider|useCircleCollider]], and [[Body.useEdgeCollider]]

## Collision Event Lifecycle

![Collision Events Diagram](/assets/images/docs/collisioneventdiagram.png)

### Collision Start "collisionstart"

The **collisionstart** event is fired when a [[Body|physics body]], usually attached to an actor, first starts colliding with another [[Body|body]], and will not fire again while in contact until the the pair separates and collides again.

Use cases for the **collisionstart** event may be detecting when an actor has touch a surface (like landing) or if a item has been touched and needs to be picked up.

```typescript
actor.on('collisionstart', () => {...})
// or
actor.body.collider.on('collisionstart', () => {...})
```

### Collision End "collisionend"

The **collisionend** event is fired when two [[Body|physics bodies]] are no longer in contact. This event will not fire again until another collision and separation.

Use cases for the **collisionend** event might be to detect when an actor has left a surface (like jumping) or has left an area.

```typescript
actor.on('collisionend', () => {...})
// or
actor.body.collider.on('collisionend', () => {...})
```

### Pre Collision "precollision"

The **precollision** event is fired **every frame** where a collision pair is found and two bodies are intersecting.

This event is useful for building in custom collision resolution logic in Passive-Passive or Active-Passive scenarios. For example in a breakout game you may want to tweak the angle of ricochet of the ball depending on which side of the paddle you hit.

```typescript
actor.on('precollision', () => {...})
// or
actor.body.collider.on('precollision', () => {...})
```

### Post Collision "postcollision"

The **postcollision** event is fired for **every frame** where collision resolution was performed. Collision resolution is when two bodies influence each other and cause a response like bouncing off one another. It is only possible to have _postcollision_ event in Active-Active and Active-Fixed type collision pairs.

Post collision would be useful if you need to know that collision resolution is happening or need to tweak the default resolution.

```typescript
actor.on('postcollision', () => {...})
// or
actor.body.collider.on('postcollision', () => {...})
```

## Example Active-Active/Active-Fixed scenario

```ts
// setup game
const game = new ex.Engine({
  width: 600,
  height: 400
});
// use rigid body
ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;
// set global acceleration simulating gravity pointing down
ex.Physics.acc.setTo(0, 700);

const block = new ex.Actor({
  pos: new ex.Vector(300, 0),
  width: 20,
  height: 20,
  color: ex.Color.Blue
});
block.body.useBoxCollider(); // useBoxCollision is the default, technically optional
block.body.collider.type = ex.CollisionType.Active;
game.add(block);

// or

const block = new ex.Actor({
    pos: new ex.Vector(300, 0),
    color: ex.Color.Blue,
    body: new ex.Body({
        collider: new ex.Collider({
            type: ex.CollisionType.Active,
            shape: ex.Shape.Box(20, 20)
        })
    })
});

const circle = new ex.Actor({
  x: 301,
  y: 100,
  width: 20,
  height: 20,
  color: ex.Color.Red
});
circle.body.useCircleCollider(10);
circle.body.collider.type = ex.CollisionType.Active;
game.add(circle);

// or

const circle = new ex.Actor({
    pos: new ex.Vector(301, 100),
    color: ex.Color.Red,
    body: new ex.Body({
        collider: new ex.Collider({
            shape: ex.Shape.Circle(10),
            type: ex.CollisionType.Active
        })
    })
});

const ground = new ex.Actor({
  x: 300,
  y: 380,
  width: 600,
  height: 10,
  color: ex.Color.Black;
});

ground.body.useBoxCollider(); // optional
groundbody.collider.type = ex.CollisionType.Fixed;

game.add(ground);
// start the game

game.start();
```

## Limitations

Currently Excalibur only supports single contact point collisions and non-sleeping physics bodies. This has some negative stability
and performance implications. Single contact point collisions can have odd oscillating behavior. Non-sleeping bodies will recalculate
collisions whether they need to or not. We fully intend to add these features into Excalibur in future releases.
