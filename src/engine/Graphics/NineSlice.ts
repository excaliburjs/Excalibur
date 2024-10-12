import { Graphic, GraphicOptions } from './Graphic';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { ImageSource } from './ImageSource';
import { Logger } from '../Util/Log';
import { Vector } from '../Math/vector';

export enum NineSliceStretch {
  Stretch,
  Tile,
  TileFit
}

export type NineSliceConfig = GraphicOptions & {
  width: number;
  height: number;
  /**
   *  Image source that's loaded from a Loader or individually
   *  */
  source: ImageSource;

  /**
   *  Configuration for the source
   *
   *  Details for the source image, including:
   *
   *  width and height as numbers of the source image
   *
   *  and the 9 slice margins
   */
  sourceConfig: {
    width: number;
    height: number;
    topMargin: number;
    leftMargin: number;
    bottomMargin: number;
    rightMargin: number;
  };

  /**
   *  Configuration for the destination
   *
   *  Details for the destination image, including:
   *
   *  stretching strategies for horizontal and vertical stretching
   *
   *  and flag for drawing the center tile if desired
   */
  destinationConfig: {
    drawCenter: boolean;
    stretchH: NineSliceStretch;
    stretchV: NineSliceStretch;
  };
};

export class NineSlice extends Graphic {
  private _imgSource: ImageSource;
  private _sourceSprite: HTMLImageElement;
  private _canvasA: HTMLCanvasElement;
  private _canvasB: HTMLCanvasElement;
  private _canvasC: HTMLCanvasElement;
  private _canvasD: HTMLCanvasElement;
  private _canvasE: HTMLCanvasElement;
  private _canvasF: HTMLCanvasElement;
  private _canvasG: HTMLCanvasElement;
  private _canvasH: HTMLCanvasElement;
  private _canvasI: HTMLCanvasElement;

  private _logger = Logger.getInstance();

  constructor(private _config: NineSliceConfig) {
    super(_config);
    this._imgSource = _config.source;
    this._sourceSprite = _config.source.image;

    this._canvasA = document.createElement('canvas');
    this._canvasB = document.createElement('canvas');
    this._canvasC = document.createElement('canvas');
    this._canvasD = document.createElement('canvas');
    this._canvasE = document.createElement('canvas');
    this._canvasF = document.createElement('canvas');
    this._canvasG = document.createElement('canvas');
    this._canvasH = document.createElement('canvas');
    this._canvasI = document.createElement('canvas');

    this._initialize();

    if (!this._imgSource.isLoaded()) {
      this._logger.warnOnce(
        `ImageSource ${this._imgSource.path}` +
          ` is not yet loaded and won't be drawn. Please call .load() or include in a Loader.\n\n` +
          `Read https://excaliburjs.com/docs/imagesource for more information.`
      );
    }
  }

  /**
   *  Sets the target width of the 9 slice (pixels), and recalculates the 9 slice if desired (auto)
   */
  setTargetWidth(newWidth: number, auto: boolean = false) {
    this._config.width = newWidth;
    if (auto) {
      this._initialize();
    }
  }

  /**
   *  Sets the target height of the 9 slice (pixels), and recalculates the 9 slice if desired (auto)
   */
  setTargetHeight(newHeight: number, auto: boolean = false) {
    this._config.height = newHeight;
    if (auto) {
      this._initialize();
    }
  }

  /**
   *  Sets the 9 slice margins (pixels), and recalculates the 9 slice if desired (auto)
   */
  setMargins(left: number, top: number, right: number, bottom: number, auto: boolean = false) {
    this._config.sourceConfig.leftMargin = left;
    this._config.sourceConfig.topMargin = top;
    this._config.sourceConfig.rightMargin = right;
    this._config.sourceConfig.bottomMargin = bottom;
    if (auto) {
      this._initialize();
    }
  }

  /**
   *  Sets the stretching strategy for the 9 slice, and recalculates the 9 slice if desired (auto)
   *
   */
  setStretch(type: 'Horizontal' | 'Vertical' | 'Both', strategy: NineSliceStretch, auto: boolean = false) {
    if (type === 'Horizontal') {
      this._config.destinationConfig.stretchH = strategy;
    } else if (type === 'Vertical') {
      this._config.destinationConfig.stretchV = strategy;
    } else {
      this._config.destinationConfig.stretchH = strategy;
      this._config.destinationConfig.stretchV = strategy;
    }
    if (auto) {
      this._initialize();
    }
  }

  /**
   *  Returns the config of the 9 slice
   */
  getConfig(): NineSliceConfig {
    return this._config;
  }

  /**
   *  Draws 1 of the 9 tiles based on parameters passed in
   *  context is the ExcaliburGraphicsContext from the _drawImage function
   *  destinationSize is the size of the destination image as a vector (width,height)
   *  targetCanvas is the canvas to draw to
   *  hstrategy and vstrategy are the horizontal and vertical stretching strategies
   *  marginW and marginH are optional margins for the 9 slice for positioning
   */
  protected _drawTile(
    context: ExcaliburGraphicsContext,
    targetCanvas: HTMLCanvasElement,
    destinationSize: Vector,
    hstrategy: NineSliceStretch,
    vstrategy: NineSliceStretch,
    marginW?: number,
    marginH?: number
  ) {
    const tempMarginW = marginW || 0;
    const tempMarginH = marginH || 0;
    let tempSizeX, tempPositionX, tempSizeY, tempPositionY;
    const numTilesX = this._getNumberOfTiles(targetCanvas.width, destinationSize.x, hstrategy);
    const numTilesY = this._getNumberOfTiles(targetCanvas.height, destinationSize.y, vstrategy);

    for (let i = 0; i < numTilesX; i++) {
      for (let j = 0; j < numTilesY; j++) {
        let { tempSize, tempPosition } = this._calculateParams(
          i,
          numTilesX,
          targetCanvas.width,
          destinationSize.x,
          this._config.destinationConfig.stretchH
        );
        tempSizeX = tempSize;
        tempPositionX = tempPosition;

        ({ tempSize, tempPosition } = this._calculateParams(
          j,
          numTilesY,
          targetCanvas.height,
          destinationSize.y,
          this._config.destinationConfig.stretchV
        ));
        tempSizeY = tempSize;
        tempPositionY = tempPosition;

        context.drawImage(
          targetCanvas,
          0,
          0,
          targetCanvas.width,
          targetCanvas.height,
          tempMarginW + tempPositionX,
          tempMarginH + tempPositionY,
          tempSizeX,
          tempSizeY
        );
      }
    }
  }

  /**
   *  Draws the 9 slices to the canvas
   */
  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    if (this._imgSource.isLoaded()) {
      //Top left, no strecthing

      this._drawTile(
        ex,
        this._canvasA,

        new Vector(this._config.sourceConfig.leftMargin, this._config.sourceConfig.topMargin),
        this._config.destinationConfig.stretchH,
        this._config.destinationConfig.stretchV
      );

      //Top, middle, horizontal stretching
      this._drawTile(
        ex,
        this._canvasB,

        new Vector(
          this._config.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin,
          this._config.sourceConfig.topMargin
        ),
        this._config.destinationConfig.stretchH,
        this._config.destinationConfig.stretchV,
        this._config.sourceConfig.leftMargin,
        0
      );

      //Top right, no strecthing

      this._drawTile(
        ex,
        this._canvasC,

        new Vector(this._config.sourceConfig.rightMargin, this._config.sourceConfig.topMargin),
        this._config.destinationConfig.stretchH,
        this._config.destinationConfig.stretchV,

        this._config.width - this._config.sourceConfig.rightMargin,
        0
      );

      // middle, left, vertical strecthing

      this._drawTile(
        ex,
        this._canvasD,
        new Vector(
          this._config.sourceConfig.leftMargin,

          this._config.height - this._config.sourceConfig.bottomMargin - this._config.sourceConfig.topMargin
        ),
        this._config.destinationConfig.stretchH,
        this._config.destinationConfig.stretchV,
        0,
        this._config.sourceConfig.topMargin
      );

      // center, both strecthing
      if (this._config.destinationConfig.drawCenter) {
        this._drawTile(
          ex,
          this._canvasE,
          new Vector(
            this._config.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin,

            this._config.height - this._config.sourceConfig.bottomMargin - this._config.sourceConfig.topMargin
          ),
          this._config.destinationConfig.stretchH,
          this._config.destinationConfig.stretchV,
          this._config.sourceConfig.leftMargin,
          this._config.sourceConfig.topMargin
        );
      }
      //middle, right, vertical strecthing
      this._drawTile(
        ex,
        this._canvasF,

        new Vector(
          this._config.sourceConfig.rightMargin,

          this._config.height - this._config.sourceConfig.bottomMargin - this._config.sourceConfig.topMargin
        ),
        this._config.destinationConfig.stretchH,
        this._config.destinationConfig.stretchV,

        this._config.width - this._config.sourceConfig.rightMargin,
        this._config.sourceConfig.topMargin
      );

      //bottom left, no strecthing
      this._drawTile(
        ex,
        this._canvasG,
        new Vector(this._config.sourceConfig.leftMargin, this._config.sourceConfig.bottomMargin),
        this._config.destinationConfig.stretchH,
        this._config.destinationConfig.stretchV,
        0,

        this._config.height - this._config.sourceConfig.bottomMargin
      );

      //bottom middle, horizontal strecthing
      this._drawTile(
        ex,
        this._canvasH,

        new Vector(
          this._config.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin,
          this._config.sourceConfig.bottomMargin
        ),
        this._config.destinationConfig.stretchH,
        this._config.destinationConfig.stretchV,
        this._config.sourceConfig.leftMargin,

        this._config.height - this._config.sourceConfig.bottomMargin
      );

      //bottom right, no strecthing
      this._drawTile(
        ex,
        this._canvasI,
        new Vector(this._config.sourceConfig.rightMargin, this._config.sourceConfig.bottomMargin),
        this._config.destinationConfig.stretchH,
        this._config.destinationConfig.stretchV,

        this._config.width - this._config.sourceConfig.rightMargin,

        this._config.height - this._config.sourceConfig.bottomMargin
      );
    } else {
      this._logger.warnOnce(
        `ImageSource ${this._imgSource.path}` +
          ` is not yet loaded and won't be drawn. Please call .load() or include in a Loader.\n\n` +
          `Read https://excaliburjs.com/docs/imagesource for more information.`
      );
    }
  }

  protected _initialize() {
    //top left slice
    this._canvasA.width = this._config.sourceConfig.leftMargin;
    this._canvasA.height = this._config.sourceConfig.topMargin;
    const Atx = this._canvasA.getContext('2d');

    Atx?.drawImage(this._sourceSprite, 0, 0, this._canvasA.width, this._canvasA.height, 0, 0, this._canvasA.width, this._canvasA.height);

    //top slice

    this._canvasB.width = this._config.sourceConfig.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin;
    this._canvasB.height = this._config.sourceConfig.topMargin;

    const Btx = this._canvasB.getContext('2d');
    Btx?.drawImage(
      this._sourceSprite,
      this._config.sourceConfig.leftMargin,
      0,
      this._canvasB.width,
      this._canvasB.height,
      0,
      0,
      this._canvasB.width,
      this._canvasB.height
    );

    //top right slice
    this._canvasC.width = this._config.sourceConfig.rightMargin;
    this._canvasC.height = this._config.sourceConfig.topMargin;
    const Ctx = this._canvasC.getContext('2d');
    Ctx?.drawImage(
      this._sourceSprite,
      this._sourceSprite.width - this._config.sourceConfig.rightMargin,
      0,
      this._canvasC.width,
      this._canvasC.height,
      0,
      0,
      this._canvasC.width,
      this._canvasC.height
    );

    //middle left slice
    this._canvasD.width = this._config.sourceConfig.leftMargin;
    this._canvasD.height = this._config.sourceConfig.height - this._config.sourceConfig.topMargin - this._config.sourceConfig.bottomMargin;
    const Dtx = this._canvasD.getContext('2d');
    Dtx?.drawImage(
      this._sourceSprite,
      0,
      this._config.sourceConfig.topMargin,
      this._canvasD.width,
      this._canvasD.height,
      0,
      0,
      this._canvasD.width,
      this._canvasD.height
    );

    //middle slice
    this._canvasE.width = this._config.sourceConfig.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin;
    this._canvasE.height = this._config.sourceConfig.height - this._config.sourceConfig.topMargin - this._config.sourceConfig.bottomMargin;
    const Etx = this._canvasE.getContext('2d');
    Etx?.drawImage(
      this._sourceSprite,
      this._config.sourceConfig.leftMargin,
      this._config.sourceConfig.topMargin,
      this._canvasE.width,
      this._canvasE.height,
      0,
      0,
      this._canvasE.width,
      this._canvasE.height
    );

    //middle right slice
    this._canvasF.width = this._config.sourceConfig.rightMargin;
    this._canvasF.height = this._config.sourceConfig.height - this._config.sourceConfig.topMargin - this._config.sourceConfig.bottomMargin;
    const Ftx = this._canvasF.getContext('2d');
    Ftx?.drawImage(
      this._sourceSprite,

      this._config.sourceConfig.width - this._config.sourceConfig.rightMargin,
      this._config.sourceConfig.topMargin,
      this._canvasF.width,
      this._canvasF.height,
      0,
      0,
      this._canvasF.width,
      this._canvasF.height
    );

    //bottom left slice
    this._canvasG.width = this._config.sourceConfig.leftMargin;
    this._canvasG.height = this._config.sourceConfig.bottomMargin;
    const Gtx = this._canvasG.getContext('2d');
    Gtx?.drawImage(
      this._sourceSprite,
      0,
      this._config.sourceConfig.height - this._config.sourceConfig.bottomMargin,
      this._canvasG.width,
      this._canvasG.height,
      0,
      0,
      this._canvasG.width,
      this._canvasG.height
    );

    //bottom slice
    this._canvasH.width = this._config.sourceConfig.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin;
    this._canvasH.height = this._config.sourceConfig.bottomMargin;
    const Htx = this._canvasH.getContext('2d');
    Htx?.drawImage(
      this._sourceSprite,
      this._config.sourceConfig.leftMargin,
      this._config.sourceConfig.height - this._config.sourceConfig.bottomMargin,
      this._canvasH.width,
      this._canvasH.height,
      0,
      0,
      this._canvasH.width,
      this._canvasH.height
    );

    //bottom right slice
    this._canvasI.width = this._config.sourceConfig.rightMargin;
    this._canvasI.height = this._config.sourceConfig.bottomMargin;
    const Itx = this._canvasI.getContext('2d');
    Itx?.drawImage(
      this._sourceSprite,
      this._sourceSprite.width - this._config.sourceConfig.rightMargin,
      this._config.sourceConfig.height - this._config.sourceConfig.bottomMargin,
      this._canvasI.width,
      this._canvasI.height,
      0,
      0,
      this._canvasI.width,
      this._canvasI.height
    );
  }

  /**
   * Clones the 9 slice
   */

  clone(): NineSlice {
    return new NineSlice(this._config);
  }

  /**
   * Returns the number of tiles
   */

  protected _getNumberOfTiles(tilesize: number, destinationSize: number, strategy: NineSliceStretch): number {
    switch (strategy) {
      case NineSliceStretch.Stretch:
        return 1;
      case NineSliceStretch.Tile:
        return Math.ceil(destinationSize / tilesize);
      case NineSliceStretch.TileFit:
        return Math.ceil(destinationSize / tilesize);
    }
  }

  /**
   * Returns the position and size of the tile
   */
  protected _calculateParams(
    tilenum: number,
    numTiles: number,
    tilesize: number,
    destinationSize: number,
    strategy: NineSliceStretch
  ): { tempPosition: number; tempSize: number } {
    switch (strategy) {
      case NineSliceStretch.Stretch:
        return {
          tempPosition: 0,
          tempSize: destinationSize
        };
      case NineSliceStretch.Tile:
        // if last tile, adjust size
        if (tilenum === numTiles - 1) {
          //last tile
          return {
            tempPosition: tilenum * tilesize,
            tempSize: tilesize - (numTiles * tilesize - destinationSize)
          };
        } else {
          return {
            tempPosition: tilenum * tilesize,
            tempSize: tilesize
          };
        }

      case NineSliceStretch.TileFit:
        const reducedTileSize = destinationSize / numTiles;
        const position = tilenum * reducedTileSize;
        return {
          tempPosition: position,
          tempSize: reducedTileSize
        };
    }
  }
}
