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
  imgSource: ImageSource;
  sourceSprite: HTMLImageElement;
  canvasA: HTMLCanvasElement;
  canvasB: HTMLCanvasElement;
  canvasC: HTMLCanvasElement;
  canvasD: HTMLCanvasElement;
  canvasE: HTMLCanvasElement;
  canvasF: HTMLCanvasElement;
  canvasG: HTMLCanvasElement;
  canvasH: HTMLCanvasElement;
  canvasI: HTMLCanvasElement;

  private _logger = Logger.getInstance();

  constructor(public config: NineSliceConfig) {
    super(config);
    if (!this.config.width) {
      this.config.width = 0;
    }
    if (!this.config.height) {
      this.config.height = 0;
    }

    this.imgSource = config.source;
    this.sourceSprite = config.source.image;

    this.canvasA = document.createElement('canvas');
    this.canvasB = document.createElement('canvas');
    this.canvasC = document.createElement('canvas');
    this.canvasD = document.createElement('canvas');
    this.canvasE = document.createElement('canvas');
    this.canvasF = document.createElement('canvas');
    this.canvasG = document.createElement('canvas');
    this.canvasH = document.createElement('canvas');
    this.canvasI = document.createElement('canvas');
    this.initialize();

    if (!this.imgSource.isLoaded()) {
      this._logger.warnOnce(
        `ImageSource ${this.imgSource.path}` +
          ` is not yet loaded and won't be drawn. Please call .load() or include in a Loader.\n\n` +
          `Read https://excaliburjs.com/docs/imagesource for more information.`
      );
    }
  }

  /**
   *  Sets the target width of the 9 slice (pixels), and recalculates the 9 slice if desired (auto)
   */
  setTargetWidth(newWidth: number, auto: boolean = false) {
    this.config.width = newWidth;
    if (auto) {
      this.initialize();
    }
  }

  /**
   *  Sets the target height of the 9 slice (pixels), and recalculates the 9 slice if desired (auto)
   */

  setTargetHeight(newHeight: number, auto: boolean = false) {
    this.config.height = newHeight;
    if (auto) {
      this.initialize();
    }
  }

  /**
   *  Sets the 9 slice margins (pixels), and recalculates the 9 slice if desired (auto)
   */
  setMargins(left: number, top: number, right: number, bottom: number, auto: boolean = false) {
    this.config.sourceConfig.leftMargin = left;
    this.config.sourceConfig.topMargin = top;
    this.config.sourceConfig.rightMargin = right;
    this.config.sourceConfig.bottomMargin = bottom;
    if (auto) {
      this.initialize();
    }
  }

  /**
   *  Sets the stretching strategy for the 9 slice, and recalculates the 9 slice if desired (auto)
   *
   */
  setStretch(type: 'Horizontal' | 'Vertical' | 'Both', strategy: NineSliceStretch, auto: boolean = false) {
    if (type === 'Horizontal') {
      this.config.destinationConfig.stretchH = strategy;
    } else if (type === 'Vertical') {
      this.config.destinationConfig.stretchV = strategy;
    } else {
      this.config.destinationConfig.stretchH = strategy;
      this.config.destinationConfig.stretchV = strategy;
    }
    if (auto) {
      this.initialize();
    }
  }

  /**
   *  Returns the config of the 9 slice
   */
  getConfig(): NineSliceConfig {
    return this.config;
  }

  /**
   *  Draws 1 of the 9 tiles based on parameters passed in
   *  context is the ExcaliburGraphicsContext from the _drawImage function
   *  destinationSize is the size of the destination image as a vector (width,height)
   *  targetCanvas is the canvas to draw to
   *  hstrategy and vstrategy are the horizontal and vertical stretching strategies
   *  marginW and marginH are optional margins for the 9 slice for positioning
   */
  _drawTile(
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
          this.config.destinationConfig.stretchH
        );
        tempSizeX = tempSize;
        tempPositionX = tempPosition;

        ({ tempSize, tempPosition } = this._calculateParams(
          j,
          numTilesY,
          targetCanvas.height,
          destinationSize.y,
          this.config.destinationConfig.stretchV
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
    if (this.imgSource.isLoaded()) {
      //Top left, no strecthing

      this._drawTile(
        ex,
        this.canvasA,
        //@ts-ignore
        new Vector(this.config.sourceConfig.leftMargin, this.config.sourceConfig.topMargin),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV
      );

      //Top, middle, horizontal stretching
      this._drawTile(
        ex,
        this.canvasB,
        //@ts-ignore
        new Vector(
          //@ts-ignore
          this.config.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin,
          this.config.sourceConfig.topMargin
        ),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        this.config.sourceConfig.leftMargin,
        0
      );

      //Top right, no strecthing

      this._drawTile(
        ex,
        this.canvasC,
        //@ts-ignore
        new Vector(this.config.sourceConfig.rightMargin, this.config.sourceConfig.topMargin),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        //@ts-ignore
        this.config.width - this.config.sourceConfig.rightMargin,
        0
      );

      // middle, left, vertical strecthing

      this._drawTile(
        ex,
        this.canvasD,
        new Vector(
          this.config.sourceConfig.leftMargin,
          //@ts-ignore
          this.config.height - this.config.sourceConfig.bottomMargin - this.config.sourceConfig.topMargin
        ),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        0,
        this.config.sourceConfig.topMargin
      );

      // center, both strecthing
      if (this.config.destinationConfig.drawCenter) {
        this._drawTile(
          ex,
          this.canvasE,
          new Vector(
            //@ts-ignore
            this.config.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin,
            //@ts-ignore
            this.config.height - this.config.sourceConfig.bottomMargin - this.config.sourceConfig.topMargin
          ),
          this.config.destinationConfig.stretchH,
          this.config.destinationConfig.stretchV,
          this.config.sourceConfig.leftMargin,
          this.config.sourceConfig.topMargin
        );
      }
      //middle, right, vertical strecthing
      this._drawTile(
        ex,
        this.canvasF,

        new Vector(
          this.config.sourceConfig.rightMargin,
          //@ts-ignore
          this.config.height - this.config.sourceConfig.bottomMargin - this.config.sourceConfig.topMargin
        ),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        //@ts-ignore
        this.config.width - this.config.sourceConfig.rightMargin,
        this.config.sourceConfig.topMargin
      );

      //bottom left, no strecthing
      this._drawTile(
        ex,
        this.canvasG,
        new Vector(this.config.sourceConfig.leftMargin, this.config.sourceConfig.bottomMargin),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        0,
        //@ts-ignore
        this.config.height - this.config.sourceConfig.bottomMargin
      );

      //bottom middle, horizontal strecthing
      this._drawTile(
        ex,
        this.canvasH,
        //@ts-ignore
        new Vector(
          //@ts-ignore
          this.config.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin,
          this.config.sourceConfig.bottomMargin
        ),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        this.config.sourceConfig.leftMargin,
        //@ts-ignore
        this.config.height - this.config.sourceConfig.bottomMargin
      );

      //bottom right, no strecthing
      this._drawTile(
        ex,
        this.canvasI,
        new Vector(this.config.sourceConfig.rightMargin, this.config.sourceConfig.bottomMargin),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        //@ts-ignore
        this.config.width - this.config.sourceConfig.rightMargin,
        //@ts-ignore
        this.config.height - this.config.sourceConfig.bottomMargin
      );
    } else {
      this._logger.warnOnce(
        `ImageSource ${this.imgSource.path}` +
          ` is not yet loaded and won't be drawn. Please call .load() or include in a Loader.\n\n` +
          `Read https://excaliburjs.com/docs/imagesource for more information.`
      );
    }
  }

  initialize() {
    //top left slice
    this.canvasA.width = this.config.sourceConfig.leftMargin;
    this.canvasA.height = this.config.sourceConfig.topMargin;
    const Atx = this.canvasA.getContext('2d');

    Atx?.drawImage(this.sourceSprite, 0, 0, this.canvasA.width, this.canvasA.height, 0, 0, this.canvasA.width, this.canvasA.height);

    //top slice
    //@ts-ignore
    this.canvasB.width = this.config.sourceConfig.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin;
    this.canvasB.height = this.config.sourceConfig.topMargin;

    const Btx = this.canvasB.getContext('2d');
    Btx?.drawImage(
      this.sourceSprite,
      this.config.sourceConfig.leftMargin,
      0,
      this.canvasB.width,
      this.canvasB.height,
      0,
      0,
      this.canvasB.width,
      this.canvasB.height
    );

    //top right slice
    this.canvasC.width = this.config.sourceConfig.rightMargin;
    this.canvasC.height = this.config.sourceConfig.topMargin;
    const Ctx = this.canvasC.getContext('2d');
    Ctx?.drawImage(
      this.sourceSprite,
      this.sourceSprite.width - this.config.sourceConfig.rightMargin,
      0,
      this.canvasC.width,
      this.canvasC.height,
      0,
      0,
      this.canvasC.width,
      this.canvasC.height
    );

    //middle left slice
    this.canvasD.width = this.config.sourceConfig.leftMargin;
    this.canvasD.height = this.config.sourceConfig.height - this.config.sourceConfig.topMargin - this.config.sourceConfig.bottomMargin;
    const Dtx = this.canvasD.getContext('2d');
    Dtx?.drawImage(
      this.sourceSprite,
      0,
      this.config.sourceConfig.topMargin,
      this.canvasD.width,
      this.canvasD.height,
      0,
      0,
      this.canvasD.width,
      this.canvasD.height
    );

    //middle slice
    this.canvasE.width = this.config.sourceConfig.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin;
    this.canvasE.height = this.config.sourceConfig.height - this.config.sourceConfig.topMargin - this.config.sourceConfig.bottomMargin;
    const Etx = this.canvasE.getContext('2d');
    Etx?.drawImage(
      this.sourceSprite,
      this.config.sourceConfig.leftMargin,
      this.config.sourceConfig.topMargin,
      this.canvasE.width,
      this.canvasE.height,
      0,
      0,
      this.canvasE.width,
      this.canvasE.height
    );

    //middle right slice
    this.canvasF.width = this.config.sourceConfig.rightMargin;
    this.canvasF.height = this.config.sourceConfig.height - this.config.sourceConfig.topMargin - this.config.sourceConfig.bottomMargin;
    const Ftx = this.canvasF.getContext('2d');
    Ftx?.drawImage(
      this.sourceSprite,
      //@ts-ignore
      this.config.sourceConfig.width - this.config.sourceConfig.rightMargin,
      this.config.sourceConfig.topMargin,
      this.canvasF.width,
      this.canvasF.height,
      0,
      0,
      this.canvasF.width,
      this.canvasF.height
    );

    //bottom left slice
    this.canvasG.width = this.config.sourceConfig.leftMargin;
    this.canvasG.height = this.config.sourceConfig.bottomMargin;
    const Gtx = this.canvasG.getContext('2d');
    Gtx?.drawImage(
      this.sourceSprite,
      0,
      this.config.sourceConfig.height - this.config.sourceConfig.bottomMargin,
      this.canvasG.width,
      this.canvasG.height,
      0,
      0,
      this.canvasG.width,
      this.canvasG.height
    );

    //bottom slice
    this.canvasH.width = this.config.sourceConfig.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin;
    this.canvasH.height = this.config.sourceConfig.bottomMargin;
    const Htx = this.canvasH.getContext('2d');
    Htx?.drawImage(
      this.sourceSprite,
      this.config.sourceConfig.leftMargin,
      this.config.sourceConfig.height - this.config.sourceConfig.bottomMargin,
      this.canvasH.width,
      this.canvasH.height,
      0,
      0,
      this.canvasH.width,
      this.canvasH.height
    );

    //bottom right slice
    this.canvasI.width = this.config.sourceConfig.rightMargin;
    this.canvasI.height = this.config.sourceConfig.bottomMargin;
    const Itx = this.canvasI.getContext('2d');
    Itx?.drawImage(
      this.sourceSprite,
      this.sourceSprite.width - this.config.sourceConfig.rightMargin,
      this.config.sourceConfig.height - this.config.sourceConfig.bottomMargin,
      this.canvasI.width,
      this.canvasI.height,
      0,
      0,
      this.canvasI.width,
      this.canvasI.height
    );
  }

  /**
   * Clones the 9 slice
   */

  clone(): Graphic {
    return new NineSlice(this.config);
  }

  /**
   * Returns the number of tiles
   */

  _getNumberOfTiles(tilesize: number, destinationSize: number, strategy: NineSliceStretch): number {
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
  _calculateParams(
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
