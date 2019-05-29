## Creating a trigger

```js
// Start the engine
var game = new ex.Engine({ width: 800, height: 600, displayMode: ex.DisplayMode.FullScreen });

// Uncomment next line to make the trigger box visible
// game.isDebug = true;

// create a handler
function onTrigger() {
  // `this` will be the Trigger instance
  ex.Logger.getInstance().info('Trigger was triggered!', this);
}

// set a trigger at (100, 100) that is 40x40px that can only be fired once
var trigger = new ex.Trigger({
  width: 40,
  height: 40,
  pos: new ex.Vector(100, 100),
  repeat: 1,
  target: actor,
  action: onTrigger
});

// create an actor above the trigger
var actor = new ex.Actor(100, 0, 40, 40, ex.Color.Red);

// Enable collision on actor (else trigger won't fire)
actor.body.collider.type = ex.CollisionType.Active;

// tell the actor to move across the trigger with a velocity of 100
actor.actions.moveTo(100, 200, 100);

// Add trigger and actor to our scene and start the scene
game.add(trigger);
game.add(actor);
game.start();
```
