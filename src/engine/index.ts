/**
 * The current Excalibur version string
 * @description `process.env.__EX_VERSION` gets replaced by Webpack on build
 */
export const EX_VERSION = process.env.__EX_VERSION;
import { polyfill } from './polyfill';
polyfill();

// This file is used as the bundle entry point and exports everything
// that will be exposed as the `ex` global variable.
export * from './flags';
export * from './id';
export * from './engine';
export * from './garbage-collector';
export * from './screen';
export * from './actor';
export * from './math/index';
export * from './camera';
export * from './debug/index';
export * from './event-emitter';
export * from './events/media-events';
export * from './events';
export * from './label';
export { FontStyle, FontUnit, TextAlign, BaseAlign } from './graphics/font-common';
export * from './particles/index';
export * from './scene';

export * from './tile-map/index';

export * from './timer';
export * from './trigger';
export * from './screen-element';

export * from './actions/index';
export * from './collision/index';

export * from './interfaces/index';
export * from './resources/index';

export * from './entity-component-system/index';

export * from './director/index';

export * from './color';

export * from './graphics/index';

// ex.Events namespace
import * as events from './events';
export { events as Events };

export { WheelEvent } from './input/wheel-event';

export { PointerEvent } from './input/pointer-event';

export { WheelDeltaMode } from './input/wheel-delta-mode';

export { PointerButton } from './input/pointer-button';

export { NativePointerButton } from './input/native-pointer-button';

export type { CapturePointerConfig } from './input/capture-pointer-config';

export type {
  NativePointerEvent,
  NativeMouseEvent,
  NativeTouchEvent,
  NativeWheelEvent,
  PointerInitOptions
} from './input/pointer-event-receiver';
export { PointerEventReceiver } from './input/pointer-event-receiver';

export { PointerAbstraction } from './input/pointer-abstraction';
export { PointerComponent } from './input/pointer-component';
export { PointerSystem } from './input/pointer-system';
export { PointerType } from './input/pointer-type';
export { PointerScope } from './input/pointer-scope';

export type {
  NavigatorGamepads,
  NavigatorGamepad,
  NavigatorGamepadButton,
  NavigatorGamepadEvent,
  GamepadConfiguration
} from './input/gamepad';
export { Gamepads, Gamepad, Buttons, Axes } from './input/gamepad';

export type { KeyboardInitOptions } from './input/keyboard';
export { Keys, KeyEvent, Keyboard } from './input/keyboard';
export * from './input/input-host';
export * from './input/input-mapper';

// ex.Util namespaces
import * as util from './util/index';
export { util as Util };

export * from './util/browser';
export * from './util/decorators';
export * from './util/detector';
export * from './util/easing-functions';
export * from './util/observable';
export * from './util/log';
export * from './util/pool';
export * from './util/fps';
export * from './util/clock';
export * from './util/web-audio';
export * from './util/toaster';
export * from './util/state-machine';
export * from './util/future';
export * from './util/semaphore';
export * from './util/coroutine';
export * from './util/assert';
export * from './util/rental-pool';
export * from './util/serializer';

// ex.Deprecated
// import * as deprecated from './deprecated';
// export { deprecated as Deprecated };
// export * from './Deprecated';
