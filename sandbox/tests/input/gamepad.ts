/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({ width: 800, height: 503, canvasElementId: 'game' });
var padTexture = new ex.ImageSource('gamepad.png');

game.backgroundColor = ex.Color.White;
game.start(new ex.Loader([padTexture])).then(start);

function start() {
  // Load gamepad sprite
  var padSprite = padTexture.toSprite();

  // Enable Gamepad support
  game.input.gamepads.enabled = true;
  game.input.gamepads.setMinimumGamepadConfiguration({
    axis: 0,
    buttons: 8
  });

  // Log when pads disconnect and connect
  game.input.gamepads.on('connect', (evet: ex.GamepadConnectEvent) => {
    console.log('Gamepad connect');
  });

  game.input.gamepads.on('disconnect', (evet: ex.GamepadDisconnectEvent) => {
    console.log('Gamepad disconnect');
  });

  // Draw gamepad
  var gamepad = new ex.Actor({width: padSprite.width, height: padSprite.height});
  gamepad.anchor.setTo(0, 0);
  gamepad.graphics.add(padSprite);
  game.add(gamepad);

  // Buttons
  var buttonDefs = [
    [ex.Input.Buttons.Face1, 544, 221],
    [ex.Input.Buttons.Face2, 573, 193],
    [ex.Input.Buttons.Face3, 516, 193],
    [ex.Input.Buttons.Face4, 544, 166],
    [ex.Input.Buttons.LeftBumper, 250, 100],
    [ex.Input.Buttons.RightBumper, 547, 100],
    [ex.Input.Buttons.LeftTrigger, 270, 88],
    [ex.Input.Buttons.RightTrigger, 524, 88],
    [ex.Input.Buttons.Select, 365, 193],
    [ex.Input.Buttons.Start, 436, 193],
    [ex.Input.Buttons.LeftStick, 330, 272],
    [ex.Input.Buttons.RightStick, 470, 272],
    [ex.Input.Buttons.DpadUp, 255, 166],
    [ex.Input.Buttons.DpadDown, 255, 222],
    [ex.Input.Buttons.DpadLeft, 227, 193],
    [ex.Input.Buttons.DpadRight, 284, 193]
  ];
  var buttons: { [key: number]: CircleActor } = {};

  var buttonDef;
  for (var b = 0; b < buttonDefs.length; b++) {
    buttonDef = buttonDefs[b];
    buttons[b] = new CircleActor({x: buttonDef[1], y: buttonDef[2], width: 10, height: 10, color: new ex.Color(0, 0, 0, 0.7)});
    game.add(buttons[b]);
  }

  // Sticks
  var leftStick = new CircleActor({x: 330, y: 272, width: 25, height: 25, color: ex.Color.fromRGB(95, 164, 22, 0.6)});
  var rightStick = new CircleActor({x: 470, y: 272, width: 25, height: 25, color: ex.Color.fromRGB(164, 45, 22, 0.6)});

  game.add(leftStick);
  game.add(rightStick);

  // Update global state on engine update
  game.on('postupdate', (ue: ex.PostUpdateEvent) => {
    document.getElementById('gamepad-num').innerHTML = game.input.gamepads.getValidGamepads().length.toString();

    var pad1 = game.input.gamepads.getValidGamepads()[0];

    if (pad1) {
      // sticks
      var leftAxisX = pad1.getAxes(ex.Input.Axes.LeftStickX);
      var leftAxisY = pad1.getAxes(ex.Input.Axes.LeftStickY);
      var rightAxisX = pad1.getAxes(ex.Input.Axes.RightStickX);
      var rightAxisY = pad1.getAxes(ex.Input.Axes.RightStickY);

      leftStick.pos = ex.vec(330 + leftAxisX * 20, 272 + leftAxisY * 20);
      rightStick.pos = ex.vec(470 + rightAxisX * 20, 272 + rightAxisY * 20);

      // buttons
      var btnIndex: number;
      for (var btn in buttons) {
        if (!buttons.hasOwnProperty(btn)) continue;
        btnIndex = parseInt(btn, 10);

        const actor = buttons[btn];
        if (pad1.wasButtonPressed(btnIndex, 0.1) || pad1.wasButtonReleased(btnIndex)) {
          actor.actions.clearActions()
          actor.actions
            .scaleTo(ex.Vector.One.scale(1.25), ex.Vector.One.scale(5))
            .scaleTo(ex.Vector.One.scale(1), ex.Vector.One.scale(5))
        }
        
        if (pad1.isButtonPressed(btnIndex, 0.1)) {
          actor.color = new ex.Color(255, 0, 0, 0.8);
          actor.value = pad1.getButton(btnIndex);
        } else {
          actor.color = new ex.Color(0, 0, 0, 0.7);
          actor.value = 0;
        }
      }
    }
  });
}

class CircleActor extends ex.Actor {
  private _value = 0;
  public get value(): number {
    return this._value;
  }
  public set value(val: number) {
    this._value = val;
    this._text.text = this._value.toString();
  }
  private _text = new ex.Text({
    text: this.value.toString(),
  });
  constructor(args: ex.ActorArgs) {
    super(args);
    this.graphics.add(new ex.Circle({
      radius: this.width,
      color: this.color
    }));
    this.graphics.add(this._text);
    this._text.color = this.color;
  }
}
