import type { Meta, StoryObj } from '@storybook/html-vite';
import * as ex from '../engine';
import { withEngine } from './utils';

export default {
  title: 'Pointer Events'
} as Meta;

export const SubscribingToEvents: StoryObj = {
  render: withEngine(async (game) => {
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
        this.on(ex.EventTypes.PointerUp, () => {
          this.color = ex.Color.Black;
        });
        this.on(ex.EventTypes.PointerDown, () => {
          this.color = ex.Color.Green;
        });
        this.on(ex.EventTypes.PointerEnter, () => {
          this.color = ex.Color.Yellow;
        });
        this.on(ex.EventTypes.PointerLeave, () => {
          this.color = ex.Color.Red;
        });
        this.on(ex.EventTypes.PointerMove, () => {
          this.color = ex.Color.Blue;
        });
      }
    }

    const block = new TestBlock(100, 100);

    game.add(block);

    await game.start(new ex.Loader());

    // game.input.pointers.primary.on('up', (e) => {
    //   action('engine.pointerup')(e);
    // });

    // game.input.pointers.primary.on('down', (e) => {
    //   action('engine.pointerdown')(e);
    // });
  }),
  parameters: {
    componentSubtitle: 'The Pointer Events API provides consistent support for mouse and touch events'
  }
};

export const ConfiguringPointerTarget: StoryObj = {
  render: withEngine(async (game, { useCollider, useGraphics }) => {
    class TestBlock extends ex.Actor {
      public rectangle = new ex.Rectangle({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });
      constructor(x: number, y: number) {
        super({
          pos: new ex.Vector(x, y),
          height: 100,
          width: 100
        });

        this.graphics.add(this.rectangle);

        this.get(ex.PointerComponent).useColliderShape = useCollider;
        this.get(ex.PointerComponent).useGraphicsBounds = useGraphics;
      }

      onInitialize() {
        this.on(ex.EventTypes.PointerUp, () => {
          this.rectangle.color = ex.Color.Black;
        });
        this.on(ex.EventTypes.PointerDown, () => {
          this.rectangle.color = ex.Color.Green;
        });
        this.on(ex.EventTypes.PointerEnter, () => {
          this.rectangle.color = ex.Color.Yellow;
        });
        this.on(ex.EventTypes.PointerLeave, () => {
          this.rectangle.color = ex.Color.Red;
        });
        this.on(ex.EventTypes.PointerMove, () => {
          this.rectangle.color = ex.Color.Yellow;
        });
      }
    }

    const block = new TestBlock(100, 100);

    game.add(block);

    game.toggleDebug();
    game.debug.entity.showId = false;
    game.debug.graphics.showBounds = true;
    game.debug.collider.showGeometry = true;
    game.debug.collider.showBounds = false;

    await game.start(new ex.Loader());
  }),
  parameters: {
    notes: 'Pointers can be configured to use the collider geometry and/or the graphic bounds for triggering events'
  },
  argTypes: {
    useCollider: {
      name: 'Use Collider geometry for pointers (default true)',
      control: {
        type: 'boolean'
      }
    },
    useGraphics: {
      name: 'Use Graphics bounds for pointers (default false)',
      control: {
        type: 'boolean'
      }
    }
  },
  args: {
    useCollider: true,
    useGraphics: false
  }
};

export const DragEvents: StoryObj = {
  render: withEngine(async (game) => {
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
        this.on(ex.EventTypes.PointerDragStart, () => {
          this.color = ex.Color.Black;
        });
        this.on(ex.EventTypes.PointerDragEnd, () => {
          this.color = ex.Color.Green;
        });
        this.on(ex.EventTypes.PointerDragMove, (e) => {
          this.color = ex.Color.Yellow;
          this.pos.setTo(e.worldPos.x, e.worldPos.y);
        });
        this.on(ex.EventTypes.PointerLeave, () => {
          this.color = ex.Color.Red;
        });
      }
    }

    const testBlockOne = new TestBlock(150, 100);
    const testBlockTwo = new TestBlock(450, 100);

    game.add(testBlockOne);
    game.add(testBlockTwo);

    await game.start(new ex.Loader());
  }),
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
