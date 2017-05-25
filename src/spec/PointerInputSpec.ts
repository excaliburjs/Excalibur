/// <reference path="jasmine.d.ts" />

/// <reference path="TestUtils.ts" />

describe('A pointer', () => {

   var engine: ex.Engine = null;
   var pointers: ex.Input.Pointers = null;

   beforeEach(() => {
      engine = TestUtils.engine();
      engine.start();
      pointers = new ex.Input.Pointers(engine);
      pointers.init();
   });

   afterEach(() => {
      engine.stop();
   });
   
   it('should exist', () => {
      expect(ex.Input.Pointers).toBeDefined();
      expect(pointers).toBeTruthy();
   });
   
   it('should fire mousedown events', () => {
      var eventLeftFired = false;
      var eventRightFired = false;
      var eventMiddleFired = false;
      
      pointers.primary.on('down', function(ev: ex.Input.PointerEvent) {
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

      var mousedownEventLeft = document.createEvent('MouseEvent');
      mousedownEventLeft.initMouseEvent('mousedown', true, true, document.defaultView, ex.Input.PointerButton.Left, 0, 0, 0, 0,
          false, false, false, false, ex.Input.PointerButton.Left, engine.canvas);
      var mousedownEventRight = document.createEvent('MouseEvent');
      mousedownEventRight.initMouseEvent('mousedown', true, true, document.defaultView, ex.Input.PointerButton.Right, 0, 0, 0, 0,
          false, false, false, false, ex.Input.PointerButton.Right, engine.canvas);
      var mousedownEventMiddle = document.createEvent('MouseEvent');
      mousedownEventMiddle.initMouseEvent('mousedown', true, true, document.defaultView, ex.Input.PointerButton.Middle, 0, 0, 0, 0,
          false, false, false, false, ex.Input.PointerButton.Middle, engine.canvas);


      engine.canvas.dispatchEvent(mousedownEventLeft);
      engine.canvas.dispatchEvent(mousedownEventRight);
      engine.canvas.dispatchEvent(mousedownEventMiddle);


      expect(eventLeftFired).toBeTruthy();
      expect(eventRightFired).toBeTruthy();
      expect(eventMiddleFired).toBeTruthy();
   });
   
   it('should fire mouseup events', () => {
      var eventLeftFired = false;
      var eventRightFired = false;
      var eventMiddleFired = false;

      pointers.primary.on('up', function(ev: ex.Input.PointerEvent) {
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

      var mouseupEventLeft = document.createEvent('MouseEvent');
      mouseupEventLeft.initMouseEvent('mouseup', true, true, document.defaultView, ex.Input.PointerButton.Left, 0, 0, 0, 0,
          false, false, false, false, ex.Input.PointerButton.Left, engine.canvas);
      var mouseupEventRight = document.createEvent('MouseEvent');
      mouseupEventRight.initMouseEvent('mouseup', true, true, document.defaultView, ex.Input.PointerButton.Right, 0, 0, 0, 0,
          false, false, false, false, ex.Input.PointerButton.Right, engine.canvas);
      var mouseupEventMiddle = document.createEvent('MouseEvent');
      mouseupEventMiddle.initMouseEvent('mouseup', true, true, document.defaultView, ex.Input.PointerButton.Middle, 0, 0, 0, 0,
          false, false, false, false, ex.Input.PointerButton.Middle, engine.canvas);


      engine.canvas.dispatchEvent(mouseupEventLeft);
      engine.canvas.dispatchEvent(mouseupEventRight);
      engine.canvas.dispatchEvent(mouseupEventMiddle);

      expect(eventLeftFired).toBeTruthy();
      expect(eventRightFired).toBeTruthy();
      expect(eventMiddleFired).toBeTruthy();
   });

   it('should fire mousemove events', () => {
      var eventMoveFired = false;

      pointers.primary.on('move', function(ev: ex.Input.PointerEvent) {
         eventMoveFired = true;
      });

      var mousemoveEvent = document.createEvent('MouseEvent');
      mousemoveEvent.initMouseEvent('mousemove', true, true, document.defaultView, null, 0, 0, 0, 0,
          false, false, false, false, null, engine.canvas);
      engine.canvas.dispatchEvent(mousemoveEvent);

      expect(eventMoveFired).toBeTruthy();
   });

   it('should update last position', () => {
      var mousemoveEvent = document.createEvent('MouseEvent');
      mousemoveEvent.initMouseEvent('mousemove', true, true, document.defaultView, null, 100, 200, 100, 200,
          false, false, false, false, null, engine.canvas);
      engine.canvas.dispatchEvent(mousemoveEvent);

      expect(pointers.primary.lastPagePos.x).toBe(100);
      expect(pointers.primary.lastPagePos.y).toBe(200);

      mousemoveEvent = document.createEvent('MouseEvent');
      mousemoveEvent.initMouseEvent('mousemove', true, true, document.defaultView, null, 300, 400, 300, 400,
          false, false, false, false, null, engine.canvas);
      engine.canvas.dispatchEvent(mousemoveEvent);


      expect(pointers.primary.lastPagePos.x).toBe(300);
      expect(pointers.primary.lastPagePos.y).toBe(400);
   });

});
