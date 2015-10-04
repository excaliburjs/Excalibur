/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('A gamepad', () => {
   navigator = null;
   var engine;
   var mock = new Mocks.Mocker();
   beforeEach(() => {
      navigator = <any>mock.navigator();
      engine = mock.engine(600, 400, null);
      engine.input = {};
      engine.input.gamepads = new ex.Input.Gamepads(engine);
   });
   
   it('should fire an event on connect', () => {
      var fired = false;
      
      engine.input.gamepads.enabled = true;
      engine.input.gamepads.on('connect', (padEvent: ex.GamepadConnectEvent) => {
         fired = true;
      });
      
      engine.input.gamepads.update(100);
      
      expect(fired).toBe(false);
      
      (<any>navigator).setGamepads(0, 4, 16);
      
      engine.input.gamepads.update(100);
      
      expect(fired).toBe(true);      
      
   });
   
   it('should fire an event on disconnect', () => {
      var fired = false;
      engine.input.gamepads.enabled = true;
      engine.input.gamepads.on('disconnect', (padEvent: ex.GamepadConnectEvent) => {
         fired = true;
      });
      
      (<any>navigator).setGamepads(0, 4, 16);
      
      engine.input.gamepads.update(100);
      
      expect(fired).toBe(false);      
      
      (<any>navigator).deleteGamepad(0);
      
      engine.input.gamepads.update(100);
      
      expect(fired).toBe(true);      
      
   });
});