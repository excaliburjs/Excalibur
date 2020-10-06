import * as ex from '@excalibur';
import { Mocks } from './util/Mocks';

describe('A keyboard', () => {
  let mockWindow = null;
  let keyboard: ex.Input.Keyboard = null;
  const mocker = new Mocks.Mocker();

  beforeEach(() => {
    mockWindow = <any>mocker.window();
    keyboard = new ex.Input.Keyboard();
    keyboard.init(mockWindow);
  });

  it('should exist', () => {
    expect(ex.Input.Keyboard).toBeDefined();
    expect(keyboard).toBeTruthy();
  });

  it('should fire keydown events', () => {
    let eventFired = false;

    keyboard.on('down', function (ev: ex.Input.KeyEvent) {
      if (ev.key === ex.Input.Keys.Up) {
        eventFired = true;
      }
    });

    (<any>mockWindow).emit('keydown', { code: ex.Input.Keys.Up });

    expect(eventFired).toBeTruthy();
  });

  it('should fire keyup events', () => {
    let eventFired = false;

    keyboard.on('up', function (ev: ex.Input.KeyEvent) {
      if (ev.key === ex.Input.Keys.Up) {
        eventFired = true;
      }
    });

    (<any>mockWindow).emit('keyup', { code: ex.Input.Keys.Up });

    expect(eventFired).toBeTruthy();
  });

  it('should know if keys are pressed', () => {
    // push key down
    (<any>mockWindow).emit('keydown', { code: ex.Input.Keys.Up });

    expect(keyboard.isHeld(ex.Input.Keys.Up)).toBeTruthy();
    expect(keyboard.wasReleased(ex.Input.Keys.Up)).toBeFalsy();
    expect(keyboard.wasPressed(ex.Input.Keys.Up)).toBeTruthy();

    // release key
    (<any>mockWindow).emit('keyup', { code: ex.Input.Keys.Up });

    expect(keyboard.getKeys().length).toBe(0);
    expect(keyboard.isHeld(ex.Input.Keys.Up)).toBeFalsy();
    expect(keyboard.wasReleased(ex.Input.Keys.Up)).toBeTruthy();
  });

  it('should have keys stay held until released', () => {
    // push key down
    (<any>mockWindow).emit('keydown', { code: ex.Input.Keys.Up });
    (<any>mockWindow).emit('keydown', { code: ex.Input.Keys.Down });

    keyboard.update();

    // release key
    (<any>mockWindow).emit('keyup', { code: ex.Input.Keys.Up });

    expect(keyboard.wasReleased(ex.Input.Keys.Down)).toBeFalsy();
    expect(keyboard.isHeld(ex.Input.Keys.Up)).toBeFalsy();

    keyboard.update();

    // release key
    (<any>mockWindow).emit('keyup', { code: ex.Input.Keys.Down });

    expect(keyboard.wasReleased(ex.Input.Keys.Down)).toBeTruthy();
  });
});
