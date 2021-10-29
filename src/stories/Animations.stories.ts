import { Actor, Color, Loader, Util } from '../engine';
import { ImageSource, SpriteSheet, Animation, AnimationStrategy, Rectangle } from '../engine/Graphics';
import { enumToControlSelectLabels, enumToControlSelectOptions, withEngine } from './utils';

import animationSprite from './assets/animation.png';

export default {
  title: 'Animations'
};

export const multipleFrames: Story = withEngine(async (game, { strategy, reverse }) => {
  const playerTexture = new ImageSource(animationSprite);
  const player = new Actor({
    x: game.screen.center.x,
    y: game.screen.center.y,
    width: 100,
    height: 30
  });
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
  if (reverse) {
    animation.reverse();
  }
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
  },
  reverse: {
    control: {
      type: 'boolean'
    }
  }
};
multipleFrames.args = {
  strategy: AnimationStrategy.End
};

export const frameDuration: Story = withEngine(async (game, { duration }) => {
  const size = 100;
  const colors = [Color.Red, Color.Orange, Color.Yellow, Color.Green, Color.Cyan, Color.Blue, Color.Violet];
  const player = new Actor({
    x: game.screen.center.x,
    y: game.screen.center.y,
    width: size,
    height: size
  });
  const animation = new Animation({
    frameDuration: duration,
    frames: colors.map((c) => ({
      graphic: new Rectangle({
        width: size,
        height: size,
        color: c
      })
    }))
  });
  player.graphics.add(animation);
  game.currentScene.add(player);
  await game.start();
});
frameDuration.story = {
  parameters: {
    notes: 'Should display 7 frames with a delay of 1s between them'
  }
};
frameDuration.argTypes = {
  duration: {
    name: 'Frame Duration',
    control: {
      type: 'range',
      min: 100,
      max: 2000,
      step: 100
    }
  }
};
frameDuration.args = {
  duration: 1000
};

export const totalDuration: Story = withEngine(async (game, { duration }) => {
  const size = 100;
  const colors = [Color.Red, Color.Orange, Color.Yellow, Color.Green, Color.Cyan, Color.Blue, Color.Violet];
  const player = new Actor({
    x: game.screen.center.x,
    y: game.screen.center.y,
    width: size,
    height: size
  });
  const animation = new Animation({
    totalDuration: duration,
    frames: colors.map((c) => ({
      graphic: new Rectangle({
        width: size,
        height: size,
        color: c
      })
    }))
  });
  player.graphics.add(animation);
  game.currentScene.add(player);
  await game.start();
});
totalDuration.story = {
  parameters: {
    notes: 'Should display 7 frames in 1s'
  }
};
totalDuration.argTypes = {
  duration: {
    name: 'Total Duration',
    control: {
      type: 'range',
      min: 100,
      max: 2000,
      step: 100
    }
  }
};
totalDuration.args = {
  duration: 1000
};