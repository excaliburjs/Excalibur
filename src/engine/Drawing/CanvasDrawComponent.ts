import { Component } from '../EntityComponentSystem';

export class CanvasDrawComponent extends Component<'ex.canvas'> {
  public readonly type = 'ex.canvas';

  constructor(public draw?: (ctx: CanvasRenderingContext2D, delta: number) => void) {
    super();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.draw = this.draw ?? (() => {});
  }
}
