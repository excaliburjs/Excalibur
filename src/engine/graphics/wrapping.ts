/**
 * Describes the different image wrapping modes
 */
export enum ImageWrapping {
  Clamp = 'Clamp',

  Repeat = 'Repeat',

  Mirror = 'Mirror'
}

/**
 *
 */
export function parseImageWrapping(val: string): ImageWrapping {
  switch (val) {
    case ImageWrapping.Clamp:
      return ImageWrapping.Clamp;
    case ImageWrapping.Repeat:
      return ImageWrapping.Repeat;
    case ImageWrapping.Mirror:
      return ImageWrapping.Mirror;
    default:
      return ImageWrapping.Clamp;
  }
}
