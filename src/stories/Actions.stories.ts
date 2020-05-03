import { withKnobs, number } from '@storybook/addon-knobs';
import { Actor, Texture, Loader, EasingFunctions } from '../engine';
import { withEngine } from './utils';

import heartTexture from './assets/heart.png';

export default {
  title: 'Actors/Actions',
  decorators: [withKnobs]
};

export const fade: Story = withEngine(async (game) => {
  const heartTx = new Texture(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  game.currentScene.camera.z = 4;

  // Center the actor on the camera coordinates
  const heart = new Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: 50,
    height: 50,
    opacity: 0
  });

  // Assign texture to heart actor
  heart.addDrawing(heartTx);
  game.add(heart);

  // Fade in then out and loop
  heart.actions
    .fade(number('Starting Opacity', 1), number('Duration (ms)', 200))
    .delay(number('Pause', 2000))
    .fade(number('Ending Opacity', 0), number('Duration (ms)', 200));
});

fade.story = {
  parameters: {
    componentSubtitle: 'Fade action',
    docs: { storyDescription: 'Use `Actor.fade()` to fade in or out the Actor over time' }
  }
};

export const rotate: Story = withEngine(async (game) => {
  const heartTx = new Texture(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  game.currentScene.camera.z = 4;

  // Center the actor on the camera coordinates
  const heart = new Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: 50,
    height: 50
  });

  // Assign texture to heart actor
  heart.addDrawing(heartTx);
  game.add(heart);

  // Rotate back and forth and loop
  const originalRotation = heart.rotation;
  heart.actions

    // Rotate by an amount in radians
    .rotateBy(number('Rotation in radians', Math.PI), number('Duration (rad/s)', 1))
    .delay(number('Pause', 2000))

    // Rotate to a specific rotation
    .rotateTo(originalRotation, number('Duration (rad/s)', 1));
});

rotate.story = {
  parameters: {
    componentSubtitle: 'Rotate action',
    docs: { storyDescription: 'Use `Actor.rotateBy()` or `Actor.rotateTo()` to rotate the Actor by an amount in radians' }
  }
};

export const move: Story = withEngine(async (game) => {
  const heartTx = new Texture(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  game.currentScene.camera.z = 4;

  // Center the actor on the camera coordinates
  const heart = new Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: 50,
    height: 50
  });

  // Assign texture to heart actor
  heart.addDrawing(heartTx);
  game.add(heart);

  // Rotate back and forth and loop
  const originalPos = heart.pos.clone();
  heart.actions

    // Rotate by an amount in radians
    .moveBy(number('Move by x (px)', -100), number('Move by y (px)', 0), number('Duration (px/s)', 10))
    .delay(number('Pause', 2000))
    // Rotate to a specific rotation
    .moveTo(originalPos.x, originalPos.y, number('Duration (px/s)', 10));
});

move.story = {
  parameters: {
    componentSubtitle: 'Move actions',
    docs: { storyDescription: 'Use `Actor.moveBy()` or `Actor.moveTo()` to move the Actor by an amount in pixels' }
  }
};

export const ease: Story = withEngine(async (game) => {
  const heartTx = new Texture(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  game.currentScene.camera.z = 4;

  // Center the actor on the camera coordinates
  const heart = new Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: 50,
    height: 50
  });

  // Assign texture to heart actor
  heart.addDrawing(heartTx);
  game.add(heart);

  // Rotate back and forth and loop
  const originalPos = heart.pos.clone();
  heart.actions

    // Rotate by an amount in radians
    .easeTo(
      originalPos.x + number('Ease by x (px)', -100),
      originalPos.y + number('Move by y (px)', 0),
      number('Duration (ms)', 1000),
      EasingFunctions.EaseOutCubic
    )
    // Rotate to a specific rotation
    .easeTo(originalPos.x, originalPos.y, number('Duration (ms)', 1000), EasingFunctions.EaseInOutCubic)
    .repeatForever();
});

ease.story = {
  parameters: {
    componentSubtitle: 'Ease actions',
    docs: { storyDescription: 'Use `Actor.easeTo()` to ease the Actor by an amount in pixels with an easing function' }
  }
};
