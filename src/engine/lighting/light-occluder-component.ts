import { Component } from '../entity-component-system/component';
import { Vector } from '../math/vector';

export type OccluderShape =
  | { kind: 'box'; width: number; height: number }
  | { kind: 'polygon'; vertices: Vector[] }
  | { kind: 'circle'; radius: number };

export interface LightOccluderComponentOptions {
  /**
   * Shape of the occluder, independent of any collider geometry on the entity
   */
  shape: OccluderShape;
  /**
   * When false, skips shadow volume geometry generation for this occluder. Default true
   */
  castShadows?: boolean;
  /**
   * Local space coordinate offset shifting the occluder geometry away from the transform origin. Default Vector.Zero
   */
  offset?: Vector;
}

/**
 * Marks an entity as a light-blocking obstacle that projects dynamic shadows in the {@apilink LightingSystem}.
 */
export class LightOccluderComponent extends Component {
  public shape: OccluderShape;
  public castShadows: boolean;
  public offset: Vector;

  constructor(options: LightOccluderComponentOptions) {
    super();
    this.shape = options.shape;
    this.castShadows = options.castShadows ?? true;
    this.offset = options.offset ?? Vector.Zero;
  }

  public clone(): LightOccluderComponent {
    return new LightOccluderComponent({
      shape: this.shape,
      castShadows: this.castShadows,
      offset: this.offset.clone()
    });
  }

  /**
   * Evaluates the bounding shape vertices in local space, factoring in local offsets.
   * Returns an empty array for circular primitives.
   */
  public localVertices(): Vector[] {
    if (this.shape.kind === 'circle') {
      return [];
    }

    let baseVerts: Vector[] = [];
    if (this.shape.kind === 'polygon') {
      baseVerts = this.shape.vertices;
    } else {
      const hw = this.shape.width / 2;
      const hh = this.shape.height / 2;
      baseVerts = [new Vector(-hw, -hh), new Vector(hw, -hh), new Vector(hw, hh), new Vector(-hw, hh)];
    }

    return baseVerts.map((v) => v.add(this.offset));
  }
}
