module ex.Input {
    
   /**
    * Enum representing input key codes 
    */
   export enum Keys {
      Num1 = 97,
      Num2 = 98,
      Num3 = 99,
      Num4 = 100,
      Num5 = 101,
      Num6 = 102,
      Num7 = 103,
      Num8 = 104,
      Num9 = 105,
      Num0 = 96,
      
      Numlock = 144,
      
      Semicolon = 186,
      
      A = 65,
      B = 66,
      C = 67,
      D = 68,
      E = 69,
      F = 70,
      G = 71,
      H = 72,
      I = 73,
      J = 74,
      K = 75,
      L = 76,
      M = 77,
      N = 78,
      O = 79,
      P = 80,
      Q = 81,
      R = 82,
      S = 83,
      T = 84,
      U = 85,
      V = 86,
      W = 87,
      X = 88,
      Y = 89,
      Z = 90,
      
      Shift = 16,
      Alt = 18,
      Up = 38,
      Down = 40,
      Left = 37,
      Right = 39,
      Space = 32,
      Esc = 27
   };

   /**
    * Event thrown on a game object for a key event
    */
   export class KeyEvent extends GameEvent {

      /**
       * @param key  The key responsible for throwing the event
       */
      constructor(public key: Keys) {
         super();
      }
   }
   
   /**
    * Keyboard input
    *
    * Working with the keyboard is easy in Excalibur. You can inspect
    * whether a button is [[Keyboard.isKeyDown|down]], [[Keyboard.isKeyUp|up]], or 
    * [[Keyboard.isKeyPressed|pressed]]. Common keys are held in the [[Input.Keys]]
    * enumeration but you can pass any character code to the methods.
    *
    * Excalibur subscribes to the browser events and keeps track of
    * what keys are currently down, up, or pressed. A key can be pressed
    * for multiple frames, but a key cannot be down or up for more than one
    * update frame.
    *
    * ## Inspecting the keyboard
    *
    * You can inspect [[Engine.input]] to see what the state of the keyboard
    * is during an update.
    *
    * ```ts
    * class Player extends ex.Actor {
    *   public update(engine, delta) {
    *     
    *     if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.W) ||
    *         engine.input.keyboard.isKeyPressed(ex.Input.Keys.Up)) {
    *       
    *       player._moveForward();
    *     }
    *
    *   }
    * }
    * ```
    */
   export class Keyboard extends ex.Class {

      private _keys: number[] = [];
      private _keysUp: number[] = [];
      private _keysDown: number[] = [];
      private _engine: ex.Engine;

      constructor(engine: ex.Engine) {
         super();

         this._engine = engine;
      }

      /**
       * Initialize Keyboard event listeners
       */
      init(): void {

         window.addEventListener('blur', (ev: UIEvent) => {
            this._keys.length = 0; // empties array efficiently
         });

         // key up is on window because canvas cannot have focus
         window.addEventListener('keyup', (ev: KeyboardEvent) => {
            var key = this._keys.indexOf(ev.keyCode);
            this._keys.splice(key, 1);
            this._keysUp.push(ev.keyCode);
            var keyEvent = new KeyEvent(ev.keyCode);
            
            // alias the old api, we may want to deprecate this in the future
            this.eventDispatcher.emit('up', keyEvent);
            this.eventDispatcher.emit('release', keyEvent);            
         });

         // key down is on window because canvas cannot have focus
         window.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (this._keys.indexOf(ev.keyCode) === -1) {
               this._keys.push(ev.keyCode);
               this._keysDown.push(ev.keyCode);
               var keyEvent = new KeyEvent(ev.keyCode);
               this.eventDispatcher.emit('down', keyEvent);
               this.eventDispatcher.emit('press', keyEvent);                 
            }
         });
      }

      public update(delta: number) {
         // Reset keysDown and keysUp after update is complete
         this._keysDown.length = 0;
         this._keysUp.length = 0;
         
         // Emit synthetic "hold" event
         for(var i = 0; i < this._keys.length; i++) {
            this.eventDispatcher.emit('hold', new KeyEvent(this._keys[i]));
         }
      }      

      /**
       * Gets list of keys being pressed down
       */
      public getKeys(): Keys[] {
         return this._keys;
      }

      /**
       * Tests if a certain key was just pressed this frame. This is cleared at the end of the update frame.
       * @param key Test wether a key was just pressed
       */
      public wasPressed(key: Keys): boolean {
         return this._keysDown.indexOf(key) > -1;
      }

      /**
       * Tests if a certain key is held down. This is persisted between frames.
       * @param key  Test wether a key is held down
       */
      public isHeld(key: Keys): boolean {
         return this._keys.indexOf(key) > -1;
      }

      /**
       * Tests if a certain key was just released this frame. This is cleared at the end of the update frame.
       * @param key  Test wether a key was just released
       */
      public wasReleased(key: Keys): boolean {
         return this._keysUp.indexOf(key) > -1;
      }
   }

}  