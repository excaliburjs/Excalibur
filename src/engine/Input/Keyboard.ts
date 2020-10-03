import { Logger } from '../Util/Log';
import { Class } from '../Class';
import * as Events from '../Events';

/**
 * Enum representing input key codes
 */
export enum Keys {
  // NUMPAD
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
  NumPlus = 157,
  NumMinus = 156,
  NumMultiply = 155,
  NumDivide = 154,
  // NumComma = 159, // not x-browser
  NumDecimal = 158,

  // MODIFIERS
  Numlock = 144,
  Shift = 16,
  Alt = 18,

  // NUMBERS
  Key0 = 48,
  Key1 = 49,
  Key2 = 50,
  Key3 = 51,
  Key4 = 52,
  Key5 = 53,
  Key6 = 54,
  Key7 = 55,
  Key8 = 56,
  Key9 = 57,

  // LETTERS
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

  // SYMBOLS
  Semicolon = 186, // 59 in some browsers
  Quote = 39,
  Comma = 44,
  Minus = 45,
  Period = 46,
  Slash = 47,
  Equal = 61,
  BracketLeft = 91,
  Backslash = 92,
  BracketRight = 93,
  Backquote = 96,

  // SYMBOLS WITH MODIFIER KEY REQUIRED
  // ExclamationPoint = 33,
  // DoubleQuote = 34,
  // Hash = 35,
  // Dollar = 36,
  // Modulus = 37,
  // Ampersand = 38,
  // ParenLeft = 40,
  // ParenRight = 41,
  // Astrisk = 42,
  // Plus = 43,
  // Colon = 58,
  // LessThan = 60,
  // GreaterThan = 62,
  // QuestionMark = 63,
  // At = 64, // @
  // Caret = 94,
  // Underscore = 95,
  // CurlyBracketLeft = 123,
  // Pipe = 124, // |
  // CurlyBracketRight = 125,
  // Tilde = 126, // ~

  // DIRECTIONS
  Up = 38,
  Down = 40,
  Left = 37,
  Right = 39,

  // OTHER
  Space = 32,
  Esc = 27
}

/**
 * Event thrown on a game object for a key event
 */
export class KeyEvent extends Events.GameEvent<any> {
  /**
   * @param key  The key responsible for throwing the event
   */
  constructor(public key: Keys) {
    super();
  }
}

/**
 * Provides keyboard support for Excalibur.
 *
 * [[include:Keyboard.md]]
 */
export class Keyboard extends Class {
  private _keys: number[] = [];
  private _keysUp: number[] = [];
  private _keysDown: number[] = [];

  constructor() {
    super();
  }

  public on(eventName: Events.press, handler: (event: KeyEvent) => void): void;
  public on(eventName: Events.release, handler: (event: KeyEvent) => void): void;
  public on(eventName: Events.hold, handler: (event: KeyEvent) => void): void;
  public on(eventName: string, handler: (event: Events.GameEvent<any>) => void): void;
  public on(eventName: string, handler: (event: any) => void): void {
    super.on(eventName, handler);
  }

  /**
   * Initialize Keyboard event listeners
   */
  init(global?: GlobalEventHandlers): void {
    if (!global) {
      try {
        // Try and listen to events on top window frame if within an iframe.
        //
        // See https://github.com/excaliburjs/Excalibur/issues/1294
        //
        // Attempt to add an event listener, which triggers a DOMException on
        // cross-origin iframes
        const noop = () => {
          return;
        };
        window.top.addEventListener('blur', noop);
        window.top.removeEventListener('blur', noop);

        // this will be the same as window if not embedded within an iframe
        global = window.top;
      } catch {
        // fallback to current frame
        global = window;

        Logger.getInstance().warn(
          'Failed to bind to keyboard events to top frame. ' +
            'If you are trying to embed Excalibur in a cross-origin iframe, keyboard events will not fire.'
        );
      }
    }

    global.addEventListener('blur', () => {
      this._keys.length = 0; // empties array efficiently
    });

    // key up is on window because canvas cannot have focus
    global.addEventListener('keyup', (ev: KeyboardEvent) => {
      const code = this._normalizeKeyCode(this._getKeyCode(ev));
      const key = this._keys.indexOf(code);
      this._keys.splice(key, 1);
      this._keysUp.push(code);
      const keyEvent = new KeyEvent(code);

      // alias the old api, we may want to deprecate this in the future
      this.eventDispatcher.emit('up', keyEvent);
      this.eventDispatcher.emit('release', keyEvent);
    });

    // key down is on window because canvas cannot have focus
    global.addEventListener('keydown', (ev: KeyboardEvent) => {
      const code = this._normalizeKeyCode(this._getKeyCode(ev));
      if (this._keys.indexOf(code) === -1) {
        this._keys.push(code);
        this._keysDown.push(code);
        const keyEvent = new KeyEvent(code);
        this.eventDispatcher.emit('down', keyEvent);
        this.eventDispatcher.emit('press', keyEvent);
      }
    });
  }

  public update() {
    // Reset keysDown and keysUp after update is complete
    this._keysDown.length = 0;
    this._keysUp.length = 0;

    // Emit synthetic "hold" event
    for (let i = 0; i < this._keys.length; i++) {
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
   * @param key Test whether a key was just pressed
   */
  public wasPressed(key: Keys): boolean {
    return this._keysDown.indexOf(key) > -1;
  }

  /**
   * Tests if a certain key is held down. This is persisted between frames.
   * @param key  Test whether a key is held down
   */
  public isHeld(key: Keys): boolean {
    return this._keys.indexOf(key) > -1;
  }

  /**
   * Tests if a certain key was just released this frame. This is cleared at the end of the update frame.
   * @param key  Test whether a key was just released
   */
  public wasReleased(key: Keys): boolean {
    return this._keysUp.indexOf(key) > -1;
  }

  /**
   * Normalizes some browser event key codes to map to standard Excalibur key codes
   * @param code Event keyCode
   * @see http://unixpapa.com/js/key.html
   */
  private _normalizeKeyCode(code: number) {
    switch (code) {
      case 59: // : ; in Firefox, Opera
        return Keys.Semicolon;
      default:
        return code;
    }
  }

  /**
   * Gets the key code from KeyboardEvent.code if supported otherwise from KeyboardEvent.keyCode
   */
  private _getKeyCode(ev: KeyboardEvent): number {
    return ev.code !== undefined ? parseInt(ev.code, 10) : ev.keyCode;
  }
}
