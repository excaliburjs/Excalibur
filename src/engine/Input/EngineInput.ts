import { Keyboard } from './Keyboard';
import { Gamepads } from './Gamepad';
import { Pointers } from './Pointers';

export interface EngineInput {
  keyboard: Keyboard;
  pointers: Pointers;
  gamepads: Gamepads;
}
