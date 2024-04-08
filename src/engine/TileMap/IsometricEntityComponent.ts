import { Component } from '../EntityComponentSystem/Component';
import { IsometricMap } from './IsometricMap';

export interface IsometricEntityComponentOptions {
  columns: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
}

export class IsometricEntityComponent extends Component {
  /**
   * Vertical "height" in the isometric world
   */
  public elevation: number = 0;

  public readonly columns: number;
  public readonly rows: number;
  public readonly tileWidth: number;
  public readonly tileHeight: number;

  /**
   * Specify the isometric map to use to position this entity's z-index
   * @param mapOrOptions
   */
  constructor(mapOrOptions: IsometricMap | IsometricEntityComponentOptions) {
    super();
    this.columns = mapOrOptions.columns;
    this.rows = mapOrOptions.rows;
    this.tileWidth = mapOrOptions.tileWidth;
    this.tileHeight = mapOrOptions.tileHeight;
  }
}
