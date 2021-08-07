import { Actor, Loader, EasingFunctions, RotationType } from '../engine';
import { ImageSource } from '../engine/Graphics';
import { enumToControlSelectLabels, enumToControlSelectOptions, withEngine } from './utils';

import heartTexture from './assets/heart.png';

export default {
  title: 'Actors/Actions',
  parameters: {
    componentSubtitle:
      'The Actions API is available for Actors using the `.actions` property and can be chained together to create sequences of movement'
  }
};

export const usingActions: Story = withEngine(async (game) => {
  const heartImage = new ImageSource(heartTexture);
  const loader = new Loader([heartImage]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  // TODO: bug with camera zoom off center
  // game.currentScene.camera.zoom = 4;

  // Center the actor on the camera coordinates
  const heart = new Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: 50,
    height: 50
  });

  // Assign texture to heart actor
  heart.graphics.add(heartImage.toSprite());
  game.add(heart);

  // Actions execute sequentially
  heart.actions
    .scaleBy(2, 2, 2)
    .rotateBy(Math.PI * 2, 1, RotationType.LongestPath)
    .scaleBy(-2, -2, 2);
});

export const fade: Story = withEngine(async (game, { startOpacity, endOpacity, pause, duration }) => {
  const heartTx = new ImageSource(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  // game.currentScene.camera.zoom = 4;

  // Center the actor on the camera coordinates
  const heart = new Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: 50,
    height: 50,
    opacity: 0
  });

  // Assign texture to heart actor
  heart.graphics.add(heartTx.toSprite());
  game.add(heart);

  // Fade in then out and loop
  heart.actions.fade(startOpacity, duration).delay(pause).fade(endOpacity, duration);
});

fade.story = {
  parameters: {
    docs: { storyDescription: 'Use `Actor.actions.fade()` to fade in or out the Actor over time' }
  }
};

fade.argTypes = {
  startOpacity: { name: 'Start Opacity', control: { min: 0, max: 1 } },
  endOpacity: { name: 'End Opacity', control: { min: 0, max: 1 } },
  duration: { name: 'Duration (in ms)' },
  pause: { name: 'Fade Delay (in ms)' }
};

fade.args = {
  startOpacity: 1,
  endOpacity: 0,
  duration: 200,
  pause: 2000
};

export const rotateTo: Story = withEngine(async (game, { duration, rotationType, rotateTo, pause }) => {
  const heartTx = new ImageSource(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  // game.currentScene.camera.zoom = 4;

  // Center the actor on the camera coordinates
  const heart = new Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: 50,
    height: 50
  });

  // Assign texture to heart actor
  heart.graphics.add(heartTx.toSprite());
  game.add(heart);

  // Rotate back and forth and loop
  const originalRotation = heart.rotation;
  heart.actions

    // Rotate by an amount in radians
    .rotateTo(originalRotation + rotateTo, duration, rotationType)
    .delay(pause)

    // Rotate to a specific rotation
    .rotateTo(originalRotation, duration, rotationType);
});

rotateTo.story = {
  parameters: {
    docs: { storyDescription: 'Use `Actor.actions.rotateTo()` to rotate the Actor by an absolute amount of radians' }
  }
};

rotateTo.argTypes = {
  rotateTo: { name: 'Rotate to (in radians)' },
  duration: { name: 'Duration (radians/s)' },
  pause: { name: 'Pause' },
  rotationType: {
    name: 'Rotation Type',
    control: { type: 'select', labels: enumToControlSelectLabels(RotationType) },
    options: enumToControlSelectOptions(RotationType)
  }
};

rotateTo.args = {
  duration: 1,
  pause: 2000,
  rotateTo: Math.PI,
  rotationType: RotationType.ShortestPath
};

export const rotateBy: Story = withEngine(async (game, { duration, rotationType, rotateBy, pause }) => {
  const heartTx = new ImageSource(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  // game.currentScene.camera.zoom = 4;

  // Center the actor on the camera coordinates
  const heart = new Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: 50,
    height: 50
  });

  // Assign texture to heart actor
  heart.graphics.add(heartTx.toSprite());
  game.add(heart);

  // Rotate back and forth and loop
  heart.actions

    // Rotate by an amount in radians
    .rotateBy(rotateBy, duration, rotationType)
    .delay(pause)

    // Rotate back
    .rotateBy(-rotateBy, duration, rotationType);
});

rotateBy.story = {
  parameters: {
    docs: { storyDescription: 'Use `Actor.actions.rotateBy()` to rotate the Actor by a relative amount of radians' }
  }
};

rotateBy.argTypes = {
  rotateBy: { name: 'Rotate by (in radians)' },
  duration: { name: 'Duration (radians/s)' },
  pause: { name: 'Pause' },
  rotationType: {
    name: 'Rotation Type',
    control: { type: 'select', labels: enumToControlSelectLabels(RotationType) },
    options: enumToControlSelectOptions(RotationType)
  }
};

rotateBy.args = {
  duration: 1,
  pause: 2000,
  rotateBy: Math.PI,
  rotationType: RotationType.ShortestPath
};

export const move: Story = withEngine(async (game, { moveX, moveY, pause, duration }) => {
  const heartTx = new ImageSource(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  // game.currentScene.camera.zoom = 4;

  // Center the actor on the camera coordinates
  const heart = new Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: 50,
    height: 50
  });

  // Assign texture to heart actor
  heart.graphics.add(heartTx.toSprite());
  game.add(heart);

  // Move back and forth and loop
  const originalPos = heart.pos.clone();
  heart.actions

    // Move by an amount in radians
    .moveBy(moveX, moveY, duration)
    .delay(pause)
    // Move to a specific rotation
    .moveTo(originalPos.x, originalPos.y, duration);
});

move.story = {
  parameters: {
    docs: { storyDescription: 'Use `Actor.actions.moveBy()` or `Actor.actions.moveTo()` to move the Actor by an amount in pixels' }
  }
};

move.argTypes = {
  moveX: { name: 'Move by x (px)' },
  moveY: { name: 'Move by y (px)' },
  duration: { name: 'Duration (px/s)' },
  pause: { name: 'Pause' }
};

move.args = {
  duration: 10,
  pause: 2000,
  moveX: -100,
  moveY: 0
};

export const ease: Story = withEngine(async (game, { easeX, easeY, duration }) => {
  const heartTx = new ImageSource(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  // game.currentScene.camera.zoom = 4;

  // Center the actor on the camera coordinates
  const heart = new Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: 50,
    height: 50
  });

  // Assign texture to heart actor
  heart.graphics.add(heartTx.toSprite());
  game.add(heart);

  // Ease back and forth and loop
  const originalPos = heart.pos.clone();
  heart.actions.repeatForever((actions) => {
    actions
      .easeTo(originalPos.x + easeX, originalPos.y + easeY, duration, EasingFunctions.EaseOutCubic)
      .easeTo(originalPos.x, originalPos.y, duration, EasingFunctions.EaseInOutCubic);
  });
});

ease.story = {
  parameters: {
    docs: { storyDescription: 'Use `Actor.actions.easeTo()` to ease the Actor by an amount in pixels with an easing function' }
  }
};

ease.argTypes = {
  easeX: { name: 'Ease by x (px)' },
  easeY: { name: 'Ease by y (px)' },
  duration: { name: 'Duration (ms)' }
};

ease.args = {
  duration: 1000,
  easeX: -100,
  easeY: 0
};

export const scale: Story = withEngine(async (game, { scaleX, scaleY, speed }) => {
  const heartTx = new ImageSource(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  // game.currentScene.camera.zoom = 4;

  // Center the actor on the camera coordinates
  const heart = new Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: 50,
    height: 50
  });

  // Assign texture to heart actor
  heart.graphics.add(heartTx.toSprite());
  game.add(heart);

  // Scale back and forth and loop
  const originalScale = heart.scale.clone();
  heart.actions.repeatForever((actions) => {
    actions.scaleBy(scaleX, scaleY, speed).scaleTo(originalScale.x, originalScale.y, speed, speed);
  });
});

scale.story = {
  parameters: {
    docs: {
      storyDescription:
        'Use `Actor.actions.scaleBy()` and `Actor.actions.scaleTo()` to scale the Actor by a scale factor at a specific speed'
    }
  }
};

scale.argTypes = {
  scaleX: { name: 'Scale by x factor' },
  scaleY: { name: 'Scale by y factor' },
  speed: { name: 'Speed (factor/s)' }
};

scale.args = {
  speed: 2,
  scaleX: 2,
  scaleY: 2
};
