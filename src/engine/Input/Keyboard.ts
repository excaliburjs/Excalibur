module ex.Input {
    
   /**
   * Enum representing input key codes 
   * @class Keys
   * 
   */
   export enum Keys {
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
      /** 
      @property Numlock {Keys}
      */
      Numlock = 144,
      /** 
      @property Semicolon {Keys}
      */
      Semicolon = 186,
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
    *
    * @class KeyEvent
    * @extends GameEvent
    * @constructor 
    * @param key {InputKey} The key responsible for throwing the event
    */
   export class KeyEvent extends GameEvent {
      constructor(public key: Keys) {
         super();
      }
   }
   
   /**
    * Manages Keyboard input events that you can query or listen for events on
    * 
    * @class Keyboard
    * @extends Class
    * @constructor
    * 
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
            this.eventDispatcher.publish("up", keyEvent);            
         });

         // key down is on window because canvas cannot have focus
         window.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (this._keys.indexOf(ev.keyCode) === -1) {
               this._keys.push(ev.keyCode);
               this._keysDown.push(ev.keyCode);
               var keyEvent = new KeyEvent(ev.keyCode);
               this.eventDispatcher.publish("down", keyEvent);               
            }
         });
      }

      public update(delta: number) {
         // Reset keysDown and keysUp after update is complete
         this._keysDown.length = 0;
         this._keysUp.length = 0;
      }      

      /**
       * Gets list of keys being pressed down
       */
      public getKeys(): Keys[] {
         return this._keys;
      }

      /**
       *  Tests if a certain key is down.
       * @method isKeyDown
       * @param key {Keys} Test wether a key is down
       * @returns boolean
       */
      public isKeyDown(key: Keys): boolean {
         return this._keysDown.indexOf(key) > -1;
      }

      /**
       *  Tests if a certain key is pressed.
       * @method isKeyPressed
       * @param key {Keys} Test wether a key is pressed
       * @returns boolean
       */
      public isKeyPressed(key: Keys): boolean {
         return this._keys.indexOf(key) > -1;
      }

      /**
       *  Tests if a certain key is up.
       * @method isKeyUp
       * @param key {Keys} Test wether a key is up
       * @returns boolean
       */
      public isKeyUp(key: Keys): boolean {
         return this._keysUp.indexOf(key) > -1;
      }
   }

}  