import { Keyboard } from './Keyboard';
import { Gamepads } from './Gamepad';
import { Pointers } from './Pointer';

export interface EngineInput {
  keyboard: Keyboard;
  pointers: Pointers;
  gamepads: Gamepads;
}
