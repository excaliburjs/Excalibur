import { Actor, Color, Loader } from '../engine';
import { Font, ImageSource, Text } from '../engine/Graphics';
import { withEngine } from './utils';

import heartTexture from './assets/heart.png';

export default {
  title: 'Engine'
};

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
      if (!game.isPaused()) {
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
