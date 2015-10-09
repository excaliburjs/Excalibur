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
   
   it('should be implicitly enabled when an event is added', () => {
      expect(engine.input.gamepads.enabled).toBe(false);
      engine.input.gamepads.on('disconnect', (padEvent: ex.GamepadConnectEvent) => {
         // do something awesome
      });
      expect(engine.input.gamepads.enabled).toBe(true);
   });
   
   it('should be implicitly enabled when an event is removed', () => {
      expect(engine.input.gamepads.enabled).toBe(false);
      engine.input.gamepads.off('disconnect');
      expect(engine.input.gamepads.enabled).toBe(true);
   });
   
   it('should be implicitly enabled when a minimum config is add', () => {
      expect(engine.input.gamepads.enabled).toBe(false);
      engine.input.gamepads.setMinimumGamepadConfiguration({axis: 2, buttons: 4});
      expect(engine.input.gamepads.enabled).toBe(true);
   });
   
   it('should be implicitly enabled when a specific pad is requested', () => {
      expect(engine.input.gamepads.enabled).toBe(false);
      engine.input.gamepads.at(0);
      expect(engine.input.gamepads.enabled).toBe(true);
   });
   
   it('should be of a valid configuration', () => {
      (<any>navigator).setGamepads(0, 4, 16); // valid 4 axis > 2 and 16 buttons > 4
      (<any>navigator).setGamepads(1, 0, 16); // invalid 0 < 4 axis
      (<any>navigator).setGamepads(2, 4, 2); // invalid 2 buttons < 4 buttons
      (<any>navigator).setGamepads(3, 2, 4); // valid 2=2 axis and 4=4 axis
      engine.input.gamepads.setMinimumGamepadConfiguration({axis: 2, buttons: 4});
                  
      var validGamepads = engine.input.gamepads.getValidGamepads();
      expect(validGamepads.length).toBe(2);      
      
   });
   
   it('should fire events on all predefined buttons', () => {
      (<any>navigator).setGamepads(0, 4, 16); // valid 4 axis > 2 and 16 buttons > 4
      
      var gamepad = engine.input.gamepads.at(0);
      
      var currentButton = null;
      var currentValue = null;
      
      gamepad.on('button', (buttonEvent: ex.Input.GamepadButtonEvent) => {
         currentButton = buttonEvent.button;
         currentValue = buttonEvent.value;
      });
      
      expect(currentButton).toBeNull();
      expect(currentValue).toBeNull();
                  
      for(var button in ex.Input.Buttons) {
         if(typeof button === 'number') {
            
            engine.input.gamepads.update(100);
            (<any>navigator).setGamepadButton(0, button, 1.0);
            engine.input.gamepads.update(100);
            expect(currentButton).toBe(button);
            expect(currentValue).toBe(1.0);
         }
      }
   });
   
   it('should fire events on all predefined axis', () => {
      (<any>navigator).setGamepads(0, 4, 16); // valid 4 axis > 2 and 16 buttons > 4
      
      var gamepad = engine.input.gamepads.at(0);
      
      var currentAxis = null;
      var currentValue = null;
      gamepad.on('axis', (axisEvent: ex.Input.GamepadAxisEvent) => {
         currentAxis = axisEvent.axis;
         currentValue = axisEvent.value;
      });
      
      expect(currentAxis).toBeNull();
      expect(currentValue).toBeNull();
      
      engine.input.gamepads.update(100);
      (<any>navigator).setGamepadAxis(0, 0,  .5);
      engine.input.gamepads.update(100);
      
      expect(currentAxis).toBe(0);
      expect(currentValue).toBe(.5);
      
      engine.input.gamepads.update(100);
      (<any>navigator).setGamepadAxis(0, 1,  -.5);
      engine.input.gamepads.update(100);
      
      expect(currentAxis).toBe(1);
      expect(currentValue).toBe(-.5);
      
      engine.input.gamepads.update(100);
      (<any>navigator).setGamepadAxis(0, 2,  .5);
      engine.input.gamepads.update(100);
      
      expect(currentAxis).toBe(2);
      expect(currentValue).toBe(.5);
      
      engine.input.gamepads.update(100);
      (<any>navigator).setGamepadAxis(0, 3,  -.5);
      engine.input.gamepads.update(100);
      
      expect(currentAxis).toBe(3);
      expect(currentValue).toBe(-.5);
      
   });
});