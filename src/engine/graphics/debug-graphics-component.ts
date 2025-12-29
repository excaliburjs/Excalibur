import type { ExcaliburGraphicsContext } from './context/excalibur-graphics-context';
import type { DebugConfig } from '../debug';
import { Component } from '../entity-component-system/component';

/**
 * Provide arbitrary drawing for the purposes of debugging your game
 *
 * Will only show when the Engine is set to debug mode {@apilink Engine.showDebug} or {@apilink Engine.toggleDebug}
 *
 */
export class DebugGraphicsComponent extends Component {
  constructor(
    public draw: (ctx: ExcaliburGraphicsContext, debugFlags: DebugConfig) => void,
    public useTransform = true
  ) {
    super();
  }
}
