import { action } from '@storybook/addon-actions'
import { Actor, Sound, Loader, Label, Color } from '../engine';
import { withEngine } from './utils';

import audioLoop from './assets/loop.mp3';

export default {
  title: 'Audio'
};

export const webAudio: Story = withEngine(async (game) => {
  var loader = new Loader();
  var testSound = new Sound(audioLoop);
  loader.addResource(testSound);

  const startBtn = new Actor(game.currentScene.camera.x + 50, 50, 100, 100, Color.White);
  const stopBtn = new Actor(game.currentScene.camera.x + 50, 70, 175, 100, Color.Blue);
  const pauseBtn = new Actor(game.currentScene.camera.x + 50, 90, 250, 100, Color.Green);
  const indicator = new Actor(game.currentScene.camera.x, game.currentScene.camera.y, 150, 50, Color.Red);

  startBtn.enableCapturePointer = true;
  startBtn.add(new Label('start - indicator green', -50, 40));
  startBtn.on('pointerup', (evt) => {
    if (!testSound.isPlaying()) {
      indicator.color = Color.Green;

      testSound.play().then(() => {
        indicator.color = Color.Red;
        action('start')(evt);
      });
    }
    
    evt.stopPropagation();
  });
  stopBtn.enableCapturePointer = true;
  stopBtn.add(new Label('stop - indicator red', -50, 40));
  stopBtn.on('pointerup', (evt) => {
    if (testSound.isPlaying()) {
      testSound.stop();
      startBtn.color = Color.Red;
      action('stop')(evt);
    }
    evt.stopPropagation();
  });
  pauseBtn.enableCapturePointer = true;
  pauseBtn.add(new Label('pause - indicator yellow', -50, 40));
  pauseBtn.on('pointerup', (evt) => {
    if (testSound.isPlaying()) {
      testSound.pause();
      indicator.color = Color.Yellow;
      action('pause')(evt);
    }
    evt.stopPropagation();
  });

  game.add(pauseBtn);
  game.add(stopBtn);
  game.add(startBtn);
  game.add(indicator);

  await game.start(loader);
});
