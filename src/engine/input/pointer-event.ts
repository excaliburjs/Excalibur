import type { GlobalCoordinates } from '../math/global-coordinates';
import type { Vector } from '../math/vector';
import type { PointerButton } from './pointer-button';
import type { PointerType } from './pointer-type';

export class PointerEvent {
  public active = true;
  public cancel() {
    this.active = false;
  }

  get pagePos(): Vector {
    return this.coordinates.pagePos;
  }

  get screenPos(): Vector {
    return this.coordinates.screenPos;
  }

  get worldPos(): Vector {
    return this.coordinates.worldPos;
  }

  constructor(
    public type: 'down' | 'up' | 'move' | 'cancel',
    public pointerId: number,
    public button: PointerButton,
    public pointerType: PointerType,
    public coordinates: GlobalCoordinates,
    public nativeEvent: Event
  ) {}
}
