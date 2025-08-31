import * as ex from '@excalibur';
import { Mocks } from '../__util__/Mocks';

describe('A keyboard', () => {
  let mockWindow = null;
  let keyboard: ex.Keyboard = null;
  const mocker = new Mocks.Mocker();

  beforeEach(() => {
    mockWindow = <any>mocker.window();
    keyboard = new ex.Keyboard();
    keyboard.init({ global: mockWindow });
  });

  it('should exist', () => {
    expect(ex.Keyboard).toBeDefined();
    expect(keyboard).toBeTruthy();
  });

  it('should fire keydown events', () => {
    let eventFired = false;

    keyboard.on('down', function (ev: ex.KeyEvent) {
      if (ev.key === ex.Keys.Up && ev.value === ex.Keys.Up) {
        eventFired = true;
      }
    });

    (<any>mockWindow).emit('keydown', { code: ex.Keys.Up, key: ex.Keys.Up });

    expect(eventFired).toBeTruthy();
  });

  it('should fire keypress events', () => {
    let eventFired = false;

    keyboard.on('press', function (ev: ex.KeyEvent) {
      if (ev.key === ex.Keys.Up && ev.value === ex.Keys.Up) {
        eventFired = true;
      }
    });

    (<any>mockWindow).emit('keydown', { code: ex.Keys.Up, key: ex.Keys.Up });
    (<any>mockWindow).emit('keyup', { code: ex.Keys.Up, key: ex.Keys.Up });

    expect(eventFired).toBeTruthy();
  });

  it('should fire keyup events', () => {
    let eventFired = false;

    keyboard.on('up', function (ev: ex.KeyEvent) {
      if (ev.key === ex.Keys.Up && ev.value === ex.Keys.Up) {
        eventFired = true;
      }
    });

    (<any>mockWindow).emit('keyup', { code: ex.Keys.Up, key: ex.Keys.Up });

    expect(eventFired).toBeTruthy();
  });

  it('should fire keyboard event with actual value and physical key', () => {
    let eventFired = false;

    keyboard.on('up', function (ev: ex.KeyEvent) {
      if (ev.key === ex.Keys.Digit9 && ev.value === '(') {
        eventFired = true;
      }
    });

    (<any>mockWindow).emit('keyup', { code: ex.Keys.Digit9, key: '(' });

    expect(eventFired).toBeTruthy();
  });

  it('should know if keys are pressed', () => {
    // push key down
    (<any>mockWindow).emit('keydown', { code: ex.Keys.Up, key: ex.Keys.Up });

    expect(keyboard.isHeld(ex.Keys.Up)).toBeTruthy();
    expect(keyboard.wasReleased(ex.Keys.Up)).toBeFalsy();
    expect(keyboard.wasPressed(ex.Keys.Up)).toBeTruthy();

    // release key
    (<any>mockWindow).emit('keyup', { code: ex.Keys.Up, key: ex.Keys.Up });

    expect(keyboard.getKeys().length).toBe(0);
    expect(keyboard.isHeld(ex.Keys.Up)).toBeFalsy();
    expect(keyboard.wasReleased(ex.Keys.Up)).toBeTruthy();
  });

  it('should have keys stay held until released', () => {
    // push key down
    (<any>mockWindow).emit('keydown', { code: ex.Keys.Up, key: ex.Keys.Up });
    (<any>mockWindow).emit('keydown', { code: ex.Keys.Down, key: ex.Keys.Down });

    keyboard.update();

    // release key
    (<any>mockWindow).emit('keyup', { code: ex.Keys.Up, key: ex.Keys.Up });

    expect(keyboard.wasReleased(ex.Keys.Down)).toBeFalsy();
    expect(keyboard.isHeld(ex.Keys.Up)).toBeFalsy();

    keyboard.update();

    // release key
    (<any>mockWindow).emit('keyup', { code: ex.Keys.Down, key: ex.Keys.Down });

    expect(keyboard.wasReleased(ex.Keys.Down)).toBeTruthy();
  });
});
