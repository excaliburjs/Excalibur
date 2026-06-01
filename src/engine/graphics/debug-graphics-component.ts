import type { ExcaliburGraphicsContext } from './context/excalibur-graphics-context';
import type { DebugConfig } from '../debug';
import { Component } from '../entity-component-system/component';

/**
 * Provide arbitrary drawing for the purposes of debugging your game
 *
 * Will only show when the Engine is set to debug mode {@link Engine.showDebug} or {@link Engine.toggleDebug}
 *
 */
export class DebugGraphicsComponent extends Component {
  // @ts-ignore
  private static _NAME = 'DebugGraphicsComponent';
  constructor(
    public draw: (ctx: ExcaliburGraphicsContext, debugFlags: DebugConfig) => void,
    public useTransform = true
  ) {
    super();
  }
}
