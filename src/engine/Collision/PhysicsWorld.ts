import { Ray } from '../Math/ray';
import { DeepRequired } from '../Util/Required';
import { Observable } from '../Util/Observable';
import { DynamicTreeCollisionProcessor, RayCastHit, RayCastOptions } from './Index';
import { BodyComponent } from './BodyComponent';
import { PhysicsConfig } from './PhysicsConfig';
import { watchDeep } from '../Util/Watch';

export class PhysicsWorld {

  $configUpdate = new Observable<DeepRequired<PhysicsConfig>>;

  private _configDirty = false;
  private _config: DeepRequired<PhysicsConfig>;
  get config(): DeepRequired<PhysicsConfig> {
    return watchDeep(this._config, change => {
      this.$configUpdate.notifyAll(change);
    });
  }
  set config(newConfig: DeepRequired<PhysicsConfig>) {
    this._config = newConfig;
    this.$configUpdate.notifyAll(newConfig);
  }

  private _collisionProcessor: DynamicTreeCollisionProcessor;
  /**
   * Spatial data structure for locating potential collision pairs and ray casts
   */
  public get collisionProcessor(): DynamicTreeCollisionProcessor {
    if (this._configDirty) {
      this._configDirty = false;
      // preserve tracked colliders if config updates
      const colliders = this._collisionProcessor.getColliders();
      this._collisionProcessor = new DynamicTreeCollisionProcessor(this._config);
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
    this._collisionProcessor = new DynamicTreeCollisionProcessor(this.config);
  }

  /**
   * Raycast into the scene's physics world
   * @param ray
   * @param options
   */
  public rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[] {
    return this.collisionProcessor.rayCast(ray, options);
  }
}