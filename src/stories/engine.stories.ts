import type { Meta, StoryObj } from '@storybook/html-vite';
import { Actor, Color, Loader, Logger } from '../engine';
import { BaseAlign, Font, ImageSource, Text } from '../engine/graphics';
import { withEngine } from './utils';
import { SpriteSheet, SpriteFont } from '../engine/graphics';
import heartTexture from './assets/heart.png';
import spriteFontTexture from './assets/spritefont.png';

export default {
  title: 'Engine'
} as Meta;

export const WordWrap: StoryObj = {
  render: withEngine(async (game) => {
    const spriteFontImage = new ImageSource(spriteFontTexture);
    const loader = new Loader([spriteFontImage]);
    await game.start(loader);

    const spriteFontSheet = SpriteSheet.fromImageSource({
      image: spriteFontImage,
      grid: {
        rows: 3,
        columns: 16,
        spriteWidth: 16,
        spriteHeight: 16
      }
    });

    const spriteFont = new SpriteFont({
      alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
      caseInsensitive: true,
      spacing: -5,
      spriteSheet: spriteFontSheet
    });

    const textWrapActor = new Actor({
      width: 100,
      height: 100,
      x: 550,
      y: 350,
      color: Color.Blue
    });

    const spriteTextWrapActor = new Actor({
      width: 100,
      height: 100,
      x: 250,
      y: 350,
      color: Color.Green
    });

    const text = new Text({
      text: 'WORD_WRAP_TEST........',
      color: Color.White,
      font: new Font({ size: 24, baseAlign: BaseAlign.Top }),
      maxWidth: 100
    });
    const spriteText = new Text({
      text: 'spritewordwraptest................',
      font: spriteFont,
      maxWidth: 100 - 5 // sub 5 to account for padding I don't completely understand
    });

    text.font.showDebug = true;
    spriteText.font.showDebug = true;

    textWrapActor.graphics.add(text);
    spriteTextWrapActor.graphics.add(spriteText);

    Logger.getInstance().info(spriteText.localBounds.left + ',' + spriteTextWrapActor.pos.x);

    game.add(textWrapActor);
    game.add(spriteTextWrapActor);

    game.start();
  })
};

export const PlayButton: StoryObj = {
  render: withEngine(
    async (game) => {
      const heartTx = new ImageSource(heartTexture);
      const loader = new Loader([heartTx]);
      await game.start(loader);
      game.screen.antialiasing = false;
      game.currentScene.camera.pos.setTo(game.halfDrawWidth, game.halfDrawHeight);
      game.currentScene.camera.zoom = 4;
      const heart = new Actor({
        x: game.currentScene.camera.x,
        y: game.currentScene.camera.y,
        width: 50,
        height: 50
      });
      heart.on('pointerdown', async (_evnt: ex.PointerEvent) => {
        if (game.isRunning()) {
          game.stop();
          await loader.showPlayButton();
          game.start();
        }
      });
      heart.actions.repeatForever((actions) => {
        actions.scaleBy(2, 2, 2).scaleBy(-2, -2, 2);
      });
      const text = new Text({
        text: 'Pause',
        color: Color.White,
        font: new Font({ size: 4 })
      });
      heart.graphics.add(heartTx.toSprite());
      heart.graphics.add(text);
      game.add(heart);
    },
    {
      suppressPlayButton: false
    }
  )
};
