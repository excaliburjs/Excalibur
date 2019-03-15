/**
 * Global Type Extensions to lib.d.ts for Excalibur
 */

interface Document {
  onmousewheel: (evt: any) => void;
}

interface WheelEvent {
  // wheelDeltaX, wheelDeltaY, are legacy properties in webkit browsers and older IE
  readonly wheelDeltaX: number;
  readonly wheelDeltaY: number;
  readonly wheelDelta: number;
}
