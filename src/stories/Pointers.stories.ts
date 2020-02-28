import * as ex from '../engine';
import { withEngine } from './utils';

export default {
  title: 'Pointer Events'
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
      this.on(ex.EventTypes.PointerDragStart, () => {
        this.color = ex.Color.Black;
      });
      this.on(ex.EventTypes.PointerDragEnd, () => {
        this.color = ex.Color.Green;
      });
      this.on(ex.EventTypes.PointerDragMove, () => {
        this.color = ex.Color.Yellow;
      });
      this.on(ex.EventTypes.PointerLeave, () => {
        this.color = ex.Color.Red;
      });
    }
  }

  var testBlockOne = new TestBlock(150, 100);
  var testBlockTwo = new TestBlock(450, 100);

  game.add(testBlockOne);
  game.add(testBlockTwo);

  await game.start(new ex.Loader());
});
