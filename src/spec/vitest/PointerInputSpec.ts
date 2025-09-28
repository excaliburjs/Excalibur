import * as ex from '@excalibur';
import { TestUtils } from '../__util__/TestUtils';

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

  beforeEach(async () => {
    engine = TestUtils.engine({
      pointerScope: ex.PointerScope.Document
    });
    await TestUtils.runToReady(engine);

    const clock = engine.clock as ex.TestClock;
    clock.step(1);
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
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

    expect(eventLeftFired, 'left should fire').toBe(true);
    expect(eventRightFired, 'right should fire').toBe(true);
    expect(eventMiddleFired, 'middle should fire').toBe(true);
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

    expect(eventLeftFired, 'left should fire').toBeTruthy();
    expect(eventRightFired, 'right should fire').toBeTruthy();
    expect(eventMiddleFired, 'middle should fire').toBeTruthy();
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

  it('should not dispatch canceled events to the top level', () => {
    const actor1 = new ex.Actor({ x: 50, y: 50, width: 100, height: 100 });

    const spyActorDown = vi.fn();
    actor1.on('pointerdown', (e) => {
      spyActorDown();
      e.cancel();
    });
    const spyActorUp = vi.fn();
    actor1.on('pointerup', (e) => {
      spyActorUp();
      e.cancel();
    });
    const spyActorMove = vi.fn();
    actor1.on('pointermove', (e) => {
      spyActorMove();
      e.cancel();
    });
    const spyActorWheel = vi.fn();
    actor1.on('pointerwheel', (e) => {
      spyActorWheel();
      e.cancel();
    });
    engine.add(actor1);

    const spyTopLevelPointerDown = vi.fn();
    engine.input.pointers.primary.on('down', spyTopLevelPointerDown);
    engine.input.pointers.on('down', spyTopLevelPointerDown);
    const spyTopLevelPointerUp = vi.fn();
    engine.input.pointers.primary.on('up', spyTopLevelPointerUp);
    engine.input.pointers.on('up', spyTopLevelPointerUp);
    const spyTopLevelPointerMove = vi.fn();
    engine.input.pointers.primary.on('move', spyTopLevelPointerMove);
    engine.input.pointers.on('move', spyTopLevelPointerMove);
    const spyTopLevelPointerWheel = vi.fn();
    engine.input.pointers.primary.on('wheel', spyTopLevelPointerWheel);
    engine.input.pointers.on('wheel', spyTopLevelPointerWheel);

    executeMouseEvent('pointerdown', <any>document, null, 50, 50);
    executeMouseEvent('pointerup', <any>document, null, 50, 50);
    executeMouseEvent('pointermove', <any>document, null, 50, 50);
    executeMouseEvent('wheel', <any>document, null, 50, 50);

    // process pointer events
    engine.currentScene.update(engine, 0);

    expect(spyActorDown).toHaveBeenCalledTimes(1);
    expect(spyTopLevelPointerDown).not.toHaveBeenCalled();

    expect(spyActorUp).toHaveBeenCalledTimes(1);
    expect(spyTopLevelPointerUp).not.toHaveBeenCalled();

    expect(spyActorMove).toHaveBeenCalledTimes(1);
    expect(spyTopLevelPointerMove).not.toHaveBeenCalled();

    expect(spyActorWheel).toHaveBeenCalledTimes(1);
    expect(spyTopLevelPointerWheel).not.toHaveBeenCalled();
  });

  it('should update the pointer pos when the camera moves', () => {
    const oldMargin = document.body.style.margin;
    const oldPadding = document.body.style.padding;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    executeMouseEvent('pointerdown', <any>document, null, 10, 10);
    engine.currentScene.update(engine, 0);
    expect(engine.input.pointers.primary.lastWorldPos).toEqual(ex.vec(10, 10));
    expect(engine.input.pointers.primary.lastScreenPos).toEqual(ex.vec(10, 10));
    expect(engine.input.pointers.primary.lastPagePos).toEqual(ex.vec(10, 10));

    expect(engine.currentScene.camera.hasChanged()).toBe(false);
    engine.currentScene.camera.pos = ex.vec(1000, 1000);
    expect(engine.currentScene.camera.hasChanged()).toBe(true);
    engine.currentScene.update(engine, 0);
    expect(engine.input.pointers.primary.lastWorldPos).toEqual(ex.vec(760, 760));
    expect(engine.input.pointers.primary.lastScreenPos).toEqual(ex.vec(10, 10));
    expect(engine.input.pointers.primary.lastPagePos).toEqual(ex.vec(10, 10));

    document.body.style.margin = oldMargin;
    document.body.style.padding = oldPadding;
  });

  it('should dispatch point events on screen elements', () => {
    const pointerDownSpy = vi.fn();
    const screenElement = new ex.ScreenElement({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      color: ex.Color.Red
    });
    screenElement.on('pointerdown', pointerDownSpy);

    engine.add(screenElement);

    executeMouseEvent('pointerdown', <any>document, null, 50, 50);
    executeMouseEvent('pointerdown', <any>document, null, 50, 150);
    executeMouseEvent('pointerdown', <any>document, null, 150, 50);
    executeMouseEvent('pointerdown', <any>document, null, 150, 150);
    executeMouseEvent('pointerdown', <any>document, null, 100, 100);

    engine.currentScene.update(engine, 0);

    expect(pointerDownSpy).toHaveBeenCalledTimes(5);

    pointerDownSpy.mockReset();

    executeMouseEvent('pointerdown', <any>document, null, 49, 49);
    executeMouseEvent('pointerdown', <any>document, null, 49, 151);
    executeMouseEvent('pointerdown', <any>document, null, 151, 49);
    executeMouseEvent('pointerdown', <any>document, null, 151, 151);

    engine.currentScene.update(engine, 0);

    expect(pointerDownSpy).toHaveBeenCalledTimes(0);
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
    const clickSpy = vi.fn();
    const actor1 = new ex.Actor({
      pos: ex.vec(50, 50),
      width: 100,
      height: 100,
      coordPlane: ex.CoordPlane.Screen
    });
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
      const upHandler = vi.fn();
      engine.input.pointers.on('up', upHandler);

      executeMouseEvent('pointerup', <any>document, null, 50, 50);

      // process pointer events
      engine.currentScene.update(engine, 0);

      expect(upHandler).toHaveBeenCalledTimes(1);
    });

    it('should fire pointer down events', () => {
      const downHandler = vi.fn();
      engine.input.pointers.on('down', downHandler);

      executeMouseEvent('pointerdown', <any>document, null, 50, 50);

      // process pointer events
      engine.currentScene.update(engine, 0);

      expect(downHandler).toHaveBeenCalledTimes(1);
    });

    it('should fire pointer move events', () => {
      const moveHandler = vi.fn();
      engine.input.pointers.on('move', moveHandler);

      executeMouseEvent('pointermove', <any>document, null, 50, 50);

      // process pointer events
      engine.currentScene.update(engine, 0);

      expect(moveHandler).toHaveBeenCalledTimes(1);
    });

    it('should fire wheel events', () => {
      const wheelHandler = vi.fn();
      engine.input.pointers.on('wheel', wheelHandler);

      executeMouseEvent('wheel', <any>document, null, 50, 50);

      // process pointer events
      engine.currentScene.update(engine, 0);

      expect(wheelHandler).toHaveBeenCalledTimes(1);
    });
  });
});
