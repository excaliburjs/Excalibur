import { storiesOf } from '@storybook/html';
import { withKnobs, number } from '@storybook/addon-knobs';
import { Actor, Texture, Loader } from '../';
import { withEngine } from '../story-utils';

import heartTexture from '../__assets__/heart.png';

storiesOf('Actions', module)
  .addDecorator(withKnobs as any)
  .add(
    'fade',
    withEngine(async (game) => {
      const hrt = new Texture(heartTexture);
      const ldr = new Loader([hrt]);

      await game.start(ldr);

      const heart = new Actor(game.halfCanvasWidth, game.halfCanvasHeight, 50, 50);
      heart.addDrawing(hrt);

      heart.opacity = 0;

      game.add(heart);

      heart.actions
        .fade(number('Starting Opacity', 1), number('Duration', 200))
        .delay(number('Delay', 2000))
        .fade(number('Ending Opacity', 0), number('Duration', 200));
    }),
    { notes: 'Should show a heart and fade out after 2 seconds' }
  );
