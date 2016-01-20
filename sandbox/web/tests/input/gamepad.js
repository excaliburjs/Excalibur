/// <reference path="../../../../dist/Excalibur.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var game = new ex.Engine(800, 503, "game");
var padTexture = new ex.Texture("gamepad.png");
game.backgroundColor = ex.Color.White;
game.start(new ex.Loader([padTexture])).then(start);
function start() {
    // Load gamepad sprite
    var padSprite = new ex.Sprite(padTexture, 0, 0, padTexture.width, padTexture.height);
    // Enable Gamepad support
    game.input.gamepads.enabled = true;
    game.input.gamepads.setMinimumGamepadConfiguration({
        axis: 0,
        buttons: 8
    });
    // Log when pads disconnect and connect
    game.input.gamepads.on("connect", function (evet) {
        console.log("Gamepad connect");
    });
    game.input.gamepads.on("disconnect", function (evet) {
        console.log("Gamepad disconnect");
    });
    // Draw gamepad
    var gamepad = new ex.Actor(0, 0, padSprite.width, padSprite.height);
    gamepad.anchor.setTo(0, 0);
    gamepad.addDrawing("bg", padSprite);
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
    var buttons = {};
    var buttonDef;
    for (var b = 0; b < buttonDefs.length; b++) {
        buttonDef = buttonDefs[b];
        buttons[b] = new CircleActor(buttonDef[1], buttonDef[2], 10, 10, new ex.Color(0, 0, 0, 0.7));
        game.add(buttons[b]);
    }
    // Sticks
    var leftStick = new CircleActor(330, 272, 25, 25, ex.Color.fromRGB(95, 164, 22, 0.6));
    var rightStick = new CircleActor(470, 272, 25, 25, ex.Color.fromRGB(164, 45, 22, 0.6));
    game.add(leftStick);
    game.add(rightStick);
    // Update global state on engine update
    game.on("update", function (ue) {
        document.getElementById("gamepad-num").innerHTML = game.input.gamepads.getValidGamepads().length.toString();
        var pad1 = game.input.gamepads.getValidGamepads()[0];
        if (pad1) {
            // sticks
            var leftAxisX = pad1.getAxes(ex.Input.Axes.LeftStickX);
            var leftAxisY = pad1.getAxes(ex.Input.Axes.LeftStickY);
            var rightAxisX = pad1.getAxes(ex.Input.Axes.RightStickX);
            var rightAxisY = pad1.getAxes(ex.Input.Axes.RightStickY);
            leftStick.x = 330 + (leftAxisX * 20);
            leftStick.y = 272 + (leftAxisY * 20);
            rightStick.x = 470 + (rightAxisX * 20);
            rightStick.y = 272 + (rightAxisY * 20);
            // buttons
            var btnIndex;
            for (var btn in buttons) {
                if (!buttons.hasOwnProperty(btn))
                    continue;
                btnIndex = parseInt(btn, 10);
                if (pad1.isButtonPressed(btnIndex, 0.1)) {
                    buttons[btn].color = new ex.Color(255, 0, 0, 0.8);
                    buttons[btn].value = pad1.getButton(btnIndex);
                }
                else {
                    buttons[btn].color = new ex.Color(0, 0, 0, 0.7);
                    buttons[btn].value = 0;
                }
            }
        }
    });
}
var CircleActor = (function (_super) {
    __extends(CircleActor, _super);
    function CircleActor() {
        _super.apply(this, arguments);
        this.value = 0;
    }
    CircleActor.prototype.draw = function (ctx, delta) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.getWidth(), 0, 2 * Math.PI, true);
        ctx.fillStyle = this.color.toString();
        ctx.fill();
        ctx.closePath();
        if (this.value > 0) {
            ctx.fillText(this.value.toString(), 10, -10);
        }
        ctx.restore();
    };
    return CircleActor;
})(ex.Actor);
