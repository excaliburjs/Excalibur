import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FitContainer,
  width: 200, // <-- Low res game (< 500x500)
  height: 200, // logical resolution remains at 200x200
  pixelRatio: 4, // <-- Upscale to something bigger than 500x500, in this case 800x800
});

const loader = new ex.Loader();

const fontSource = new ex.FontSource(
  'https://fonts.gstatic.com/s/pixelifysans/v3/CHylV-3HFUT7aC4iv1TxGDR9Jn0Eiw.woff2',
  'Pixelify Sans'
);
loader.addResource(fontSource);

const font = fontSource.toFont({
  padding: 10,
  lineHeight: 25,
  color: ex.Color.White,
  quality: 4, // <-- Increase quality scales up the backing image used to draw text (default 2)
  size: 30,
  shadow: {
    blur: 15,
    color: ex.Color.Black
  }
});

const label = new ex.Label({
  pos: ex.vec(0, 0),
  text: 'Some Pixel text can fill up the screen a whole bunch with nice quality!!!!',
  maxWidth: 220,
  font
});

game.add(label);
game.start(loader);
