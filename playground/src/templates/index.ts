import templateAudio from './audio';
import templateDefault from './default';
import templateSpritesheet from './spritesheet';
import templateTileset from './tileset';

export const templates: Record<string, string> = {
  audio: templateAudio,
  default: templateDefault,
  spritesheet: templateSpritesheet,
  tileset: templateTileset
};
