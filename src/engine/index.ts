/**
 * The current Excalibur version string
 * @description `process.env.__EX_VERSION` gets replaced by Webpack on build
 */
export const EX_VERSION = process.env.__EX_VERSION;
import { polyfill } from './Polyfill';
polyfill();

// This file is used as the bundle entry point and exports everything
// that will be exposed as the `ex` global variable.
export * from './Flags';
export * from './Id';
export * from './Engine';
export * from './Screen';
export { Actor, ActorArgs } from './Actor';
export * from './Math/Index';
export * from './Camera';
export * from './Configurable';
export * from './Debug/index';
export * from './EventDispatcher';
export * from './EventEmitter';
export * from './Events/MediaEvents';
export * from './Events';
export * from './Label';
export { FontStyle, FontUnit, TextAlign, BaseAlign } from './Graphics/FontCommon';
export * from './EmitterType';
export { Particle, ParticleTransform, ParticleArgs, ParticleEmitterArgs } from './Particles';
export * from './ParticleEmitter';
export * from './Collision/Physics';
export * from './Scene';

export * from './TileMap/index';

export * from './Timer';
export * from './Trigger';
export * from './ScreenElement';

export * from './Actions/Index';
export * from './Collision/Index';

export * from './Interfaces/Index';
export * from './Resources/Index';

export * from './EntityComponentSystem/index';

export * from './Director/index';

export * from './Color';

export * from './Graphics/index';

// ex.Events namespace
import * as events from './Events';
export { events as Events };

// ex.Input namespace
// TODO deprecated import site remove in v0.29.0
import * as input from './Input/Index';
export { input as Input };

export { WheelEvent } from './Input/WheelEvent';

export { PointerEvent } from './Input/PointerEvent';

export { WheelDeltaMode } from './Input/WheelDeltaMode';

export { PointerButton } from './Input/PointerButton';

export { NativePointerButton } from './Input/NativePointerButton';

export { CapturePointerConfig } from './Input/CapturePointerConfig';

export {
  NativePointerEvent,
  NativeMouseEvent,
  NativeTouchEvent,
  NativeWheelEvent,
  PointerInitOptions,
  PointerEventReceiver
} from './Input/PointerEventReceiver';

export { PointerAbstraction } from './Input/PointerAbstraction';
export { PointerComponent } from './Input/PointerComponent';
export { PointerSystem } from './Input/PointerSystem';
export { PointerType } from './Input/PointerType';
export { PointerScope } from './Input/PointerScope';

export {
  Gamepads,
  Gamepad,
  Buttons,
  Axes,
  NavigatorGamepads,
  NavigatorGamepad,
  NavigatorGamepadButton,
  NavigatorGamepadEvent,
  GamepadConfiguration
} from './Input/Gamepad';

export { Keys, KeyEvent, KeyboardInitOptions, Keyboard } from './Input/Keyboard';
export * from './Input/InputHost';
export * from './Input/InputMapper';

// ex.Util namespaces
import * as util from './Util/Index';
export { util as Util };

export * from './Util/Browser';
export * from './Util/Decorators';
export * from './Util/Detector';
export * from './Util/EasingFunctions';
export * from './Util/Observable';
export * from './Util/Log';
export * from './Util/Pool';
export * from './Util/Fps';
export * from './Util/Clock';
export * from './Util/WebAudio';
export * from './Util/Toaster';
export * from './Util/StateMachine';
export * from './Util/Future';
export * from './Util/Semaphore';
export * from './Util/Coroutine';

// ex.Deprecated
// import * as deprecated from './Deprecated';
// export { deprecated as Deprecated };
// export * from './Deprecated';
