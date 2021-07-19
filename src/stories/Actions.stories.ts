import { withKnobs, number, select } from '@storybook/addon-knobs';
import { Actor, Texture, Loader, EasingFunctions, RotationType } from '../engine';
import { withEngine } from './utils';

import heartTexture from './assets/heart.png';

export default {
  title: 'Actors/Actions',
  decorators: [withKnobs],
  parameters: {
    componentSubtitle:
      'The Actions API is available for Actors using the `.actions` property and can be chained together to create sequences of movement'
  }
};

export const usingActions: Story = withEngine(async (game) => {
  const heartTx = new Texture(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  game.currentScene.camera.zoom = 4;

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

  // Actions execute sequentially
  heart.actions
    .scaleBy(2, 2, 2)
    .rotateBy(Math.PI * 2, 1, RotationType.LongestPath)
    .scaleBy(-2, -2, 2);
});

export const fade: Story = withEngine(async (game) => {
  const heartTx = new Texture(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  game.currentScene.camera.zoom = 4;

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
    docs: { storyDescription: 'Use `Actor.actions.fade()` to fade in or out the Actor over time' }
  }
};

export const rotateTo: Story = withEngine(async (game) => {
  const heartTx = new Texture(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  game.currentScene.camera.zoom = 4;

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

  const rotateTo = number('Rotate to (in radians)', Math.PI);
  const rotationType = select(
    'Rotation Type',
    {
      ShortestPath: RotationType.ShortestPath,
      LongestPath: RotationType.LongestPath,
      Clockwise: RotationType.Clockwise,
      CounterClockwise: RotationType.CounterClockwise
    },
    RotationType.ShortestPath
  );

  const duration = number('Duration (radians/s)', 1);

  // Rotate back and forth and loop
  const originalRotation = heart.rotation;
  heart.actions

    // Rotate by an amount in radians
    .rotateTo(originalRotation + rotateTo, duration, rotationType)
    .delay(number('Pause', 2000))

    // Rotate to a specific rotation
    .rotateTo(originalRotation, duration, rotationType);
});

rotateTo.story = {
  parameters: {
    docs: { storyDescription: 'Use `Actor.actions.rotateTo()` to rotate the Actor by an absolute amount of radians' }
  }
};

export const rotateBy: Story = withEngine(async (game) => {
  const heartTx = new Texture(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  game.currentScene.camera.zoom = 4;

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

  const rotateBy = number('Rotate by (in radians)', Math.PI);

  const rotationType = select(
    'Rotation Type',
    {
      ShortestPath: RotationType.ShortestPath,
      LongestPath: RotationType.LongestPath,
      Clockwise: RotationType.Clockwise,
      CounterClockwise: RotationType.CounterClockwise
    },
    RotationType.ShortestPath
  );

  const duration = number('Duration (radians/s)', 1);

  // Rotate back and forth and loop
  heart.actions

    // Rotate by an amount in radians
    .rotateBy(rotateBy, duration, rotationType)
    .delay(number('Pause', 2000))

    // Rotate back
    .rotateBy(-rotateBy, duration, rotationType);
});

rotateBy.story = {
  parameters: {
    docs: { storyDescription: 'Use `Actor.actions.rotateBy()` to rotate the Actor by a relative amount of radians' }
  }
};

export const move: Story = withEngine(async (game) => {
  const heartTx = new Texture(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  game.currentScene.camera.zoom = 4;

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

  // Move back and forth and loop
  const originalPos = heart.pos.clone();
  heart.actions

    // Move by an amount in radians
    .moveBy(number('Move by x (px)', -100), number('Move by y (px)', 0), number('Duration (px/s)', 10))
    .delay(number('Pause', 2000))
    // Move to a specific rotation
    .moveTo(originalPos.x, originalPos.y, number('Duration (px/s)', 10));
});

move.story = {
  parameters: {
    docs: { storyDescription: 'Use `Actor.actions.moveBy()` or `Actor.actions.moveTo()` to move the Actor by an amount in pixels' }
  }
};

export const ease: Story = withEngine(async (game) => {
  const heartTx = new Texture(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  game.currentScene.camera.zoom = 4;

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

  // Ease back and forth and loop
  const originalPos = heart.pos.clone();
  heart.actions
    .easeTo(
      originalPos.x + number('Ease by x (px)', -100),
      originalPos.y + number('Ease by y (px)', 0),
      number('Duration (ms)', 1000),
      EasingFunctions.EaseOutCubic
    )
    .easeTo(originalPos.x, originalPos.y, number('Duration (ms)', 1000), EasingFunctions.EaseInOutCubic)
    .repeatForever();
});

ease.story = {
  parameters: {
    docs: { storyDescription: 'Use `Actor.actions.easeTo()` to ease the Actor by an amount in pixels with an easing function' }
  }
};

export const scale: Story = withEngine(async (game) => {
  const heartTx = new Texture(heartTexture);
  const loader = new Loader([heartTx]);

  await game.start(loader);

  game.setAntialiasing(false);

  // Zoom in a bit
  game.currentScene.camera.zoom = 4;

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

  // Scale back and forth and loop
  const originalScale = heart.scale.clone();
  heart.actions
    .scaleBy(number('Scale by x factor', 2), number('Scale by y factor', 2), number('Speed (factor/s)', 2))
    .scaleTo(originalScale.x, originalScale.y, number('Speed (factor/s)', 2), number('Speed (factor/s)', 2))
    .repeatForever();
});

scale.story = {
  parameters: {
    docs: {
      storyDescription:
        'Use `Actor.actions.scaleBy()` and `Actor.actions.scaleTo()` to scale the Actor by a scale factor at a specific speed'
    }
  }
};
