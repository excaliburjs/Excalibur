module ex.Input {

   /**
    * Manages Gamepad API input. You can query the gamepads that are connected
    * or listen to events ("button" and "axis").
    * @class Gamepads
    * @extends Class
    * @param pads {Gamepad[]} The connected gamepads. 
    * @param supported {boolean} Whether or not the Gamepad API is present
    */
   export class Gamepads extends ex.Class {
      
      /**
       * Whether or not to poll for Gamepad input (default: false)
       * @property enabled {boolean}
       */
      public enabled = false;

      /**
       * Whether or not Gamepad API is supported
       * @property supported {boolean}
       */
      public supported = !!(<any>navigator).getGamepads;

      /**
       * The minimum value an axis has to move before considering it a change
       * @property MinAxisMoveThreshold {number}
       * @static
       */
      public static MinAxisMoveThreshold = 0.05;

      private _gamePadTimeStamps = [0, 0, 0, 0];
      private _oldPads: Gamepad[] = [];
      private _pads: Gamepad[] = [];
      private _initSuccess: boolean = false;
      private _engine: ex.Engine;
      private _navigator: INavigatorGamepads = <any>navigator;

      constructor(engine: ex.Engine) {
         super();

         this._engine = engine;
      }

      public init() {
         if (!this.supported) return;
         if (this._initSuccess) return;

         // In Chrome, this will return 4 undefined items until a button is pressed
         // In FF, this will not return any items until a button is pressed
         this._oldPads = this._clonePads(this._navigator.getGamepads());
         if(this._oldPads.length && this._oldPads[0]){
            this._initSuccess = true;
         }
      }

      /**
       * Updates Gamepad state and publishes Gamepad events
       */
      public update(delta: number) {
         if (!this.enabled || !this.supported) return;
         this.init();

         var gamepads = this._navigator.getGamepads();

         for (var i = 0; i < gamepads.length; i++) {

            if (!gamepads[i]) {

               // Reset connection status
               this.at(i).connected = false;

               continue;
            } else {

               // Set connection status
               this.at(i).connected = true;
            };

            // Only supported in Chrome
            if (gamepads[i].timestamp && gamepads[i].timestamp === this._gamePadTimeStamps[i]) {
               continue;
            }

            this._gamePadTimeStamps[i] = gamepads[i].timestamp;

            // Buttons
            var b: string, a: string, value: number, buttonIndex: number, axesIndex: number;
            for (b in Buttons) {
               if (typeof Buttons[b] !== "number") continue;

               buttonIndex = Buttons[b];
               value = gamepads[i].buttons[buttonIndex].value;
               if (value !== this._oldPads[i].getButton(buttonIndex)) {
                  if (gamepads[i].buttons[buttonIndex].pressed) {
                     this.at(i).updateButton(buttonIndex, value);
                     this.at(i).eventDispatcher.publish("button", new GamepadButtonEvent(buttonIndex, value));
                  } else {
                     this.at(i).updateButton(buttonIndex, 0);
                  }
               }
            }

            // Axes
            for (a in Axes) {
               if (typeof Axes[a] !== "number") continue;

               axesIndex = Axes[a];
               value = gamepads[i].axes[axesIndex];
               if (value !== this._oldPads[i].getAxes(axesIndex)) {
                  this.at(i).updateAxes(axesIndex, value);
                  this.at(i).eventDispatcher.publish("axis", new GamepadAxisEvent(axesIndex, value));
               }
            }                      

            this._oldPads[i] = this._clonePad(gamepads[i]);
         }
      }

      /**
       * Safely retrieves a Gamepad at a specific index and creates one if it doesn't yet exist
       */
      public at(index: number): Gamepad {
         if (index >= this._pads.length) {

            // Ensure there is a pad to retrieve
            for (var i = this._pads.length - 1, max = index; i < max; i++) {
               this._pads.push(new Gamepad());
               this._oldPads.push(new Gamepad());
            }
         }

         return this._pads[index];
      }

      /**
       * Gets the number of connected gamepads
       */
      public count() {
         return this._pads.filter(p => p.connected).length;
      }

      private _clonePads(pads: INavigatorGamepad[]): Gamepad[] {
         var arr = [];
         for (var i = 0, len = pads.length; i < len; i++) {
            arr.push(this._clonePad(pads[i]));
         }
         return arr;
      }

      /**
       * Fastest way to clone a known object is to do it yourself
       */
      private _clonePad(pad: INavigatorGamepad): Gamepad {
         var i, len;
         var clonedPad = new Gamepad();

         if (!pad) return clonedPad;

         for (i = 0, len = pad.buttons.length; i < len; i++) {
            clonedPad.updateButton(i, pad.buttons[i].value);
         }
         for (i = 0, len = pad.axes.length; i < len; i++) {
            clonedPad.updateAxes(i, pad.axes[i]);
         }

         return clonedPad;
      }
   }

   /**
    * Individual state for a Gamepad
    * @class Gamepad
    * @extends Class
    */
   export class Gamepad extends ex.Class {
      public connected = false;

      private _buttons: number[] = new Array(16);
      private _axes: number[] = new Array(4);

      constructor() {
         super();

         var i: number;
         for (i = 0; i < this._buttons.length; i++) {
            this._buttons[i] = 0;
         }
         for (i = 0; i < this._axes.length; i++) {
            this._axes[i] = 0;
         }
      }

      /**
       * Whether or not the given button is pressed
       * @param button {Buttons}
       * @param [threshold=1] {number} The threshold over which the button is considered to be pressed
       */
      public isButtonPressed(button: Buttons, threshold: number = 1) {
         return this._buttons[button] >= threshold;
      }

      /**
       * Gets the given button value
       * @param button {Buttons}
       */
      public getButton(button: Buttons) {
         return this._buttons[button];
      }

      /**
       * Gets the given axis value
       * @param axes {Axes}
       */
      public getAxes(axes: Axes) {
         var value = this._axes[axes];

         if (Math.abs(value) < Gamepads.MinAxisMoveThreshold) {
            return 0;
         } else {
            return value;
         }
      }

      public updateButton(buttonIndex: number, value: number) {
         this._buttons[buttonIndex] = value;
      }

      public updateAxes(axesIndex: number, value: number) {
         this._axes[axesIndex] = value;
      }
   }

   /**
    * Gamepad Buttons enumeration
    * @class Buttons
    */
   export enum Buttons {
      /**
       * Face 1 button (e.g. A)
       * @property Face1 {Buttons}
       * @static
       */
      /**
       * Face 2 button (e.g. B)
       * @property Face2 {Buttons}
       * @static
       */
      /**
       * Face 3 button (e.g. X)
       * @property Face3 {Buttons}
       * @static
       */
      /**
       * Face 4 button (e.g. Y)
       * @property Face4 {Buttons}
       * @static
       */
      Face1 = 0,
      Face2 = 1,
      Face3 = 2,
      Face4 = 3,
      /**
       * Left bumper button
       * @property LeftBumper {Buttons}
       * @static
       */
      /**
       * Right bumper button
       * @property RightBumper {Buttons}
       * @static
       */
      LeftBumper = 4,
      RightBumper = 5,
      /**
       * Left trigger button
       * @property LeftTrigger {Buttons}
       * @static
       */
      /**
       * Right trigger button
       * @property RightTrigger {Buttons}
       * @static
       */
      LeftTrigger = 6,
      RightTrigger = 7,
      /**
       * Select button
       * @property Select {Buttons}
       * @static
       */
      /**
       * Start button
       * @property Start {Buttons}
       * @static
       */
      Select = 8,
      Start = 9,
      /**
       * Left analog stick press (e.g. L3)
       * @property LeftStick {Buttons}
       * @static
       */
      /**
       * Right analog stick press (e.g. R3)
       * @property Start {Buttons}
       * @static
       */
      LeftStick = 10,
      RightStick = 11,
      /**
       * D-pad up
       * @property DpadUp {Buttons}
       * @static
       */
      /**
       * D-pad down
       * @property DpadDown {Buttons}
       * @static
       */
      /**
       * D-pad left
       * @property DpadLeft {Buttons}
       * @static
       */
      /**
       * D-pad right
       * @property DpadRight {Buttons}
       * @static
       */
      DpadUp = 12,
      DpadDown = 13,
      DpadLeft = 14,
      DpadRight = 15
   }

   /**
    * Gamepad Axes enumeration
    * @class Axes
    */
   export enum Axes {
      /**
       * Left analogue stick X direction
       * @property LeftStickX {Axes}
       * @static
       */
      /**
       * Left analogue stick Y direction
       * @property LeftStickY {Axes}
       * @static
       */
      /**
       * Right analogue stick X direction
       * @property RightStickX {Axes}
       * @static
       */
      /**
       * Right analogue stick Y direction
       * @property RightStickY {Axes}
       * @static
       */
      LeftStickX = 0,
      LeftStickY = 1,
      RightStickX = 2,
      RightStickY = 3
   }

   export class GamepadButtonEvent extends ex.GameEvent {
      constructor(public button: Buttons, public value: number) {
         super();
      }
   }

   export class GamepadAxisEvent extends ex.GameEvent {
      constructor(public axis: Axes, public value: number) {
         super();
      }
   }

   interface INavigatorGamepads {
      getGamepads(): INavigatorGamepad[];
   }

   export interface INavigatorGamepad {
      axes: number[];
      buttons: INavigatorGamepadButton[];
      connected: boolean;
      id: string;
      index: number;
      mapping: string;
      timestamp: number;
   }

   export interface INavigatorGamepadButton {
      pressed: boolean;
      value: number;
   }

   export interface INavigatorGamepadEvent {
      gamepad: INavigatorGamepad;
   }
}  