import { Label, Color, Input } from '../engine';
import { withEngine } from './utils';

export default {
  title: 'Keyboard Input'
};

export const keyEvents = withEngine(async (game) => {
  let lastKeysPressed: string;
  const keyLabel = new Label({
    x: game.halfCanvasWidth,
    y: game.halfCanvasHeight,
    color: Color.White,
    fontSize: 72
  });

  const lastKey = new Label({
    x: game.halfCanvasWidth,
    y: game.halfCanvasHeight + 72,
    color: Color.Cyan,
    fontSize: 18
  });

  keyLabel.on('preupdate', () => {
    const keys = game.input.keyboard.getKeys();

    if (keys.length === 0) {
      keyLabel.text = 'Press some keys';
    } else {
      const lastKeysPressed = keys.map((k) => k as Input.Keys).join('');
      keyLabel.text = lastKeysPressed;
    }
  });

  keyLabel.on('postupdate', () => {
    lastKey.text = 'Last Pressed: ' + (lastKeysPressed || 'none');
  });

  keyLabel.on('predraw', (e) => {
    // center text, which can be measured after we've drawn for the next frame
    keyLabel.pos.setTo(game.halfCanvasWidth - keyLabel.getTextWidth(e.ctx) / 2, keyLabel.pos.y);
    lastKey.pos.setTo(game.halfCanvasWidth - lastKey.getTextWidth(e.ctx) / 2, lastKey.pos.y);
  });

  game.add(keyLabel);
  game.add(lastKey);

  await game.start();
});
