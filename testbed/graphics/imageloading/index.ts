import * as ex from '../../../build/dist/';
import bigImage from './big-image.png';

var game = new ex.Engine({
  width: 600,
  height: 400
});

var image = new ex.ImageSource(bigImage);
var loader = new ex.Loader([image]);

game.on('postdraw', () => {
  game.graphicsContext.drawImage(image.image, 0, 0);
});

game.start(loader);