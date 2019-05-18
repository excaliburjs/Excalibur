You can query any [[Gamepad|Gamepads]] that are connected or listen to events ("button" and "axis").

You must opt-in to controller support ([[Gamepads.enabled]]) because it is a polling-based
API, so we have to check it each update frame. If an gamepad related event handler is set, you will
automatically opt-in to controller polling.

HTML5 Gamepad API only supports a maximum of 4 gamepads. You can access them using the [[Gamepads.at]] method. If a [[Gamepad]] is
not connected, it will simply not throw events.

## Gamepad Filtering

Different browsers/devices are sometimes loose about the devices they consider Gamepads, you can set minimum device requirements with
`engine.input.gamepads.setMinimumGamepadConfiguration` so that undesired devices are not reported to you (Touchpads, Mice, Web
Cameras, etc.).

```js
// ensures that only gamepads with at least 4 axis and 8 buttons are reported for events
engine.input.gamepads.setMinimumGamepadConfiguration({
  axis: 4,
  buttons: 8
});
```

## Events

You can subscribe to gamepad connect and disconnect events through `engine.input.gamepads.on`.

A [[GamepadConnectEvent]] or [[GamepadDisconnectEvent]] will be passed to you.

- `connect` - When a gamepad connects it will fire this event and pass a [[GamepadConnectEvent]] with a reference to the gamepad.
- `disconnect` - When a gamepad disconnects it will fire this event and pass a [[GamepadDisconnectEvent]]

Once you have a reference to a gamepad you may listen to changes on that gamepad with `.on`. A [[GamepadButtonEvent]] or
[[GamepadAxisEvent]] will be passed to you.

- `button` - Whenever a button is pressed on the game
- `axis` - Whenever an axis

```ts
engine.input.gamepads.on('connect', (ce: ex.Input.GamepadConnectEvent) => {
  const newPlayer = CreateNewPlayer(); // pseudo-code for new player logic on gamepad connection
  console.log('Gamepad connected', ce);
  ce.gamepad.on('button', (be: ex.GamepadButtonEvent) => {
    if (be.button === ex.Input.Buttons.Face1) {
      newPlayer.jump();
    }
  });

  ce.gamepad.on('axis', (ae: ex.GamepadAxisEvent) => {
    if (ae.axis === ex.Input.Axis.LeftStickX && ae.value > 0.5) {
      newPlayer.moveRight();
    }
  });
});
```

## Responding to button input

[[Buttons|Gamepad buttons]] typically have values between 0 and 1, however depending on
the sensitivity of the controller, even if a button is idle it could have a
very tiny value. For this reason, you can pass in a threshold to several
methods to customize how sensitive you want to be in detecting button presses.

You can inspect any connected [[Gamepad]] using [[Gamepad.isButtonPressed]], [[Gamepad.getButton]],
or you can subscribe to the `button` event published on the [[Gamepad]] which passes
a [[GamepadButtonEvent]] to your handler.

```js
// enable gamepad support
engine.input.gamepads.enabled = true;
// query gamepad on update
engine.on('update', function(ev) {
  // access any gamepad by index
  if (engine.input.gamepads.at(0).isButtonPressed(ex.Input.Buttons.Face1)) {
    ex.Logger.getInstance().info('Controller A button pressed');
  }
  // query individual button
  if (engine.input.gamepads.at(0).getButton(ex.Input.Buttons.DpadLeft) > 0.2) {
    ex.Logger.getInstance().info('Controller D-pad left value is > 0.2');
  }
});
// subscribe to button events
engine.input.gamepads.at(0).on('button', function(ev) {
  ex.Logger.getInstance().info(ev.button, ev.value);
});
```

## Responding to axis input

[[Axes|Gamepad axes]] typically have values between -1 and 1, but even idle
sticks can still propogate very small values depending on the quality and age
of a controller. For this reason, you can set [[Gamepads.MinAxisMoveThreshold]]
to set the (absolute) threshold after which Excalibur will start publishing `axis` events.
By default it is set to a value that normally will not throw events if a stick is idle.
You can query axes via [[Gamepad.getAxes]] or by subscribing to the `axis` event on [[Gamepad]]
which passes a [[GamepadAxisEvent]] to your handler.

```js
// enable gamepad support
engine.input.gamepads.enabled = true;
// query gamepad on update
engine.on('update', function(ev) {
  // access any gamepad by index
  var axisValue;
  if ((axisValue = engine.input.gamepads.at(0).getAxes(ex.Input.Axes.LeftStickX)) > 0.5) {
    ex.Logger.getInstance().info('Move right', axisValue);
  }
});
// subscribe to axis events
engine.input.gamepads.at(0).on('axis', function(ev) {
  ex.Logger.getInstance().info(ev.axis, ev.value);
});
```
