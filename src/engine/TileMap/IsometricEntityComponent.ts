import { Component } from '../EntityComponentSystem/Component';
import { IsometricMap } from './IsometricMap';

export class IsometricEntityComponent extends Component<'ex.isometricentity'> {
  public readonly type = 'ex.isometricentity';
  /**
   * Vertical "height" in the isometric world
   */
  public elevation: number = 0;

  public map: IsometricMap;

  /**
   * Specify the isometric map to use to position this entity's z-index
   * @param map
   */
  constructor(map: IsometricMap) {
    super();
    this.map = map;
  }
}