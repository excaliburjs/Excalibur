export default `
import * as ex from 'excalibur';
console.log('hello world');

const game = new ex.Engine({
    canvasElementId: 'preview-canvas',
    displayMode: ex.DisplayMode.FitContainer,
    width: 600,
    height: 400
});

const a = new ex.Actor({
  pos: ex.vec(100, 100),
  width: 100,
  height: 100,
  color: ex.Color.Red
});

game.add(a);
game.start();
`;
