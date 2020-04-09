import { action } from '@storybook/addon-actions';
import * as ex from '../engine';
import { withEngine } from './utils';

export default {
  title: 'Pointer Events'
};

export const subscribingToEvents: Story = withEngine(async (game) => {
  class TestBlock extends ex.Actor {
    constructor(x: number, y: number) {
      super({
        pos: new ex.Vector(x, y),
        height: 100,
        width: 100,
        color: ex.Color.Red
      });
    }

    onInitialize() {
      this.on(ex.EventTypes.PointerUp, (e) => {
        this.color = ex.Color.Black;
        action('pointerup')(e);
      });
      this.on(ex.EventTypes.PointerDown, (e) => {
        this.color = ex.Color.Green;
        action('pointerdown')(e);
      });
      this.on(ex.EventTypes.PointerEnter, (e) => {
        this.color = ex.Color.Yellow;
        action('pointerenter')(e);
      });
      this.on(ex.EventTypes.PointerLeave, (e) => {
        this.color = ex.Color.Red;
        action('pointerleave')(e);
      });
      this.on(ex.EventTypes.PointerMove, (e) => {
        this.color = ex.Color.Blue;
        action('pointermove')(e);
      });
    }
  }

  const block = new TestBlock(100, 100);

  game.add(block);

  await game.start(new ex.Loader());

  game.input.pointers.primary.on('up', (e) => {
    action('engine.pointerup')(e);
  });

  game.input.pointers.primary.on('down', (e) => {
    action('engine.pointerdown')(e);
  });
});

subscribingToEvents.story = {
  parameters: {
    componentSubtitle: 'The Pointer Events API provides consistent support for mouse and touch events'
  }
};

export const dragEvents: Story = withEngine(async (game) => {
  class TestBlock extends ex.Actor {
    constructor(x: number, y: number) {
      super({
        pos: new ex.Vector(x, y),
        height: 100,
        width: 100,
        color: ex.Color.Red
      });
    }

    onInitialize() {
      this.on(ex.EventTypes.PointerDragStart, (e) => {
        this.color = ex.Color.Black;
        action('pointerdragstart')(e);
      });
      this.on(ex.EventTypes.PointerDragEnd, (e) => {
        this.color = ex.Color.Green;
        action('pointerdragend')(e);
      });
      this.on(ex.EventTypes.PointerDragMove, (e) => {
        this.color = ex.Color.Yellow;
        this.pos.setTo(e.pos.x, e.pos.y);
        action('pointerdragmove')(e);
      });
      this.on(ex.EventTypes.PointerLeave, (e) => {
        this.color = ex.Color.Red;
        action('pointerleave')(e);
      });
    }
  }

  var testBlockOne = new TestBlock(150, 100);
  var testBlockTwo = new TestBlock(450, 100);

  game.add(testBlockOne);
  game.add(testBlockTwo);

  await game.start(new ex.Loader());
});

dragEvents.story = {
  parameters: {
    docs: {
      storyDescription: `
In Excalibur you can subscribe to \`pointerdragstart\`, \`pointerdragmove\` and \`pointerdragend\` events 
to perform drag-and-drop actions on Actors.
    
The actions pane displays the pointer events captured during the demo. Try clicking a box and dragging it around.
      `
    }
  }
};
