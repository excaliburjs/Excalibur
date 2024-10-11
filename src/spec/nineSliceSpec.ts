import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

const inputTile = new ex.ImageSource('src/spec/images/GraphicsNineSliceSpec/InputTile.png');

fdescribe('A NineSlice', () => {
  let canvasElement: HTMLCanvasElement;

  let ctx: ex.ExcaliburGraphicsContext;

  let testGraphicConfigSmall: ex.NineSliceConfig;
  let testGraphicConfigStretch: ex.NineSliceConfig;
  let testGraphicConfigTile: ex.NineSliceConfig;
  let testGraphicConfigTileFit: ex.NineSliceConfig;
  let testGraphicConfigNoCenter: ex.NineSliceConfig;

  beforeAll(async () => {
    await inputTile.load();
    testGraphicConfigSmall = {
      width: 64,
      height: 64,
      source: inputTile,
      sourceConfig: {
        width: 64,
        height: 64,
        topMargin: 5,
        leftMargin: 6,
        bottomMargin: 5,
        rightMargin: 6
      },
      destinationConfig: {
        drawCenter: true,
        stretchH: ex.NineSliceStretch.Stretch,
        stretchV: ex.NineSliceStretch.Stretch
      }
    };
    testGraphicConfigStretch = {
      width: 128,
      height: 128,
      source: inputTile,
      sourceConfig: {
        width: 64,
        height: 64,
        topMargin: 5,
        leftMargin: 6,
        bottomMargin: 5,
        rightMargin: 6
      },
      destinationConfig: {
        drawCenter: true,
        stretchH: ex.NineSliceStretch.Stretch,
        stretchV: ex.NineSliceStretch.Stretch
      }
    };
    testGraphicConfigTile = {
      width: 128,
      height: 128,
      source: inputTile,
      sourceConfig: {
        width: 64,
        height: 64,
        topMargin: 5,
        leftMargin: 6,
        bottomMargin: 5,
        rightMargin: 6
      },
      destinationConfig: {
        drawCenter: true,
        stretchH: ex.NineSliceStretch.Tile,
        stretchV: ex.NineSliceStretch.Tile
      }
    };
    testGraphicConfigTileFit = {
      width: 128,
      height: 128,
      source: inputTile,
      sourceConfig: {
        width: 64,
        height: 64,
        topMargin: 5,
        leftMargin: 6,
        bottomMargin: 5,
        rightMargin: 6
      },
      destinationConfig: {
        drawCenter: true,
        stretchH: ex.NineSliceStretch.TileFit,
        stretchV: ex.NineSliceStretch.TileFit
      }
    };
    testGraphicConfigNoCenter = {
      width: 64,
      height: 64,
      source: inputTile,
      sourceConfig: {
        width: 64,
        height: 64,
        topMargin: 5,
        leftMargin: 6,
        bottomMargin: 5,
        rightMargin: 6
      },
      destinationConfig: {
        drawCenter: false,
        stretchH: ex.NineSliceStretch.Stretch,
        stretchV: ex.NineSliceStretch.Stretch
      }
    };
  });
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
    canvasElement = document.createElement('canvas');
    canvasElement.width = 64;
    canvasElement.height = 64;
    ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });
  });

  it('can exist', () => {
    // eslint-disable-next-line no-console
    console.log('ex.NineSlice being ran');
    expect(ex.NineSlice).toBeDefined();
  });

  it('generates a new id', () => {
    const graphic1 = new ex.NineSlice(testGraphicConfigStretch);
    const graphic2 = new ex.NineSlice(testGraphicConfigTile);
    expect(graphic1.id).not.toBe(graphic2.id);
  });

  it('can have its config modified', () => {
    const dummyConfig = {
      width: 64,
      height: 64,
      source: inputTile,
      sourceConfig: {
        width: 64,
        height: 64,
        topMargin: 5,
        leftMargin: 6,
        bottomMargin: 6,
        rightMargin: 5
      },
      destinationConfig: {
        drawCenter: true,
        stretchH: ex.NineSliceStretch.Stretch,
        stretchV: ex.NineSliceStretch.Stretch
      }
    };

    const sut = new ex.NineSlice(dummyConfig);

    sut.setMargins(1, 2, 3, 4);
    expect(sut.getConfig().sourceConfig.leftMargin).toBe(1);
    expect(sut.getConfig().sourceConfig.topMargin).toBe(2);
    expect(sut.getConfig().sourceConfig.rightMargin).toBe(3);
    expect(sut.getConfig().sourceConfig.bottomMargin).toBe(4);

    sut.setTargetWidth(256);
    expect(sut.getConfig().width).toBe(256);
    sut.setTargetHeight(256);
    expect(sut.getConfig().height).toBe(256);

    sut.setStretch('Horizontal', ex.NineSliceStretch.Tile);
    sut.setStretch('Vertical', ex.NineSliceStretch.TileFit);
    expect(sut.getConfig().destinationConfig.stretchH).toBe(ex.NineSliceStretch.Tile);
    expect(sut.getConfig().destinationConfig.stretchV).toBe(ex.NineSliceStretch.TileFit);
  });

  it('can clone the Graphic', () => {
    const sut = new ex.NineSlice(testGraphicConfigSmall);
    const newSut = sut.clone();
    expect(newSut).not.toBe(sut);
    expect(newSut).toBeInstanceOf(ex.NineSlice);
  });

  it('can draw a copy of input tile', async () => {
    canvasElement.width = 64;
    canvasElement.height = 64;
    ctx.clear();
    const sut = new ex.NineSlice(testGraphicConfigSmall);
    sut.draw(ctx, 0, 0);
    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsNineSliceSpec/InputTile.png');
  });

  it('can draw a tiled copy of input tile', async () => {
    canvasElement.width = 128;
    canvasElement.height = 128;
    ctx.clear();
    const sut = new ex.NineSlice(testGraphicConfigTile);
    sut.draw(ctx, 0, 0);
    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsNineSliceSpec/resultImage_128_128_v_tile_h_tile.png');
  });

  it('can draw a fitted tile copy of input tile', async () => {
    canvasElement.width = 128;
    canvasElement.height = 128;
    ctx.clear();
    const sut = new ex.NineSlice(testGraphicConfigTileFit);
    sut.draw(ctx, 0, 0);
    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsNineSliceSpec/resultImage_128_128_v_tilefit_h_tilefit.png');
  });

  it('can draw a stretched copy of input tile', async () => {
    canvasElement.width = 128;
    canvasElement.height = 128;
    ctx.clear();
    const sut = new ex.NineSlice(testGraphicConfigStretch);
    sut.draw(ctx, 0, 0);
    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsNineSliceSpec/resultImage_128_128_v_stretch_h_stretch.png');
  });

  it('can draw the frame of a tile with no center', async () => {
    canvasElement.width = 64;
    canvasElement.height = 64;
    ctx.clear();
    const sut = new ex.NineSlice(testGraphicConfigNoCenter);
    sut.draw(ctx, 0, 0);
    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsNineSliceSpec/resultImage_64_64_noCenter.png');
  });
});
