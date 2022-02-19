import { ExcaliburGraphicsContext } from '.';
import { Component } from '../EntityComponentSystem/Component';


/**
 * Provide arbitrary drawing for the purposes of debugging your game
 *
 * Will only show when the Engine is set to debug mode [[Engine.showDebug]] or [[Engine.toggleDebug]]
 *
 */
export class DebugGraphicsComponent extends Component<'ex.debuggraphics'> {
  readonly type = 'ex.debuggraphics';
  constructor(public draw: (ctx: ExcaliburGraphicsContext) => void, public useTransform = true) {
    super();
  }
}