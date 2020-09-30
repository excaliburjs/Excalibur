import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A pointer', () => {
  let engine: ex.Engine = null;

  /**
   * Helper to make a mouse event in the test
   * @param type
   * @param target
   * @param button
   * @param x
   * @param y
   */
  function executeMouseEvent(type: string, target: HTMLElement, button: ex.Input.NativePointerButton = null, x: number = 0, y: number = 0) {
    const evt = new PointerEvent(type, {
      clientX: x,
      clientY: y,
      button: button
    });

    target.dispatchEvent(evt);
  }

  beforeEach(() => {
    engine = TestUtils.engine();
    engine.start();
  });

  afterEach(() => {
    engine.stop();
  });

  it('should exist', () => {
    expect(ex.Input.Pointers).toBeDefined();
    expect(engine.input.pointers).toBeTruthy();
  });

  it('should have a new id', () => {
    const pointer1 = new ex.Input.Pointer();
    const pointer2 = new ex.Input.Pointer();
    expect(pointer1.id).not.toEqual(pointer2.id);
  });

  it('should detect pointer event', () => {
    expect((<any>window).PointerEvent).toBeDefined();
  });

  it('should fire pointerdown events', () => {
    let eventLeftFired = false;
    let eventRightFired = false;
    let eventMiddleFired = false;
    engine.input.pointers.primary.on('down', (ev: ex.Input.PointerEvent) => {
      if (ev.button === ex.Input.PointerButton.Left) {
        eventLeftFired = true;
      }
      if (ev.button === ex.Input.PointerButton.Right) {
        eventRightFired = true;
      }
      if (ev.button === ex.Input.PointerButton.Middle) {
        eventMiddleFired = true;
      }
    });

    executeMouseEvent('pointerdown', <any>document, ex.Input.NativePointerButton.Left);
    executeMouseEvent('pointerdown', <any>document, ex.Input.NativePointerButton.Right);
    executeMouseEvent('pointerdown', <any>document, ex.Input.NativePointerButton.Middle);

    expect(eventLeftFired).toBe(true, 'left should fire');
    expect(eventRightFired).toBe(true, 'right should fire');
    expect(eventMiddleFired).toBe(true, 'middle should fire');
  });

  it('should fire pointerup events', () => {
    let eventLeftFired = false;
    let eventRightFired = false;
    let eventMiddleFired = false;

    engine.input.pointers.primary.on('up', function (ev: ex.Input.PointerEvent) {
      if (ev.button === ex.Input.PointerButton.Left) {
        eventLeftFired = true;
      }
      if (ev.button === ex.Input.PointerButton.Right) {
        eventRightFired = true;
      }
      if (ev.button === ex.Input.PointerButton.Middle) {
        eventMiddleFired = true;
      }
    });

    executeMouseEvent('pointerup', <any>document, ex.Input.NativePointerButton.Left);
    executeMouseEvent('pointerup', <any>document, ex.Input.NativePointerButton.Right);
    executeMouseEvent('pointerup', <any>document, ex.Input.NativePointerButton.Middle);

    expect(eventLeftFired).toBeTruthy('left should fire');
    expect(eventRightFired).toBeTruthy('right should fire');
    expect(eventMiddleFired).toBeTruthy('middle should fire');
  });

  it('should fire pointermove events', () => {
    let eventMoveFired = false;

    engine.input.pointers.primary.on('move', function (ev: ex.Input.PointerEvent) {
      eventMoveFired = true;
    });

    executeMouseEvent('pointermove', <any>document);

    expect(eventMoveFired).toBeTruthy();
  });

  it('should update last position on down and move', () => {
    executeMouseEvent('pointerdown', <any>document, null, 10, 800);
    expect(engine.input.pointers.primary.lastPagePos.x).toBe(10);
    expect(engine.input.pointers.primary.lastPagePos.y).toBe(800);

    executeMouseEvent('pointermove', <any>document, null, 100, 200);

    expect(engine.input.pointers.primary.lastPagePos.x).toBe(100);
    expect(engine.input.pointers.primary.lastPagePos.y).toBe(200);

    executeMouseEvent('pointermove', <any>document, null, 300, 400);

    expect(engine.input.pointers.primary.lastPagePos.x).toBe(300);
    expect(engine.input.pointers.primary.lastPagePos.y).toBe(400);
  });

  it('should not throw when checking if actors are under pointer if no pointer events have happened yet', () => {
    const actor = new ex.Actor({ pos: new ex.Vector(50, 50), width: 100, height: 100 });
    expect(() => engine.input.pointers.primary.checkActorUnderPointer(actor)).not.toThrowError();
    expect(engine.input.pointers.primary.checkActorUnderPointer(actor)).toBe(false);
  });

  it('should return true when an actor is under the pointer', () => {
    const actor = new ex.Actor({ pos: new ex.Vector(50, 50), width: 100, height: 100 });
    executeMouseEvent('pointerdown', <any>document, null, 50, 50);

    expect(engine.input.pointers.primary.checkActorUnderPointer(actor)).toBe(true);
  });
  it('should only add actors under pointer that are in scene', () => {
    const actor = new ex.Actor({ pos: new ex.Vector(50, 50), width: 100, height: 100 });
    executeMouseEvent('pointerdown', <any>document, null, 50, 50);
    expect(engine.input.pointers.primary.isActorAliveUnderPointer(actor)).toBe(false);
  });
});
