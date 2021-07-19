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
    engine = TestUtils.engine({
      pointerScope: ex.Input.PointerScope.Document
    });
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

  it('should dispatch events in z order high to low', () => {
    const actualOrder = [];

    const actor1 = new ex.Actor({ x: 50, y: 50, width: 100, height: 100 });
    actor1.z = 0;
    actor1.on('pointerdown', (e) => {
      actualOrder.push('actor1');
    });
    const actor2 = new ex.Actor({ x: 50, y: 50, width: 100, height: 100 });
    actor2.z = 1;
    actor2.on('pointerdown', (e) => {
      actualOrder.push('actor2');
    });
    const actor3 = new ex.Actor({ x: 50, y: 50, width: 100, height: 100 });
    actor3.z = 2;
    actor3.on('pointerdown', (e) => {
      actualOrder.push('actor3');
    });
    const actor4 = new ex.Actor({ x: 50, y: 50, width: 100, height: 100 });
    actor4.z = 3;
    actor4.on('pointerdown', (e) => {
      actualOrder.push('actor4');
    });

    engine.input.pointers.primary.addActorUnderPointer(actor1);
    engine.input.pointers.primary.addActorUnderPointer(actor2);
    engine.input.pointers.primary.addActorUnderPointer(actor3);
    engine.input.pointers.primary.addActorUnderPointer(actor4);

    executeMouseEvent('pointerdown', <any>document, null, 50, 50);

    engine.input.pointers.dispatchPointerEvents();

    expect(actualOrder).toEqual(['actor4', 'actor3', 'actor2', 'actor1']);
  });

  it('can have pointer event canceled', () => {
    const actualOrder = [];

    const actor1 = new ex.Actor({ x: 50, y: 50, width: 100, height: 100 });
    actor1.z = 0;
    actor1.on('pointerdown', (e) => {
      actualOrder.push('actor1');
    });
    const actor2 = new ex.Actor({ x: 50, y: 50, width: 100, height: 100 });
    actor2.z = 1;
    actor2.on('pointerdown', (e) => {
      actualOrder.push('actor2');
    });
    const actor3 = new ex.Actor({ x: 50, y: 50, width: 100, height: 100 });
    actor3.z = 2;
    actor3.on('pointerdown', (e) => {
      actualOrder.push('actor3');
      e.cancel();
    });
    const actor4 = new ex.Actor({ x: 50, y: 50, width: 100, height: 100 });
    actor4.z = 3;
    actor4.on('pointerdown', (e) => {
      actualOrder.push('actor4');
    });

    engine.input.pointers.primary.addActorUnderPointer(actor1);
    engine.input.pointers.primary.addActorUnderPointer(actor2);
    engine.input.pointers.primary.addActorUnderPointer(actor3);
    engine.input.pointers.primary.addActorUnderPointer(actor4);

    executeMouseEvent('pointerdown', <any>document, null, 50, 50);

    engine.input.pointers.dispatchPointerEvents();

    expect(actualOrder).toEqual(['actor4', 'actor3']);
  });

  describe('at the engine level', () => {
    it('should fire pointer up events', () => {
      const upHandler = jasmine.createSpy('upHandler');
      engine.input.pointers.on('up', upHandler);

      executeMouseEvent('pointerup', <any>document, null, 50, 50);
      expect(upHandler).toHaveBeenCalledTimes(1);
    });

    it('should fire pointer down events', () => {
      const downHandler = jasmine.createSpy('downHandler');
      engine.input.pointers.on('down', downHandler);

      executeMouseEvent('pointerdown', <any>document, null, 50, 50);
      expect(downHandler).toHaveBeenCalledTimes(1);
    });

    it('should fire pointer move events', () => {
      const moveHandler = jasmine.createSpy('moveHandler');
      engine.input.pointers.on('move', moveHandler);

      executeMouseEvent('pointermove', <any>document, null, 50, 50);
      expect(moveHandler).toHaveBeenCalledTimes(1);
    });

    it('should fire wheel events', () => {
      const wheelHandler = jasmine.createSpy('wheelHandler');
      engine.input.pointers.on('wheel', wheelHandler);

      executeMouseEvent('wheel', <any>document, null, 50, 50);
      expect(wheelHandler).toHaveBeenCalledTimes(1);
    });
  });
});
