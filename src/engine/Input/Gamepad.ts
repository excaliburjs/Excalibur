import { Class } from './../Class';
import { GameEvent, GamepadConnectEvent, GamepadDisconnectEvent, GamepadButtonEvent, GamepadAxisEvent } from '../Events';
import * as Events from '../Events';

/**
 * Excalibur leverages the HTML5 Gamepad API [where it is supported](http://caniuse.com/#feat=gamepad)
 * to provide controller support for your games.
 */
export class Gamepads extends Class {
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
  private _navigator: NavigatorGamepads = <any>navigator;
  private _minimumConfiguration: GamepadConfiguration = null;

  constructor() {
    super();
  }

  public init() {
    if (!this.supported) {
      return;
    }
    if (this._initSuccess) {
      return;
    }

    // In Chrome, this will return 4 undefined items until a button is pressed
    // In FF, this will not return any items until a button is pressed
    this._oldPads = this._clonePads(this._navigator.getGamepads());
    if (this._oldPads.length && this._oldPads[0]) {
      this._initSuccess = true;
    }
  }

  /**
   * Sets the minimum gamepad configuration, for example {axis: 4, buttons: 4} means
   * this game requires at minimum 4 axis inputs and 4 buttons, this is not restrictive
   * all other controllers with more axis or buttons are valid as well. If no minimum
   * configuration is set all pads are valid.
   */
  public setMinimumGamepadConfiguration(config: GamepadConfiguration): void {
    this._enableAndUpdate(); // if config is used, implicitly enable
    this._minimumConfiguration = config;
  }

  /**
   * When implicitly enabled, set the enabled flag and run an update so information is updated
   */
  private _enableAndUpdate() {
    if (!this.enabled) {
      this.enabled = true;
      this.update();
    }
  }

  /**
   * Checks a navigator gamepad against the minimum configuration if present.
   */
  private _isGamepadValid(pad: NavigatorGamepad): boolean {
    if (!this._minimumConfiguration) {
      return true;
    }
    if (!pad) {
      return false;
    }
    const axesLength = pad.axes.filter((value) => {
      return typeof value !== undefined;
    }).length;

    const buttonLength = pad.buttons.filter((value) => {
      return typeof value !== undefined;
    }).length;
    return axesLength >= this._minimumConfiguration.axis && buttonLength >= this._minimumConfiguration.buttons && pad.connected;
  }

  public on(eventName: Events.connect, handler: (event: GamepadConnectEvent) => void): void;
  public on(eventName: Events.disconnect, handler: (event: GamepadDisconnectEvent) => void): void;
  public on(eventName: Events.button, handler: (event: GamepadButtonEvent) => void): void;
  public on(eventName: Events.axis, handler: (event: GamepadAxisEvent) => void): void;
  public on(eventName: string, handler: (event: GameEvent<any>) => void): void;
  public on(eventName: string, handler: (event: any) => void): void {
    this._enableAndUpdate(); // implicitly enable
    super.on(eventName, handler);
  }

  public off(eventName: string, handler?: (event: GameEvent<any>) => void) {
    this._enableAndUpdate(); // implicitly enable
    super.off(eventName, handler);
  }

  /**
   * Updates Gamepad state and publishes Gamepad events
   */
  public update() {
    if (!this.enabled || !this.supported) {
      return;
    }
    this.init();

    const gamepads = this._navigator.getGamepads();

    for (let i = 0; i < gamepads.length; i++) {
      if (!gamepads[i]) {
        const gamepad = this.at(i);
        // If was connected, but now isn't emit the disconnect event
        if (gamepad.connected) {
          this.eventDispatcher.emit('disconnect', new GamepadDisconnectEvent(i, gamepad));
        }
        // Reset connection status
        gamepad.connected = false;
        continue;
      } else {
        if (!this.at(i).connected && this._isGamepadValid(gamepads[i])) {
          this.eventDispatcher.emit('connect', new GamepadConnectEvent(i, this.at(i)));
        }
        // Set connection status
        this.at(i).connected = true;
      }

      // Only supported in Chrome
      if (gamepads[i].timestamp && gamepads[i].timestamp === this._gamePadTimeStamps[i]) {
        continue;
      }

      this._gamePadTimeStamps[i] = gamepads[i].timestamp;

      // Add reference to navigator gamepad
      this.at(i).navigatorGamepad = gamepads[i];

      // Buttons
      let b: string, bi: number, a: string, ai: number, value: number;

      for (b in Buttons) {
        bi = <any>Buttons[b];
        if (typeof bi === 'number') {
          if (gamepads[i].buttons[bi]) {
            value = gamepads[i].buttons[bi].value;
            if (value !== this._oldPads[i].getButton(bi)) {
              if (gamepads[i].buttons[bi].pressed) {
                this.at(i).updateButton(bi, value);
                this.at(i).eventDispatcher.emit('button', new GamepadButtonEvent(bi, value, this.at(i)));
              } else {
                this.at(i).updateButton(bi, 0);
              }
            }
          }
        }
      }

      // Axes
      for (a in Axes) {
        ai = <any>Axes[a];
        if (typeof ai === 'number') {
          value = gamepads[i].axes[ai];
          if (value !== this._oldPads[i].getAxes(ai)) {
            this.at(i).updateAxes(ai, value);
            this.at(i).eventDispatcher.emit('axis', new GamepadAxisEvent(ai, value, this.at(i)));
          }
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
      for (let i = this._pads.length - 1, max = index; i < max; i++) {
        this._pads.push(new Gamepad());
        this._oldPads.push(new Gamepad());
      }
    }

    return this._pads[index];
  }

  /**
   * Returns a list of all valid gamepads that meet the minimum configuration requirement.
   */
  public getValidGamepads(): Gamepad[] {
    this._enableAndUpdate();
    const result: Gamepad[] = [];
    for (let i = 0; i < this._pads.length; i++) {
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
    return this._pads.filter((p) => p.connected).length;
  }

  private _clonePads(pads: NavigatorGamepad[]): Gamepad[] {
    const arr = [];
    for (let i = 0, len = pads.length; i < len; i++) {
      arr.push(this._clonePad(pads[i]));
    }
    return arr;
  }

  /**
   * Fastest way to clone a known object is to do it yourself
   */
  private _clonePad(pad: NavigatorGamepad): Gamepad {
    let i, len;
    const clonedPad = new Gamepad();

    if (!pad) {
      return clonedPad;
    }

    for (i = 0, len = pad.buttons.length; i < len; i++) {
      if (pad.buttons[i]) {
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
export class Gamepad extends Class {
  public connected = false;
  public navigatorGamepad: NavigatorGamepad;
  private _buttons: number[] = new Array(16);
  private _axes: number[] = new Array(4);

  constructor() {
    super();

    for (let i = 0; i < this._buttons.length; i++) {
      this._buttons[i] = 0;
    }
    for (let i = 0; i < this._axes.length; i++) {
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
    const value = this._axes[axes];

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
export interface NavigatorGamepads {
  getGamepads(): NavigatorGamepad[];
}

/**
 * @internal
 */
export interface NavigatorGamepad {
  axes: number[];
  buttons: NavigatorGamepadButton[];
  connected: boolean;
  id: string;
  index: number;
  mapping: string;
  timestamp: number;
}

/**
 * @internal
 */
export interface NavigatorGamepadButton {
  pressed: boolean;
  value: number;
}

/**
 * @internal
 */
export interface NavigatorGamepadEvent {
  gamepad: NavigatorGamepad;
}

/**
 * @internal
 */
export interface GamepadConfiguration {
  axis: number;
  buttons: number;
}
