import { ImageSource } from './ImageSource';
import { SourceView, Sprite } from './Sprite';
import { Logger } from '../Util/Log';

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
   * Optionally specify any spacing information between sprites
   */
  spacing?: SpriteSheetSpacingDimensions;
}

export interface SpriteSheetSparseOptions {
  /**
   * Source image to use for each sprite
   */
  image: ImageSource;
  /**
   * List of source view rectangles to create a sprite sheet from
   */
  sourceViews: SourceView[];
}

export interface SpriteSheetOptions {
  /**
   * Source sprites for the sprite sheet
   */
  sprites: Sprite[];
  /**
   * Optionally specify the number of rows in a sprite sheet (default 1 row)
   */
  rows?: number;
  /**
   * Optionally specify the number of columns in a sprite sheet (default sprites.length)
   */
  columns?: number;
}

/**
 * Represents a collection of sprites from a source image with some organization in a grid
 */
export class SpriteSheet {
  private _logger = Logger.getInstance();
  public readonly sprites: Sprite[] = [];
  public readonly rows: number;
  public readonly columns: number;

  /**
   * Build a new sprite sheet from a list of sprites
   *
   * Use [[SpriteSheet.fromImageSource]] to create a SpriteSheet from an [[ImageSource]] organized in a grid
   * @param options
   */
  constructor(options: SpriteSheetOptions) {
    const { sprites, rows, columns } = options;
    this.sprites = sprites;
    this.rows = rows ?? 1;
    this.columns = columns ?? this.sprites.length;
  }

  /**
   * Find a sprite by their x/y position in the SpriteSheet, for example `getSprite(0, 0)` is the [[Sprite]] in the top-left
   * @param x
   * @param y
   */
  public getSprite(x: number, y: number): Sprite | null {
    if (x >= this.columns || x < 0) {
      this._logger.warn(`No sprite exists in the SpriteSheet at (${x}, ${y}), x: ${x} should be between 0 and ${this.columns - 1}`);
      return null;
    }
    if (y >= this.rows || y < 0) {
      this._logger.warn(`No sprite exists in the SpriteSheet at (${x}, ${y}), y: ${y} should be between 0 and ${this.rows - 1}`);
      return null;
    }
    const spriteIndex = x + y * this.columns;
    return this.sprites[spriteIndex];
  }

  /**
   * Create a sprite sheet from a sparse set of [[SourceView]] rectangles
   * @param options
   */
  public static fromImageSourceWithSourceViews(options: SpriteSheetSparseOptions): SpriteSheet {
    const sprites: Sprite[] = options.sourceViews.map(sourceView => {
      return new Sprite({
        image: options.image,
        sourceView
      });
    });
    return new SpriteSheet({sprites});
  }

  /**
   * Create a SpriteSheet from an [[ImageSource]] organized in a grid
   *
   * Example:
   * ```
   * const spriteSheet = SpriteSheet.fromImageSource({
   *   image: imageSource,
   *   grid: {
   *     rows: 5,
   *     columns: 2,
   *     spriteWidth: 32, // pixels
   *     spriteHeight: 32 // pixels
   *   },
   *   // Optionally specify spacing
   *   spacing: {
   *     // pixels from the top left to start the sprite parsing
   *     originOffset: {
   *       x: 5,
   *       y: 5
   *     },
   *     // pixels between each sprite while parsing
   *     margin: {
   *       x: 1,
   *       y: 1
   *     }
   *   }
   * })
   * ```
   *
   * @param options
   */
  public static fromImageSource(options: SpriteSheetGridOptions): SpriteSheet {
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
      sprites: sprites,
      rows: rows,
      columns: cols
    });
  }
}
