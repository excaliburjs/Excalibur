/// <reference path="TestUtils.ts" />

describe('A pointer', () => {

   var engine: ex.Engine = null;

   function executeMouseEvent(type: string,
                              target: HTMLElement,
                              button: ex.Input.PointerButton = null,
                              x: number = 0,
                              y: number = 0) {
      // var mouseEvent = document.createEvent('MouseEvent');
      // mouseEvent.initMouseEvent(type, true, true, document.defaultView, button, x, y, x, y,
      //     false, false, false, false, button, target);

      var evt = new PointerEvent(type, {
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

   it('should detect pointer event', () => {
      expect((<any>window).PointerEvent).toBeDefined();
   });
   
   it('should fire pointerdown events', () => {
      var eventLeftFired = false;
      var eventRightFired = false;
      var eventMiddleFired = false;
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

      executeMouseEvent('pointerdown', <any>document, ex.Input.PointerButton.Left);
      executeMouseEvent('pointerdown', <any>document, ex.Input.PointerButton.Right);
      executeMouseEvent('pointerdown', <any>document, ex.Input.PointerButton.Middle);


      expect(eventLeftFired).toBe(true);
      expect(eventRightFired).toBe(true);
      expect(eventMiddleFired).toBe(true);
   });
   
   it('should fire pointerup events', () => {
      var eventLeftFired = false;
      var eventRightFired = false;
      var eventMiddleFired = false;

      engine.input.pointers.primary.on('up', function(ev: ex.Input.PointerEvent) {
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

      executeMouseEvent('pointerup', <any>document, ex.Input.PointerButton.Left);
      executeMouseEvent('pointerup', <any>document, ex.Input.PointerButton.Right);
      executeMouseEvent('pointerup', <any>document, ex.Input.PointerButton.Middle);

      expect(eventLeftFired).toBeTruthy();
      expect(eventRightFired).toBeTruthy();
      expect(eventMiddleFired).toBeTruthy();
   });

   it('should fire pointermove events', () => {
      var eventMoveFired = false;

      engine.input.pointers.primary.on('move', function(ev: ex.Input.PointerEvent) {
         eventMoveFired = true;
      });

      executeMouseEvent('pointermove', <any>document);

      expect(eventMoveFired).toBeTruthy();
   });

   it('should update last position', () => {
      executeMouseEvent('pointermove', <any>document, null, 100, 200);

      expect(engine.input.pointers.primary.lastPagePos.x).toBe(100);
      expect(engine.input.pointers.primary.lastPagePos.y).toBe(200);

      executeMouseEvent('pointermove', <any>document, null, 300, 400);


      expect(engine.input.pointers.primary.lastPagePos.x).toBe(300);
      expect(engine.input.pointers.primary.lastPagePos.y).toBe(400);
   });

});
