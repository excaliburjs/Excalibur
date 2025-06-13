import type { Meta, StoryObj } from '@storybook/html-vite';
import type { Keys } from '../engine';
import { Label, Color } from '../engine';
import { withEngine } from './utils';

export default {
  title: 'Keyboard Input'
} as Meta;

export const KeyEvents: StoryObj = {
  render: withEngine(async (game) => {
    let lastKeysPressed: string;
    const keyLabel = new Label({
      x: game.halfCanvasWidth,
      y: game.halfCanvasHeight
    });
    keyLabel.font.size = 72;
    keyLabel.color = Color.White;

    const lastKey = new Label({
      x: game.halfCanvasWidth,
      y: game.halfCanvasHeight + 72
    });
    lastKey.font.size = 18;
    lastKey.color = Color.Cyan;

    keyLabel.on('preupdate', () => {
      const keys = game.input.keyboard.getKeys();

      if (keys.length === 0) {
        keyLabel.text = 'Press some keys';
      } else {
        lastKeysPressed = keys.map((k) => k as Keys).join('');
        keyLabel.text = lastKeysPressed;
      }
    });

    keyLabel.on('postupdate', () => {
      lastKey.text = 'Last Pressed: ' + (lastKeysPressed || 'none');
    });

    keyLabel.on('predraw', () => {
      // center text, which can be measured after we've drawn for the next frame
      keyLabel.pos.setTo(game.halfCanvasWidth - keyLabel.getTextWidth() / 2, keyLabel.pos.y);
      lastKey.pos.setTo(game.halfCanvasWidth - lastKey.getTextWidth() / 2, lastKey.pos.y);
    });

    game.add(keyLabel);
    game.add(lastKey);

    await game.start();
  })
};
