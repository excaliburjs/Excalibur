## Creating a trigger

```js
var game = new ex.Game();
// create a handler
function onTrigger() {
  // `this` will be the Trigger instance
  ex.Logger.getInstance().info("Trigger was triggered!", this);
}
// set a trigger at (100, 100) that is 40x40px
var trigger = new ex.Trigger(100, 100, 40, 40, onTrigger, 1);
// create an actor across from the trigger
var actor = new ex.Actor(100, 0, 40, 40, ex.Color.Red);
// tell the actor to move towards the trigger over 3 seconds
actor.moveTo(100, 200, 3000);
game.add(trigger);
game.add(actor);
game.start();
```