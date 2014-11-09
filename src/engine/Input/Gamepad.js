var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ex;
(function (ex) {
    (function (Input) {
        (function (Buttons) {
            /**
            * Face 1 button (e.g. A)
            * @property Face1 {Buttons}
            */
            /**
            * Face 2 button (e.g. B)
            * @property Face2 {Buttons}
            */
            /**
            * Face 3 button (e.g. X)
            * @property Face3 {Buttons}
            */
            /**
            * Face 4 button (e.g. Y)
            * @property Face4 {Buttons}
            */
            Buttons[Buttons["Face1"] = 0] = "Face1";
            Buttons[Buttons["Face2"] = 1] = "Face2";
            Buttons[Buttons["Face3"] = 2] = "Face3";
            Buttons[Buttons["Face4"] = 3] = "Face4";

            /**
            * Left bumper button
            * @property LeftBumper {Buttons}
            */
            /**
            * Right bumper button
            * @property RightBumper {Buttons}
            */
            Buttons[Buttons["LeftBumper"] = 4] = "LeftBumper";
            Buttons[Buttons["RightBumper"] = 5] = "RightBumper";

            /**
            * Left trigger button
            * @property LeftTrigger {Buttons}
            */
            /**
            * Right trigger button
            * @property RightTrigger {Buttons}
            */
            Buttons[Buttons["LeftTrigger"] = 6] = "LeftTrigger";
            Buttons[Buttons["RightTrigger"] = 7] = "RightTrigger";

            /**
            * Select button
            * @property Select {Buttons}
            */
            /**
            * Start button
            * @property Start {Buttons}
            */
            Buttons[Buttons["Select"] = 8] = "Select";
            Buttons[Buttons["Start"] = 9] = "Start";

            /**
            * Left analog stick press (e.g. L3)
            * @property LeftStick {Buttons}
            */
            /**
            * Right analog stick press (e.g. R3)
            * @property Start {Buttons}
            */
            Buttons[Buttons["LeftStick"] = 10] = "LeftStick";
            Buttons[Buttons["RightStick"] = 11] = "RightStick";

            /**
            * D-pad up
            * @property DpadUp {Buttons}
            */
            /**
            * D-pad down
            * @property DpadDown {Buttons}
            */
            /**
            * D-pad left
            * @property DpadLeft {Buttons}
            */
            /**
            * D-pad right
            * @property DpadRight {Buttons}
            */
            Buttons[Buttons["DpadUp"] = 12] = "DpadUp";
            Buttons[Buttons["DpadDown"] = 13] = "DpadDown";
            Buttons[Buttons["DpadLeft"] = 14] = "DpadLeft";
            Buttons[Buttons["DpadRight"] = 15] = "DpadRight";
        })(Input.Buttons || (Input.Buttons = {}));
        var Buttons = Input.Buttons;

        (function (Axes) {
            /**
            * Left analogue stick X direction
            * @property LeftStickX {Axes}
            */
            /**
            * Left analogue stick Y direction
            * @property LeftStickY {Axes}
            */
            /**
            * Right analogue stick X direction
            * @property RightStickX {Axes}
            */
            /**
            * Right analogue stick Y direction
            * @property RightStickY {Axes}
            */
            Axes[Axes["LeftStickX"] = 0] = "LeftStickX";
            Axes[Axes["LeftStickY"] = 1] = "LeftStickY";
            Axes[Axes["RightStickX"] = 2] = "RightStickX";
            Axes[Axes["RightStickY"] = 3] = "RightStickY";
        })(Input.Axes || (Input.Axes = {}));
        var Axes = Input.Axes;

        var GamepadEvent = (function (_super) {
            __extends(GamepadEvent, _super);
            function GamepadEvent(gamepad) {
                _super.call(this);
                this.gamepad = gamepad;
            }
            return GamepadEvent;
        })(ex.GameEvent);
        Input.GamepadEvent = GamepadEvent;

        var GamepadButtonEvent = (function (_super) {
            __extends(GamepadButtonEvent, _super);
            function GamepadButtonEvent(button, value) {
                _super.call(this);
                this.button = button;
                this.value = value;
            }
            return GamepadButtonEvent;
        })(ex.GameEvent);
        Input.GamepadButtonEvent = GamepadButtonEvent;

        var GamepadAxisEvent = (function (_super) {
            __extends(GamepadAxisEvent, _super);
            function GamepadAxisEvent(axis, value) {
                _super.call(this);
                this.axis = axis;
                this.value = value;
            }
            return GamepadAxisEvent;
        })(ex.GameEvent);
        Input.GamepadAxisEvent = GamepadAxisEvent;

        var Gamepads = (function (_super) {
            __extends(Gamepads, _super);
            function Gamepads(engine) {
                _super.call(this);
                /**
                * Access to the individual pads
                * @property pads {Array<Gamepad>}
                */
                this.pads = [];
                /**
                * Whether or not to poll for Gamepad input (default: false)
                * @property enabled {boolean}
                */
                this.enabled = false;
                /**
                * Whether or not Gamepad API is supported
                * @property supported {boolean}
                */
                this.supported = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
                this._gamePadTimeStamps = [0, 0, 0, 0];
                this._oldPads = [];
                this._navigator = navigator;

                this._engine = engine;
            }
            Gamepads.prototype.init = function () {
                var _this = this;
                if (!this.supported)
                    return;

                window.addEventListener("gamepadconnected", function (ev) {
                    _this.eventDispatcher.publish("connected", new GamepadEvent(ev.gamepad));
                });
                window.addEventListener("gamepaddisconnected", function (ev) {
                    _this.eventDispatcher.publish("disconnected", new GamepadEvent(ev.gamepad));
                });

                this._oldPads = this._clonePads(this._navigator.getGamepads());

                for (var p = 0; p < this._oldPads.length; p++) {
                    this.pads.push(new Gamepad());
                }
            };

            Gamepads.prototype.update = function (delta) {
                if (!this.enabled)
                    return;

                var gamepads = this._navigator.getGamepads();

                for (var i = 0; i < gamepads.length; i++) {
                    if (gamepads[i] && (gamepads[i].timestamp !== this._gamePadTimeStamps[i])) {
                        // Buttons
                        var b, a;
                        for (b in Buttons) {
                            var buttonIndex = Buttons[b];
                            if (gamepads[i].buttons[buttonIndex].value !== this._oldPads[i].buttons[buttonIndex].value) {
                                if (gamepads[i].buttons[buttonIndex].pressed) {
                                    this.pads[i].eventDispatcher.publish("press", new GamepadButtonEvent(Buttons[b], gamepads[i].buttons[buttonIndex].value));
                                }
                            }
                        }

                        for (a in Axes) {
                            var axesIndex = Axes[a];
                            if (Math.abs(gamepads[i].axes[axesIndex] - this._oldPads[i].axes[axesIndex]) > Gamepads.MinAxisMoveThreshold) {
                                this.pads[i].eventDispatcher.publish("press", new GamepadAxisEvent(Axes[a], gamepads[i].axes[axesIndex]));
                            }
                        }

                        this._gamePadTimeStamps[i] = gamepads[i].timestamp;
                    }

                    this._oldPads[i] = this._clonePad(gamepads[i]);
                }
            };

            Gamepads.prototype._clonePads = function (pads) {
                var arr = [];
                for (var i = 0, len = pads.length; i < len; i++) {
                    arr.push(this._clonePad(pads[i]));
                }
                return arr;
            };

            /**
            * Fastest way to clone a known object is to do it yourself
            */
            Gamepads.prototype._clonePad = function (pad) {
                var i, len;
                var clonedPad = {
                    axes: [],
                    buttons: []
                };

                for (i = 0, len = pad.buttons.length; i < len; i++) {
                    clonedPad.buttons.push({ pressed: pad.buttons[i].pressed, value: pad.buttons[i].value });
                }
                for (i = 0, len = pad.axes.length; i < len; i++) {
                    clonedPad.axes.push(pad.axes[i]);
                }

                return clonedPad;
            };
            Gamepads.MinAxisMoveThreshold = 0.1;
            return Gamepads;
        })(ex.Class);
        Input.Gamepads = Gamepads;

        var Gamepad = (function (_super) {
            __extends(Gamepad, _super);
            function Gamepad() {
                _super.apply(this, arguments);
            }
            return Gamepad;
        })(ex.Class);
        Input.Gamepad = Gamepad;
    })(ex.Input || (ex.Input = {}));
    var Input = ex.Input;
})(ex || (ex = {}));
//# sourceMappingURL=Gamepad.js.map
