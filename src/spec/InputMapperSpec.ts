import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('An InputMapper', () => {
  it('exists', () => {
    expect(ex.InputMapper).toBeDefined();
  });

  it('can listen to events and map to the command', () => {
    const command = jasmine.createSpy('command');
    const keyboard = jasmine.createSpyObj<ex.Keyboard>('keyboard', ['isHeld']);
    keyboard.isHeld.and.returnValue(true);
    const sut = new ex.InputMapper({
      keyboard: keyboard as unknown as ex.Keyboard,
      pointers: {} as any,
      gamepads: {} as any
    });

    sut.on(({keyboard}) => {
      return keyboard.isHeld(ex.Keys.Enter);
    }, command);
    sut.on(({keyboard}) => {
      return keyboard.isHeld(ex.Keys.ArrowRight);
    }, command);

    sut.execute();

    expect(command).toHaveBeenCalledTimes(2);
  });

  it('can listen to events and not map to the command', () => {
    const command = jasmine.createSpy('command');
    const keyboard = jasmine.createSpyObj<ex.Keyboard>('keyboard', ['isHeld']);
    keyboard.isHeld.and.returnValue(false);
    const sut = new ex.InputMapper({
      keyboard: keyboard,
      pointers: {} as any,
      gamepads: {} as any
    });

    sut.on(({keyboard}) => {
      return keyboard.isHeld(ex.Keys.Enter);
    }, command);
    sut.on(({keyboard}) => {
      return keyboard.isHeld(ex.Keys.ArrowRight);
    }, command);

    sut.execute();

    expect(command).toHaveBeenCalledTimes(0);
  });

  it('can fire wasPressed events when used in a engine', () => {

    const engine = TestUtils.engine({ width: 100, height: 100 });

    const clock = engine.clock as ex.TestClock;
    clock.start();
    engine.input.keyboard.triggerEvent('down', ex.Keys.Space);

    const sut = engine.inputMapper;
    const keyPressedSpy = jasmine.createSpy('keyPressed');
    const keyReleasedSpy = jasmine.createSpy('keyReleased');
    sut.on(({keyboard}) => keyboard.wasPressed(ex.Keys.Space), keyPressedSpy);
    sut.on(({keyboard}) => keyboard.wasReleased(ex.Keys.Space), keyReleasedSpy);

    clock.step();
    expect(keyPressedSpy).toHaveBeenCalled();

    engine.input.keyboard.triggerEvent('up', ex.Keys.Space);
    clock.step();
    expect(keyReleasedSpy).toHaveBeenCalled();
  });
});