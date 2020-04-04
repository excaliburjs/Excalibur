import { action } from '@storybook/addon-actions';
import playIcon from '@fortawesome/fontawesome-free/svgs/solid/play.svg';
import pauseIcon from '@fortawesome/fontawesome-free/svgs/solid/pause.svg';
import stopIcon from '@fortawesome/fontawesome-free/svgs/solid/stop.svg';
import { Actor, Sound, Loader, Color, Texture, Sprite, NativeSoundEvent, EasingFunctions, NativeSoundProcessedEvent } from '../engine';
import { withEngine } from './utils';

import audioLoop from './assets/loop.mp3';

export default {
  title: 'Audio'
};

export const webAudio: Story = withEngine(async (game) => {
  const loader = new Loader();
  const testSound = new Sound(audioLoop);
  const playIconTx = new Texture(playIcon);
  const pauseIconTx = new Texture(pauseIcon);
  const stopIconTx = new Texture(stopIcon);

  loader.addResources([testSound, playIconTx, pauseIconTx, stopIconTx]);

  testSound.on('processed', (e: NativeSoundProcessedEvent) => {
    action('testSound processed')(e);
  });

  await game.start(loader);

  const startOrPauseBtn = new Actor(game.currentScene.camera.x - 42, 50, 32, 32, Color.White);
  const stopBtn = new Actor(game.currentScene.camera.x, 50, 32, 32, Color.Blue);
  const playHead = new Actor(game.currentScene.camera.x, 100, 2, 25, Color.White);
  const playTimeline = new Actor(game.currentScene.camera.x, 100, 250, 3, Color.White);

  const playSprite = new Sprite({ image: playIconTx, x: 0, y: 0, width: 32, height: 32 });
  playSprite.fill(Color.White);
  const pauseSprite = new Sprite({ image: pauseIconTx, x: 0, y: 0, width: 32, height: 32 });
  pauseSprite.fill(Color.White);
  const stopSprite = new Sprite({ image: stopIconTx, x: 0, y: 0, width: 32, height: 32 });
  stopSprite.fill(Color.White);

  startOrPauseBtn.addDrawing('play', playSprite);
  startOrPauseBtn.addDrawing('pause', pauseSprite);
  startOrPauseBtn.setDrawing('play');

  startOrPauseBtn.enableCapturePointer = true;
  startOrPauseBtn.on('pointerup', (evt) => {
    if (!testSound.isPlaying()) {
      testSound.play();
    } else {
      testSound.pause();
    }

    evt.stopPropagation();
  });
  stopBtn.addDrawing(stopSprite);
  stopBtn.enableCapturePointer = true;
  stopBtn.on('pointerup', (evt) => {
    if (testSound.isPlaying()) {
      testSound.stop();
    }
    evt.stopPropagation();
  });

  const playheadStartPos = playTimeline.body.collider.bounds.left;
  const playheadEndPos = playTimeline.body.collider.bounds.right;
  let startTime = 0;
  let elapsedTime = 0;

  playHead.pos.setTo(playheadStartPos, playHead.pos.y);

  testSound.on('playbackstart', (e: NativeSoundEvent) => {
    playHead.pos.setTo(playheadStartPos, playHead.pos.y);
    if (testSound.duration > 0) {
      startTime = Date.now();
      elapsedTime = 0;
      playHead.actions.easeTo(playheadEndPos, playHead.pos.y, testSound.duration * 1000, EasingFunctions.Linear);
    }
    startOrPauseBtn.setDrawing('pause');
    action('playbackstart')(e)
  });

  testSound.on('pause', (e) => {
    elapsedTime = (Date.now() - startTime) + elapsedTime
    playHead.actions.clearActions();
    startOrPauseBtn.setDrawing('play');
    action('pause')(e, elapsedTime)
  });

  testSound.on('resume', (e: NativeSoundEvent) => {
    startTime = Date.now()
    if (testSound.duration > 0) {
      playHead.actions.easeTo(playheadEndPos, playHead.pos.y, testSound.duration * 1000 - elapsedTime, EasingFunctions.Linear);
    }
    startOrPauseBtn.setDrawing('pause');
    action('resume')(e)
  });

  testSound.on('playbackend', (e) => {
    playHead.actions.clearActions()
    playHead.pos.setTo(playheadStartPos, playHead.pos.y);
    startOrPauseBtn.setDrawing('play');
    action('playbackend')(e)
  });

  game.add(stopBtn);
  game.add(startOrPauseBtn);
  game.add(playTimeline);
  game.add(playHead);
});
