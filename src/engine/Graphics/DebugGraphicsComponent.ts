import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { DebugConfig } from '../Debug';
import { Component } from '../EntityComponentSystem/Component';


/**
 * Provide arbitrary drawing for the purposes of debugging your game
 *
 * Will only show when the Engine is set to debug mode [[Engine.showDebug]] or [[Engine.toggleDebug]]
 *
 */
export class DebugGraphicsComponent extends Component {
  constructor(
    public draw: (ctx: ExcaliburGraphicsContext, debugFlags: DebugConfig) => void,
    public useTransform = true) {
    super();
  }
}