
/**
 * Describes the different image filtering modes
 */
export enum ImageFiltering {

  /**
   * Pixel is useful when you do not want smoothing aka antialiasing applied to your graphics.
   *
   * Useful for Pixel art aesthetics.
   */
  Pixel = 'Pixel',

  /**
   * Blended is useful when you have high resolution artwork and would like it blended and smoothed
   */
  Blended = 'Blended'
}