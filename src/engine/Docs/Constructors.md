## Constructor Arguments

In Excalibur there are option bag constructors available on most types. These support any public property or member, methods are not supported. The API documentation does not provide an exhaustive list of possible properties but a list of commonly used properties.

For example instead of doing this:

```typescript
const actor = new ex.Actor(1, 2, 100, 100, ex.Color.Red);
actor.body.collider.type = ex.CollisionType.Active;
```

This is possible:

```typescript
const options: IActorArgs = {
   pos: new ex.Vector(1,2);
   width: 100,
   height: 100,
   color: ex.Color.Red,
}

const actor = new ex.Actor(options);
actor.body.collider.type = ex.CollisionType.Active;
```

In fact you can create a duplicate this way

```typescript
const actor = new ex.Actor({
  pos: new ex.Vector(1, 2)
});
const actorClone = new ex.Actor(actor);

expect(actor.pos).toBe(actorClone.pos); // true;
```

Types that support option bags can have their properties mass assigned using the assign method.

```typescript
const actor = new ex.Actor(options);

actor.assign({
  pos: new ex.Vector(100, 100),
  width: 1000,
  color: ex.Color.Red
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
