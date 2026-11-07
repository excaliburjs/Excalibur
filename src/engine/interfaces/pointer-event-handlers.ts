import type { PointerEvent } from '../input/pointer-event';
import type { WheelEvent } from '../input/wheel-event';
export interface PointerEvents {
  on(eventName: 'pointerup', handler: (event: PointerEvent) => void): void;
  on(eventName: 'pointerdown', handler: (event: PointerEvent) => void): void;
  on(eventName: 'pointerenter', handler: (event: PointerEvent) => void): void;
  on(eventName: 'pointerleave', handler: (event: PointerEvent) => void): void;
  on(eventName: 'pointermove', handler: (event: PointerEvent) => void): void;
  on(eventName: 'pointercancel', handler: (event: PointerEvent) => void): void;
  on(eventName: 'pointerwheel', handler: (event: WheelEvent) => void): void;
  on(eventName: 'pointerdragstart', handler: (event: PointerEvent) => void): void;
  on(eventName: 'pointerdragend', handler: (event: PointerEvent) => void): void;
  on(eventName: 'pointerdragenter', handler: (event: PointerEvent) => void): void;
  on(eventName: 'pointerdragleave', handler: (event: PointerEvent) => void): void;
  on(eventName: 'pointerdragmove', handler: (event: PointerEvent) => void): void;

  once(eventName: 'pointerup', handler: (event: PointerEvent) => void): void;
  once(eventName: 'pointerdown', handler: (event: PointerEvent) => void): void;
  once(eventName: 'pointerenter', handler: (event: PointerEvent) => void): void;
  once(eventName: 'pointerleave', handler: (event: PointerEvent) => void): void;
  once(eventName: 'pointermove', handler: (event: PointerEvent) => void): void;
  once(eventName: 'pointercancel', handler: (event: PointerEvent) => void): void;
  once(eventName: 'pointerwheel', handler: (event: WheelEvent) => void): void;
  once(eventName: 'pointerdragstart', handler: (event: PointerEvent) => void): void;
  once(eventName: 'pointerdragend', handler: (event: PointerEvent) => void): void;
  once(eventName: 'pointerdragenter', handler: (event: PointerEvent) => void): void;
  once(eventName: 'pointerdragleave', handler: (event: PointerEvent) => void): void;
  once(eventName: 'pointerdragmove', handler: (event: PointerEvent) => void): void;

  off(eventName: 'pointerup', handler?: (event: PointerEvent) => void): void;
  off(eventName: 'pointerdown', handler?: (event: PointerEvent) => void): void;
  off(eventName: 'pointerenter', handler?: (event: PointerEvent) => void): void;
  off(eventName: 'pointerleave', handler?: (event: PointerEvent) => void): void;
  off(eventName: 'pointermove', handler?: (event: PointerEvent) => void): void;
  off(eventName: 'pointercancel', handler?: (event: PointerEvent) => void): void;
  off(eventName: 'pointerwheel', handler?: (event: WheelEvent) => void): void;
  off(eventName: 'pointerdragstart', handler?: (event: PointerEvent) => void): void;
  off(eventName: 'pointerdragend', handler?: (event: PointerEvent) => void): void;
  off(eventName: 'pointerdragenter', handler?: (event: PointerEvent) => void): void;
  off(eventName: 'pointerdragleave', handler?: (event: PointerEvent) => void): void;
  off(eventName: 'pointerdragmove', handler?: (event: PointerEvent) => void): void;
}
