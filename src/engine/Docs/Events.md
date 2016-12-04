When working with events, be sure to keep in mind the order of subscriptions
and try not to create a situation that requires specific things to happen in
order. Events are best used for input events, tying together disparate objects, 
or for UI updates.

Excalibur events follow the convention that the name of the thrown event for listening 
will be the same as the Event object in all lower case with the 'Event' suffix removed.    

For example:

- PreDrawEvent event object and "predraw" as the event name

```typescript
actor.on('predraw', (evtObj: PreDrawEvent) => {
   // do some pre drawing
})
```

## Example: Actor events

Actors implement an EventDispatcher ([[Actor.eventDispatcher]]) so they can 
send and receive events. For example, they can enable Pointer events (mouse/touch)
and you can respond to them by subscribing to the event names.
You can also emit any other kind of event for your game just by using a custom
`string` value and implementing a class that inherits from [[GameEvent]].

```js
var player = new ex.Actor(...);

// Enable pointer events for this actor
player.enableCapturePointer = true;
// subscribe to pointerdown event
player.on("pointerdown", function (evt: ex.Input.PointerEvent) {
  console.log("Player was clicked!");
});
// turn off subscription
player.off("pointerdown");
// subscribe to custom event
player.on("death", function (evt) {
  console.log("Player died:", evt);
});
// trigger custom event
player.emit("death", new DeathEvent());
```

## Example: Pub/Sub with Excalibur

You can also create an EventDispatcher for any arbitrary object, for example
a global game event aggregator (shown below as `vent`). Anything in your game can subscribe to
it, if the event aggregator is in the global scope.
*Warning:* This can easily get out of hand. Avoid this usage, it just serves as
an example.

```js
// create a publisher on an empty object
var vent = new ex.EventDispatcher({});
// handler for an event
var subscription = function (event) {
  console.log(event);
}
// add a subscription
vent.on("someevent", subscription);
// publish an event somewhere in the game
vent.emit("someevent", new ex.GameEvent());
```