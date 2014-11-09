module ex.Input {

   export enum Buttons {
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
      Face1 = 0,
      Face2 = 1,
      Face3 = 2,
      Face4 = 3,
      /**
       * Left bumper button
       * @property LeftBumper {Buttons}
       */
      /**
       * Right bumper button
       * @property RightBumper {Buttons}
       */
      LeftBumper = 4,
      RightBumper = 5,
      /**
       * Left trigger button
       * @property LeftTrigger {Buttons}
       */
      /**
       * Right trigger button
       * @property RightTrigger {Buttons}
       */
      LeftTrigger = 6,
      RightTrigger = 7,
      /**
       * Select button
       * @property Select {Buttons}
       */
      /**
       * Start button
       * @property Start {Buttons}
       */
      Select = 8,
      Start = 9,
      /**
       * Left analog stick press (e.g. L3)
       * @property LeftStick {Buttons}
       */
      /**
       * Right analog stick press (e.g. R3)
       * @property Start {Buttons}
       */
      LeftStick = 10,
      RightStick = 11,
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
      DpadUp = 12,
      DpadDown = 13,
      DpadLeft = 14,
      DpadRight = 15
   }

   export enum Axes {
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
      LeftStickX = 0,
      LeftStickY = 1,
      RightStickX = 2,
      RightStickY = 3
   }

   export class GamepadEvent extends GameEvent implements INavigatorGamepadEvent {
      constructor(public gamepad: INavigatorGamepad) {
         super();
      }
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

   export class Gamepads extends ex.Class {
      
      /**
       * Access to the individual pads
       * @property pads {Array<Gamepad>}
       */
      public pads: Gamepad[] = [];

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
       */
      public static MinAxisMoveThreshold = 0.05;

      private _gamePadTimeStamps = [0, 0, 0, 0];
      private _oldPads: INavigatorGamepad[] = [];
      private _engine: ex.Engine;
      private _navigator: INavigatorGamepads = <any>navigator;

      constructor(engine: ex.Engine) {
         super();

         this._engine = engine;
      }

      public init() {
         if (!this.supported) return;

         this._oldPads = this._clonePads(this._navigator.getGamepads());
      }

      public update(delta: number) {
         if (!this.enabled || !this.supported) return;

         var gamepads = this._navigator.getGamepads();

         for (var i = 0; i < gamepads.length; i++) {

            if (!gamepads[i]) {
               if (this.pads[i]) {
                  this.pads[i].connected = false;
               }

               continue;
            } else {
               if (this.pads.length === i) {
                  this.pads.push(new Gamepad());
               }
               if (this._oldPads.length === i) {
                  this._oldPads.push(this._clonePad(gamepads[i]));
               }
               this.pads[i].connected = true;
            };

            // Only supported in Chrome
            if (gamepads[i].timestamp && gamepads[i].timestamp === this._gamePadTimeStamps[i]) {
               continue;
            }

            this._gamePadTimeStamps[i] = gamepads[i].timestamp;

            // Buttons
            var b: string, a: string;
            for (b in Buttons) {
               if (typeof Buttons[b] !== "number") continue;

               var buttonIndex: number = Buttons[b];
               if (gamepads[i].buttons[buttonIndex].value !== this._oldPads[i].buttons[buttonIndex].value) {
                  if (gamepads[i].buttons[buttonIndex].pressed) {
                     this.pads[i].updateButton(buttonIndex, gamepads[i].buttons[buttonIndex].value);
                  } else {
                     this.pads[i].updateButton(buttonIndex, 0);
                  }
               }
            }

            // Axes
            for (a in Axes) {
               if (typeof Axes[a] !== "number") continue;

               var axesIndex: number = Axes[a];
               if (gamepads[i].axes[axesIndex] !== this._oldPads[i].axes[axesIndex]) {
                  this.pads[i].updateAxes(axesIndex, gamepads[i].axes[axesIndex]);
               }
            }                      

            this._oldPads[i] = this._clonePad(gamepads[i]);
         }
      }

      public count() {
         return this.pads.filter(p => p.connected).length;
      }

      private _clonePads(pads: INavigatorGamepad[]): INavigatorGamepad[] {
         var arr = [];
         for (var i = 0, len = pads.length; i < len; i++) {
            arr.push(this._clonePad(pads[i]));
         }
         return arr;
      }

      /**
       * Fastest way to clone a known object is to do it yourself
       */
      private _clonePad(pad: INavigatorGamepad): INavigatorGamepad {
         var i, len;
         var clonedPad = <INavigatorGamepad>{
            axes: [],
            buttons: []
         };

         if (!pad) return pad;

         for (i = 0, len = pad.buttons.length; i < len; i++) {
            clonedPad.buttons.push({ pressed: pad.buttons[i].pressed, value: pad.buttons[i].value });
         }
         for (i = 0, len = pad.axes.length; i < len; i++) {
            clonedPad.axes.push(pad.axes[i]);
         }

         return clonedPad;
      }
   }

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

      public isButtonPressed(button: Buttons, threshold: number = 1) {
         return this._buttons[button] >= threshold;
      }

      public getButton(button: Buttons) {
         return this._buttons[button];
      }

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

   
}  