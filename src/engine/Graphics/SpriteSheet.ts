import { RawImage } from './RawImage';
import { Sprite } from './Sprite';

export interface SpriteSheetGridOptions {
  image: RawImage;
  grid: {
    rows: number;
    columns: number;
    spriteWidth: number;
    spriteHeight: number;
    padding?: number;
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

  public static fromGrid(options: SpriteSheetGridOptions): SpriteSheet {
    const sprites: Sprite[] = [];
    const {
      image,
      grid: { rows, columns: cols, spriteWidth, spriteHeight, padding }
    } = options;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        sprites[x + y * cols] = new Sprite({
          image: image,
          sourceView: {
            x: x * spriteWidth + (padding ?? 0),
            y: y * spriteHeight + (padding ?? 0),
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
