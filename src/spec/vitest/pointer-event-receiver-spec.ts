import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

function coords() {
  return new ex.GlobalCoordinates(ex.vec(0, 0), ex.vec(0, 0), ex.vec(0, 0));
}

describe('A PointerEventReceiver', () => {
  let engine: ex.Engine;

  beforeEach(async () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    await TestUtils.runToReady(engine);
  });

  afterEach(() => {
    engine.dispose();
  });

  it('exists', () => {
    expect(ex.PointerEventReceiver).toBeDefined();
  });

  it('can be constructed with a single primary pointer', () => {
    const receiver = new ex.PointerEventReceiver(engine.canvas, engine);

    expect(receiver).toBeDefined();
    expect(receiver.primary).toBeDefined();
    expect(receiver.count()).toBe(1);
    expect(receiver.at(0)).toBe(receiver.primary);
  });

  describe('at()', () => {
    it('grows the pointer list when requesting a further index', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      const third = receiver.at(2);

      expect(third).toBeDefined();
      expect(receiver.count()).toBe(3);
    });
  });

  describe('isDown/wasDown/isDragging/isDragStart/isDragEnd', () => {
    it('reads from the current/last frame down maps', () => {
      const receiver = engine.input.pointers;
      receiver.currentFramePointerDown.set(0, true);
      receiver.lastFramePointerDown.set(0, false);

      expect(receiver.isDown(0)).toBe(true);
      expect(receiver.wasDown(0)).toBe(false);
      expect(receiver.isDragging(0)).toBe(true);
      expect(receiver.isDragStart(0)).toBe(true);
      expect(receiver.isDragEnd(0)).toBe(false);
    });

    it('isDragEnd is true when down last frame but not this frame', () => {
      const receiver = engine.input.pointers;
      receiver.currentFramePointerDown.set(0, false);
      receiver.lastFramePointerDown.set(0, true);

      expect(receiver.isDragEnd(0)).toBe(true);
    });

    it('defaults to false for an unknown pointer id', () => {
      const receiver = engine.input.pointers;
      expect(receiver.isDown(999)).toBe(false);
      expect(receiver.wasDown(999)).toBe(false);
    });

    it('all report false when disabled via toggleEnabled(false)', () => {
      const receiver = engine.input.pointers;
      receiver.currentFramePointerDown.set(0, true);
      receiver.lastFramePointerDown.set(0, true);
      receiver.toggleEnabled(false);

      expect(receiver.isDown(0)).toBe(false);
      expect(receiver.wasDown(0)).toBe(false);
      expect(receiver.isDragging(0)).toBe(false);
      expect(receiver.isDragStart(0)).toBe(false);
      expect(receiver.isDragEnd(0)).toBe(false);

      receiver.toggleEnabled(true);
    });
  });

  describe('on/once/off/emit', () => {
    it('delegates to the underlying event emitter', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      const handler = vi.fn();
      receiver.on('down', handler);

      receiver.emit('down', {} as any);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('once only fires a single time', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      const handler = vi.fn();
      receiver.once('down', handler);

      receiver.emit('down', {} as any);
      receiver.emit('down', {} as any);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('off removes a handler', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      const handler = vi.fn();
      receiver.on('down', handler);
      receiver.off('down', handler);

      receiver.emit('down', {} as any);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('recreate()', () => {
    it('preserves the primary pointer and tracked pointers on the new receiver', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      receiver.at(1); // grow to 2 pointers

      const recreated = receiver.recreate(engine.canvas, engine);

      expect(recreated.primary).toBe(receiver.primary);
      expect(recreated.count()).toBe(receiver.count());
    });
  });

  describe('update()', () => {
    it('emits down/up/move/cancel events for active pointer events this frame', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      const downHandler = vi.fn();
      const upHandler = vi.fn();
      const moveHandler = vi.fn();
      receiver.on('down', downHandler);
      receiver.on('up', upHandler);
      receiver.on('move', moveHandler);
      const cancelHandler = vi.fn();
      receiver.on('cancel' as any, cancelHandler);

      const c = coords();
      receiver.currentFrameDown.push(
        new ex.PointerEvent('down', 0, ex.PointerButton.Left, ex.PointerType.Mouse, c, new Event('pointerdown'))
      );
      receiver.currentFrameUp.push(new ex.PointerEvent('up', 0, ex.PointerButton.Left, ex.PointerType.Mouse, c, new Event('pointerup')));
      receiver.currentFrameMove.push(
        new ex.PointerEvent('move', 0, ex.PointerButton.Left, ex.PointerType.Mouse, c, new Event('pointermove'))
      );
      receiver.currentFrameCancel.push(
        new ex.PointerEvent('cancel', 0, ex.PointerButton.Left, ex.PointerType.Mouse, c, new Event('pointercancel'))
      );

      receiver.update();

      expect(downHandler).toHaveBeenCalledTimes(1);
      expect(upHandler).toHaveBeenCalledTimes(1);
      expect(moveHandler).toHaveBeenCalledTimes(1);
      expect(cancelHandler).toHaveBeenCalledTimes(1);
    });

    it('skips events that were deactivated before update runs', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      const downHandler = vi.fn();
      receiver.on('down', downHandler);

      const event = new ex.PointerEvent('down', 0, ex.PointerButton.Left, ex.PointerType.Mouse, coords(), new Event('pointerdown'));
      event.cancel();
      receiver.currentFrameDown.push(event);

      receiver.update();

      expect(downHandler).not.toHaveBeenCalled();
    });

    it('emits wheel events to both the receiver and the primary pointer', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      const wheelHandler = vi.fn();
      receiver.on('wheel', wheelHandler);
      const primaryWheelHandler = vi.fn();
      receiver.primary.on('wheel', primaryWheelHandler);

      receiver.currentFrameWheel.push(new ex.WheelEvent(0, 0, 0, 0, 0, 0, 0, 0, 100, 0, ex.WheelDeltaMode.Pixel, new Event('wheel')));

      receiver.update();

      expect(wheelHandler).toHaveBeenCalledTimes(1);
      expect(primaryWheelHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear()', () => {
    it('empties all current-frame event queues and pointer coordinates for released pointers', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      const c = coords();
      receiver.currentFrameDown.push(
        new ex.PointerEvent('down', 0, ex.PointerButton.Left, ex.PointerType.Mouse, c, new Event('pointerdown'))
      );
      receiver.currentFrameUp.push(new ex.PointerEvent('up', 0, ex.PointerButton.Left, ex.PointerType.Mouse, c, new Event('pointerup')));
      receiver.currentFrameMove.push(
        new ex.PointerEvent('move', 0, ex.PointerButton.Left, ex.PointerType.Mouse, c, new Event('pointermove'))
      );
      receiver.currentFrameCancel.push(
        new ex.PointerEvent('cancel', 0, ex.PointerButton.Left, ex.PointerType.Mouse, c, new Event('pointercancel'))
      );
      receiver.currentFrameWheel.push(new ex.WheelEvent(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ex.WheelDeltaMode.Pixel, new Event('wheel')));
      receiver.currentFramePointerCoords.set(0, c);

      receiver.clear();

      expect(receiver.currentFrameDown).toEqual([]);
      expect(receiver.currentFrameUp).toEqual([]);
      expect(receiver.currentFrameMove).toEqual([]);
      expect(receiver.currentFrameCancel).toEqual([]);
      expect(receiver.currentFrameWheel).toEqual([]);
      expect(receiver.currentFramePointerCoords.has(0)).toBe(false);
    });
  });

  describe('native DOM event handling via init()/detach()', () => {
    it('normalizes native pointer button values (left/middle/right)', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      receiver.init();

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 1, clientX: 10, clientY: 10, button: 0 }));
      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 2, clientX: 10, clientY: 10, button: 1 }));
      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 3, clientX: 10, clientY: 10, button: 2 }));

      expect(receiver.currentFrameDown.map((e) => e.button)).toEqual([
        ex.PointerButton.Left,
        ex.PointerButton.Middle,
        ex.PointerButton.Right
      ]);

      receiver.detach();
    });

    it('normalizes native pointerType values (mouse/touch/pen)', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      receiver.init();

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 1, clientX: 10, clientY: 10, pointerType: 'mouse' }));
      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 2, clientX: 10, clientY: 10, pointerType: 'touch' }));
      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 3, clientX: 10, clientY: 10, pointerType: 'pen' }));

      expect(receiver.currentFrameDown.map((e) => e.pointerType)).toEqual([ex.PointerType.Mouse, ex.PointerType.Touch, ex.PointerType.Pen]);

      receiver.detach();
    });

    it('assigns increasing normalized ids when native ids arrive in ascending order', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      receiver.init();

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 2, clientX: 10, clientY: 10 }));
      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 5, clientX: 10, clientY: 10 }));

      expect(receiver.currentFrameDown.map((e) => e.pointerId)).toEqual([0, 1]);

      receiver.detach();
    });

    it('assigns normalized ids by arrival order, even when a later pointer has a lower native id', () => {
      // normalized ids are allocated on first sight of a native id and never change
      // afterward, so a later-arriving pointer can never collide with (or displace)
      // an already-tracked one, regardless of how the native ids compare numerically.
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      receiver.init();

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 5, clientX: 10, clientY: 10 }));
      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 2, clientX: 10, clientY: 10 }));

      expect(receiver.currentFrameDown.map((e) => e.pointerId)).toEqual([0, 1]);

      receiver.detach();
    });

    it('reuses a freed normalized id for a new native pointer after the old one lifts', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      receiver.init();

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 5, clientX: 10, clientY: 10 }));
      expect(receiver.currentFrameDown.map((e) => e.pointerId)).toEqual([0]);

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerup', { pointerId: 5, clientX: 10, clientY: 10 }));
      receiver.clear();

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 9, clientX: 10, clientY: 10 }));
      expect(receiver.currentFrameDown.map((e) => e.pointerId)).toEqual([0]);

      receiver.detach();
    });

    it('reuses the smallest freed id so a lone new contact lands back on the primary pointer', () => {
      // Regression test: freed ids were reused LIFO, so after a multi-touch release the next
      // single touch popped the highest freed id and pointers.primary (id 0) went silent.
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      receiver.init();

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 5, pointerType: 'touch', clientX: 10, clientY: 10 }));
      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 7, pointerType: 'touch', clientX: 20, clientY: 20 }));
      expect(receiver.currentFrameDown.map((e) => e.pointerId)).toEqual([0, 1]);

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerup', { pointerId: 5, pointerType: 'touch', clientX: 10, clientY: 10 }));
      engine.canvas.dispatchEvent(new window.PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', clientX: 20, clientY: 20 }));
      receiver.clear();

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 9, pointerType: 'touch', clientX: 30, clientY: 30 }));
      expect(receiver.currentFrameDown.map((e) => e.pointerId)).toEqual([0]);

      receiver.detach();
    });

    it('frees the normalized id and down state when a pointer is cancelled', () => {
      // Regression test: only pointerup freed ids - cancelled contacts (palm rejection, browser
      // gesture takeover) leaked their mapping forever and left the pointer reporting down.
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      receiver.init();

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 5, pointerType: 'touch', clientX: 10, clientY: 10 }));
      expect(receiver.currentFrameDown.map((e) => e.pointerId)).toEqual([0]);
      expect(receiver.isDown(0)).toBe(true);

      engine.canvas.dispatchEvent(
        new window.PointerEvent('pointercancel', { pointerId: 5, pointerType: 'touch', clientX: 10, clientY: 10 })
      );
      expect(receiver.isDown(0)).toBe(false);
      receiver.clear();

      expect((receiver as any)._activeNativePointerIdsToNormalized.size).toBe(0);

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 9, pointerType: 'touch', clientX: 30, clientY: 30 }));
      expect(receiver.currentFrameDown.map((e) => e.pointerId)).toEqual([0]);
      expect((receiver as any)._activeNativePointerIdsToNormalized.size).toBe(1);

      receiver.detach();
    });

    it('keeps the mouse id reserved after mouse up so a later touch cannot steal the primary pointer', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      receiver.init();

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 1, pointerType: 'mouse', clientX: 10, clientY: 10 }));
      engine.canvas.dispatchEvent(new window.PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', clientX: 10, clientY: 10 }));
      expect(receiver.currentFrameUp.map((e) => e.pointerId)).toEqual([0]);
      receiver.clear();

      // The mouse still exists (it hovers) - a new touch must not take over id 0
      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 5, pointerType: 'touch', clientX: 30, clientY: 30 }));
      expect(receiver.currentFrameDown.map((e) => e.pointerId)).toEqual([1]);

      // And the hovering mouse keeps routing to the primary pointer
      engine.canvas.dispatchEvent(new window.PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 15, clientY: 15 }));
      expect(receiver.currentFrameMove.map((e) => e.pointerId)).toEqual([0]);

      receiver.detach();
    });

    it('stops handling events after detach()', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      receiver.init();
      receiver.detach();

      engine.canvas.dispatchEvent(new window.PointerEvent('pointerdown', { pointerId: 1, clientX: 10, clientY: 10 }));

      expect(receiver.currentFrameDown).toEqual([]);
    });

    it('records wheel events with normalized delta mode', () => {
      const receiver = new ex.PointerEventReceiver(engine.canvas, engine);
      receiver.init();

      engine.canvas.dispatchEvent(new window.WheelEvent('wheel', { deltaX: 0, deltaY: 100, deltaMode: 1 }));

      expect(receiver.currentFrameWheel.length).toBe(1);
      expect(receiver.currentFrameWheel[0].deltaY).toBe(100);
      expect(receiver.currentFrameWheel[0].deltaMode).toBe(ex.WheelDeltaMode.Line);

      receiver.detach();
    });
  });
});
