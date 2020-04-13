import { action } from '@storybook/addon-actions';
import { number, withKnobs } from '@storybook/addon-knobs';
import playIcon from '@fortawesome/fontawesome-free/svgs/solid/play.svg';
import pauseIcon from '@fortawesome/fontawesome-free/svgs/solid/pause.svg';
import stopIcon from '@fortawesome/fontawesome-free/svgs/solid/stop.svg';
import { Actor, Sound, Loader, Color, Texture, Sprite, NativeSoundEvent, EasingFunctions, NativeSoundProcessedEvent } from '../engine';
import { withEngine } from './utils';

import guitarLoop from './assets/loop-guitar.mp3';
import campfireLoop from './assets/loop-campfire.mp3';
import forestLoop from './assets/loop-forest.mp3';

export default {
  title: 'Audio',
  decorators: [withKnobs]
};

export const playingASound: Story = withEngine(async (game) => {
  const loader = new Loader();
  const guitarLoopSound = new Sound(guitarLoop);
  const playIconTx = new Texture(playIcon);
  const pauseIconTx = new Texture(pauseIcon);
  const stopIconTx = new Texture(stopIcon);

  loader.addResources([guitarLoopSound, playIconTx, pauseIconTx, stopIconTx]);

  guitarLoopSound.on('processed', (e: NativeSoundProcessedEvent) => {
    action('Guitar loop sound processed')(e);
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
    if (!guitarLoopSound.isPlaying()) {
      guitarLoopSound.play();
    } else {
      guitarLoopSound.pause();
    }

    evt.stopPropagation();
  });
  stopBtn.addDrawing(stopSprite);
  stopBtn.enableCapturePointer = true;

  const playheadStartPos = playTimeline.body.collider.bounds.left;
  const playheadEndPos = playTimeline.body.collider.bounds.right;
  let startTime = 0;
  let elapsedTime = 0;

  playHead.pos.setTo(playheadStartPos, playHead.pos.y);

  guitarLoopSound.on('playbackstart', (e: NativeSoundEvent) => {
    playHead.pos.setTo(playheadStartPos, playHead.pos.y);
    if (guitarLoopSound.duration > 0) {
      startTime = Date.now();
      elapsedTime = 0;
      playHead.actions.easeTo(playheadEndPos, playHead.pos.y, guitarLoopSound.duration * 1000, EasingFunctions.Linear);
    }
    startOrPauseBtn.setDrawing('pause');
    action('playbackstart')(e);
  });

  guitarLoopSound.on('pause', (e) => {
    elapsedTime = Date.now() - startTime + elapsedTime;
    playHead.actions.clearActions();
    startOrPauseBtn.setDrawing('play');
    action('pause')(e, elapsedTime);
  });

  guitarLoopSound.on('resume', (e: NativeSoundEvent) => {
    startTime = Date.now();
    if (guitarLoopSound.duration > 0) {
      playHead.actions.easeTo(playheadEndPos, playHead.pos.y, guitarLoopSound.duration * 1000 - elapsedTime, EasingFunctions.Linear);
    }
    startOrPauseBtn.setDrawing('pause');
    action('resume')(e);
  });

  guitarLoopSound.on('playbackend', (e) => {
    playHead.actions.clearActions();
    playHead.pos.setTo(playheadStartPos, playHead.pos.y);
    startOrPauseBtn.setDrawing('play');
    action('playbackend')(e);
  });

  stopBtn.on('pointerup', (evt) => {
    guitarLoopSound.stop();
    playHead.pos.setTo(playheadStartPos, playHead.pos.y);

    evt.stopPropagation();
  });

  game.add(stopBtn);
  game.add(startOrPauseBtn);
  game.add(playTimeline);
  game.add(playHead);
});

export const multipleTracksAndLooping = withEngine(async (game) => {
  const loader = new Loader();
  const guitarLoopSound = new Sound(guitarLoop);
  const campfireLoopSound = new Sound(campfireLoop);
  const forestLoopSound = new Sound(forestLoop);
  const playIconTx = new Texture(playIcon);
  loader.addResources([guitarLoopSound, campfireLoopSound, forestLoopSound, playIconTx]);

  game.on('visible', () => {
    action('visible')('Game was visible, sound should continue playing');
  });

  game.on('hidden', () => {
    action('hidden')('Game was hidden, sound should pause playing');
  });

  await game.start(loader);

  const playAction = action('play');
  const startGuitarAt = number('Begin playing guitar after (in milliseconds)', 2000);

  const startBtn = new Actor(game.currentScene.camera.x - 42, 50, 32, 32, Color.White);
  const playSprite = new Sprite({ image: playIconTx, x: 0, y: 0, width: 32, height: 32 });
  playSprite.fill(Color.White);

  startBtn.addDrawing(playSprite);
  startBtn.enableCapturePointer = true;
  startBtn.on('pointerup', (evt) => {
    playAction('Playing campfire and forest sounds ');
    playSprite.fill(Color.Green);

    guitarLoopSound.loop = true;
    campfireLoopSound.loop = true;
    forestLoopSound.loop = true;
    campfireLoopSound.play();
    forestLoopSound.play();

    setTimeout(() => {
      playAction('Playing guitar loop');
      guitarLoopSound.play();
    }, startGuitarAt);

    evt.stopPropagation();
  });

  game.add(startBtn);
});


export const volumeLevels = withEngine(async (game) => {
  const loader = new Loader();
  const testSound = new Sound(guitarLoop);
  const playIconTx = new Texture(playIcon);

  loader.addResources([testSound, playIconTx]);

  //click a button to play the sound
  const playAction = action('play');
  const startBtn = new Actor(game.currentScene.camera.x - 42, 50, 32, 32, Color.White);
  const playSprite = new Sprite({ image: playIconTx, x: 0, y: 0, width: 32, height: 32 });
  playSprite.fill(Color.White);
  startBtn.addDrawing(playSprite);
  startBtn.enableCapturePointer = true;

  const volumeOptions = {
    range: true,
    min: 0,
    max: 1,
    step: 0.1
  };
  const initialVolume = number('Initial volume', 0.2, volumeOptions);
  const delayVolume = number('Adjusted volume', 1, volumeOptions);

  startBtn.on('pointerup', function () {
    playAction('Playing guitar sound, volume will adjust in 2 seconds');

    playSprite.fill(Color.Green);

    //button will turn red again when song is done
    if (!testSound.isPlaying()) {
      testSound.play(initialVolume).then(function () {
        playSprite.fill(Color.White);
      });

      //change volume of the sound after 2000 ms to show that
      //initial setting worked
      setTimeout(function () {
        testSound.volume = delayVolume;
      }, 2000);
    }
  });
  game.add(startBtn);

  await game.start(loader);
});
