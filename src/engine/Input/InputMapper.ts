import { Gamepads } from './Gamepad';
import { Keyboard } from './Keyboard';
import { PointerEventReceiver } from './PointerEventReceiver';

export interface InputsOptions {
  keyboard: Keyboard;
  gamepads: Gamepads;
  pointers: PointerEventReceiver;
}

/**
 * This allows you to map multiple inputs to specific commands! This is especially useful when
 * you need to allow multiple input sources to control a specific action.
 */
export class InputMapper {
  private _handlers = new Map<any, any>();
  constructor(public inputs: InputsOptions) {}

  /**
   * Executes the input map, called internally by Excalibur
   */
  execute() {
    for (const [input, command] of this._handlers.entries()) {
      const results = input(this.inputs);
      if (results) {
        command(results);
      }
    }
  }

  /**
   * This allows you to map multiple inputs to specific commands! This is useful
   *
   * The inputHandler should return a truthy value if you wish the commandHandler to fire.
   *
   * Example:
   * ```typescript
   * const moveRight = (amount: number) => { actor.vel.x = 100 * amount }
   * const moveLeft = (amount: number) => { actor.vel.x = -100 * amount }
   * const moveUp = (amount: number) => { actor.vel.y = -100 * amount }
   * const moveDown = (amount: number) => { actor.vel.y = 100 * amount }
   *
   * engine.inputMapper.on(({keyboard}) => keyboard.isHeld(ex.Keys.ArrowRight) ? 1 : 0, moveRight);
   * engine.inputMapper.on(({gamepads}) => gamepads.at(0).isButtonPressed(ex.Buttons.DpadRight) ? 1 : 0, moveRight);
   * engine.inputMapper.on(({gamepads}) => gamepads.at(0).getAxes(ex.Axes.LeftStickX) > 0 ?
   *  gamepads.at(0).getAxes(ex.Axes.LeftStickX) : 0, moveRight);
   * ```
   * @param inputHandler
   * @param commandHandler
   */
  on<TInputHandlerData>(
    inputHandler: (inputs: InputsOptions) => TInputHandlerData | false,
    commandHandler: (data: TInputHandlerData) => any
  ) {
    this._handlers.set(inputHandler, commandHandler);
  }
}
