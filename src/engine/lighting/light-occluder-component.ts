import { Component } from '../entity-component-system/component';
import { Vector } from '../math/vector';

export type OccluderShape =
  | { kind: 'box'; width: number; height: number; anchor?: Vector }
  | { kind: 'polygon'; vertices: Vector[] }
  | { kind: 'circle'; radius: number };

/** A shadow volume silhouette approximated by a closed polygon in screen space */
export type PolyOccluder = { kind: 'poly'; verts: Vector[] };
/** A shadow volume silhouette approximated by a circle in screen space */
export type CircleOccluder = { kind: 'circle'; center: Vector; radius: number };
/** World/screen-space occluder geometry consumed by {@apilink LightingSystem} to cast shadows */
export type Occluder = PolyOccluder | CircleOccluder;

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
 *
 * Box shapes are centered on the transform origin by default (`anchor: Vector.Half`, matching {@apilink Shape.Box}).
 * Polygon and circle shapes are positioned by their own vertex/center coordinates, same as {@apilink Shape.Polygon}
 * and {@apilink Shape.Circle} — `offset` shifts any shape further from the transform origin in local space.
 */
export class LightOccluderComponent extends Component {
  // @ts-ignore
  private static _NAME = 'LightOccluderComponent';

  public castShadows: boolean;

  private _shape: OccluderShape;
  private _offset: Vector;
  private _localVertices: Vector[] | null = null;

  constructor(options: LightOccluderComponentOptions) {
    super();
    this._shape = options.shape;
    this.castShadows = options.castShadows ?? true;
    this._offset = options.offset ?? Vector.Zero;
  }

  public get shape(): OccluderShape {
    return this._shape;
  }

  public set shape(shape: OccluderShape) {
    this._shape = shape;
    this._localVertices = null;
  }

  public get offset(): Vector {
    return this._offset;
  }

  public set offset(offset: Vector) {
    this._offset = offset;
    this._localVertices = null;
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
   * Returns an empty array for circular primitives. Cached until `shape` or `offset` are reassigned.
   */
  public localVertices(): Vector[] {
    if (this._localVertices) {
      return this._localVertices;
    }

    if (this._shape.kind === 'circle') {
      return (this._localVertices = []);
    }

    let baseVerts: Vector[] = [];
    if (this._shape.kind === 'polygon') {
      baseVerts = this._shape.vertices;
    } else {
      const anchor = this._shape.anchor ?? Vector.Half;
      const left = -this._shape.width * anchor.x;
      const top = -this._shape.height * anchor.y;
      const right = this._shape.width - this._shape.width * anchor.x;
      const bottom = this._shape.height - this._shape.height * anchor.y;
      baseVerts = [new Vector(left, top), new Vector(right, top), new Vector(right, bottom), new Vector(left, bottom)];
    }

    return (this._localVertices = baseVerts.map((v) => v.add(this._offset)));
  }
}
