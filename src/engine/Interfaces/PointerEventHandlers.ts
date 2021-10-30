import * as Events from '../Events';
import { PointerEvent } from '../Input/PointerEvent';
import { WheelEvent } from '../Input/WheelEvent';
export interface PointerEvents {
  on(eventName: Events.pointerup, handler: (event: PointerEvent) => void): void;
  on(eventName: Events.pointerdown, handler: (event: PointerEvent) => void): void;
  on(eventName: Events.pointerenter, handler: (event: PointerEvent) => void): void;
  on(eventName: Events.pointerleave, handler: (event: PointerEvent) => void): void;
  on(eventName: Events.pointermove, handler: (event: PointerEvent) => void): void;
  on(eventName: Events.pointercancel, handler: (event: PointerEvent) => void): void;
  on(eventName: Events.pointerwheel, handler: (event: WheelEvent) => void): void;
  on(eventName: Events.pointerdragstart, handler: (event: PointerEvent) => void): void;
  on(eventName: Events.pointerdragend, handler: (event: PointerEvent) => void): void;
  on(eventName: Events.pointerdragenter, handler: (event: PointerEvent) => void): void;
  on(eventName: Events.pointerdragleave, handler: (event: PointerEvent) => void): void;
  on(eventName: Events.pointerdragmove, handler: (event: PointerEvent) => void): void;

  once(eventName: Events.pointerup, handler: (event: PointerEvent) => void): void;
  once(eventName: Events.pointerdown, handler: (event: PointerEvent) => void): void;
  once(eventName: Events.pointerenter, handler: (event: PointerEvent) => void): void;
  once(eventName: Events.pointerleave, handler: (event: PointerEvent) => void): void;
  once(eventName: Events.pointermove, handler: (event: PointerEvent) => void): void;
  once(eventName: Events.pointercancel, handler: (event: PointerEvent) => void): void;
  once(eventName: Events.pointerwheel, handler: (event: WheelEvent) => void): void;
  once(eventName: Events.pointerdragstart, handler: (event: PointerEvent) => void): void;
  once(eventName: Events.pointerdragend, handler: (event: PointerEvent) => void): void;
  once(eventName: Events.pointerdragenter, handler: (event: PointerEvent) => void): void;
  once(eventName: Events.pointerdragleave, handler: (event: PointerEvent) => void): void;
  once(eventName: Events.pointerdragmove, handler: (event: PointerEvent) => void): void;

  off(eventName: Events.pointerup, handler?: (event: PointerEvent) => void): void;
  off(eventName: Events.pointerdown, handler?: (event: PointerEvent) => void): void;
  off(eventName: Events.pointerenter, handler?: (event: PointerEvent) => void): void;
  off(eventName: Events.pointerleave, handler?: (event: PointerEvent) => void): void;
  off(eventName: Events.pointermove, handler?: (event: PointerEvent) => void): void;
  off(eventName: Events.pointercancel, handler?: (event: PointerEvent) => void): void;
  off(eventName: Events.pointerwheel, handler?: (event: WheelEvent) => void): void;
  off(eventName: Events.pointerdragstart, handler?: (event: PointerEvent) => void): void;
  off(eventName: Events.pointerdragend, handler?: (event: PointerEvent) => void): void;
  off(eventName: Events.pointerdragenter, handler?: (event: PointerEvent) => void): void;
  off(eventName: Events.pointerdragleave, handler?: (event: PointerEvent) => void): void;
  off(eventName: Events.pointerdragmove, handler?: (event: PointerEvent) => void): void;
}
