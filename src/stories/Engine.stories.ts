import { Actor, Color, Loader } from '../engine';
import { BaseAlign, Font, ImageSource, Text } from '../engine/Graphics';
import { withEngine } from './utils';

import heartTexture from './assets/heart.png';

export default {
  title: 'Engine'
};

export const wordWrap: Story = withEngine(async (game) => {
  game.start();
  const dummyActor = new Actor({
    width: 100,
    height: 100,
    x: 550,
    y: 350,
    color: Color.Blue
  });

  const text = new Text({
    text: 'WORD_WRAP_TEST',
    color: Color.White,
    font: new Font({ size: 24, baseAlign: BaseAlign.Top }),
    maxWidth: 100
  });

  text.font.showDebug = true;
  dummyActor.graphics.add(text);
  game.add(dummyActor);
});

export const playButton: Story = withEngine(
  async (game) => {
    const heartTx = new ImageSource(heartTexture);
    const loader = new Loader([heartTx]);
    await game.start(loader);
    game.setAntialiasing(false);
    game.currentScene.camera.pos.setTo(game.halfDrawWidth, game.halfDrawHeight);
    game.currentScene.camera.zoom = 4;
    const heart = new Actor({
      x: game.currentScene.camera.x,
      y: game.currentScene.camera.y,
      width: 50,
      height: 50
    });
    heart.on('pointerdown', async (_evnt: ex.Input.PointerEvent) => {
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
);
