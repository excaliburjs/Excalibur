import * as Events from '../Events';
import { PointerEvent, WheelEvent, PointerDragEvent } from '../Input/Pointer';

export interface IPointerEvents {

   
   on(eventName: Events.pointerup, handler: (event?: PointerEvent) => void): void;
   on(eventName: Events.pointerdown, handler: (event?: PointerEvent) => void): void;
   on(eventName: Events.pointerenter, handler: (event?: PointerEvent) => void): void;
   on(eventName: Events.pointerleave, handler: (event?: PointerEvent) => void): void;
   on(eventName: Events.pointermove, handler: (event?: PointerEvent) => void): void;
   on(eventName: Events.pointercancel, handler: (event?: PointerEvent) => void): void;
   on(eventName: Events.pointerwheel, handler: (event?: WheelEvent) => void): void;
   on(eventName: Events.pointerdragstart, handler: (event?: PointerDragEvent) => void): void;
   on(eventName: Events.pointerdragend, handler: (event?: PointerDragEvent) => void): void;
   on(eventName: Events.pointerdragenter, handler: (event?: PointerDragEvent) => void): void;
   on(eventName: Events.pointerdragleave, handler: (event?: PointerDragEvent) => void): void;
   on(eventName: Events.pointerdragmove, handler: (event?: PointerDragEvent) => void): void;

   once(eventName: Events.pointerup, handler: (event?: PointerEvent) => void): void;
   once(eventName: Events.pointerdown, handler: (event?: PointerEvent) => void): void;
   once(eventName: Events.pointerenter, handler: (event?: PointerEvent) => void): void;
   once(eventName: Events.pointerleave, handler: (event?: PointerEvent) => void): void;
   once(eventName: Events.pointermove, handler: (event?: PointerEvent) => void): void;
   once(eventName: Events.pointercancel, handler: (event?: PointerEvent) => void): void;
   once(eventName: Events.pointerwheel, handler: (event?: WheelEvent) => void): void;
   once(eventName: Events.pointerdragstart, handler: (event?: PointerDragEvent) => void): void;
   once(eventName: Events.pointerdragend, handler: (event?: PointerDragEvent) => void): void;
   once(eventName: Events.pointerdragenter, handler: (event?: PointerDragEvent) => void): void;
   once(eventName: Events.pointerdragleave, handler: (event?: PointerDragEvent) => void): void;
   once(eventName: Events.pointerdragmove, handler: (event?: PointerDragEvent) => void): void;


   off(eventName: Events.pointerup, handler?: (event?: PointerEvent) => void): void;
   off(eventName: Events.pointerdown, handler?: (event?: PointerEvent) => void): void;
   off(eventName: Events.pointerenter, handler?: (event?: PointerEvent) => void): void;
   off(eventName: Events.pointerleave, handler?: (event?: PointerEvent) => void): void;
   off(eventName: Events.pointermove, handler?: (event?: PointerEvent) => void): void;
   off(eventName: Events.pointercancel, handler?: (event?: PointerEvent) => void): void;
   off(eventName: Events.pointerwheel, handler?: (event?: WheelEvent) => void): void;
   off(eventName: Events.pointerdragstart, handler?: (event?: PointerDragEvent) => void): void;
   off(eventName: Events.pointerdragend, handler?: (event?: PointerDragEvent) => void): void;
   off(eventName: Events.pointerdragenter, handler?: (event?: PointerDragEvent) => void): void;
   off(eventName: Events.pointerdragleave, handler?: (event?: PointerDragEvent) => void): void;
   off(eventName: Events.pointerdragmove, handler?: (event?: PointerDragEvent) => void): void;

}