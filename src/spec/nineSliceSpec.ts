import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

const inputTile = new ex.ImageSource('src/spec/images/GraphicsNineSliceSpec/InputTile.png');
//await inputTile.load();

const testGraphicConfigSmall: ex.NineSliceConfig = {
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
const testGraphicConfigStretch: ex.NineSliceConfig = {
  width: 128,
  height: 128,
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
const testGraphicConfigTile: ex.NineSliceConfig = {
  width: 128,
  height: 128,
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
    stretchH: ex.NineSliceStretch.Tile,
    stretchV: ex.NineSliceStretch.Tile
  }
};
const testGraphicConfigTileFit: ex.NineSliceConfig = {
  width: 128,
  height: 128,
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
    stretchH: ex.NineSliceStretch.TileFit,
    stretchV: ex.NineSliceStretch.TileFit
  }
};
fdescribe('A NineSlice', async () => {
  let canvasElement: HTMLCanvasElement;
  let canvasElementSmall: HTMLCanvasElement;
  let ctx: ex.ExcaliburGraphicsContext;
  let ctxSmall: ex.ExcaliburGraphicsContext;

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);

    canvasElement = document.createElement('canvas');
    canvasElementSmall = document.createElement('canvas');

    canvasElement.width = 128;
    canvasElement.height = 128;

    canvasElementSmall.width = 64;
    canvasElementSmall.height = 64;

    ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });
    ctxSmall = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement: canvasElementSmall });
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

  it('can draw a copy of input tile', async () => {
    ctxSmall.clear();
    const sut = new ex.NineSlice(testGraphicConfigSmall);
    sut.draw(ctxSmall, 0, 0);
    await expectAsync(canvasElementSmall).toEqualImage('src/spec/images/GraphicsNineSliceSpec/InputTile.png');
  });
});
