import { RawImage } from './RawImage';
import { Sprite } from './Sprite';
import { SpriteSheet as LegacySpriteSheet } from '../Drawing/SpriteSheet';

export interface SpriteSheetGridOptions {
  image: RawImage;
  grid: {
    rows: number;
    columns: number;
    spriteWidth: number;
    spriteHeight: number;
  };
}

export interface SpriteSheetOptions {
  image: RawImage;
  sprites: Sprite[];
}

export class SpriteSheet {
  public image: RawImage;
  public sprites: Sprite[] = [];
  constructor(options: SpriteSheetOptions) {
    const { image, sprites } = options;
    this.sprites = sprites;
    this.image = image;
  }

  public static fromLegacySpriteSheet(legacySpriteSheet: LegacySpriteSheet): SpriteSheet {
    const image = RawImage.fromLegacyTexture(legacySpriteSheet.image);
    const sprites = legacySpriteSheet.sprites.map(oldSprite => Sprite.fromLegacySprite(oldSprite));
    return new SpriteSheet({
      image,
      sprites
    });
  }

  public static fromGrid(options: SpriteSheetGridOptions): SpriteSheet {
    const sprites: Sprite[] = [];
    const {
      image,
      grid: { rows, columns: cols, spriteWidth, spriteHeight }
    } = options;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        sprites[x + y * cols] = new Sprite({
          image: image,
          sourceView: {
            x: x * spriteWidth,
            y: y * spriteHeight,
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
