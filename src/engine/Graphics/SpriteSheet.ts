import { ImageSource } from './ImageSource';
import { Sprite } from './Sprite';
import { SpriteSheet as LegacySpriteSheet } from '../Drawing/SpriteSheet';


/**
 * Specify sprite sheet spacing options, useful if your sprites are not tightly packed
 * and have space between them.
 */
export interface SpriteSheetSpacingDimensions {
  /**
   * The starting point to offset and start slicing the sprite sheet from the top left of the image.
   * Default is (0, 0)
   */
  originOffset?: { x?: number, y?: number };

  /**
   * The margin between sprites.
   * Default is (0, 0)
   */
  margin?: {x?: number, y?: number};
}

/**
 * Sprite sheet options for slicing up images
 */
export interface SpriteSheetGridOptions {
  /**
   * Source image to use for each sprite
   */
  image: ImageSource;
  /**
   * Grid definition for the sprite sheet
   */
  grid: {
    /**
     * Number of rows in the sprite sheet
     */
    rows: number;
    /**
     * Number of columns in the sprite sheet
     */
    columns: number;
    /**
     * Width of each individual sprite
     */
    spriteWidth: number;
    /**
     * Height of each individual sprite
     */
    spriteHeight: number;
  };
  /**
   * Optionally specifiy any spacing information between sprites
   */
  spacing?: SpriteSheetSpacingDimensions;
}

export interface SpriteSheetOptions {
  sprites: Sprite[];
}

/**
 * Represents a collection of sprites from a source image
 */
export class SpriteSheet {
  public readonly sprites: Sprite[] = [];

  /**
   * Build a new sprite sheet from a list of sprites
   * @param options
   */
  constructor(options: SpriteSheetOptions) {
    const { sprites } = options;
    this.sprites = sprites;
  }

  /**
   * To a graphics sprite sheet from a legacy sprite sheet
   */
  public static fromLegacySpriteSheet(legacySpriteSheet: LegacySpriteSheet): SpriteSheet {
    const sprites = legacySpriteSheet.sprites.map(oldSprite => Sprite.fromLegacySprite(oldSprite));
    return new SpriteSheet({
      sprites
    });
  }

  /**
   * @deprecated
   * @param spriteSheet
   * @returns
   */
  public static toLegacySpriteSheet(spriteSheet: SpriteSheet): LegacySpriteSheet {
    const sprites = spriteSheet.sprites.map(sprite => Sprite.toLegacySprite(sprite));
    return new LegacySpriteSheet(sprites);
  }

  /**
   * Parse a sprite sheet from grid options
   * @param options
   */
  public static fromGrid(options: SpriteSheetGridOptions): SpriteSheet {
    const sprites: Sprite[] = [];
    options.spacing = options.spacing ?? {};
    const {
      image,
      grid: { rows, columns: cols, spriteWidth, spriteHeight },
      spacing: { originOffset, margin }
    } = options;
    const offsetDefaults = { x: 0, y: 0, ...originOffset};
    const marginDefaults = { x: 0, y: 0, ...margin};
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        sprites[x + y * cols] = new Sprite({
          image: image,
          sourceView: {
            x: x * spriteWidth + marginDefaults.x * x + offsetDefaults.x,
            y: y * spriteHeight + marginDefaults.y * y + offsetDefaults.y,
            width: spriteWidth,
            height: spriteHeight
          },
          destSize: { height: spriteHeight, width: spriteWidth }
        });
      }
    }
    return new SpriteSheet({
      sprites: sprites
    });
  }
}
