There is always at least one [[Pointer]] available ([[Pointers.primary]]) and
you can request multiple pointers to support multi-touch scenarios.

Since [[Pointers.primary]] normalizes both mouse and touch events, your game
automatically supports touch for the primary pointer by default. When
you handle the events, you can customize what your game does based on the type
of pointer, if applicable.

Excalibur handles mouse/touch events and normalizes them to a [[PointerEvent]]
that your game can subscribe to and handle (`engine.input.pointers`).

## Events

You can subscribe to pointer events through `engine.input.pointers.on`. A [[PointerEvent]] object is
passed to your handler which offers information about the pointer input being received.

- `down` - When a pointer is pressed down (any mouse button or finger press)
- `up` - When a pointer is lifted
- `move` - When a pointer moves (be wary of performance issues when subscribing to this)
- `cancel` - When a pointer event is canceled for some reason

```js
engine.input.pointers.primary.on("down", function (evt) { });
engine.input.pointers.primary.on("up", function (evt) { });
engine.input.pointers.primary.on("move", function (evt) { });
engine.input.pointers.primary.on("cancel", function (evt) { });
```

### Wheel Event

You can also subscribe to the mouse wheel event through `engine.input.points.on`. A [[WheelEvent]]
object is passed to your handler which offers information about the wheel event being received.

- `wheel` - When a mousewheel is activated (trackpad scroll or mouse wheel)

```js
engine.input.pointers.primary.on("wheel", function (evt) { });
```

## Last position querying

If you don't wish to subscribe to events, you can also access the [[Pointer.lastPagePos]], [[Pointer.lastScreenPos]]
or [[Pointer.lastWorldPos]] coordinates ([[Vector]]) on the pointer you're targeting.

```js
engine.input.pointers.primary.lastPagePos
engine.input.pointers.primary.lastScreenPos
engine.input.pointers.primary.lastWorldPos
```

Note that the value may be `null` if the Pointer was not active the last frame.

## Pointer scope (window vs. canvas)

You have the option to handle *all* pointer events in the browser by setting
[[IEngineOptions.pointerScope]] to [[PointerScope.Document]]. If this is enabled,

Excalibur will handle every pointer event in the browser. This is useful for handling
complex input and having control over every interaction.

You can also use [[PointerScope.Canvas]] to only scope event handling to the game
canvas. This is useful if you don't care about events that occur outside the game.

One real-world example is dragging and gestures. Sometimes a player will drag their
finger outside your game and then into it, expecting it to work. If [[PointerScope]]
is set to [[PointerScope.Canvas|Canvas]] this will not work. If it is set to
[[PointerScope.Document|Document]], it will.

## Responding to input

The primary pointer can be a mouse, stylus, or single finger touch event. You
can inspect what type of pointer it is from the [[PointerEvent]] handled.

```js
engine.input.pointers.primary.on("down", function (pe) {
  if (pe.pointerType === ex.Input.PointerType.Mouse) {
    ex.Logger.getInstance().info("Mouse event:", pe);
  } else if (pe.pointerType === ex.Input.PointerType.Touch) {
    ex.Logger.getInstance().info("Touch event:", pe);
  }
});
```

## Multiple Pointers (Multi-Touch)

When there is more than one pointer detected on the screen,
this is considered multi-touch. For example, pressing one finger,
then another, will create two pointers. If you lift a finger,
the first one remains and the second one disappears.

You can handle multi-touch by subscribing to however many pointers
you would like to support. If a pointer doesn't yet exist, it will
be created. You do not need to check if a pointer exists. If it does
exist, it will propogate events, otherwise it will remain idle.

Excalibur does not impose a limit to the amount of pointers you can
subscribe to, so by all means, support all 10 fingers.

*Note:* There is no way to identify touches after they happen; you can only
know that there are *n* touches on the screen at once.

```js
function paint(color) {
  // create a handler for the event
  return function (pe) {
    if (pe.pointerType === ex.Input.PointerType.Touch) {
      engine.canvas.fillStyle = color;
      engine.canvas.fillRect(pe.x, pe.y, 5, 5);
    }
  }
}
engine.input.pointers.at(0).on("move", paint("blue"));  // 1st finger
engine.input.pointers.at(1).on("move", paint("red"));   // 2nd finger
engine.input.pointers.at(2).on("move", paint("green")); // 3rd finger
```

## Actor pointer events

By default, [[Actor|Actors]] do not participate in pointer events. In other
words, when you "click" an Actor, it will not throw an event **for that Actor**,
only a generic pointer event for the game. This is to keep performance 
high and allow actors to "opt-in" to handling pointer events. Actors will automatically
opt-in if a pointer related event handler is set on them `actor.on("pointerdown", () => {})` for example.

To opt-in manually, set [[Actor.enableCapturePointer]] to `true` and the [[Actor]] will
start publishing `pointerup` and `pointerdown` events. `pointermove` events
will not be published by default due to performance implications. If you want
an actor to receive move events, set [[ICapturePointerConfig.captureMoveEvents]] to
`true`.

Actor pointer events will be prefixed with `pointer`.

```js
var player = new ex.Actor();
// enable propagating pointer events
player.enableCapturePointer = true;
// enable move events, warning: performance intensive!
player.capturePointer.captureMoveEvents = true;
// subscribe to input
player.on("pointerup", function (ev) {
  player.logger.info("Player selected!", ev);
});
```
