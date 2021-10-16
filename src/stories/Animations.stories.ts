import { Actor, Loader, Util } from '../engine';
import { ImageSource, SpriteSheet, Animation, AnimationStrategy } from '../engine/Graphics';
import { enumToControlSelectLabels, enumToControlSelectOptions, withEngine } from './utils';

import animationSprite from './assets/animation.png';

export default {
  title: 'Animations'
};

export const multipleFrames: Story = withEngine(async (game, { strategy }) => {
  const playerTexture = new ImageSource(animationSprite);

  const player = new Actor({ x: game.currentScene.camera.x, y: game.currentScene.camera.y, width: 100, height: 30 });
  player.anchor.setTo(0.5, 0.5);
  const spritesheet = SpriteSheet.fromImageSource({
    image: playerTexture,
    grid: {
      columns: 3,
      rows: 1,
      spriteWidth: 100,
      spriteHeight: 100
    }
  });
  const animation = Animation.fromSpriteSheet(spritesheet, Util.range(0, 2), 1500, strategy);
  player.graphics.add(animation);
  game.currentScene.add(player);

  const loader = new Loader([playerTexture]);

  await game.start(loader);
});
multipleFrames.story = {
  parameters: {
    notes: 'Should display 3 frames of 1, 2, and 3'
  }
};
multipleFrames.argTypes = {
  strategy: {
    name: 'Animation Strategy',
    options: enumToControlSelectOptions(AnimationStrategy),
    control: {
      type: 'select',
      labels: enumToControlSelectLabels(AnimationStrategy)
    }
  }
};
multipleFrames.args = {
  strategy: AnimationStrategy.End
};
