import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A TiledAnimation', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.ExcaliburGraphicsContext;
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  beforeEach(() => {
    ex.TextureLoader.filtering = ex.ImageFiltering.Pixel;
    canvasElement = document.createElement('canvas');
    canvasElement.width = 400;
    canvasElement.height = 400;
    ctx = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement,
      uvPadding: 0.01,
      antialiasing: false,
      snapToPixel: false,
      pixelArtSampler: false
    });
  });

  it('exists', () => {
    expect(ex.TiledAnimation).toBeDefined();
  });

  it('can be created', async () => {
    const cardsImage = new ex.ImageSource('src/spec/images/TiledAnimationSpec/kenny-cards.png');
    await cardsImage.load();
    const cardSpriteSheet = ex.SpriteSheet.fromImageSource({
      image: cardsImage,
      grid: {
        rows: 4,
        columns: 14,
        spriteWidth: 42,
        spriteHeight: 60
      },
      spacing: {
        originOffset: { x: 11, y: 2 },
        margin: { x: 23, y: 5 }
      }
    });

    cardSpriteSheet.sprites.forEach((s) => (s.scale = ex.vec(2, 2)));
    const cardAnimation = ex.Animation.fromSpriteSheet(cardSpriteSheet, ex.range(0, 14 * 4), 200);

    const sut = new ex.TiledAnimation({
      animation: cardAnimation,
      sourceView: { x: 20, y: 20 },
      width: 200,
      height: 200,
      wrapping: ex.ImageWrapping.Repeat
    });

    await sut.ready;

    ctx.clear();
    sut.draw(ctx, 20, 20);
    ctx.flush();

    await expectAsync(canvasElement).toEqualImage('src/spec/images/TiledAnimationSpec/tiled.png');

    sut.tick(200);
    ctx.clear();
    sut.draw(ctx, 20, 20);
    ctx.flush();

    await expectAsync(canvasElement).toEqualImage('src/spec/images/TiledAnimationSpec/tiled-2.png');
  });
});
