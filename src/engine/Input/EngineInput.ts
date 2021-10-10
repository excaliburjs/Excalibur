import { Keyboard } from './Keyboard';
import { Gamepads } from './Gamepad';
import { PointerEventReceiver } from './PointerEventReceiver';

export interface EngineInput {
  keyboard: Keyboard;
  pointers: PointerEventReceiver;
  gamepads: Gamepads;
}
