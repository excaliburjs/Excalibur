import type { Meta, StoryObj } from '@storybook/html-vite';
import { action } from 'storybook/actions';
import playIcon from '@fortawesome/fontawesome-free/svgs/solid/play.svg';
import pauseIcon from '@fortawesome/fontawesome-free/svgs/solid/pause.svg';
import stopIcon from '@fortawesome/fontawesome-free/svgs/solid/stop.svg';
import type { NativeSoundEvent, NativeSoundProcessedEvent } from '../engine';
import { Actor, Sound, Loader, Color, linear, vec } from '../engine';
import { ImageSource, Sprite } from '../engine/graphics';
import { withEngine } from './utils';

import guitarLoop from './assets/loop-guitar.mp3';
import campfireLoop from './assets/loop-campfire.mp3';
import forestLoop from './assets/loop-forest.mp3';

export default {
  title: 'Audio'
} as Meta;

export const PlayingASound: StoryObj = {
  render: withEngine(async (game) => {
    const loader = new Loader();
    const guitarLoopSound = new Sound(guitarLoop);
    const playIconTx = new ImageSource(playIcon);
    const pauseIconTx = new ImageSource(pauseIcon);
    const stopIconTx = new ImageSource(stopIcon);

    loader.addResources([guitarLoopSound, playIconTx, pauseIconTx, stopIconTx]);

    guitarLoopSound.on('processed', (e: NativeSoundProcessedEvent) => {
      action('Guitar loop sound processed')(e);
    });

    await game.start(loader);

    const startOrPauseBtn = new Actor({ x: game.currentScene.camera.x - 42, y: 50, width: 32, height: 32 });
    const stopBtn = new Actor({ x: game.currentScene.camera.x, y: 50, width: 32, height: 32, color: Color.Blue });
    const playHead = new Actor({ x: game.currentScene.camera.x, y: 100, width: 2, height: 25, color: Color.White });
    const playTimeline = new Actor({ x: game.currentScene.camera.x, y: 100, width: 250, height: 3, color: Color.White });

    const playSprite = new Sprite({ image: playIconTx, destSize: { width: 32, height: 32 } });
    // playSprite.fill(Color.White);
    const pauseSprite = new Sprite({ image: pauseIconTx, destSize: { width: 32, height: 32 } });
    // pauseSprite.fill(Color.White);
    const stopSprite = new Sprite({ image: stopIconTx, destSize: { width: 32, height: 32 } });
    // stopSprite.fill(Color.White);

    startOrPauseBtn.graphics.add('play', playSprite);
    startOrPauseBtn.graphics.add('pause', pauseSprite);
    startOrPauseBtn.graphics.use('play');

    startOrPauseBtn.on('pointerup', (evt) => {
      if (!guitarLoopSound.isPlaying()) {
        guitarLoopSound.play();
      } else {
        guitarLoopSound.pause();
      }

      evt.cancel();
    });
    stopBtn.graphics.use(stopSprite);

    const playheadStartPos = playTimeline.collider.bounds.left;
    const playheadEndPos = playTimeline.collider.bounds.right;
    let startTime = 0;
    let elapsedTime = 0;

    playHead.pos.setTo(playheadStartPos, playHead.pos.y);

    guitarLoopSound.on('playbackstart', (e: NativeSoundEvent) => {
      playHead.pos.setTo(playheadStartPos, playHead.pos.y);
      if (guitarLoopSound.duration > 0) {
        startTime = Date.now();
        elapsedTime = 0;
        playHead.actions.moveTo({ pos: vec(playheadEndPos, playHead.pos.y), duration: guitarLoopSound.duration * 1000, easing: linear });
      }
      startOrPauseBtn.graphics.use('pause');
      action('playbackstart')(e);
    });

    guitarLoopSound.on('pause', (e) => {
      elapsedTime = Date.now() - startTime + elapsedTime;
      playHead.actions.clearActions();
      startOrPauseBtn.graphics.use('play');
      action('pause')(e, elapsedTime);
    });

    guitarLoopSound.on('resume', (e: NativeSoundEvent) => {
      startTime = Date.now();
      if (guitarLoopSound.duration > 0) {
        playHead.actions.moveTo({
          pos: vec(playheadEndPos, playHead.pos.y),
          duration: guitarLoopSound.duration * 1000 - elapsedTime,
          easing: linear
        });
      }
      startOrPauseBtn.graphics.use('pause');
      action('resume')(e);
    });

    guitarLoopSound.on('playbackend', (e) => {
      playHead.actions.clearActions();
      playHead.pos.setTo(playheadStartPos, playHead.pos.y);
      startOrPauseBtn.graphics.use('play');
      action('playbackend')(e);
    });

    stopBtn.on('pointerup', (evt) => {
      guitarLoopSound.stop();
      playHead.pos.setTo(playheadStartPos, playHead.pos.y);

      evt.cancel();
    });

    game.add(stopBtn);
    game.add(startOrPauseBtn);
    game.add(playTimeline);
    game.add(playHead);
  })
};

export const MultipleTracksAndLooping: StoryObj = {
  render: withEngine(async (game, { beginGuitarDelay }) => {
    const loader = new Loader();
    const guitarLoopSound = new Sound(guitarLoop);
    const campfireLoopSound = new Sound(campfireLoop);
    const forestLoopSound = new Sound(forestLoop);
    const playIconTx = new ImageSource(playIcon);
    loader.addResources([guitarLoopSound, campfireLoopSound, forestLoopSound, playIconTx]);

    game.on('visible', () => {
      action('visible')('Game was visible, sound should continue playing');
    });

    game.on('hidden', () => {
      action('hidden')('Game was hidden, sound should pause playing');
    });

    await game.start(loader);

    const playAction = action('play');
    const startGuitarAt = beginGuitarDelay;

    const startBtn = new Actor({ x: game.currentScene.camera.x - 42, y: 50, width: 32, height: 32, color: Color.White });
    const playSprite = new Sprite({ image: playIconTx, destSize: { width: 32, height: 32 } });
    // playSprite.fill(Color.White);

    startBtn.graphics.add(playSprite);
    startBtn.on('pointerup', (evt) => {
      playAction('Playing campfire and forest sounds ');
      // playSprite.fill(Color.Green);

      guitarLoopSound.loop = true;
      campfireLoopSound.loop = true;
      forestLoopSound.loop = true;
      campfireLoopSound.play();
      forestLoopSound.play();

      setTimeout(() => {
        playAction('Playing guitar loop');
        guitarLoopSound.play();
      }, startGuitarAt);

      evt.cancel();
    });

    game.add(startBtn);
  }),
  args: {
    beginGuitarDelay: 2000
  }
};

export const VolumeLevels: StoryObj = {
  render: withEngine(async (game, { initialVolume, delayVolume }) => {
    const loader = new Loader();
    const testSound = new Sound(guitarLoop);
    const playIconTx = new ImageSource(playIcon);

    loader.addResources([testSound, playIconTx]);

    // click a button to play the sound
    const playAction = action('play');
    const startBtn = new Actor({ x: game.currentScene.camera.x - 42, y: 50, width: 32, height: 32, color: Color.White });
    const playSprite = new Sprite({ image: playIconTx, destSize: { width: 32, height: 32 } });
    startBtn.graphics.add(playSprite);

    startBtn.on('pointerup', function () {
      playAction('Playing guitar sound, volume will adjust in 2 seconds');

      if (!testSound.isPlaying()) {
        testSound.play(initialVolume).then(function () {
          /* do nothing */
        });

        setTimeout(function () {
          testSound.volume = delayVolume;
        }, 2000);
      }
    });
    game.add(startBtn);

    await game.start(loader);
  }),
  argTypes: {
    initialVolume: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.1
      }
    },
    delayVolume: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.1
      }
    }
  },
  args: {
    initialVolume: 0.2,
    delayVolume: 1
  }
};
