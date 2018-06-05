import { Keyboard } from './Keyboard';
import { Gamepads } from './Gamepad';
import { Pointers } from './Pointer';

export interface IEngineInput {
  keyboard: Keyboard;
  pointers: Pointers;
  gamepads: Gamepads;
}
