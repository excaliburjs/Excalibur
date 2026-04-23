import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';
import { Mocks } from '../__util__/mocks';

describe('A gamepad', () => {
  let engine: ex.Engine;
  const mock = new Mocks.Mocker();

  let nav: any;

  beforeEach(() => {
    engine = TestUtils.engine({ width: 600, height: 400 });

    nav = mock.navigator();

    vi.spyOn(navigator, 'getGamepads').mockImplementation(() => nav.getGamepads());
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('should fire an event on connect', () => {
    let fired = false;

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
    let fired = false;
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

    const validGamepads = engine.input.gamepads.getValidGamepads();
    expect(validGamepads.length).toBe(2);
  });

  it('should fire events on all predefined buttons', () => {
    nav.setGamepads(0, 4, 16); // valid 4 axis > 2 and 16 buttons > 4

    const gamepad = engine.input.gamepads.at(0);

    let currentButton = null;
    let currentValue = null;

    let currentButtonDownButton = null;
    let currentButtonDownValue = null;

    let currentButtonUpButton = null;
    let currentButtonUpValue = null;

    gamepad.on("button", (buttonEvent: ex.GamepadButtonEvent) => {
      currentButton = buttonEvent.button;
      currentValue = buttonEvent.value;
    });

    gamepad.on("buttondown", (buttonEvent: ex.GamepadButtonEvent) => {
      currentButtonDownButton = buttonEvent.button;
      currentButtonDownValue = buttonEvent.value;
    });

    gamepad.on("buttonup", (buttonEvent: ex.GamepadButtonEvent) => {
      currentButtonUpButton = buttonEvent.button;
      currentButtonUpValue = buttonEvent.value;
    });

    expect(currentButton).toBeNull();
    expect(currentValue).toBeNull();

    expect(currentButtonDownButton).toBeNull();
    expect(currentButtonDownValue).toBeNull();

    expect(currentButtonUpButton).toBeNull();
    expect(currentButtonUpValue).toBeNull();

    for (const button in ex.Buttons) {
      if (typeof button === 'number') {
        engine.input.gamepads.update();
        //press button
        nav.setGamepadButton(0, button, 1.0);
        engine.input.gamepads.update();
        expect(currentButton).toBe(button);
        expect(currentValue).toBe(1.0);
        expect(currentButtonDownButton).toBe(button);
        expect(currentButtonDownValue).toBe(1.0);
        // release button
        nav.setGamepadButton(0, button, 0);
        engine.input.gamepads.update();
        expect(currentButtonUpButton).toBe(button);
        expect(currentButtonUpValue).toBe(0);
      }
    }
  });

  it('should fire button events the correct amount of times', () => {
    nav.setGamepads(0, 4, 16); // valid 4 axis > 2 and 16 buttons > 4

    const gamepad = engine.input.gamepads.at(0);


    let currentButtonCounter = 0;
    let currentButtonDownCounter = 0;
    let currentButtonUpCounter = 0;

    gamepad.on("button", (buttonEvent: ex.GamepadButtonEvent) => {
      currentButtonCounter++;
    });

    gamepad.on("buttondown", (buttonEvent: ex.GamepadButtonEvent) => {
      currentButtonDownCounter++;
    });

    gamepad.on("buttonup", (buttonEvent: ex.GamepadButtonEvent) => {
      currentButtonUpCounter++;
    });

    expect(currentButtonCounter).toBe(0);
    expect(currentButtonDownCounter).toBe(0);
    expect(currentButtonUpCounter).toBe(0);

    const button = ex.Buttons.Face1;
    engine.input.gamepads.update();
    //press button
    nav.setGamepadButton(0, button, 1.0);
    engine.input.gamepads.update();
    expect(currentButtonCounter).toBe(1);
    expect(currentButtonDownCounter).toBe(1);
    expect(gamepad.wasButtonPressed(button)).toBe(true);
    expect(gamepad.wasButtonReleased(button)).toBe(false);
    expect(currentButtonUpCounter).toBe(0);
    //change button pressure
    nav.setGamepadButton(0, button, 0.5);
    engine.input.gamepads.update();
    expect(currentButtonCounter).toBe(2);
    expect(currentButtonDownCounter).toBe(2);
    expect(gamepad.wasButtonPressed(button, 0)).toBe(true);
    expect(gamepad.wasButtonReleased(button)).toBe(false);
    expect(currentButtonUpCounter).toBe(0);
    // release button
    nav.setGamepadButton(0, button, 0);
    engine.input.gamepads.update();
    expect(currentButtonCounter).toBe(2);
    expect(currentButtonDownCounter).toBe(2);
    expect(gamepad.wasButtonPressed(button)).toBe(false);
    expect(gamepad.wasButtonReleased(button)).toBe(true);
    expect(currentButtonUpCounter).toBe(1);
  });

  it('should fire events on all predefined axis', () => {
    nav.setGamepads(0, 4, 16); // valid 4 axis > 2 and 16 buttons > 4

    const gamepad = engine.input.gamepads.at(0);

    let currentAxis = null;
    let currentValue = null;
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
