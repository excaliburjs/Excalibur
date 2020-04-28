import { Logger } from '../Util/Log';
import { Class } from '../Class';
import * as Events from '../Events';

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

  Semicolon = 186, // 59 in some browsers

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
      const code = this._normalizeKeyCode(ev.keyCode);
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
      const code = this._normalizeKeyCode(ev.keyCode);
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
}
