import { Actor, Texture, Loader, EasingFunctions, RotationType } from '../engine';
import { enumToKnobSelect, withEngine } from './utils';

import heartTexture from './assets/heart.png';

export default {
  title: 'Actors/Actions',
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

export const fade: Story = withEngine(async (game, { startOpacity, endOpacity, pause, duration }) => {
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
  heart.actions.fade(startOpacity, duration).delay(pause).fade(endOpacity, duration);
});

fade.story = {
  parameters: {
    docs: { storyDescription: 'Use `Actor.actions.fade()` to fade in or out the Actor over time' }
  }
};

fade.argTypes = {
  startOpacity: { control: { type: 'number', min: 0, max: 1 } },
  endOpacity: { control: { type: 'number', min: 0, max: 1 } },
  duration: { control: { type: 'number' } },
  pause: { control: { type: 'number' } }
};

fade.args = {
  startOpacity: 1,
  endOpacity: 0,
  duration: 200,
  pause: 2000
};

export const rotateTo: Story = withEngine(async (game, { duration, rotationType, rotateTo, pause }) => {
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
  rotateTo: { control: { type: 'number' } },
  duration: { control: { type: 'number' } },
  pause: { control: { type: 'number' } },
  rotationType: { control: { type: 'select' }, options: enumToKnobSelect(RotationType) }
};

rotateTo.args = {
  duration: 1,
  pause: 2000,
  rotateTo: Math.PI,
  rotationType: RotationType.ShortestPath
};

export const rotateBy: Story = withEngine(async (game, { duration, rotationType, rotateBy, pause }) => {
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
  rotateBy: { control: { type: 'number' } },
  duration: { control: { type: 'number' } },
  pause: { control: { type: 'number' } },
  rotationType: { control: { type: 'select' }, options: enumToKnobSelect(RotationType) }
};

rotateBy.args = {
  duration: 1,
  pause: 2000,
  rotateBy: Math.PI,
  rotationType: RotationType.ShortestPath
};

export const move: Story = withEngine(async (game, { moveX, moveY, pause, duration }) => {
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
  moveX: { control: { type: 'number' } },
  moveY: { control: { type: 'number' } },
  duration: { control: { type: 'number' } },
  pause: { control: { type: 'number' } }
};

move.args = {
  duration: 10,
  pause: 2000,
  moveX: -100,
  moveY: 0
};

export const ease: Story = withEngine(async (game, { easeX, easeY, pause, duration }) => {
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
  easeX: { control: { type: 'number' } },
  easeY: { control: { type: 'number' } },
  duration: { control: { type: 'number' } },
  pause: { control: { type: 'number' } }
};

ease.args = {
  duration: 1000,
  pause: 2000,
  easeX: -100,
  easeY: 0
};

export const scale: Story = withEngine(async (game, { scaleX, scaleY, speed }) => {
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
  scaleX: { control: { type: 'number' } },
  scaleY: { control: { type: 'number' } },
  speed: { control: { type: 'number' } }
};

scale.args = {
  speed: 2,
  scaleX: 2,
  scaleY: 2
};
