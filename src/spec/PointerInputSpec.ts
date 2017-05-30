/// <reference path="jasmine.d.ts" />

/// <reference path="TestUtils.ts" />

describe('A pointer', () => {

   var engine: ex.Engine = null;
   var pointers: ex.Input.Pointers = null;

   function executeMouseEvent(type: string,
                              button: ex.Input.PointerButton = null,
                              x: number = 0,
                              y: number = 0,
                              target: HTMLElement = engine.canvas) {
      var mouseEvent = document.createEvent('MouseEvent');
      mouseEvent.initMouseEvent(type, true, true, document.defaultView, button, x, y, x, y,
          false, false, false, false, button, target);
      target.dispatchEvent(mouseEvent);
   }

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

      executeMouseEvent('mousedown', ex.Input.PointerButton.Left);
      executeMouseEvent('mousedown', ex.Input.PointerButton.Right);
      executeMouseEvent('mousedown', ex.Input.PointerButton.Middle);


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

      executeMouseEvent('mouseup', ex.Input.PointerButton.Left);
      executeMouseEvent('mouseup', ex.Input.PointerButton.Right);
      executeMouseEvent('mouseup', ex.Input.PointerButton.Middle);

      expect(eventLeftFired).toBeTruthy();
      expect(eventRightFired).toBeTruthy();
      expect(eventMiddleFired).toBeTruthy();
   });

   it('should fire mousemove events', () => {
      var eventMoveFired = false;

      pointers.primary.on('move', function(ev: ex.Input.PointerEvent) {
         eventMoveFired = true;
      });

      executeMouseEvent('mousemove');

      expect(eventMoveFired).toBeTruthy();
   });

   it('should update last position', () => {
      executeMouseEvent('mousemove', null, 100, 200);

      expect(pointers.primary.lastPagePos.x).toBe(100);
      expect(pointers.primary.lastPagePos.y).toBe(200);

      executeMouseEvent('mousemove', null, 300, 400);


      expect(pointers.primary.lastPagePos.x).toBe(300);
      expect(pointers.primary.lastPagePos.y).toBe(400);
   });

});
