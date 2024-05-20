import { Component } from '../Component';
import { TransformComponent } from './TransformComponent';

/**
 * Adjusts the z-index of an entity based on its global y position
 */
export interface YSortOptions {
  /**
   * Applies an offset to the resulting z-index
   * @default 0
   */
  offset?: number;

  /**
   * When 1, the z-index will increase as the y value increases. When -1, the
   * z-index will decrease as the y value increases.
   * @default 1
   */
  order?: 1 | -1;
}

export class YSortComponent extends Component {
  offset: number;
  order: number;

  constructor(public options: YSortOptions = {}) {
    super();
    this.offset = options.offset ?? 0;
    this.order = options.order ?? 1;
  }

  private get _transform() {
    const transform = this.owner?.get(TransformComponent);

    if (!transform) {
      throw new Error('YSortComponent requires a TransformComponent');
    }

    return transform;
  }

  public updateZ() {
    const y = this._transform.globalPos.y;
    const rounded = Math.floor(y) * this.order;
    const z = rounded + this.offset;

    this._transform.z = z;
  }
}
