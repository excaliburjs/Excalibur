/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('A keyboard', () => {
   window = null;
   var engine = null;
   var keyboard: ex.Input.Keyboard = null;
   var mocker = new Mocks.Mocker();
   beforeEach(() => {
      window = <any>mocker.window();
      engine = mocker.engine(600, 400, null);
      keyboard = new ex.Input.Keyboard(engine);
      keyboard.init();
   });
   
   it('should exist', () => {
      expect(ex.Input.Keyboard).toBeDefined();
      expect(keyboard).toBeTruthy();
   });
   
   it('should fire keydown events', () => {
      var eventFired = false;
      
      keyboard.on('down', function(ev: ex.Input.KeyEvent) {
         if (ev.key === ex.Input.Keys.Up) {
            eventFired = true;
         }
      });
      
      (<any>window).emit('keydown', {keyCode: ex.Input.Keys.Up});
      
      expect(eventFired).toBeTruthy();
   });
   
   it('should fire keyup events', () => {
      var eventFired = false;
      
      keyboard.on('up', function(ev: ex.Input.KeyEvent) {
         if (ev.key === ex.Input.Keys.Up) {
            eventFired = true;
         }
      });
      
      (<any>window).emit('keyup', {keyCode: ex.Input.Keys.Up});
      
      expect(eventFired).toBeTruthy();
   });
   
   it('should know if keys are pressed', () => {
      // push key down
      (<any>window).emit('keydown', {keyCode: ex.Input.Keys.Up});
      
      expect(keyboard.isKeyDown(ex.Input.Keys.Up)).toBeTruthy();
      expect(keyboard.isKeyUp(ex.Input.Keys.Up)).toBeFalsy();
      expect(keyboard.isKeyPressed(ex.Input.Keys.Up)).toBeTruthy();
      expect(keyboard.isKeyUp(ex.Input.Keys.Up)).toBeFalsy();
            
      // release key
      (<any>window).emit('keyup', {keyCode: ex.Input.Keys.Up});
      
      expect(keyboard.getKeys().length).toBe(0);
      expect(keyboard.isKeyUp(ex.Input.Keys.Up)).toBeTruthy();
      expect(keyboard.isKeyPressed(ex.Input.Keys.Up)).toBeFalsy();
   });
      
   it('should have keys stay pressed until released', () => {
       // push key down
      (<any>window).emit('keydown', {keyCode: ex.Input.Keys.Up});
      (<any>window).emit('keydown', {keyCode: ex.Input.Keys.Down});
      
      keyboard.update(200);
      
      // release key
      (<any>window).emit('keyup', {keyCode: ex.Input.Keys.Up});
      
      expect(keyboard.isKeyPressed(ex.Input.Keys.Down)).toBeTruthy();
      expect(keyboard.isKeyUp(ex.Input.Keys.Up)).toBeTruthy();
      
      keyboard.update(200);
      
      // release key
      (<any>window).emit('keyup', {keyCode: ex.Input.Keys.Down});
      
      expect(keyboard.isKeyPressed(ex.Input.Keys.Down)).toBeFalsy();
      
   });

});