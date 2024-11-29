import { Engine } from '../Engine';
import { Gamepads } from './Gamepad';
import { InputMapper } from './InputMapper';
import { Keyboard } from './Keyboard';
import { PointerEventReceiver } from './PointerEventReceiver';

export interface InputHostOptions {
  pointerTarget: Document | HTMLCanvasElement;
  grabWindowFocus: boolean;
  engine: Engine;
}

export class InputHost {
  private _enabled = true;

  keyboard: Keyboard;
  pointers: PointerEventReceiver;
  gamepads: Gamepads;
  inputMapper: InputMapper;

  constructor(options: InputHostOptions) {
    const { pointerTarget, grabWindowFocus, engine } = options;
    this.keyboard = new Keyboard();
    this.pointers = new PointerEventReceiver(pointerTarget, engine);
    this.gamepads = new Gamepads();

    this.keyboard.init({ grabWindowFocus });
    this.pointers.init({ grabWindowFocus });
    this.gamepads.init();
    this.inputMapper = new InputMapper({
      keyboard: this.keyboard,
      pointers: this.pointers,
      gamepads: this.gamepads
    });
  }

  get enabled() {
    return this._enabled;
  }

  toggleEnabled(enabled: boolean) {
    this._enabled = enabled;
    this.keyboard.toggleEnabled(this._enabled);
    this.pointers.toggleEnabled(this._enabled);
    this.gamepads.toggleEnabled(this._enabled);
  }

  update() {
    if (this._enabled) {
      this.inputMapper.execute();
      this.keyboard.update();
      this.gamepads.update();
    }
  }

  clear() {
    this.keyboard.clear();
    this.pointers.clear();
    // this.gamepads.clear();
  }
}
