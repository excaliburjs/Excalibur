/**
 * Enum representing the coordinate plane for the position 2D vector in the {@apilink TransformComponent}
 */
export enum CoordPlane {
  /**
   * The world coordinate plane (default) represents world space, any entities drawn with world
   * space move when the camera moves.
   */
  World = 'world',
/**
 * The screen coordinate plane represents screen space, entities drawn in screen space are pinned
 * to screen coordinates ignoring the camera.
 *
 * Screen space is rooted at the top-left of the safe {@apilink Screen.contentArea} (the
 * "C-frame"): a `CoordPlane.Screen` entity with `pos = (0, 0)` is drawn at
 * `contentArea.topLeft`, not at the raw canvas corner (the "R-frame"). The engine applies this
 * shift automatically before drawing — see {@apilink Screen.contentAreaOffset}.
 *
 * Under display modes that don't clip ({@apilink DisplayMode.Fixed}, {@apilink DisplayMode.FitScreen},
 * {@apilink DisplayMode.FillScreen}, {@apilink DisplayMode.FitContainer}, {@apilink DisplayMode.FillContainer})
 * `contentAreaOffset = (0, 0)` so the C and R frames coincide. Under
 * {@apilink DisplayMode.FitScreenAndFill} / {@apilink DisplayMode.FitContainerAndFill} /
 * {@apilink DisplayMode.FitScreenAndZoom} / {@apilink DisplayMode.FitContainerAndZoom}, the
 * C-frame is shifted into the safe area.
 *
 * ```
 *     World (infinite, camera)        Screen (CoordPlane.Screen, C)       Canvas / resolution (R)
 *
 *       +                                    +                                 +
 *       | (camera moves)                     | (0,0) = contentArea.topLeft     | (0,0) = canvas top-left
 *       |                                     |   shifts into the safe area     |   raw canvas corner
 *       |                                     |   on *AndFill / *AndZoom        |
 *       v                                     v                                 v
 *                                       +--- contentArea.width ---+         +--- resolution.width ---+
 *   worldToScreen():                    |                         |         |                         |
 *   camera.transform                    |     contentArea         |   <==   | unsafe |  contentArea   | unsafe |
 *   - contentAreaOffset  ============>  |  (CoordPlane.Screen)    |         | (clip) |   (R span)     | (clip) |
 *                                       |                         |         |                         |
 *   screenToWorld():                    +-------------------------+         +-------------------------+
 *   camera.inverse
 *   + contentAreaOffset
 *
 *   contentAreaOffset = (clip, 0)   on the *AndFill / *AndZoom horizontal-clip axis;
 *                                     (0, 0)                under Fixed/FitScreen/FillScreen/FitContainer/FillContainer.
 * ```
 *
 * Use {@apilink Screen.worldToScreenCoordinates}, {@apilink Screen.screenToWorldCoordinates},
 * {@apilink Screen.pageToScreenCoordinates} and {@apilink Screen.screenToPageCoordinates}
 * to convert between frames — they perform the offset and camera math for you.
 */
  Screen = 'screen'
}