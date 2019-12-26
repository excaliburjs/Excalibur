import { RawImage } from './RawImage';
import { SourceView, Size } from './Sprite';

export interface SpriteSheetGridOptions {
  image: RawImage;
  grid: {
    rows: number;
    cols: number;
    spriteWidth: number;
    spriteHeight: number;
    padding?: number;
  };
}

export interface SpriteSheetOptions {
  image: RawImage;
  sprites: { source: SourceView[]; size?: Size }[];
}

// export class SpriteSheet {
//   private static FromGrid(_options: SpriteSheetGridOptions): SpriteSheet {
//     return new SpriteSheet({});
//   }

//   constructor(options: SpriteSheetOptions) {}

//   getSprite(x: number, y: number) {}
// }
