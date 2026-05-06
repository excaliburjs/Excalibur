import * as ex from '@excalibur';
import { PointerEventsToObjectDispatcher } from '../../engine/input/pointer-events-to-object-dispatcher';

/**
 * Builds a minimal stand-in for PointerEventReceiver.
 * Only the fields actually read by PointerEventsToObjectDispatcher are populated.
 */
function makeReceiver(
  overrides: {
    currentFrameDown?: ex.PointerEvent[];
    currentFrameUp?: ex.PointerEvent[];
    currentFrameMove?: ex.PointerEvent[];
    currentFrameCancel?: ex.PointerEvent[];
    currentFrameWheel?: any[];
    isDragging?: (id: number) => boolean;
    isDragStart?: (id: number) => boolean;
    isDragEnd?: (id: number) => boolean;
  } = {}
) {
  return {
    currentFrameDown: [],
    currentFrameUp: [],
    currentFrameMove: [],
    currentFrameCancel: [],
    currentFrameWheel: [],
    currentFramePointerCoords: new Map<number, ex.GlobalCoordinates>(),
    isDragging: () => false,
    isDragStart: () => false,
    isDragEnd: () => false,
    ...overrides
  } as unknown as ex.PointerEventReceiver;
}

/** Builds a PointerEvent with controllable type and pointerType. */
function makePointerEvent(type: 'down' | 'up' | 'move' | 'cancel', pointerType: ex.PointerType, pointerId = 0): ex.PointerEvent {
  const coords = new ex.GlobalCoordinates(ex.vec(0, 0), ex.vec(0, 0), ex.vec(0, 0));
  return new ex.PointerEvent(type, pointerId, ex.PointerButton.Unknown, pointerType, coords, new Event('pointerevent'));
}

/** Builds a simple object that satisfies the TObject constraint. */
function makeTrackedObject() {
  return { events: new ex.EventEmitter() };
}

describe('PointerEventsToObjectDispatcher', () => {
  describe('_processEnterLeaveAndEmit (enter conditions)', () => {
    it('fires pointerenter on the first frame any pointer appears over an object (mouse move, _entered path)', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      // Object is under the pointer in the current frame, but has no last-frame entry → _entered is true
      dispatcher.addPointerToObject(obj, 0);

      const moveEvent = makePointerEvent('move', ex.PointerType.Mouse);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameMove: [moveEvent] }), [obj]);

      expect(emitSpy).toHaveBeenCalledWith('pointerenter', moveEvent);
    });

    it('fires pointerenter on touch down even when object was tracked in the previous frame (_entered is false)', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      // Put object in last frame
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      // Object is still under the pointer this frame (touch down at same location)
      dispatcher.addPointerToObject(obj, 0);

      const downEvent = makePointerEvent('down', ex.PointerType.Touch);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameDown: [downEvent] }), [obj]);

      // _entered is false (object was in last frame), but isTouchOrPenEvent + down fires enter
      expect(emitSpy).toHaveBeenCalledWith('pointerenter', downEvent);
    });

    it('fires pointerenter on pen down even when object was tracked in the previous frame (_entered is false)', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      dispatcher.addPointerToObject(obj, 0);

      const downEvent = makePointerEvent('down', ex.PointerType.Pen);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameDown: [downEvent] }), [obj]);

      expect(emitSpy).toHaveBeenCalledWith('pointerenter', downEvent);
    });

    it('does NOT fire pointerenter on mouse down when _entered is false (object was already tracked last frame)', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      // Put object in last frame so _entered is false
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      dispatcher.addPointerToObject(obj, 0);

      const downEvent = makePointerEvent('down', ex.PointerType.Mouse);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameDown: [downEvent] }), [obj]);

      // Mouse down alone should not fire pointerenter; only move/_entered path applies for mouse
      expect(emitSpy).not.toHaveBeenCalledWith('pointerenter', expect.anything());
    });

    it('does NOT fire pointerenter when the event is cancelled (active = false)', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      dispatcher.addPointerToObject(obj, 0);

      const downEvent = makePointerEvent('down', ex.PointerType.Touch);
      downEvent.cancel(); // event.active = false
      dispatcher.dispatchEvents(makeReceiver({ currentFrameDown: [downEvent] }), [obj]);

      expect(emitSpy).not.toHaveBeenCalledWith('pointerenter', expect.anything());
    });

    it('does NOT fire pointerenter when the object is inactive', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => false
      ); // active = false
      dispatcher.addPointerToObject(obj, 0);

      const downEvent = makePointerEvent('down', ex.PointerType.Touch);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameDown: [downEvent] }), [obj]);

      expect(emitSpy).not.toHaveBeenCalledWith('pointerenter', expect.anything());
    });

    it('does NOT fire pointerenter on touch down when the object is not under the pointer', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      // Object NOT added to current frame → not under pointer
      // Put in last frame only so we get into the dispatch block
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();

      const downEvent = makePointerEvent('down', ex.PointerType.Touch);
      // currentFrameDown has an event for pointer 0, but object is not under that pointer
      dispatcher.dispatchEvents(makeReceiver({ currentFrameDown: [downEvent] }), [obj]);

      expect(emitSpy).not.toHaveBeenCalledWith('pointerenter', expect.anything());
    });
  });

  describe('_processEnterLeaveAndEmit (leave conditions)', () => {
    it('fires pointerleave when a pointer moves off an object (_left path)', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      // Object under pointer last frame…
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      // …but NOT under pointer this frame (pointer moved away)

      const moveEvent = makePointerEvent('move', ex.PointerType.Mouse);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameMove: [moveEvent] }), [obj]);

      expect(emitSpy).toHaveBeenCalledWith('pointerleave', moveEvent);
    });

    it('fires pointerleave on touch up while object is still under the pointer (_left is false)', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      // Object was under pointer last frame…
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      // …and is still under pointer this frame (finger lifted at same location)
      dispatcher.addPointerToObject(obj, 0);

      const upEvent = makePointerEvent('up', ex.PointerType.Touch);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameUp: [upEvent] }), [obj]);

      // _left is false (object IS in current frame), but isTouchOrPenEvent + up fires leave
      expect(emitSpy).toHaveBeenCalledWith('pointerleave', upEvent);
    });

    it('fires pointerleave on pen up while object is still under the pointer (_left is false)', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      dispatcher.addPointerToObject(obj, 0);

      const upEvent = makePointerEvent('up', ex.PointerType.Pen);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameUp: [upEvent] }), [obj]);

      expect(emitSpy).toHaveBeenCalledWith('pointerleave', upEvent);
    });

    it('does NOT fire pointerleave on mouse up when _left is false (object still under pointer)', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      // Object in both last and current frames → _left is false
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      dispatcher.addPointerToObject(obj, 0);

      const upEvent = makePointerEvent('up', ex.PointerType.Mouse);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameUp: [upEvent] }), [obj]);

      // Mouse up alone should not fire pointerleave when pointer is still over the object
      expect(emitSpy).not.toHaveBeenCalledWith('pointerleave', expect.anything());
    });

    it('does NOT fire pointerleave when the event is cancelled (active = false)', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      dispatcher.addPointerToObject(obj, 0);

      const upEvent = makePointerEvent('up', ex.PointerType.Touch);
      upEvent.cancel(); // event.active = false
      dispatcher.dispatchEvents(makeReceiver({ currentFrameUp: [upEvent] }), [obj]);

      expect(emitSpy).not.toHaveBeenCalledWith('pointerleave', expect.anything());
    });

    it('does NOT fire pointerleave when the object is inactive', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => false
      ); // active = false
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      dispatcher.addPointerToObject(obj, 0);

      const upEvent = makePointerEvent('up', ex.PointerType.Touch);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameUp: [upEvent] }), [obj]);

      expect(emitSpy).not.toHaveBeenCalledWith('pointerleave', expect.anything());
    });

    it('does NOT fire pointerleave on touch up when the object is not under the pointer', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      // Object in last frame but NOT in current frame (pointer moved away before lifting)
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      // Do not add to current frame

      // A move event is needed to get into the dispatch block; use pointer 1 so _left for 0 doesn't trigger
      // Instead just use the up event with a different pointer so neither _left nor the new condition fires
      const upEvent = makePointerEvent('up', ex.PointerType.Touch, 1); // different pointer id
      dispatcher.dispatchEvents(makeReceiver({ currentFrameUp: [upEvent] }), [obj]);

      expect(emitSpy).not.toHaveBeenCalledWith('pointerleave', expect.anything());
    });
  });

  describe('_processEnterLeaveAndEmit (drag variants)', () => {
    it('fires pointerdragenter on touch down when dragging', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      dispatcher.addPointerToObject(obj, 0);

      const downEvent = makePointerEvent('down', ex.PointerType.Touch);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameDown: [downEvent], isDragging: () => true }), [obj]);

      expect(emitSpy).toHaveBeenCalledWith('pointerdragenter', downEvent);
    });

    it('fires pointerdragleave on touch up when dragging', () => {
      const dispatcher = new PointerEventsToObjectDispatcher();
      const obj = makeTrackedObject();
      const emitSpy = vi.spyOn(obj.events, 'emit');

      dispatcher.addObject(
        obj,
        () => false,
        () => true
      );
      dispatcher.addPointerToObject(obj, 0);
      dispatcher.clear();
      dispatcher.addPointerToObject(obj, 0);

      const upEvent = makePointerEvent('up', ex.PointerType.Touch);
      dispatcher.dispatchEvents(makeReceiver({ currentFrameUp: [upEvent], isDragging: () => true }), [obj]);

      expect(emitSpy).toHaveBeenCalledWith('pointerdragleave', upEvent);
    });
  });
});
