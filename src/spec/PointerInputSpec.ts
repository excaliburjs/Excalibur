/// <reference path="jasmine.d.ts" />

/// <reference path="TestUtils.ts" />

function executeMouseEvent(type: string, button: ex.Input.PointerButton, x: number, y: number, target: HTMLElement) {
   var mouseEvent = document.createEvent('MouseEvent');
   mouseEvent.initMouseEvent(type, true, true, document.defaultView, button, x, y, x, y,
       false, false, false, false, button, target);
   target.dispatchEvent(mouseEvent);
}

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

      executeMouseEvent('mousedown', ex.Input.PointerButton.Left, 0, 0, engine.canvas);
      executeMouseEvent('mousedown', ex.Input.PointerButton.Right, 0, 0,  engine.canvas);
      executeMouseEvent('mousedown', ex.Input.PointerButton.Middle, 0, 0, engine.canvas);


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

      executeMouseEvent('mouseup', ex.Input.PointerButton.Left, 0, 0, engine.canvas);
      executeMouseEvent('mouseup', ex.Input.PointerButton.Right, 0, 0,  engine.canvas);
      executeMouseEvent('mouseup', ex.Input.PointerButton.Middle, 0, 0, engine.canvas);

      expect(eventLeftFired).toBeTruthy();
      expect(eventRightFired).toBeTruthy();
      expect(eventMiddleFired).toBeTruthy();
   });

   it('should fire mousemove events', () => {
      var eventMoveFired = false;

      pointers.primary.on('move', function(ev: ex.Input.PointerEvent) {
         eventMoveFired = true;
      });

      executeMouseEvent('mousemove', null, 0, 0, engine.canvas);

      expect(eventMoveFired).toBeTruthy();
   });

   it('should update last position', () => {
      executeMouseEvent('mousemove', null, 100, 200, engine.canvas);

      expect(pointers.primary.lastPagePos.x).toBe(100);
      expect(pointers.primary.lastPagePos.y).toBe(200);

      executeMouseEvent('mousemove', null, 300, 400, engine.canvas);


      expect(pointers.primary.lastPagePos.x).toBe(300);
      expect(pointers.primary.lastPagePos.y).toBe(400);
   });

});
