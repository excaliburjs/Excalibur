## Constructor Arguments

In Excalibur there are option bag constructors available on most types. These support any public property or member, methods are not supported. The API documentation does not provide an exhaustive list of possible properties but a list of commonly used properties.


For example instead of doing this:

```typescript
var actor = new ex.Actor(1, 2, 100, 100, ex.Color.Red);
actor.collisionType = ex.CollisionType.Active;

```

This is possible:
```typescript
var options: IActorArgs = {
   pos: new ex.Vector(1,2);
   width: 100,
   height: 100,
   color: ex.Color.Red,
   collisionType: ex.CollisionType.Active
}

var actor = new ex.Actor(options);
```

In fact you can create a duplicate this way

```typescript
var actor = new ex.Actor({
   pos: new ex.Vector(1,2)
})
var actorClone = new ex.Actor(actor);

expect(actor.pos).toBe(actorClone.pos); // true;
```

Types that support option bags can be mass assigned.

```typescript
var actor = new ex.Actor(options);

actor.assign({
   pos: new ex.Vector(100, 100),
   width: 1000,
   color: ex.Color.Red,
});
```

See:
  - [[Actor]]
  - [[Animation]]
  - [[Label]]
  - [[Sprite]]
  - [[SpriteSheet]]
  - [[SpriteFont]]
  - [[UIActor]]
  - [[Particle]]
  - [[ParticleEmitter]]
  - [[TileMap]]
  - [[Cell]]