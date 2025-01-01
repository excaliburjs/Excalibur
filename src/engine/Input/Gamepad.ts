import { GamepadConnectEvent, GamepadDisconnectEvent, GamepadButtonEvent, GamepadAxisEvent } from '../Events';
import { EventEmitter, EventKey, Handler, Subscription } from '../EventEmitter';

export type GamepadEvents = {
  connect: GamepadConnectEvent;
  disconnect: GamepadDisconnectEvent;
  button: GamepadButtonEvent;
  axis: GamepadAxisEvent;
};

export const GamepadEvents = {
  GamepadConnect: 'connect',
  GamepadDisconnect: 'disconnect',
  GamepadButton: 'button',
  GamepadAxis: 'axis'
};

/**
 * Excalibur leverages the HTML5 Gamepad API [where it is supported](http://caniuse.com/#feat=gamepad)
 * to provide controller support for your games.
 */
export class Gamepads {
  public events = new EventEmitter<GamepadEvents>();
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
  private _enabled = true;

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

  public toggleEnabled(enabled: boolean) {
    this._enabled = enabled;
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

  public emit<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, event: GamepadEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<GamepadEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<GamepadEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    this._enableAndUpdate(); // implicitly enable
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<GamepadEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    this._enableAndUpdate(); // implicitly enable
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<GamepadEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    this._enableAndUpdate(); // implicitly enable
    this.events.off(eventName, handler);
  }

  /**
   * Updates Gamepad state and publishes Gamepad events
   */
  public update() {
    if (!this.enabled || !this.supported) {
      return;
    }
    if (!this._enabled) {
      return;
    }
    this.init();

    const gamepads = this._navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (!gamepads[i]) {
        const gamepad = this.at(i);
        // If was connected, but now isn't emit the disconnect event
        if (gamepad.connected) {
          this.events.emit('disconnect', new GamepadDisconnectEvent(i, gamepad));
          gamepad.events.unpipe(this.events);
        }
        // Reset connection status
        gamepad.connected = false;
        continue;
      } else {
        const gamepad = this.at(i);
        if (!this.at(i).connected && this._isGamepadValid(gamepads[i])) {
          gamepad.events.pipe(this.events);
          this.events.emit('connect', new GamepadConnectEvent(i, this.at(i)));
        }
        // Set connection status
        this.at(i).connected = true;
      }

      this.at(i).update();

      // Only supported in Chrome
      if (gamepads[i].timestamp && gamepads[i].timestamp === this._gamePadTimeStamps[i]) {
        continue;
      }

      this._gamePadTimeStamps[i] = gamepads[i].timestamp;

      // Add reference to navigator gamepad
      this.at(i).navigatorGamepad = gamepads[i];

      // Buttons

      const gamepad = gamepads[i];
      // gamepads are a list that might be null
      if (gamepad) {
        for (let buttonIndex = 0; buttonIndex < gamepad.buttons.length; buttonIndex++) {
          const button = gamepad.buttons[buttonIndex];
          const value = button?.value;
          if (value !== this._oldPads[i]?.getButton(buttonIndex)) {
            if (button?.pressed) {
              this.at(i).updateButton(buttonIndex, value);
              // Fallback to unknown if not mapped
              // prettier-ignore
              this.at(i).events.emit('button', new GamepadButtonEvent(
                buttonIndex in Buttons ? buttonIndex as Buttons : Buttons.Unknown,
                buttonIndex,
                value,
                this.at(i))
              );
            } else {
              this.at(i).updateButton(buttonIndex, 0);
            }
          }
        }

        for (let axesIndex = 0; axesIndex < gamepad.axes.length; axesIndex++) {
          const axis = gamepad.axes[axesIndex];
          if (axis !== this._oldPads[i]?.getAxes(axesIndex)) {
            this.at(i).updateAxes(axesIndex, axis);
            this.at(i).events.emit('axis', new GamepadAxisEvent(axesIndex, axis, this.at(i)));
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
 * Gamepad holds state information for a connected controller. See {@apilink Gamepads}
 * for more information on handling controller input.
 */
export class Gamepad {
  public events = new EventEmitter<GamepadEvents>();
  public connected = false;
  public navigatorGamepad: NavigatorGamepad;
  private _axes: number[] = new Array(4);
  private _buttons: number[] = new Array(16);
  private _buttonsUp: number[] = new Array(16);
  private _buttonsDown: number[] = new Array(16);

  constructor() {
    for (let i = 0; i < this._buttons.length; i++) {
      this._buttons[i] = 0;
    }
    for (let i = 0; i < this._axes.length; i++) {
      this._axes[i] = 0;
    }
  }

  public update() {
    // Reset buttonsDown and buttonsUp after update is complete
    this._buttonsDown = new Array(16);
    this._buttonsUp = new Array(16);
  }

  /**
   * Whether or not the given button is pressed
   * @deprecated will be removed in v0.28.0. Use isButtonHeld instead
   * @param button     The button to query
   * @param threshold  The threshold over which the button is considered to be pressed
   */
  public isButtonPressed(button: Buttons | number, threshold: number = 1) {
    return this._buttons[button] >= threshold;
  }

  /**
   * Tests if a certain button is held down. This is persisted between frames.
   * @param button     The button to query
   * @param threshold  The threshold over which the button is considered to be pressed
   */
  public isButtonHeld(button: Buttons | number, threshold: number = 1) {
    return this._buttons[button] >= threshold;
  }

  /**
   * Tests if a certain button was just pressed this frame. This is cleared at the end of the update frame.
   * @param button Test whether a button was just pressed
   * @param threshold  The threshold over which the button is considered to be pressed
   */
  public wasButtonPressed(button: Buttons | number, threshold: number = 1) {
    return this._buttonsDown[button] >= threshold;
  }

  /**
   * Tests if a certain button was just released this frame. This is cleared at the end of the update frame.
   * @param button  Test whether a button was just released
   */
  public wasButtonReleased(button: Buttons | number) {
    return Boolean(this._buttonsUp[button]);
  }

  /**
   * Gets the given button value between 0 and 1
   */
  public getButton(button: Buttons | number) {
    return this._buttons[button];
  }

  /**
   * Gets the given axis value between -1 and 1. Values below
   * {@apilink MinAxisMoveThreshold} are considered 0.
   */
  public getAxes(axes: Axes | number) {
    const value = this._axes[axes];

    if (Math.abs(value) < Gamepads.MinAxisMoveThreshold) {
      return 0;
    } else {
      return value;
    }
  }

  public updateButton(buttonIndex: number, value: number) {
    // button was just released
    if (value === 0 && this._buttons[buttonIndex]) {
      this._buttonsUp[buttonIndex] = 1;

      // button was just pressed
    } else {
      this._buttonsDown[buttonIndex] = value;
    }

    this._buttons[buttonIndex] = value;
  }

  public updateAxes(axesIndex: number, value: number) {
    this._axes[axesIndex] = value;
  }

  public emit<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, event: GamepadEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<GamepadEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<GamepadEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<GamepadEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<GamepadEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    this.events.off(eventName, handler);
  }
}

/**
 * Gamepad Buttons enumeration
 */
export enum Buttons {
  /**
   * Any button that isn't explicity known by excalibur
   */
  Unknown = -1,
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
  DpadRight = 15,
  /**
   * Center button (e.g. the Nintendo Home Button)
   */
  CenterButton = 16,
  /**
   * Misc button 1 (e.g. Xbox Series X share button, PS5 microphone button, Nintendo Switch Pro capture button, Amazon Luna microphone button)
   * defacto standard not listed on the w3c spec for a standard gamepad https://w3c.github.io/gamepad/#dfn-standard-gamepad
   */
  MiscButton1 = 17
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
  getGamepads(): (NavigatorGamepad | undefined)[];
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
