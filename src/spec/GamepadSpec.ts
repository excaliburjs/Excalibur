import * as ex from '../../build/dist/excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';

describe('A gamepad', () => {
  var engine: ex.Engine;
  var mock = new Mocks.Mocker();

  var nav: any;

  beforeEach(() => {
    engine = TestUtils.engine({ width: 600, height: 400 });

    nav = mock.navigator();

    spyOn(navigator, 'getGamepads').and.callFake(function(): any[] {
      return nav.getGamepads();
    });
  });

  it('should fire an event on connect', () => {
    var fired = false;

    engine.input.gamepads.enabled = true;
    engine.input.gamepads.on('connect', (padEvent: ex.GamepadConnectEvent) => {
      fired = true;
    });

    engine.input.gamepads.update();

    expect(fired).toBe(false);

    nav.setGamepads(0, 4, 16);

    engine.input.gamepads.update();

    expect(fired).toBe(true);

    // should happen only once per connect
    fired = false;
    engine.input.gamepads.update();
    expect(fired).toBe(false);
  });

  it('should fire an event on disconnect', () => {
    var fired = false;
    engine.input.gamepads.enabled = true;
    engine.input.gamepads.on('disconnect', (padEvent: ex.GamepadConnectEvent) => {
      fired = true;
    });

    nav.setGamepads(0, 4, 16);

    engine.input.gamepads.update();

    expect(fired).toBe(false);

    nav.deleteGamepad(0);

    engine.input.gamepads.update();

    expect(fired).toBe(true);

    // should happen only once per disconnect
    fired = false;
    engine.input.gamepads.update();
    expect(fired).toBe(false);
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
    engine.input.gamepads.setMinimumGamepadConfiguration({ axis: 2, buttons: 4 });
    expect(engine.input.gamepads.enabled).toBe(true);
  });

  it('should be implicitly enabled when a specific pad is requested', () => {
    expect(engine.input.gamepads.enabled).toBe(false);
    engine.input.gamepads.at(0);
    expect(engine.input.gamepads.enabled).toBe(true);
  });

  it('should be of a valid configuration', () => {
    nav.setGamepads(0, 4, 16); // valid 4 axis > 2 and 16 buttons > 4
    nav.setGamepads(1, 0, 16); // invalid 0 < 4 axis
    nav.setGamepads(2, 4, 2); // invalid 2 buttons < 4 buttons
    nav.setGamepads(3, 2, 4); // valid 2=2 axis and 4=4 axis
    engine.input.gamepads.setMinimumGamepadConfiguration({ axis: 2, buttons: 4 });

    var validGamepads = engine.input.gamepads.getValidGamepads();
    expect(validGamepads.length).toBe(2);
  });

  it('should fire events on all predefined buttons', () => {
    nav.setGamepads(0, 4, 16); // valid 4 axis > 2 and 16 buttons > 4

    var gamepad = engine.input.gamepads.at(0);

    var currentButton = null;
    var currentValue = null;

    gamepad.on('button', (buttonEvent: ex.GamepadButtonEvent) => {
      currentButton = buttonEvent.button;
      currentValue = buttonEvent.value;
    });

    expect(currentButton).toBeNull();
    expect(currentValue).toBeNull();

    for (var button in ex.Input.Buttons) {
      if (typeof button === 'number') {
        engine.input.gamepads.update();
        nav.setGamepadButton(0, button, 1.0);
        engine.input.gamepads.update();
        expect(currentButton).toBe(button);
        expect(currentValue).toBe(1.0);
      }
    }
  });

  it('should fire events on all predefined axis', () => {
    nav.setGamepads(0, 4, 16); // valid 4 axis > 2 and 16 buttons > 4

    var gamepad = engine.input.gamepads.at(0);

    var currentAxis = null;
    var currentValue = null;
    gamepad.on('axis', (axisEvent: ex.GamepadAxisEvent) => {
      currentAxis = axisEvent.axis;
      currentValue = axisEvent.value;
    });

    expect(currentAxis).toBeNull();
    expect(currentValue).toBeNull();

    engine.input.gamepads.update();
    nav.setGamepadAxis(0, 0, 0.5);
    engine.input.gamepads.update();

    expect(currentAxis).toBe(0);
    expect(currentValue).toBe(0.5);

    engine.input.gamepads.update();
    nav.setGamepadAxis(0, 1, -0.5);
    engine.input.gamepads.update();

    expect(currentAxis).toBe(1);
    expect(currentValue).toBe(-0.5);

    engine.input.gamepads.update();
    nav.setGamepadAxis(0, 2, 0.5);
    engine.input.gamepads.update();

    expect(currentAxis).toBe(2);
    expect(currentValue).toBe(0.5);

    engine.input.gamepads.update();
    nav.setGamepadAxis(0, 3, -0.5);
    engine.input.gamepads.update();

    expect(currentAxis).toBe(3);
    expect(currentValue).toBe(-0.5);
  });
});
