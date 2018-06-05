Working with the keyboard is easy in Excalibur. You can inspect
whether a button was just [[Keyboard.wasPressed|pressed]] or [[Keyboard.wasReleased|released]] this frame, or
if the key is currently being [[Keyboard.isHeld|held]] down. Common keys are held in the [[Keys]]
enumeration but you can pass any character code to the methods.

Excalibur subscribes to the browser events and keeps track of
what keys are currently held, released, or pressed. A key can be held
for multiple frames, but a key cannot be pressed or released for more than one subsequent
update frame.

## Inspecting the keyboard

You can inspect [[Engine.input]] to see what the state of the keyboard
is during an update.

It is recommended that keyboard actions that directly effect actors be handled like so to improve code quality:

```ts
class Player extends ex.Actor {
  public update(engine, delta) {
    if (engine.input.keyboard.isHeld(ex.Input.Keys.W) || engine.input.keyboard.isHeld(ex.Input.Keys.Up)) {
      player._moveForward();
    }

    if (engine.input.keyboard.wasPressed(ex.Input.Keys.Right)) {
      player._fire();
    }
  }
}
```

## Events

You can subscribe to keyboard events through `engine.input.keyboard.on`. A [[KeyEvent]] object is
passed to your handler which offers information about the key that was part of the event.

- `press` - When a key was just pressed this frame
- `release` - When a key was just released this frame
- `hold` - Whenever a key is in the down position

```ts
engine.input.keyboard.on("press", (evt: KeyEvent) => {...});
engine.input.keyboard.on("release", (evt: KeyEvent) => {...});
engine.input.keyboard.on("hold", (evt: KeyEvent) => {...});
```
