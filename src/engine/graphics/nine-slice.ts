import type { GraphicOptions } from './graphic';
import { Graphic } from './graphic';
import type { ExcaliburGraphicsContext } from './context/excalibur-graphics-context';
import type { ImageSource } from './image-source';
import { Logger } from '../util/log';
import { Vector } from '../math/vector';

/**
 * Nine slice stretch mode
 */
export enum NineSliceStretch {
  /**
   * Stretch the image across a dimension
   */
  Stretch = 'stretch',
  /**
   * Tile the image across a dimension
   */
  Tile = 'tile',
  /**
   * Tile the image across a dimension but only by whole image amounts
   */
  TileFit = 'tile-fit'
}

export type NineSliceConfig = GraphicOptions & {
  /**
   * Final width of the nine slice graphic
   */
  width: number;
  /**
   * Final height of the nine slice graphic
   */
  height: number;
  /**
   *  Image source that's loaded from a Loader or individually
   *
   */
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
    /**
     * Draw the center part of the nine slice, if false it's a completely transparent gap
     */
    drawCenter: boolean;
    /**
     * Horizontal stretch configuration
     */
    horizontalStretch: NineSliceStretch;
    /**
     * Vertical stretch configuration
     */
    verticalStretch: NineSliceStretch;
  };
};

export class NineSlice extends Graphic {
  private _imgSource: ImageSource;
  private _sourceSprite?: HTMLImageElement;
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

  private _config: NineSliceConfig;
  constructor(config: NineSliceConfig) {
    super(config);
    this._config = config;
    this._imgSource = config.source;

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

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this._imgSource.ready.then(() => {
      this._initialize();
    });
  }

  /**
   * Sets the target width of the 9 slice (pixels), and recalculates the 9 slice if desired (auto)
   * @param newWidth
   * @param auto
   */
  setTargetWidth(newWidth: number, auto: boolean = false) {
    this._config.width = newWidth;
    if (auto) {
      this._initialize();
    }
  }

  /**
   * Sets the target height of the 9 slice (pixels), and recalculates the 9 slice if desired (auto)
   * @param newHeight
   * @param auto
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
  setStretch(type: 'horizontal' | 'vertical' | 'both', stretch: NineSliceStretch, auto: boolean = false) {
    if (type === 'horizontal') {
      this._config.destinationConfig.horizontalStretch = stretch;
    } else if (type === 'vertical') {
      this._config.destinationConfig.verticalStretch = stretch;
    } else {
      this._config.destinationConfig.horizontalStretch = stretch;
      this._config.destinationConfig.verticalStretch = stretch;
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
   * Draws 1 of the 9 tiles based on parameters passed in
   * context is the ExcaliburGraphicsContext from the _drawImage function
   * destinationSize is the size of the destination image as a vector (width,height)
   * targetCanvas is the canvas to draw to
   * horizontalStretch and verticalStretch are the horizontal and vertical stretching strategies
   * marginW and marginH are optional margins for the 9 slice for positioning
   * @param context
   * @param targetCanvas
   * @param destinationSize
   * @param horizontalStretch
   * @param verticalStretch
   * @param marginWidth
   * @param marginHeight
   */
  protected _drawTile(
    context: ExcaliburGraphicsContext,
    targetCanvas: HTMLCanvasElement,
    destinationSize: Vector,
    horizontalStretch: NineSliceStretch,
    verticalStretch: NineSliceStretch,
    marginWidth?: number,
    marginHeight?: number
  ) {
    const tempMarginW = marginWidth || 0;
    const tempMarginH = marginHeight || 0;
    let tempSizeX: number, tempPositionX: number, tempSizeY: number, tempPositionY: number;
    const numTilesX = this._getNumberOfTiles(targetCanvas.width, destinationSize.x, horizontalStretch);
    const numTilesY = this._getNumberOfTiles(targetCanvas.height, destinationSize.y, verticalStretch);

    for (let i = 0; i < numTilesX; i++) {
      for (let j = 0; j < numTilesY; j++) {
        let { tempSize, tempPosition } = this._calculateParams(
          i,
          numTilesX,
          targetCanvas.width,
          destinationSize.x,
          this._config.destinationConfig.horizontalStretch
        );
        tempSizeX = tempSize;
        tempPositionX = tempPosition;

        ({ tempSize, tempPosition } = this._calculateParams(
          j,
          numTilesY,
          targetCanvas.height,
          destinationSize.y,
          this._config.destinationConfig.verticalStretch
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
      // Top left, no stretching

      this._drawTile(
        ex,
        this._canvasA,

        new Vector(this._config.sourceConfig.leftMargin, this._config.sourceConfig.topMargin),
        this._config.destinationConfig.horizontalStretch,
        this._config.destinationConfig.verticalStretch
      );

      // Top, middle, horizontal stretching
      this._drawTile(
        ex,
        this._canvasB,

        new Vector(
          this._config.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin,
          this._config.sourceConfig.topMargin
        ),
        this._config.destinationConfig.horizontalStretch,
        this._config.destinationConfig.verticalStretch,
        this._config.sourceConfig.leftMargin,
        0
      );

      // Top right, no stretching

      this._drawTile(
        ex,
        this._canvasC,

        new Vector(this._config.sourceConfig.rightMargin, this._config.sourceConfig.topMargin),
        this._config.destinationConfig.horizontalStretch,
        this._config.destinationConfig.verticalStretch,

        this._config.width - this._config.sourceConfig.rightMargin,
        0
      );

      // middle, left, vertical stretching

      this._drawTile(
        ex,
        this._canvasD,
        new Vector(
          this._config.sourceConfig.leftMargin,

          this._config.height - this._config.sourceConfig.bottomMargin - this._config.sourceConfig.topMargin
        ),
        this._config.destinationConfig.horizontalStretch,
        this._config.destinationConfig.verticalStretch,
        0,
        this._config.sourceConfig.topMargin
      );

      // center, both stretching
      if (this._config.destinationConfig.drawCenter) {
        this._drawTile(
          ex,
          this._canvasE,
          new Vector(
            this._config.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin,

            this._config.height - this._config.sourceConfig.bottomMargin - this._config.sourceConfig.topMargin
          ),
          this._config.destinationConfig.horizontalStretch,
          this._config.destinationConfig.verticalStretch,
          this._config.sourceConfig.leftMargin,
          this._config.sourceConfig.topMargin
        );
      }
      // middle, right, vertical stretching
      this._drawTile(
        ex,
        this._canvasF,

        new Vector(
          this._config.sourceConfig.rightMargin,

          this._config.height - this._config.sourceConfig.bottomMargin - this._config.sourceConfig.topMargin
        ),
        this._config.destinationConfig.horizontalStretch,
        this._config.destinationConfig.verticalStretch,

        this._config.width - this._config.sourceConfig.rightMargin,
        this._config.sourceConfig.topMargin
      );

      // bottom left, no stretching
      this._drawTile(
        ex,
        this._canvasG,
        new Vector(this._config.sourceConfig.leftMargin, this._config.sourceConfig.bottomMargin),
        this._config.destinationConfig.horizontalStretch,
        this._config.destinationConfig.verticalStretch,
        0,

        this._config.height - this._config.sourceConfig.bottomMargin
      );

      // bottom middle, horizontal stretching
      this._drawTile(
        ex,
        this._canvasH,

        new Vector(
          this._config.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin,
          this._config.sourceConfig.bottomMargin
        ),
        this._config.destinationConfig.horizontalStretch,
        this._config.destinationConfig.verticalStretch,
        this._config.sourceConfig.leftMargin,

        this._config.height - this._config.sourceConfig.bottomMargin
      );

      // bottom right, no stretching
      this._drawTile(
        ex,
        this._canvasI,
        new Vector(this._config.sourceConfig.rightMargin, this._config.sourceConfig.bottomMargin),
        this._config.destinationConfig.horizontalStretch,
        this._config.destinationConfig.verticalStretch,

        this._config.width - this._config.sourceConfig.rightMargin,

        this._config.height - this._config.sourceConfig.bottomMargin
      );
    } else {
      this._logger.warnOnce(
        `NineSlice ImageSource ${this._imgSource.path}` +
          ` is not yet loaded and won't be drawn. Please call .load() or include in a Loader.\n\n` +
          `Read https://excaliburjs.com/docs/imagesource for more information.`
      );
    }
  }

  /**
   * Slices the source sprite into the 9 slice canvases internally
   */
  protected _initialize() {
    this._sourceSprite = this._imgSource.image;

    // top left slice
    this._canvasA.width = this._config.sourceConfig.leftMargin;
    this._canvasA.height = this._config.sourceConfig.topMargin;
    const aCtx = this._canvasA.getContext('2d');

    aCtx?.drawImage(this._sourceSprite, 0, 0, this._canvasA.width, this._canvasA.height, 0, 0, this._canvasA.width, this._canvasA.height);

    // top slice

    this._canvasB.width = this._config.sourceConfig.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin;
    this._canvasB.height = this._config.sourceConfig.topMargin;

    const bCtx = this._canvasB.getContext('2d');
    bCtx?.drawImage(
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

    // top right slice
    this._canvasC.width = this._config.sourceConfig.rightMargin;
    this._canvasC.height = this._config.sourceConfig.topMargin;
    const cCtx = this._canvasC.getContext('2d');
    cCtx?.drawImage(
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

    // middle left slice
    this._canvasD.width = this._config.sourceConfig.leftMargin;
    this._canvasD.height = this._config.sourceConfig.height - this._config.sourceConfig.topMargin - this._config.sourceConfig.bottomMargin;
    const dCtx = this._canvasD.getContext('2d');
    dCtx?.drawImage(
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

    // middle slice
    this._canvasE.width = this._config.sourceConfig.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin;
    this._canvasE.height = this._config.sourceConfig.height - this._config.sourceConfig.topMargin - this._config.sourceConfig.bottomMargin;
    const eCtx = this._canvasE.getContext('2d');
    eCtx?.drawImage(
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

    // middle right slice
    this._canvasF.width = this._config.sourceConfig.rightMargin;
    this._canvasF.height = this._config.sourceConfig.height - this._config.sourceConfig.topMargin - this._config.sourceConfig.bottomMargin;
    const fCtx = this._canvasF.getContext('2d');
    fCtx?.drawImage(
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

    // bottom left slice
    this._canvasG.width = this._config.sourceConfig.leftMargin;
    this._canvasG.height = this._config.sourceConfig.bottomMargin;
    const gCtx = this._canvasG.getContext('2d');
    gCtx?.drawImage(
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

    // bottom slice
    this._canvasH.width = this._config.sourceConfig.width - this._config.sourceConfig.leftMargin - this._config.sourceConfig.rightMargin;
    this._canvasH.height = this._config.sourceConfig.bottomMargin;
    const hCtx = this._canvasH.getContext('2d');
    hCtx?.drawImage(
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

    // bottom right slice
    this._canvasI.width = this._config.sourceConfig.rightMargin;
    this._canvasI.height = this._config.sourceConfig.bottomMargin;
    const iCtx = this._canvasI.getContext('2d');
    iCtx?.drawImage(
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
  protected _getNumberOfTiles(tileSize: number, destinationSize: number, strategy: NineSliceStretch): number {
    switch (strategy) {
      case NineSliceStretch.Stretch:
        return 1;
      case NineSliceStretch.Tile:
        return Math.ceil(destinationSize / tileSize);
      case NineSliceStretch.TileFit:
        return Math.ceil(destinationSize / tileSize);
    }
  }

  /**
   * Returns the position and size of the tile
   */
  protected _calculateParams(
    tileNum: number,
    numTiles: number,
    tileSize: number,
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
        if (tileNum === numTiles - 1) {
          //last tile
          return {
            tempPosition: tileNum * tileSize,
            tempSize: tileSize - (numTiles * tileSize - destinationSize)
          };
        } else {
          return {
            tempPosition: tileNum * tileSize,
            tempSize: tileSize
          };
        }

      case NineSliceStretch.TileFit:
        const reducedTileSize = destinationSize / numTiles;
        const position = tileNum * reducedTileSize;
        return {
          tempPosition: position,
          tempSize: reducedTileSize
        };
    }
  }
}
