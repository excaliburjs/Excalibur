module ex.Input {

   /**
    * Controller Support (Gamepads)
    *
    * Excalibur leverages the HTML5 Gamepad API [where it is supported](http://caniuse.com/#feat=gamepad)
    * to provide controller support for your games.
    *
    * You can query any [[Gamepad|Gamepads]] that are connected or listen to events ("button" and "axis").
    *
    * You must opt-in to controller support ([[Gamepads.enabled]]) because it is a polling-based
    * API, so we have to check it each update frame. If an gamepad related event handler is set, you will
    * automatically opt-in to controller polling.
    *
    * HTML5 Gamepad API only supports a maximum of 4 gamepads. You can access them using the [[Gamepads.at]] method. If a [[Gamepad]] is
    * not connected, it will simply not throw events.
    *
    * ## Gamepad Filtering
    * 
    * Different browsers/devices are sometimes loose about the devices they consider Gamepads, you can set minimum device requirements with
    * `engine.inpute.gamepads.setMinimumGamepadConfiguration` so that undesired devices are not reported to you (Touchpads, Mice, Web 
    * Cameras, etc.).
    * ```js
    * // ensures that only gamepads with at least 4 axis and 8 buttons are reported for events
    * engine.input.gamepads.setMinimumGamepadConfiguration({
    *    axis: 4,
    *    buttons: 8
    * });
    * ```
    *
    * ## Events
    *
    * You can subscribe to gamepad connect and disconnect events through `engine.input.gamepads.on`. 
    * A [[GamepadConnectEvent]] or [[GamepadDisconnectEvent]] will be passed to you.
    *
    * - `connect` - When a gamepad connects it will fire this event and pass a [[GamepadConnectEvent]] with a reference to the gamepad.
    * - `disconnect` - When a gamepad disconnects it will fire this event and pass a [[GamepadDisconnectEvent]]
    * 
    * Once you have a reference to a gamepad you may listen to changes on that gamepad with `.on`. A [[GamepadButtonEvent]] or 
    * [[GamepadAxisEvent]] will be passed to you.   
    * - `button` - Whenever a button is pressed on the game
    * - `axis` - Whenever an axis  
    *
    * ```ts
    * 
    * engine.input.gamepads.on('connect', (ce: ex.Input.GamepadConnectEvent) => {
    *    var newPlayer = CreateNewPlayer(); // pseudo-code for new player logic on gamepad connection
    *    console.log("Gamepad connected", ce);
    *    ce.gamepad.on('button', (be: ex.GamepadButtonEvent) => {
    *       if(be.button === ex.Input.Buttons.Face1) {
    *          newPlayer.jump();
    *       }
    *    });
    *    
    *    ce.gamepad.on('axis', (ae: ex.GamepadAxisEvent) => {
    *      if(ae.axis === ex.Input.Axis.LeftStickX && ae.value > .5){
    *         newPlayer.moveRight();
    *      }
    *    })
    *
    *  });
    *
    *
    * ```
    *
    * ## Responding to button input
    *
    * [[Buttons|Gamepad buttons]] typically have values between 0 and 1, however depending on
    * the sensitivity of the controller, even if a button is idle it could have a
    * very tiny value. For this reason, you can pass in a threshold to several
    * methods to customize how sensitive you want to be in detecting button presses.
    *
    * You can inspect any connected [[Gamepad]] using [[Gamepad.isButtonPressed]], [[Gamepad.getButton]],
    * or you can subscribe to the `button` event published on the [[Gamepad]] which passes
    * a [[GamepadButtonEvent]] to your handler.
    *
    * ```js
    * // enable gamepad support
    * engine.input.gamepads.enabled = true;
    *
    * // query gamepad on update
    * engine.on("update", function (ev) {
    *
    *   // access any gamepad by index
    *   if (engine.input.gamepads.at(0).isButtonPressed(ex.Input.Buttons.Face1)) {
    *     ex.Logger.getInstance().info("Controller A button pressed");
    *   }
    *
    *   // query individual button
    *   if (engine.input.gamepads.at(0).getButton(ex.Input.Buttons.DpadLeft) > 0.2) {
    *     ex.Logger.getInstance().info("Controller D-pad left value is > 0.2")
    *   }
    * });
    *
    * // subscribe to button events
    * engine.input.gamepads.at(0).on("button", function (ev) {
    *   ex.Logger.getInstance().info(ev.button, ev.value);
    * });
    * ```
    *
    * ## Responding to axis input
    *
    * [[Axes|Gamepad axes]] typically have values between -1 and 1, but even idle
    * sticks can still propogate very small values depending on the quality and age
    * of a controller. For this reason, you can set [[Gamepads.MinAxisMoveThreshold]]
    * to set the (absolute) threshold after which Excalibur will start publishing `axis` events. 
    * By default it is set to a value that normally will not throw events if a stick is idle.
    *
    * You can query axes via [[Gamepad.getAxes]] or by subscribing to the `axis` event on [[Gamepad]]
    * which passes a [[GamepadAxisEvent]] to your handler.    
    * 
    * ```js
    * // enable gamepad support
    * engine.input.gamepads.enabled = true;
    *
    * // query gamepad on update
    * engine.on("update", function (ev) {
    *
    *   // access any gamepad by index
    *   var axisValue;
    *   if ((axisValue = engine.input.gamepads.at(0).getAxes(ex.Input.Axes.LeftStickX)) > 0.5) {
    *     ex.Logger.getInstance().info("Move right", axisValue);
    *   }
    * });
    *
    * // subscribe to axis events
    * engine.input.gamepads.at(0).on("axis", function (ev) {
    *   ex.Logger.getInstance().info(ev.axis, ev.value);
    * });
    * ```
    */
   export class Gamepads extends ex.Class {
      
      /**
       * Whether or not to poll for Gamepad input (default: `false`)
       */
      public enabled = false;

      /**
       * Whether or not Gamepad API is supported
       */
      public supported = !!(<any>navigator).getGamepads;

      /**
       * The minimum value an axis has to move before considering it a change
       */
      public static MinAxisMoveThreshold = 0.05;

      private _gamePadTimeStamps = [0, 0, 0, 0];
      private _oldPads: Gamepad[] = [];
      private _pads: Gamepad[] = [];
      private _initSuccess: boolean = false;
      private _engine: ex.Engine;
      private _navigator: INavigatorGamepads = <any>navigator;
      private _minimumConfiguration: IGamepadConfiguration = null;

      constructor(engine: ex.Engine) {
         super();
         this._engine = engine;
      }

      public init() {
         if (!this.supported) { return; }
         if (this._initSuccess) { return; }

         // In Chrome, this will return 4 undefined items until a button is pressed
         // In FF, this will not return any items until a button is pressed
         this._oldPads = this._clonePads(this._navigator.getGamepads());
         if(this._oldPads.length && this._oldPads[0]) {
            this._initSuccess = true;
         }
      }
      
      /**
       * Sets the minimum gamepad configuration, for example {axis: 4, buttons: 4} means
       * this game requires at minimum 4 axis inputs and 4 buttons, this is not restrictive
       * all other controllers with more axis or buttons are valid as well. If no minimum 
       * configuration is set all pads are valid.
       */
      public setMinimumGamepadConfiguration(config: IGamepadConfiguration) : void {
         this._enableAndUpdate(); // if config is used, implicitely enable
         this._minimumConfiguration = config;
      }
      
      /** 
       * When implicitely enabled, set the enabled flag and run an update so information is updated
       */
      private _enableAndUpdate() {
         if (!this.enabled) {
            this.enabled = true;
            this.update(100);
         }
      }
      
      /**
       * Checks a navigator gamepad against the minimum configuration if present.
       */
      private _isGamepadValid(pad: INavigatorGamepad) : boolean {
         if(!this._minimumConfiguration) { return true; };
         if(!pad) { return false; };
         var axesLength = pad.axes.filter((value, index, array) => {
            return (typeof value !== undefined);
         }).length;
         
         var buttonLength = pad.buttons.filter((value, index, array) => {
            return (typeof value !== undefined);
         }).length;
         return axesLength >= this._minimumConfiguration.axis && 
                buttonLength >= this._minimumConfiguration.buttons &&
                pad.connected;
      }
      
      public on(eventName: string, handler: (event?: GameEvent) => void) {
         this._enableAndUpdate(); // implicitly enable
         super.on(eventName, handler);  
      }
      
      public off(eventName: string, handler?: (event?: GameEvent) => void) {
         this._enableAndUpdate(); // implicitly enable
         super.off(eventName, handler);  
      }
      
      /**
       * Updates Gamepad state and publishes Gamepad events
       */
      public update(delta: number) {
         if (!this.enabled || !this.supported) { return; }
         this.init();

         var gamepads = this._navigator.getGamepads();

         for (var i = 0; i < gamepads.length; i++) {

            if (!gamepads[i]) {

               // If was connected, but now isn't emit the disconnect event
               if (this.at(i).connected) {
                  this.eventDispatcher.emit('disconnect', new GamepadDisconnectEvent(i));
               }
               // Reset connection status
               this.at(i).connected = false;
               continue;
            } else {

               if(!this.at(i).connected && this._isGamepadValid(gamepads[i])) {
                  this.eventDispatcher.emit('connect', new GamepadConnectEvent(i, this.at(i)));   
               } 
               // Set connection status
               this.at(i).connected = true;               
            };

            // Only supported in Chrome
            if (gamepads[i].timestamp && gamepads[i].timestamp === this._gamePadTimeStamps[i]) {
               continue;
            }

            this._gamePadTimeStamps[i] = gamepads[i].timestamp;
            
            // Add reference to navigator gamepad
            this.at(i).navigatorGamepad = gamepads[i];

            // Buttons
            var b: string, a: string, value: number, buttonIndex: number, axesIndex: number;
            for (b in Buttons) {
               if (typeof Buttons[b] !== 'number') { continue; }

               buttonIndex = Buttons[b];
               if(gamepads[i].buttons[buttonIndex]) {
                  value = gamepads[i].buttons[buttonIndex].value;
                  if (value !== this._oldPads[i].getButton(buttonIndex)) {
                     if (gamepads[i].buttons[buttonIndex].pressed) {
                        this.at(i).updateButton(buttonIndex, value);
                        this.at(i).eventDispatcher.publish('button', new GamepadButtonEvent(buttonIndex, value));
                     } else {
                        this.at(i).updateButton(buttonIndex, 0);
                     }
                  }
               }
            }

            // Axes
            for (a in Axes) {
               if (typeof Axes[a] !== 'number') { continue; }

               axesIndex = Axes[a];
               value = gamepads[i].axes[axesIndex];
               if (value !== this._oldPads[i].getAxes(axesIndex)) {
                  this.at(i).updateAxes(axesIndex, value);
                  this.at(i).eventDispatcher.emit('axis', new GamepadAxisEvent(axesIndex, value));
               }
            }                      

            this._oldPads[i] = this._clonePad(gamepads[i]);
         }
      }

      /**
       * Safely retrieves a Gamepad at a specific index and creates one if it doesn't yet exist
       */
      public at(index: number): Gamepad {
         this._enableAndUpdate(); // implicitly enable gamepads when at() is called         
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
       * Returns a list of all valid gamepads that meet the minimum configuration requirment.
       */
      public getValidGamepads(): Gamepad[] {
         this._enableAndUpdate();
         var result : Gamepad[] = [];
         for (var i = 0; i < this._pads.length; i++) {
            if (this._isGamepadValid(this.at(i).navigatorGamepad) && this.at(i).connected) {
               result.push(this.at(i));
            }
         }         
         return result;
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

         if (!pad) { return clonedPad; }

         for (i = 0, len = pad.buttons.length; i < len; i++) {
            if(pad.buttons[i]) {
               clonedPad.updateButton(i, pad.buttons[i].value);
            }
         }
         for (i = 0, len = pad.axes.length; i < len; i++) {
            clonedPad.updateAxes(i, pad.axes[i]);
         }

         return clonedPad;
      }
   }

   /**
    * Gamepad holds state information for a connected controller. See [[Gamepads]]
    * for more information on handling controller input.
    */
   export class Gamepad extends ex.Class {
      public connected = false;
      public navigatorGamepad: INavigatorGamepad;
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
       * @param button     The button to query
       * @param threshold  The threshold over which the button is considered to be pressed
       */
      public isButtonPressed(button: Buttons, threshold: number = 1) {
         return this._buttons[button] >= threshold;
      }

      /**
       * Gets the given button value between 0 and 1
       */
      public getButton(button: Buttons) {
         return this._buttons[button];
      }

      /**
       * Gets the given axis value between -1 and 1. Values below
       * [[MinAxisMoveThreshold]] are considered 0.
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
    */
   export enum Buttons {
      /**
       * Face 1 button (e.g. A)
       */
      Face1 = 0,
      /**
       * Face 2 button (e.g. B)
       */
      Face2 = 1,
      /**
       * Face 3 button (e.g. X)
       */
      Face3 = 2,
      /**
       * Face 4 button (e.g. Y)
       */
      Face4 = 3,
      /**
       * Left bumper button
       */
      LeftBumper = 4,
      /**
       * Right bumper button
       */
      RightBumper = 5,
      /**
       * Left trigger button
       */
      LeftTrigger = 6,
      /**
       * Right trigger button
       */
      RightTrigger = 7,
      /**
       * Select button
       */
      Select = 8,
      /**
       * Start button
       */
      Start = 9,
      /**
       * Left analog stick press (e.g. L3)
       */
      LeftStick = 10,
      /**
       * Right analog stick press (e.g. R3)
       */
      RightStick = 11,
      /**
       * D-pad up
       */
      DpadUp = 12,
      /**
       * D-pad down
       */
      DpadDown = 13,
      /**
       * D-pad left
       */
      DpadLeft = 14,
      /**
       * D-pad right
       */
      DpadRight = 15
   }

   /**
    * Gamepad Axes enumeration
    */
   export enum Axes {
      /**
       * Left analogue stick X direction
       */
      LeftStickX = 0,
      /**
       * Left analogue stick Y direction
       */
      LeftStickY = 1,
      /**
       * Right analogue stick X direction
       */
      RightStickX = 2,
      /**
       * Right analogue stick Y direction
       */
      RightStickY = 3
   }

   /**
    * @internal
    */
   interface INavigatorGamepads {
      getGamepads(): INavigatorGamepad[];
   }

   /**
    * @internal
    */
   export interface INavigatorGamepad {
      axes: number[];
      buttons: INavigatorGamepadButton[];
      connected: boolean;
      id: string;
      index: number;
      mapping: string;
      timestamp: number;
   }

   /**
    * @internal
    */
   export interface INavigatorGamepadButton {
      pressed: boolean;
      value: number;
   }

   /**
    * @internal
    */
   export interface INavigatorGamepadEvent {
      gamepad: INavigatorGamepad;
   }
   
   /**
    * @internal
    */
   export interface IGamepadConfiguration {
      axis: number;
      buttons: number;
   }
}  