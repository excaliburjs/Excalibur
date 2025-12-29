/**
 * Turn on move and drag events for an {@apilink Actor}
 */

export interface CapturePointerConfig {
  /**
   * Capture PointerMove events (may be expensive!)
   */
  captureMoveEvents: boolean;

  /**
   * Capture PointerDrag events (may be expensive!)
   */
  captureDragEvents: boolean;
}
