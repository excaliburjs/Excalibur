var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ex;
(function (ex) {
    (function (Input) {
        /**
        * Enum representing input key codes
        * @class Keys
        *
        */
        (function (Keys) {
            /**
            @property Num1 {Keys}
            */
            /**
            @property Num2 {Keys}
            */
            /**
            @property Num3 {Keys}
            */
            /**
            @property Num4 {Keys}
            */
            /**
            @property Num5 {Keys}
            */
            /**
            @property Num6 {Keys}
            */
            /**
            @property Num7 {Keys}
            */
            /**
            @property Num8 {Keys}
            */
            /**
            @property Num9 {Keys}
            */
            /**
            @property Num0 {Keys}
            */
            Keys[Keys["Num1"] = 97] = "Num1";
            Keys[Keys["Num2"] = 98] = "Num2";
            Keys[Keys["Num3"] = 99] = "Num3";
            Keys[Keys["Num4"] = 100] = "Num4";
            Keys[Keys["Num5"] = 101] = "Num5";
            Keys[Keys["Num6"] = 102] = "Num6";
            Keys[Keys["Num7"] = 103] = "Num7";
            Keys[Keys["Num8"] = 104] = "Num8";
            Keys[Keys["Num9"] = 105] = "Num9";
            Keys[Keys["Num0"] = 96] = "Num0";

            /**
            @property Numlock {Keys}
            */
            Keys[Keys["Numlock"] = 144] = "Numlock";

            /**
            @property Semicolon {Keys}
            */
            Keys[Keys["Semicolon"] = 186] = "Semicolon";

            /**
            @property A {Keys}
            */
            /**
            @property B {Keys}
            */
            /**
            @property C {Keys}
            */
            /**
            @property D {Keys}
            */
            /**
            @property E {Keys}
            */
            /**
            @property F {Keys}
            */
            /**
            @property G {Keys}
            */
            /**
            @property H {Keys}
            */
            /**
            @property I {Keys}
            */
            /**
            @property J {Keys}
            */
            /**
            @property K {Keys}
            */
            /**
            @property L {Keys}
            */
            /**
            @property M {Keys}
            */
            /**
            @property N {Keys}
            */
            /**
            @property O {Keys}
            */
            /**
            @property P {Keys}
            */
            /**
            @property Q {Keys}
            */
            /**
            @property R {Keys}
            */
            /**
            @property S {Keys}
            */
            /**
            @property T {Keys}
            */
            /**
            @property U {Keys}
            */
            /**
            @property V {Keys}
            */
            /**
            @property W {Keys}
            */
            /**
            @property X {Keys}
            */
            /**
            @property Y {Keys}
            */
            /**
            @property Z {Keys}
            */
            Keys[Keys["A"] = 65] = "A";
            Keys[Keys["B"] = 66] = "B";
            Keys[Keys["C"] = 67] = "C";
            Keys[Keys["D"] = 68] = "D";
            Keys[Keys["E"] = 69] = "E";
            Keys[Keys["F"] = 70] = "F";
            Keys[Keys["G"] = 71] = "G";
            Keys[Keys["H"] = 72] = "H";
            Keys[Keys["I"] = 73] = "I";
            Keys[Keys["J"] = 74] = "J";
            Keys[Keys["K"] = 75] = "K";
            Keys[Keys["L"] = 76] = "L";
            Keys[Keys["M"] = 77] = "M";
            Keys[Keys["N"] = 78] = "N";
            Keys[Keys["O"] = 79] = "O";
            Keys[Keys["P"] = 80] = "P";
            Keys[Keys["Q"] = 81] = "Q";
            Keys[Keys["R"] = 82] = "R";
            Keys[Keys["S"] = 83] = "S";
            Keys[Keys["T"] = 84] = "T";
            Keys[Keys["U"] = 85] = "U";
            Keys[Keys["V"] = 86] = "V";
            Keys[Keys["W"] = 87] = "W";
            Keys[Keys["X"] = 88] = "X";
            Keys[Keys["Y"] = 89] = "Y";
            Keys[Keys["Z"] = 90] = "Z";

            /**
            @property Shift {Keys}
            */
            /**
            @property Alt {Keys}
            */
            /**
            @property Up {Keys}
            */
            /**
            @property Down {Keys}
            */
            /**
            @property Left {Keys}
            */
            /**
            @property Right {Keys}
            */
            /**
            @property Space {Keys}
            */
            /**
            @property Esc {Keys}
            */
            Keys[Keys["Shift"] = 16] = "Shift";
            Keys[Keys["Alt"] = 18] = "Alt";
            Keys[Keys["Up"] = 38] = "Up";
            Keys[Keys["Down"] = 40] = "Down";
            Keys[Keys["Left"] = 37] = "Left";
            Keys[Keys["Right"] = 39] = "Right";
            Keys[Keys["Space"] = 32] = "Space";
            Keys[Keys["Esc"] = 27] = "Esc";
        })(Input.Keys || (Input.Keys = {}));
        var Keys = Input.Keys;
        ;

        /**
        * Event thrown on a game object on KeyDown
        *
        * @class KeyDown
        * @extends GameEvent
        * @constructor
        * @param key {InputKey} The key responsible for throwing the event
        */
        var KeyDown = (function (_super) {
            __extends(KeyDown, _super);
            function KeyDown(key) {
                _super.call(this);
                this.key = key;
            }
            return KeyDown;
        })(ex.GameEvent);
        Input.KeyDown = KeyDown;

        /**
        * Event thrown on a game object on KeyUp
        *
        * @class KeyUp
        * @extends GameEvent
        * @constructor
        * @param key {InputKey} The key responsible for throwing the event
        */
        var KeyUp = (function (_super) {
            __extends(KeyUp, _super);
            function KeyUp(key) {
                _super.call(this);
                this.key = key;
            }
            return KeyUp;
        })(ex.GameEvent);
        Input.KeyUp = KeyUp;

        /**
        * Event thrown on a game object on KeyPress
        *
        * @class KeyPress
        * @extends GameEvent
        * @constructor
        * @param key {InputKey} The key responsible for throwing the event
        */
        var KeyPress = (function (_super) {
            __extends(KeyPress, _super);
            function KeyPress(key) {
                _super.call(this);
                this.key = key;
            }
            return KeyPress;
        })(ex.GameEvent);
        Input.KeyPress = KeyPress;

        var Keyboard = (function (_super) {
            __extends(Keyboard, _super);
            function Keyboard(engine) {
                _super.call(this);
                this._keys = [];
                this._keysUp = [];
                this._keysDown = [];

                this._engine = engine;
            }
            /**
            * Initialize Keyboard event listeners
            */
            Keyboard.prototype.init = function () {
                var _this = this;
                window.addEventListener('blur', function (ev) {
                    _this._keys.length = 0; // empties array efficiently
                });

                // key up is on window because canvas cannot have focus
                window.addEventListener('keyup', function (ev) {
                    var key = _this._keys.indexOf(ev.keyCode);
                    _this._keys.splice(key, 1);
                    _this._keysUp.push(ev.keyCode);
                    var keyEvent = new KeyUp(ev.keyCode);
                    _this.eventDispatcher.publish("up", keyEvent);
                });

                // key down is on window because canvas cannot have focus
                window.addEventListener('keydown', function (ev) {
                    if (_this._keys.indexOf(ev.keyCode) === -1) {
                        _this._keys.push(ev.keyCode);
                        _this._keysDown.push(ev.keyCode);
                        var keyEvent = new KeyDown(ev.keyCode);
                        _this.eventDispatcher.publish("down", keyEvent);
                    }
                });
            };

            Keyboard.prototype.update = function (delta) {
                // Reset keysDown and keysUp after update is complete
                this._keysDown.length = 0;
                this._keysUp.length = 0;
            };

            /**
            * Gets list of keys being pressed down
            */
            Keyboard.prototype.getKeys = function () {
                return this._keys;
            };

            /**
            *  Tests if a certain key is down.
            * @method isKeyDown
            * @param key {Keys} Test wether a key is down
            * @returns boolean
            */
            Keyboard.prototype.isKeyDown = function (key) {
                return this._keysDown.indexOf(key) > -1;
            };

            /**
            *  Tests if a certain key is pressed.
            * @method isKeyPressed
            * @param key {Keys} Test wether a key is pressed
            * @returns boolean
            */
            Keyboard.prototype.isKeyPressed = function (key) {
                return this._keys.indexOf(key) > -1;
            };

            /**
            *  Tests if a certain key is up.
            * @method isKeyUp
            * @param key {Keys} Test wether a key is up
            * @returns boolean
            */
            Keyboard.prototype.isKeyUp = function (key) {
                return this._keysUp.indexOf(key) > -1;
            };
            return Keyboard;
        })(ex.Class);
        Input.Keyboard = Keyboard;
    })(ex.Input || (ex.Input = {}));
    var Input = ex.Input;
})(ex || (ex = {}));
//# sourceMappingURL=Keyboard.js.map
