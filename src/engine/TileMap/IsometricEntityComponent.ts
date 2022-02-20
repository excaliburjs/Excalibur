import { Component } from '../EntityComponentSystem/Component';
import { IsometricMap } from './IsometricMap';

export class IsometricEntityComponent extends Component<'ex.isometricentity'> {
  public readonly type = 'ex.isometricentity';
  /**
   * Vertical "height" in the isometric world
   */
  public elevation: number = 0;

  /**
   * Specify the isometric map to use to position this entity's z-index
   * @param map 
   */
  constructor(public map: IsometricMap) {
    super();
  }
}