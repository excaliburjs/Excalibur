import { Logger } from '../Util/Log';
import * as Events from '../Events';
import { isCrossOriginIframe } from '../Util/IFrame';
import { EventEmitter, EventKey, Handler, Subscription } from '../EventEmitter';

/**
 * Enum representing physical input key codes
 *
 * Spec: https://w3c.github.io/uievents-code/#key-alphanumeric-section
 */
export enum Keys {
  // Writing System Keys https://w3c.github.io/uievents-code/#key-alphanumeric-writing-system
  Backquote = 'Backquote',
  Backslash = 'Backslash',
  BracketLeft = 'BracketLeft',
  BracketRight = 'BracketRight',
  Comma = 'Comma',

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
  Digit0 = 'Digit0',
  Digit1 = 'Digit1',
  Digit2 = 'Digit2',
  Digit3 = 'Digit3',
  Digit4 = 'Digit4',
  Digit5 = 'Digit5',
  Digit6 = 'Digit6',
  Digit7 = 'Digit7',
  Digit8 = 'Digit8',
  Digit9 = 'Digit9',

  Equal = 'Equal',

  IntlBackslash = 'IntlBackslash',
  IntlRo = 'IntlRo',
  IntlYen = 'IntlYen',

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
  KeyA = 'KeyA',
  KeyB = 'KeyB',
  KeyC = 'KeyC',
  KeyD = 'KeyD',
  KeyE = 'KeyE',
  KeyF = 'KeyF',
  KeyG = 'KeyG',
  KeyH = 'KeyH',
  KeyI = 'KeyI',
  KeyJ = 'KeyJ',
  KeyK = 'KeyK',
  KeyL = 'KeyL',
  KeyM = 'KeyM',
  KeyN = 'KeyN',
  KeyO = 'KeyO',
  KeyP = 'KeyP',
  KeyQ = 'KeyQ',
  KeyR = 'KeyR',
  KeyS = 'KeyS',
  KeyT = 'KeyT',
  KeyU = 'KeyU',
  KeyV = 'KeyV',
  KeyW = 'KeyW',
  KeyX = 'KeyX',
  KeyY = 'KeyY',
  KeyZ = 'KeyZ',

  // SYMBOLS
  Minus = 'Minus',
  Period = 'Period',
  Quote = 'Quote',
  Semicolon = 'Semicolon',
  Slash = 'Slash',

  // Functional keys https://w3c.github.io/uievents-code/#key-alphanumeric-functional
  AltLeft = 'AltLeft',
  AltRight = 'AltRight',
  Alt = 'Alt',
  AltGraph = 'AltGraph',
  Backspace = 'Backspace',
  CapsLock = 'CapsLock',
  ContextMenu = 'ContextMenu',
  ControlLeft = 'ControlLeft',
  ControlRight = 'ControlRight',
  Enter = 'Enter',
  MetaLeft = 'MetaLeft',
  MetaRight = 'MetaRight',
  ShiftLeft = 'ShiftLeft',
  ShiftRight = 'ShiftRight',
  Space = 'Space',
  Tab = 'Tab',

  Convert = 'Convert',
  KanaMode = 'KanaMode',
  NonConvert = 'NonConvert',

  // Control Pad https://w3c.github.io/uievents-code/#key-controlpad-section
  Delete = 'Delete',
  End = 'End',
  Help = 'Help',
  Home = 'Home',
  Insert = 'Insert',
  PageDown = 'PageDown',
  PageUp = 'PageUp',

  // Arrow Pad https://w3c.github.io/uievents-code/#key-arrowpad-section
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',

  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',

  // Numpad Section https://w3c.github.io/uievents-code/#key-numpad-section
  NumLock = 'NumLock',
  Numpad0 = 'Numpad0',
  Numpad1 = 'Numpad1',
  Numpad2 = 'Numpad2',
  Numpad3 = 'Numpad3',
  Numpad4 = 'Numpad4',
  Numpad5 = 'Numpad5',
  Numpad6 = 'Numpad6',
  Numpad7 = 'Numpad7',
  Numpad8 = 'Numpad8',
  Numpad9 = 'Numpad9',
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

  NumAdd = 'NumpadAdd',
  NumpadAdd = 'NumpadAdd',

  NumDecimal = 'NumpadDecimal',
  NumpadDecimal = 'NumpadDecimal',

  NumDivide = 'NumpadDivide',
  NumpadDivide = 'NumpadDivide',

  NumEnter = 'NumpadEnter',
  NumpadEnter = 'NumpadEnter',

  NumMultiply = 'NumpadMultiply',
  NumpadMultiply = 'NumpadMultiply',

  NumSubtract = 'NumpadSubtract',
  NumpadSubtract = 'NumpadSubtract',
  // NumComma = 'NumpadComma', // not x-browser
  // NumpadComma = 'NumpadComma', // not x-browser

  // Function section https://w3c.github.io/uievents-code/#key-function-section
  Esc = 'Escape',
  Escape = 'Escape',
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
  F5 = 'F5',
  F6 = 'F6',
  F7 = 'F7',
  F8 = 'F8',
  F9 = 'F9',
  F10 = 'F10',
  F11 = 'F11',
  F12 = 'F12',
  F13 = 'F13',
  F14 = 'F14',
  F15 = 'F15',
  F16 = 'F16',
  F17 = 'F17',
  F18 = 'F18',
  F19 = 'F19',
  F20 = 'F20',
  PrintScreen = 'PrintScreen',
  ScrollLock = 'ScrollLock',
  Pause = 'Pause',

  Unidentified = 'Unidentified'
}

/**
 * Event thrown on a game object for a key event
 */
export class KeyEvent extends Events.GameEvent<any> {
  /**
   * @param key  The key responsible for throwing the event
   * @param value The key's typed value the browser detected
   * @param originalEvent The original keyboard event that Excalibur handled
   */
  constructor(
    public key: Keys,
    public value?: string,
    public originalEvent?: KeyboardEvent
  ) {
    super();
  }
}

export interface KeyboardInitOptions {
  global?: GlobalEventHandlers;
  grabWindowFocus?: boolean;
}

export type KeyEvents = {
  press: KeyEvent;
  hold: KeyEvent;
  release: KeyEvent;
};

export const KeyEvents = {
  Press: 'press',
  Hold: 'hold',
  Release: 'release'
};

/**
 * Provides keyboard support for Excalibur.
 */
export class Keyboard {
  public events = new EventEmitter<KeyEvents>();
  private _enabled = true;
  /**
   * Keys that are currently held down
   */
  private _keys: Keys[] = [];
  /**
   * Keys up in the current frame
   */
  private _keysUp: Keys[] = [];
  /**
   * Keys down in the current frame
   */
  private _keysDown: Keys[] = [];

  public emit<TEventName extends EventKey<KeyEvents>>(eventName: TEventName, event: KeyEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<KeyEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<KeyEvents>>(eventName: TEventName, handler: Handler<KeyEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<KeyEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<KeyEvents>>(eventName: TEventName, handler: Handler<KeyEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<KeyEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<KeyEvents>>(eventName: TEventName, handler: Handler<KeyEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<KeyEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    this.events.off(eventName, handler);
  }

  /**
   * Initialize Keyboard event listeners
   */
  init(keyboardOptions?: KeyboardInitOptions): void {
    let { global } = keyboardOptions;
    const { grabWindowFocus } = keyboardOptions;
    if (!global) {
      if (isCrossOriginIframe()) {
        global = window;
        // Workaround for iframes like for itch.io or codesandbox
        // https://www.reddit.com/r/gamemaker/comments/kfs5cs/keyboard_inputs_no_longer_working_in_html5_game/
        // https://forum.gamemaker.io/index.php?threads/solved-keyboard-issue-on-itch-io.87336/
        if (grabWindowFocus) {
          window.focus();
        }

        Logger.getInstance().warn('Excalibur might be in a cross-origin iframe, in order to receive keyboard events it must be in focus');
      } else {
        global = window.top;
      }
    }

    global.addEventListener('blur', () => {
      this._keys.length = 0; // empties array efficiently
    });

    // key up is on window because canvas cannot have focus
    global.addEventListener('keyup', this._handleKeyUp);

    // key down is on window because canvas cannot have focus
    global.addEventListener('keydown', this._handleKeyDown);
  }

  toggleEnabled(enabled: boolean) {
    this._enabled = enabled;
  }

  private _releaseAllKeys = (ev: KeyboardEvent) => {
    for (const code of this._keys) {
      const keyEvent = new KeyEvent(code, ev.key, ev);
      this.events.emit('up', keyEvent);
      this.events.emit('release', keyEvent);
    }
    this._keysUp = Array.from(new Set(this._keys.concat(this._keysUp)));
    this._keys.length = 0;
  };

  public clear() {
    this._keysDown.length = 0;
    this._keysUp.length = 0;
    this._keys.length = 0;
  }

  private _handleKeyDown = (ev: KeyboardEvent) => {
    if (!this._enabled) {
      return;
    }

    // handle macos meta key issue
    // https://github.com/excaliburjs/Excalibur/issues/2608
    if (!ev.metaKey && (this._keys.includes(Keys.MetaLeft) || this._keys.includes(Keys.MetaRight))) {
      this._releaseAllKeys(ev);
    }

    const code = ev.code as Keys;
    if (this._keys.indexOf(code) === -1) {
      this._keys.push(code);
      this._keysDown.push(code);
      const keyEvent = new KeyEvent(code, ev.key, ev);
      this.events.emit('down', keyEvent);
      this.events.emit('press', keyEvent);
    }
  };

  private _handleKeyUp = (ev: KeyboardEvent) => {
    if (!this._enabled) {
      return;
    }
    const code = ev.code as Keys;
    const key = this._keys.indexOf(code);
    this._keys.splice(key, 1);
    this._keysUp.push(code);
    const keyEvent = new KeyEvent(code, ev.key, ev);

    // alias the old api, we may want to deprecate this in the future
    this.events.emit('up', keyEvent);
    this.events.emit('release', keyEvent);

    // handle macos meta key issue
    // https://github.com/excaliburjs/Excalibur/issues/2608
    if (ev.key === 'Meta') {
      this._releaseAllKeys(ev);
    }
  };

  public update() {
    // Reset keysDown and keysUp after update is complete
    this._keysDown.length = 0;
    this._keysUp.length = 0;

    // Emit synthetic "hold" event
    for (let i = 0; i < this._keys.length; i++) {
      this.events.emit('hold', new KeyEvent(this._keys[i]));
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
    if (!this._enabled) {
      return false;
    }
    return this._keysDown.indexOf(key) > -1;
  }

  /**
   * Tests if a certain key is held down. This is persisted between frames.
   * @param key  Test whether a key is held down
   */
  public isHeld(key: Keys): boolean {
    if (!this._enabled) {
      return false;
    }
    return this._keys.indexOf(key) > -1;
  }

  /**
   * Tests if a certain key was just released this frame. This is cleared at the end of the update frame.
   * @param key  Test whether a key was just released
   */
  public wasReleased(key: Keys): boolean {
    if (!this._enabled) {
      return false;
    }
    return this._keysUp.indexOf(key) > -1;
  }

  /**
   * Trigger a manual key event
   * @param type
   * @param key
   * @param character
   */
  public triggerEvent(type: 'down' | 'up', key: Keys, character?: string) {
    if (type === 'down') {
      this._handleKeyDown(
        new KeyboardEvent('keydown', {
          code: key,
          key: character ?? null
        })
      );
    }
    if (type === 'up') {
      this._handleKeyUp(
        new KeyboardEvent('keyup', {
          code: key,
          key: character ?? null
        })
      );
    }
  }
}
