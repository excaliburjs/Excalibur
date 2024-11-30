import { Vector } from '../Math/vector';
import { TransformComponent } from '../EntityComponentSystem';
import { Component } from '../EntityComponentSystem/Component';
import { Entity } from '../EntityComponentSystem/Entity';
import { CollisionEndEvent, CollisionStartEvent, PostCollisionEvent, PreCollisionEvent } from '../Events';
import { Observable } from '../Util/Observable';
import { BoundingBox } from './BoundingBox';
import { CollisionContact } from './Detection/CollisionContact';
import { CircleCollider } from './Colliders/CircleCollider';
import { Collider } from './Colliders/Collider';
import { CompositeCollider } from './Colliders/CompositeCollider';
import { PolygonCollider } from './Colliders/PolygonCollider';
import { EdgeCollider } from './Colliders/EdgeCollider';
import { Shape } from './Colliders/Shape';
import { EventEmitter } from '../EventEmitter';
import { Actor } from '../Actor';

export class ColliderComponent extends Component {
  public events = new EventEmitter();
  /**
   * Observable that notifies when a collider is added to the body
   */
  public $colliderAdded = new Observable<Collider>();

  /**
   * Observable that notifies when a collider is removed from the body
   */
  public $colliderRemoved = new Observable<Collider>();

  constructor(collider?: Collider) {
    super();
    this.set(collider);
  }

  private _collider: Collider;
  /**
   * Get the current collider geometry
   */
  public get(): Collider | undefined {
    return this._collider;
  }

  /**
   * Set the collider geometry
   * @param collider
   * @returns the collider you set
   */
  public set<T extends Collider>(collider: T): T {
    this.clear();
    if (collider) {
      this._collider = collider;
      this._collider.owner = this.owner;
      collider.events.pipe(this.events);
      this.$colliderAdded.notifyAll(collider);
      this.update();
    }
    return collider;
  }

  private _collidersToRemove: Collider[] = [];
  /**
   * Remove collider geometry from collider component
   */
  public clear() {
    if (this._collider) {
      this._collidersToRemove.push(this._collider);
      this._collider = null;
    }
  }

  public processColliderRemoval() {
    for (const collider of this._collidersToRemove) {
      collider.events.unpipe(this.events);
      this.$colliderRemoved.notifyAll(collider);
      collider.owner = null;
    }
  }

  public clone(): ColliderComponent {
    const clone = new ColliderComponent(this._collider.clone());

    return clone;
  }

  /**
   * Return world space bounds
   */
  public get bounds() {
    return this._collider?.bounds ?? new BoundingBox();
  }

  /**
   * Return local space bounds
   */
  public get localBounds() {
    return this._collider?.localBounds ?? new BoundingBox();
  }

  /**
   * Update the collider's transformed geometry
   */
  public update() {
    const tx = this.owner?.get(TransformComponent);
    if (this._collider) {
      this._collider.owner = this.owner;
      if (tx) {
        this._collider.update(tx.get());
      }
    }
  }

  /**
   * Collide component with another
   * @param other
   */
  collide(other: ColliderComponent): CollisionContact[] {
    let colliderA = this._collider;
    let colliderB = other._collider;
    if (!colliderA || !colliderB) {
      return [];
    }

    // If we have a composite left hand side :(
    // Might bite us, but to avoid updating all the handlers make composite always left side
    let flipped = false;
    if (colliderB instanceof CompositeCollider) {
      colliderA = colliderB;
      colliderB = this._collider;
      flipped = true;
    }

    if (this._collider) {
      const contacts = colliderA.collide(colliderB);
      if (contacts) {
        if (flipped) {
          contacts.forEach((contact) => {
            contact.mtv = contact.mtv.negate();
            contact.normal = contact.normal.negate();
            contact.tangent = contact.normal.perpendicular();
            contact.colliderA = this._collider;
            contact.colliderB = other._collider;
          });
        }
        return contacts;
      }
      return [];
    }
    return [];
  }

  onAdd(entity: Entity) {
    if (this._collider) {
      this.update();
    }
    // Wire up the collider events to the owning entity
    this.events.on('precollision', (evt: any) => {
      const precollision = evt as PreCollisionEvent<Collider>;
      entity.events.emit(
        'precollision',
        new PreCollisionEvent(precollision.self, precollision.other, precollision.side, precollision.intersection, precollision.contact)
      );
      if (entity instanceof Actor) {
        entity.onPreCollisionResolve(precollision.self, precollision.other, precollision.side, precollision.contact);
      }
    });
    this.events.on('postcollision', (evt: any) => {
      const postcollision = evt as PostCollisionEvent<Collider>;
      entity.events.emit(
        'postcollision',
        new PostCollisionEvent(
          postcollision.self,
          postcollision.other,
          postcollision.side,
          postcollision.intersection,
          postcollision.contact
        )
      );
      if (entity instanceof Actor) {
        entity.onPostCollisionResolve(postcollision.self, postcollision.other, postcollision.side, postcollision.contact);
      }
    });
    this.events.on('collisionstart', (evt: any) => {
      const start = evt as CollisionStartEvent<Collider>;
      entity.events.emit('collisionstart', new CollisionStartEvent(start.self, start.other, start.side, start.contact));
      if (entity instanceof Actor) {
        entity.onCollisionStart(start.self, start.other, start.side, start.contact);
      }
    });
    this.events.on('collisionend', (evt: any) => {
      const end = evt as CollisionEndEvent<Collider>;
      entity.events.emit('collisionend', new CollisionEndEvent(end.self, end.other, end.side, end.lastContact));
      if (entity instanceof Actor) {
        entity.onCollisionEnd(end.self, end.other, end.side, end.lastContact);
      }
    });
  }

  onRemove() {
    this.events.clear();
    this.$colliderRemoved.notifyAll(this._collider);
  }

  /**
   * Sets up a box geometry based on the current bounds of the associated actor of this physics body.
   *
   * If no width/height are specified the body will attempt to use the associated actor's width/height.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  useBoxCollider(width: number, height: number, anchor: Vector = Vector.Half, center: Vector = Vector.Zero): PolygonCollider {
    const collider = Shape.Box(width, height, anchor, center);
    return this.set(collider);
  }

  /**
   * Sets up a {@apilink PolygonCollider | `polygon`} collision geometry based on a list of of points relative
   *  to the anchor of the associated actor
   * of this physics body.
   *
   * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  usePolygonCollider(points: Vector[], center: Vector = Vector.Zero): PolygonCollider {
    const poly = Shape.Polygon(points, center);
    return this.set(poly);
  }

  /**
   * Sets up a {@apilink Circle | `circle collision geometry`} as the only collider with a specified radius in pixels.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  useCircleCollider(radius: number, center: Vector = Vector.Zero): CircleCollider {
    const collider = Shape.Circle(radius, center);
    return this.set(collider);
  }

  /**
   * Sets up an {@apilink Edge | `edge collision geometry`} with a start point and an end point relative to the anchor of the associated actor
   * of this physics body.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  useEdgeCollider(begin: Vector, end: Vector): EdgeCollider {
    const collider = Shape.Edge(begin, end);
    return this.set(collider);
  }

  /**
   * Setups up a {@apilink CompositeCollider} which can define any arbitrary set of excalibur colliders
   * @param colliders
   */
  useCompositeCollider(colliders: Collider[]): CompositeCollider {
    return this.set(new CompositeCollider(colliders));
  }
}
