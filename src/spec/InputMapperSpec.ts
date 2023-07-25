import * as ex from '@excalibur';

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

});