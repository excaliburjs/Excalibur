import { Component } from '../EntityComponentSystem/Component';
import { IsometricMap } from './IsometricMap';

export class IsometricEntityComponent extends Component<'ex.isometricentity'> {
  public readonly type = 'ex.isometricentity';
  /**
   * Vertical "height" in the isometric world
   */
  public elevation: number = 0;
  // TODO let's not take a dependency on the isometric map
  public map: IsometricMap;
}