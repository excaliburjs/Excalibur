import { Actor, Color, Texture, Loader, SpriteSheet } from '../engine';
import { withEngine } from './utils';

import animationSprite from './assets/animation.png';

export default {
  title: 'Animations'
};

export const multipleFrames: Story = withEngine(async (game) => {
  const playerTexture = new Texture(animationSprite);

  const player = new Actor(game.halfCanvasWidth, game.halfCanvasHeight, 100, 30, Color.Red);
  player.anchor.setTo(0.5, 0.5);
  const spritesheet = new SpriteSheet(playerTexture, 3, 1, 100, 100);
  const animation = spritesheet.getAnimationForAll(game, 1500);
  animation.loop = false;
  player.addDrawing('default', animation);
  game.currentScene.add(player);

  const loader = new Loader([playerTexture]);
  loader.playButtonText = 'Start the best game ever';

  await game.start(loader);
});
multipleFrames.story = {
  parameters: {
    notes: 'Should display 3 frames of 1, 2, and 3'
  }
};
