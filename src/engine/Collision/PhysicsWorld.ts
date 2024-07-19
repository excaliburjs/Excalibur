import { Ray } from '../Math/ray';
import { DeepRequired } from '../Util/Required';
import { Observable } from '../Util/Observable';
import {
  BoundingBox,
  Collider,
  CollisionProcessor,
  DynamicTreeCollisionProcessor,
  RayCastHit,
  RayCastOptions,
  SparseHashGridCollisionProcessor
} from './Index';
import { BodyComponent } from './BodyComponent';
import { PhysicsConfig } from './PhysicsConfig';
import { watchDeep } from '../Util/Watch';
import { Vector } from '../Math/vector';
import { SpatialPartitionStrategy } from './Detection/SpatialPartitionStrategy';

export class PhysicsWorld {
  $configUpdate = new Observable<DeepRequired<PhysicsConfig>>();

  private _configDirty = false;
  private _config: DeepRequired<PhysicsConfig>;
  get config(): DeepRequired<PhysicsConfig> {
    return watchDeep(this._config, (change) => {
      this.$configUpdate.notifyAll(change);
    });
  }
  set config(newConfig: DeepRequired<PhysicsConfig>) {
    this._config = newConfig;
    this.$configUpdate.notifyAll(newConfig);
  }

  private _collisionProcessor: CollisionProcessor;
  /**
   * Spatial data structure for locating potential collision pairs and ray casts
   */
  public get collisionProcessor(): CollisionProcessor {
    if (this._configDirty) {
      this._configDirty = false;
      // preserve tracked colliders if config updates
      const colliders = this._collisionProcessor.getColliders();
      if (this._config.spatialPartition === SpatialPartitionStrategy.SparseHashGrid) {
        this._collisionProcessor = new SparseHashGridCollisionProcessor(this._config.sparseHashGrid);
      } else {
        this._collisionProcessor = new DynamicTreeCollisionProcessor(this._config);
      }
      for (const collider of colliders) {
        this._collisionProcessor.track(collider);
      }
    }
    return this._collisionProcessor;
  }
  constructor(config: DeepRequired<PhysicsConfig>) {
    this.config = config;
    this.$configUpdate.subscribe((config) => {
      this._configDirty = true;
      BodyComponent.updateDefaultPhysicsConfig(config.bodies);
    });
    if (this._config.spatialPartition === SpatialPartitionStrategy.SparseHashGrid) {
      this._collisionProcessor = new SparseHashGridCollisionProcessor(this._config.sparseHashGrid);
    } else {
      this._collisionProcessor = new DynamicTreeCollisionProcessor(this._config);
    }
  }

  /**
   * Raycast into the scene's physics world
   * @param ray
   * @param options
   */
  public rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[] {
    return this.collisionProcessor.rayCast(ray, options);
  }

  /**
   * Query for colliders in the scene's physics world
   * @param point
   */
  public query(point: Vector): Collider[];
  public query(bounds: BoundingBox): Collider[];
  public query(pointOrBounds: Vector | BoundingBox): Collider[] {
    // FIXME workaround TS: https://github.com/microsoft/TypeScript/issues/14107
    return this._collisionProcessor.query(pointOrBounds as any);
  }
}
