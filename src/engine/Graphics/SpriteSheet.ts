import { ImageSource } from './ImageSource';
import { Sprite } from './Sprite';
import { SpriteSheet as LegacySpriteSheet } from '../Drawing/SpriteSheet';


export interface SpriteSheetSpacingDimensions {
  /**
   * The starting point to offset and start slicing the sprite sheet.
   * Default is (0, 0)
   */
  originOffset?: { x?: number, y?: number };

  /**
   * The margin between sprites.
   * Default is (0, 0)
   */
  margin?: {x?: number, y?: number};
}
export interface SpriteSheetGridOptions {
  image: ImageSource;
  grid: {
    rows: number;
    columns: number;
    spriteWidth: number;
    spriteHeight: number;
  };
  spacing?: SpriteSheetSpacingDimensions;
}

export interface SpriteSheetOptions {
  image: ImageSource;
  sprites: Sprite[];
}

export class SpriteSheet {
  public image: ImageSource;
  public readonly sprites: Sprite[] = [];
  constructor(options: SpriteSheetOptions) {
    const { image, sprites } = options;
    this.sprites = sprites;
    this.image = image;
  }

  public static fromLegacySpriteSheet(legacySpriteSheet: LegacySpriteSheet): SpriteSheet {
    const image = ImageSource.fromLegacyTexture(legacySpriteSheet.image);
    const sprites = legacySpriteSheet.sprites.map(oldSprite => Sprite.fromLegacySprite(oldSprite));
    return new SpriteSheet({
      image,
      sprites
    });
  }

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
      image: image,
      sprites: sprites
    });
  }
}
