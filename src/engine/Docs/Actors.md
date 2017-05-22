## Basic actors

For quick and dirty games, you can just create an instance of an `Actor`
and manipulate it directly.

Actors (and other entities) must be added to a [[Scene]] to be drawn
and updated on-screen.

```ts
var player = new ex.Actor();

// move the player
player.vel.x = 5;

// add player to the current scene
game.add(player);

```
`game.add` is a convenience method for adding an `Actor` to the current scene. The equivalent verbose call is `game.currentScene.add`.

## Actor Lifecycle

An [[Actor|actor]] has a basic lifecycle that dictates how it is initialized, updated, and drawn. Once an actor is part of a 
[[Scene|scene]], it will follow this lifecycle.

![Actor Lifecycle](/assets/images/docs/ActorLifecycle.png)

## Extending actors

For "real-world" games, you'll want to `extend` the `Actor` class.
This gives you much greater control and encapsulates logic for that
actor.

You can override the [[onInitialize]] method to perform any startup logic
for an actor (such as configuring state). [[onInitialize]] gets called
**once** before the first frame an actor is drawn/updated. It is passed
an instance of [[Engine]] to access global state or perform coordinate math.

**TypeScript**

```ts
class Player extends ex.Actor {

   public level = 1;
   public endurance = 0;
   public fortitude = 0;

   constructor() {
      super();
   }

   public onInitialize(engine: ex.Engine) {
      this.endurance = 20;
      this.fortitude = 16;
   }

   public getMaxHealth() {
      return (0.4 * this.endurance) + (0.9 * this.fortitude) + (this.level * 1.2);
   }
}
```

**Javascript**

In Javascript you can use the [[extend]] method to override or add
methods to an `Actor`.

```js
var Player = ex.Actor.extend({

   level: 1,
   endurance: 0,
   fortitude: 0,

   onInitialize: function (engine) {
      this.endurance = 20;
      this.fortitude = 16;
   },

   getMaxHealth: function () {
      return (0.4 * this.endurance) + (0.9 * this.fortitude) + (this.level * 1.2);
   }
});
```

## Updating actors

Override the [[update]] method to update the state of your actor each frame.
Typically things that need to be updated include state, drawing, or position.

Remember to call `super.update` to ensure the base update logic is performed.
You can then write your own logic for what happens after that.

The [[update]] method is passed an instance of the Excalibur engine, which
can be used to perform coordinate math or access global state. It is also
passed `delta` which is the time in milliseconds since the last frame, which can be used
to perform time-based movement or time-based math (such as a timer).

**TypeScript**

```ts
class Player extends Actor {
   public update(engine: ex.Engine, delta: number) {
      super.update(engine, delta); // call base update logic

      // check if player died
      if (this.health <= 0) {
         this.emit("death");
         this.onDeath();
         return;
      }
   }
}
```

**Javascript**

```js
var Player = ex.Actor.extend({
   update: function (engine, delta) {
      ex.Actor.prototype.update.call(this, engine, delta); // call base update logic

      // check if player died
      if (this.health <= 0) {
         this.emit("death");
         this.onDeath();
         return;
      }
   }
});
```

## Drawing actors

Override the [[draw]] method to perform any custom drawing. For simple games,
you don't need to override `draw`, instead you can use [[addDrawing]] and [[setDrawing]]
to manipulate the [[Sprite|sprites]]/[[Animation|animations]] that the actor is using.

### Working with Textures & Sprites

Think of a [[Texture|texture]] as the raw image file that will be loaded into Excalibur. In order for it to be drawn
it must be converted to a [[Sprite]].

A common usage is to load a [[Texture]] and convert it to a [[Sprite]] for an actor. If you are using the [[Loader]] to
pre-load assets, you can simply assign an actor a [[Sprite]] to draw. You can also create a 
[[Texture.asSprite|sprite from a Texture]] to quickly create a [[Sprite]] instance.

```ts
// assume Resources.TxPlayer is a 80x80 png image

public onInitialize(engine: ex.Engine) {

   // set as the "default" drawing
   this.addDrawing(Resources.TxPlayer);

   // you can also set a Sprite instance to draw
   this.addDrawing(Resources.TxPlayer.asSprite());
}
```

### Working with Animations

A [[SpriteSheet]] holds a collection of sprites from a single [[Texture]].
Use [[SpriteSheet.getAnimationForAll]] to easily generate an [[Animation]].

```ts
// assume Resources.TxPlayerIdle is a texture containing several frames of an animation

public onInitialize(engine: ex.Engine) {

   // create a SpriteSheet for the animation
   var playerIdleSheet = new ex.SpriteSheet(Resources.TxPlayerIdle, 5, 1, 80, 80);

   // create an animation
   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(engine, 120);

   // the first drawing is always the current
   this.addDrawing("idle", playerIdleAnimation);
}
```

### Custom drawing

You can always override the default drawing logic for an actor in the [[draw]] method, 
for example, to draw complex shapes or to use the raw 
[[https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D|Canvas API]].

Usually you should call `super.draw` to perform the base drawing logic, but other times
you may want to take over the drawing completely.

```ts
public draw(ctx: CanvasRenderingContext2D, delta: number) {

   super.draw(ctx, delta); // perform base drawing logic

   // custom drawing
   ctx.lineTo(...);
}
```

## Actions

You can use the [[ActionContext|Action API]] to create chains of
actions and script actors into doing your bidding for your game.

Actions can be simple or can be chained together to create complex
AI routines. In the future, it will be easier to create timelines or
scripts to run depending on the state of your actor, such as an
enemy ship that is Guarding a path and then is Alerted when a Player
draws near.

Learn more about the [[ActionContext|Action API]].

## Collision Detection

By default Actors do not participate in collisions. If you wish to make
an actor participate, you need to switch from the default [[CollisionType.PreventCollision|prevent collision]]
to [[CollisionType.Active|active]], [[CollisionType.Fixed|fixed]], or [[CollisionType.Passive|passive]] collision type. 

```ts
public Player extends ex.Actor {
   constructor() {
      super();
      // set preferred CollisionType
      this.collisionType = ex.CollisionType.Active;
   }
}

// or set the collisionType 

var actor = new ex.Actor();
actor.collisionType = ex.CollisionType.Active;

```

## Traits
   
Traits describe actor behavior that occurs every update. If you wish to build a generic behavior 
without needing to extend every actor you can do it with a trait, a good example of this may be 
plugging in an external collision detection library like [[https://github.com/kripken/box2d.js/|Box2D]] or 
[[http://wellcaffeinated.net/PhysicsJS/|PhysicsJS]] by wrapping it in a trait. Removing traits can also make your 
actors more efficient.

Default traits provided by Excalibur are [["Traits/CapturePointer"|pointer capture]], 
[["Traits/TileMapCollisionDetection"|tile map collision]], 
and [["Traits/OffscreenCulling"|offscreen culling]].
