import { GlobalCoordinates } from '..';
import { WheelDeltaMode } from '../Input/WheelDeltaMode';
import { ExEvent } from './ExEvent';


export abstract class PointerEvent extends ExEvent<'down' | 'up' | 'move' | 'cancel'> {
  constructor(
    public pointerId: number,
    public coordinates: GlobalCoordinates,
    public nativeEvent: Event) {
    super();
  }
}
export class PointerUp extends PointerEvent {
  public readonly type = 'up';
}
export class PointerDown extends PointerEvent {
  public readonly type = 'down';
}
export class PointerMove extends PointerEvent {
  public readonly type = 'move';
}
export class PointerCancel extends PointerEvent {
  public readonly type = 'cancel';
}

export class Wheel extends ExEvent<'wheel'> {
  public readonly type = 'wheel';
  constructor(
    public x: number,
    public y: number,
    public pageX: number,
    public pageY: number,
    public screenX: number,
    public screenY: number,
    public index: number,
    public deltaX: number,
    public deltaY: number,
    public deltaZ: number,
    public deltaMode: WheelDeltaMode,
    public ev: Event
  ) {
    super();
  }
}