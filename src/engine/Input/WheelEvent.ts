import { WheelDeltaMode } from './WheelDeltaMode';


export class WheelEvent {
  public active = true;
  public cancel() {
    this.active = false;
  }
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
  ) { }
}
