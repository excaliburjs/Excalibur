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
  function executeMouseEvent(type: string, target: HTMLElement, button: ex.NativePointerButton = null, x: number = 0, y: number = 0) {
    const evt = new PointerEvent(type, {
      clientX: x,
      clientY: y,
      button: button
    });

    target.dispatchEvent(evt);
  }

  beforeEach(() => {
    engine = TestUtils.engine({
      pointerScope: ex.PointerScope.Document
    });
    engine.start();

    const clock = engine.clock as ex.TestClock;
    clock.step(1);
  });

  afterEach(() => {
    engine.stop();
  });

  it('should detect pointer event', () => {
    expect((<any>window).PointerEvent).toBeDefined();
  });

  it('should fire pointerdown events', () => {
    let eventLeftFired = false;
    let eventRightFired = false;
    let eventMiddleFired = false;
    engine.input.pointers.primary.on('down', (ev: ex.PointerEvent) => {
      if (ev.button === ex.PointerButton.Left) {
        eventLeftFired = true;
      }
      if (ev.button === ex.PointerButton.Right) {
        eventRightFired = true;
      }
      if (ev.button === ex.PointerButton.Middle) {
        eventMiddleFired = true;
      }
    });

    executeMouseEvent('pointerdown', <any>document, ex.NativePointerButton.Left);
    executeMouseEvent('pointerdown', <any>document, ex.NativePointerButton.Right);
    executeMouseEvent('pointerdown', <any>document, ex.NativePointerButton.Middle);
    // process pointer events
    engine.currentScene.update(engine, 0);

    expect(eventLeftFired).toBe(true, 'left should fire');
    expect(eventRightFired).toBe(true, 'right should fire');
    expect(eventMiddleFired).toBe(true, 'middle should fire');
  });

  it('should fire pointerup events', () => {
    let eventLeftFired = false;
    let eventRightFired = false;
    let eventMiddleFired = false;

    engine.input.pointers.primary.on('up', function (ev: ex.PointerEvent) {
      if (ev.button === ex.PointerButton.Left) {
        eventLeftFired = true;
      }
      if (ev.button === ex.PointerButton.Right) {
        eventRightFired = true;
      }
      if (ev.button === ex.PointerButton.Middle) {
        eventMiddleFired = true;
      }
    });

    executeMouseEvent('pointerup', <any>document, ex.NativePointerButton.Left);
    executeMouseEvent('pointerup', <any>document, ex.NativePointerButton.Right);
    executeMouseEvent('pointerup', <any>document, ex.NativePointerButton.Middle);
    // process pointer events
    engine.currentScene.update(engine, 0);

    expect(eventLeftFired).toBeTruthy('left should fire');
    expect(eventRightFired).toBeTruthy('right should fire');
    expect(eventMiddleFired).toBeTruthy('middle should fire');
  });

  it('should fire pointermove events', () => {
    let eventMoveFired = false;

    engine.input.pointers.primary.on('move', function (ev: ex.PointerEvent) {
      eventMoveFired = true;
    });

    executeMouseEvent('pointermove', <any>document);
    // process pointer events
    engine.currentScene.update(engine, 0);

    expect(eventMoveFired).toBeTruthy();
  });

  it('should update last position on down and move', () => {
    executeMouseEvent('pointerdown', <any>document, null, 10, 800);
    // process pointer events
    engine.currentScene.update(engine, 0);
    expect(engine.input.pointers.primary.lastPagePos.x).toBe(10);
    expect(engine.input.pointers.primary.lastPagePos.y).toBe(800);

    executeMouseEvent('pointermove', <any>document, null, 100, 200);
    // process pointer events
    engine.currentScene.update(engine, 0);

    expect(engine.input.pointers.primary.lastPagePos.x).toBe(100);
    expect(engine.input.pointers.primary.lastPagePos.y).toBe(200);

    executeMouseEvent('pointermove', <any>document, null, 300, 400);
    // process pointer events
    engine.currentScene.update(engine, 0);

    expect(engine.input.pointers.primary.lastPagePos.x).toBe(300);
    expect(engine.input.pointers.primary.lastPagePos.y).toBe(400);
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

    engine.add(actor1);
    engine.add(actor2);
    engine.add(actor3);
    engine.add(actor4);

    executeMouseEvent('pointerdown', <any>document, null, 50, 50);

    // process pointer events
    engine.currentScene.update(engine, 0);

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

    engine.add(actor1);
    engine.add(actor2);
    engine.add(actor3);
    engine.add(actor4);

    executeMouseEvent('pointerdown', <any>document, null, 50, 50);

    // process pointer events
    engine.currentScene.update(engine, 0);

    expect(actualOrder).toEqual(['actor4', 'actor3']);
  });

  it('can click on screen locked actors', () => {
    const clickSpy = jasmine.createSpy('down');
    const actor1 = new ex.Actor({
      pos: ex.vec(50, 50),
      width: 100,
      height: 100
    });
    actor1.transform.coordPlane = ex.CoordPlane.Screen;
    actor1.on('pointerdown', clickSpy);
    engine.currentScene.camera.pos = ex.vec(1000, 1000);
    engine.currentScene.camera.draw(engine.graphicsContext);

    engine.add(actor1);

    executeMouseEvent('pointerdown', <any>document, null, 50, 50);

    engine.currentScene.update(engine, 0);
    // process pointer events
    expect(clickSpy).toHaveBeenCalled();
  });

  describe('at the engine level', () => {
    it('should fire pointer up events', () => {
      const upHandler = jasmine.createSpy('upHandler');
      engine.input.pointers.on('up', upHandler);

      executeMouseEvent('pointerup', <any>document, null, 50, 50);

      // process pointer events
      engine.currentScene.update(engine, 0);

      expect(upHandler).toHaveBeenCalledTimes(1);
    });

    it('should fire pointer down events', () => {
      const downHandler = jasmine.createSpy('downHandler');
      engine.input.pointers.on('down', downHandler);

      executeMouseEvent('pointerdown', <any>document, null, 50, 50);

      // process pointer events
      engine.currentScene.update(engine, 0);

      expect(downHandler).toHaveBeenCalledTimes(1);
    });

    it('should fire pointer move events', () => {
      const moveHandler = jasmine.createSpy('moveHandler');
      engine.input.pointers.on('move', moveHandler);

      executeMouseEvent('pointermove', <any>document, null, 50, 50);

      // process pointer events
      engine.currentScene.update(engine, 0);

      expect(moveHandler).toHaveBeenCalledTimes(1);
    });

    it('should fire wheel events', () => {
      const wheelHandler = jasmine.createSpy('wheelHandler');
      engine.input.pointers.on('wheel', wheelHandler);

      executeMouseEvent('wheel', <any>document, null, 50, 50);

      // process pointer events
      engine.currentScene.update(engine, 0);

      expect(wheelHandler).toHaveBeenCalledTimes(1);
    });
  });
});
