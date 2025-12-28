import { ImageSource } from './image-source';
import type { SourceView } from './sprite';
import { Sprite } from './sprite';
import type { GraphicOptions } from './graphic';
import type { TiledSpriteOptions } from './tiled-sprite';
import { TiledSprite } from './tiled-sprite';
import { Vector } from '../math/vector';

/**
 * Specify sprite sheet spacing options, useful if your sprites are not tightly packed
 * and have space between them.
 */
export interface SpriteSheetSpacingDimensions {
  /**
   * The starting point to offset and start slicing the sprite sheet from the top left of the image.
   * Default is (0, 0)
   */
  originOffset?: { x?: number; y?: number } | Vector;

  /**
   * The margin between sprites.
   * Default is (0, 0)
   */
  margin?: { x?: number; y?: number } | Vector;
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

export interface GetSpriteOptions extends GraphicOptions {}

/**
 * Represents a collection of sprites from a source image with some organization in a grid
 */
export class SpriteSheet {
  public readonly sprites: Sprite[] = [];
  public readonly rows: number;
  public readonly columns: number;

  /**
   * Build a new sprite sheet from a list of sprites
   *
   * Use {@apilink SpriteSheet.fromImageSource} to create a SpriteSheet from an {@apilink ImageSource} organized in a grid
   * @param options
   */
  constructor(options: SpriteSheetOptions) {
    const { sprites, rows, columns } = options;
    this.sprites = sprites;
    this.rows = rows ?? 1;
    this.columns = columns ?? this.sprites.length;
  }

  /**
   * Find a sprite by their x/y integer coordinates in the SpriteSheet, for example `getSprite(0, 0)` is the {@apilink Sprite} in the top-left
   * and `getSprite(1, 0)` is the sprite one to the right.
   * @param x
   * @param y
   */
  public getSprite(x: number, y: number, options?: GetSpriteOptions): Sprite {
    if (x >= this.columns || x < 0) {
      throw Error(`No sprite exists in the SpriteSheet at (${x}, ${y}), x: ${x} should be between 0 and ${this.columns - 1} columns`);
    }
    if (y >= this.rows || y < 0) {
      throw Error(`No sprite exists in the SpriteSheet at (${x}, ${y}), y: ${y} should be between 0 and ${this.rows - 1} rows`);
    }
    const spriteIndex = x + y * this.columns;
    const sprite = this.sprites[spriteIndex];
    if (sprite) {
      if (options) {
        const spriteWithOptions = sprite.clone();
        spriteWithOptions.flipHorizontal = options.flipHorizontal ?? spriteWithOptions.flipHorizontal;
        spriteWithOptions.flipVertical = options.flipVertical ?? spriteWithOptions.flipVertical;
        spriteWithOptions.width = options.width ?? spriteWithOptions.width;
        spriteWithOptions.height = options.height ?? spriteWithOptions.height;
        spriteWithOptions.rotation = options.rotation ?? spriteWithOptions.rotation;
        spriteWithOptions.scale = options.scale ?? spriteWithOptions.scale;
        spriteWithOptions.opacity = options.opacity ?? spriteWithOptions.opacity;
        spriteWithOptions.tint = options.tint ?? spriteWithOptions.tint;
        spriteWithOptions.origin = options.origin ?? spriteWithOptions.origin;
        return spriteWithOptions;
      }
      return sprite;
    }
    throw Error(`Invalid sprite coordinates (${x}, ${y})`);
  }

  /**
   * Find a sprite by their x/y integer coordinates in the SpriteSheet and configures tiling to repeat by default,
   * for example `getTiledSprite(0, 0)` is the {@apilink TiledSprite} in the top-left
   * and `getTiledSprite(1, 0)` is the sprite one to the right.
   *
   * Example:
   *
   * ```typescript
   * spriteSheet.getTiledSprite(1, 0, {
   * width: game.screen.width,
   * height: 200,
   * wrapping: {
   * x: ex.ImageWrapping.Repeat,
   * y: ex.ImageWrapping.Clamp
   * }
   * });
   * ```
   * @param x
   * @param y
   * @param options
   */
  public getTiledSprite(x: number, y: number, options?: Partial<Omit<TiledSpriteOptions & GraphicOptions, 'image'>>): TiledSprite {
    if (x >= this.columns || x < 0) {
      throw Error(`No sprite exists in the SpriteSheet at (${x}, ${y}), x: ${x} should be between 0 and ${this.columns - 1} columns`);
    }
    if (y >= this.rows || y < 0) {
      throw Error(`No sprite exists in the SpriteSheet at (${x}, ${y}), y: ${y} should be between 0 and ${this.rows - 1} rows`);
    }
    const spriteIndex = x + y * this.columns;
    const sprite = this.sprites[spriteIndex];
    if (sprite) {
      return TiledSprite.fromSprite(sprite, options);
    }
    throw Error(`Invalid sprite coordinates (${x}, ${y})`);
  }

  /**
   * Returns a sprite that has a new backing image the exact size of the sprite that tha is a copy of the original sprite slice.
   *
   * Useful if you need to apply effects, manipulate, or mutate the image and you don't want to disturb the original sprite sheet.
   *
   */
  public async getSpriteAsStandalone(x: number, y: number): Promise<Sprite> {
    if (x >= this.columns || x < 0) {
      throw Error(`No sprite exists in the SpriteSheet at (${x}, ${y}), x: ${x} should be between 0 and ${this.columns - 1} columns`);
    }
    if (y >= this.rows || y < 0) {
      throw Error(`No sprite exists in the SpriteSheet at (${x}, ${y}), y: ${y} should be between 0 and ${this.rows - 1} rows`);
    }
    const spriteIndex = x + y * this.columns;
    const sprite = this.sprites[spriteIndex];
    const cnv = document.createElement('canvas');
    const ctx = cnv.getContext('2d');
    cnv.width = sprite.width;
    cnv.height = sprite.height;

    if (!sprite) {
      throw Error(`Invalid sprite coordinates (${x}, ${y})`);
    }
    if (!ctx) {
      throw Error('Unable to create canvas context');
    }

    ctx.drawImage(
      sprite.image.image,
      sprite.sourceView.x,
      sprite.sourceView.y,
      sprite.sourceView.width,
      sprite.sourceView.height,
      0,
      0,
      sprite.sourceView.width,
      sprite.sourceView.height
    );

    const imgSrc = new ImageSource(cnv.toDataURL());
    await imgSrc.load();

    return new Sprite({
      image: imgSrc,
      sourceView: {
        x: 0,
        y: 0,
        width: sprite.width,
        height: sprite.height
      },
      destSize: {
        width: sprite.width,
        height: sprite.height
      }
    });
  }

  /**
   * Returns a new image exact size and copy of the original sprite slice.
   *
   * Useful if you need to apply effects, manipulate, or mutate the image and you don't want to disturb the original sprite sheet.
   */
  public async getSpriteAsImage(x: number, y: number): Promise<HTMLImageElement> {
    if (x >= this.columns || x < 0) {
      throw Error(`No sprite exists in the SpriteSheet at (${x}, ${y}), x: ${x} should be between 0 and ${this.columns - 1} columns`);
    }
    if (y >= this.rows || y < 0) {
      throw Error(`No sprite exists in the SpriteSheet at (${x}, ${y}), y: ${y} should be between 0 and ${this.rows - 1} rows`);
    }
    const spriteIndex = x + y * this.columns;
    const sprite = this.sprites[spriteIndex];
    const cnv = document.createElement('canvas');
    const ctx = cnv.getContext('2d');
    cnv.width = sprite.width;
    cnv.height = sprite.height;

    if (!sprite) {
      throw Error(`Invalid sprite coordinates (${x}, ${y})`);
    }
    if (!ctx) {
      throw Error('Unable to create canvas context');
    }

    ctx.drawImage(
      sprite.image.image,
      sprite.sourceView.x,
      sprite.sourceView.y,
      sprite.sourceView.width,
      sprite.sourceView.height,
      0,
      0,
      sprite.sourceView.width,
      sprite.sourceView.height
    );

    const imgSrc = new Image(sprite.width, sprite.height);
    imgSrc.src = cnv.toDataURL();

    return await new Promise((resolve, reject) => {
      imgSrc.onload = () => {
        resolve(imgSrc);
      };
      imgSrc.onerror = (e) => {
        reject(e);
      };
    });
  }

  /**
   * Create a sprite sheet from a sparse set of {@apilink SourceView} rectangles
   * @param options
   */
  public static fromImageSourceWithSourceViews(options: SpriteSheetSparseOptions): SpriteSheet {
    const sprites: Sprite[] = options.sourceViews.map((sourceView) => {
      return new Sprite({
        image: options.image,
        sourceView
      });
    });
    return new SpriteSheet({ sprites });
  }

  /**
   * Create a SpriteSheet from an {@apilink ImageSource} organized in a grid
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
    let newmargin: { x: number; y: number } | undefined;
    let neworiginOffset: { x: number; y: number } | undefined;

    if (originOffset instanceof Vector) {
      neworiginOffset = { x: originOffset.x, y: originOffset.y };
    } else {
      if (originOffset) {
        neworiginOffset = { x: originOffset.x as number, y: originOffset.y as number };
      }
    }

    if (margin instanceof Vector) {
      newmargin = { x: margin.x, y: margin.y };
    } else {
      if (margin) {
        newmargin = { x: margin.x as number, y: margin.y as number };
      }
    }

    const offsetDefaults = { x: 0, y: 0, ...neworiginOffset };
    const marginDefaults = { x: 0, y: 0, ...newmargin };
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

  public clone(): SpriteSheet {
    return new SpriteSheet({
      sprites: this.sprites.map((sprite) => sprite.clone()),
      rows: this.rows,
      columns: this.columns
    });
  }
}
