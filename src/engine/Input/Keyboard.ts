import { Logger } from '../Util/Log';
import { Class } from '../Class';
import * as Events from '../Events';

/**
 * Enum representing input key codes
 */
export enum Keys {
  // NUMPAD
  Num0 = 'Numpad0',
  Num1 = 'Numpad1',
  Num2 = 'Numpad2',
  Num3 = 'Numpad3',
  Num4 = 'Numpad4',
  Num5 = 'Numpad5',
  Num6 = 'Numpad6',
  Num7 = 'Numpad7',
  Num8 = 'Numpad8',
  Num9 = 'Numpad9',
  NumPlus = 'NumpadAdd',
  NumMinus = 'NumpadSubtract',
  NumMultiply = 'NumpadMultiply',
  NumDivide = 'NumpadDivide',
  // NumComma = 'NumpadComma', // not x-browser
  NumDecimal = 'NumpadDecimal',

  // MODIFIERS
  Numlock = 'NumLock',
  ShiftLeft = 'ShiftLeft',
  ShiftRight = 'ShiftRight',
  AltLeft = 'AltLeft',
  AltRight = 'AltRight',

  // NUMBERS
  Key0 = 'Digit0',
  Key1 = 'Digit1',
  Key2 = 'Digit2',
  Key3 = 'Digit3',
  Key4 = 'Digit4',
  Key5 = 'Digit5',
  Key6 = 'Digit6',
  Key7 = 'Digit7',
  Key8 = 'Digit8',
  Key9 = 'Digit9',

  // LETTERS
  A = 'KeyA',
  B = 'KeyB',
  C = 'KeyC',
  D = 'KeyD',
  E = 'KeyE',
  F = 'KeyF',
  G = 'KeyG',
  H = 'KeyH',
  I = 'KeyI',
  J = 'KeyJ',
  K = 'KeyK',
  L = 'KeyL',
  M = 'KeyM',
  N = 'KeyN',
  O = 'KeyO',
  P = 'KeyP',
  Q = 'KeyQ',
  R = 'KeyR',
  S = 'KeyS',
  T = 'KeyT',
  U = 'KeyU',
  V = 'KeyV',
  W = 'KeyW',
  X = 'KeyX',
  Y = 'KeyY',
  Z = 'KeyZ',

  // SYMBOLS
  Semicolon = 'Semicolon',
  Quote = 'Quote',
  Comma = 'Comma',
  Minus = 'Minus',
  Period = 'Period',
  Slash = 'Slash',
  Equal = 'Equal',
  BracketLeft = 'BracketLeft',
  Backslash = 'Backslash',
  BracketRight = 'BracketRight',
  Backquote = 'Backquote',

  // DIRECTIONS
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',

  // OTHER
  Space = 'Space',
  Esc = 'Escape'
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
