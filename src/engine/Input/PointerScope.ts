/**
 * Determines the scope of handling mouse/touch events.
 */

export enum PointerScope {
  /**
   * Handle events on the `canvas` element only. Events originating outside the
   * `canvas` will not be handled.
   */
  Canvas = 'Canvas',

  /**
   * Handles events on the entire document. All events will be handled by Excalibur.
   */
  Document = 'Document'
}
