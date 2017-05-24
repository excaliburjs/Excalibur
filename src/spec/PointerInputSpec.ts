/// <reference path="jasmine.d.ts" />

/// <reference path="Mocks.ts" />

describe('A pointer', () => {
   
   var mockWindow = null;
   var engine: ex.Engine = null;
   var pointers: ex.Input.Pointers = null;
   var mocker = new Mocks.Mocker();
   var noop = () => { return null; };

   beforeEach(() => {
      mockWindow = <any>mocker.window();
      engine = mocker.engine(600, 400);
      pointers = new ex.Input.Pointers(engine);
      pointers.init(mockWindow);
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

      (<any>mockWindow).emit('mousedown', {pageX: 0, pageY: 0, button: ex.Input.PointerButton.Left, preventDefault: noop});
      (<any>mockWindow).emit('mousedown', {pageX: 0, pageY: 0, button: ex.Input.PointerButton.Right, preventDefault: noop});
      (<any>mockWindow).emit('mousedown', {pageX: 0, pageY: 0, button: ex.Input.PointerButton.Middle, preventDefault: noop});

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

      (<any>mockWindow).emit('mouseup', {pageX: 0, pageY: 0, button: ex.Input.PointerButton.Left, preventDefault: noop});
      (<any>mockWindow).emit('mouseup', {pageX: 0, pageY: 0, button: ex.Input.PointerButton.Right, preventDefault: noop});
      (<any>mockWindow).emit('mouseup', {pageX: 0, pageY: 0, button: ex.Input.PointerButton.Middle, preventDefault: noop});

      expect(eventLeftFired).toBeTruthy();
      expect(eventRightFired).toBeTruthy();
      expect(eventMiddleFired).toBeTruthy();
   });

   it('should fire mousemove events', () => {
      var eventMoveFired = false;

      pointers.primary.on('move', function(ev: ex.Input.PointerEvent) {
         eventMoveFired = true;
      });

      (<any>mockWindow).emit('mousemove', {pageX: 0, pageY: 0, preventDefault: noop});

      expect(eventMoveFired).toBeTruthy();
   });

   it('should update last position', () => {
      (<any>mockWindow).emit('mousemove', {pageX: 100, pageY: 200, preventDefault: noop});

      expect(pointers.primary.lastPagePos.x).toBe(100);
      expect(pointers.primary.lastPagePos.y).toBe(200);

      (<any>mockWindow).emit('mousemove', {pageX: 300, pageY: 400, preventDefault: noop});

      expect(pointers.primary.lastPagePos.x).toBe(300);
      expect(pointers.primary.lastPagePos.y).toBe(400);
   });

});
