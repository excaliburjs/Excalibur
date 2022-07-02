import { Vector } from '../../Math/vector';
import { BodyComponent } from '../BodyComponent';
import { CollisionContact } from '../Detection/CollisionContact';

/**
 * Holds information about contact points, meant to be reused over multiple frames of contact
 */
export class ContactConstraintPoint {
  constructor(public point: Vector, public local: Vector, public contact: CollisionContact) {
    this.update();
  }

  /**
   * Updates the contact information
   */
  update() {
    const bodyA = this.contact.colliderA.owner?.get(BodyComponent);
    const bodyB = this.contact.colliderB.owner?.get(BodyComponent);

    if (bodyA && bodyB) {
      const normal = this.contact.normal;
      const tangent = this.contact.tangent;

      this.aToContact = this.point.sub(bodyA.globalPos);
      this.bToContact = this.point.sub(bodyB.globalPos);

      const aToContactNormal = this.aToContact.cross(normal);
      const bToContactNormal = this.bToContact.cross(normal);

      this.normalMass =
        bodyA.inverseMass +
        bodyB.inverseMass +
        bodyA.inverseInertia * aToContactNormal * aToContactNormal +
        bodyB.inverseInertia * bToContactNormal * bToContactNormal;

      const aToContactTangent = this.aToContact.cross(tangent);
      const bToContactTangent = this.bToContact.cross(tangent);

      this.tangentMass =
        bodyA.inverseMass +
        bodyB.inverseMass +
        bodyA.inverseInertia * aToContactTangent * aToContactTangent +
        bodyB.inverseInertia * bToContactTangent * bToContactTangent;
    }

    return this;
  }

  /**
   * Returns the relative velocity between bodyA and bodyB
   */
  public getRelativeVelocity() {
    const bodyA = this.contact.colliderA.owner?.get(BodyComponent);
    const bodyB = this.contact.colliderB.owner?.get(BodyComponent);
    if (bodyA && bodyB) {
      // Relative velocity in linear terms
      // Angular to linear velocity formula -> omega = velocity/radius so omega x radius = velocity
      const velA = bodyA.vel.add(Vector.cross(bodyA.angularVelocity, this.aToContact));
      const velB = bodyB.vel.add(Vector.cross(bodyB.angularVelocity, this.bToContact));
      return velB.sub(velA);
    }
    return Vector.Zero;
  }

  /**
   * Impulse accumulated over time in normal direction
   */
  public normalImpulse: number = 0;

  /**
   * Impulse accumulated over time in the tangent direction
   */
  public tangentImpulse: number = 0;

  /**
   * Effective mass seen in the normal direction
   */
  public normalMass: number = 0;

  /**
   * Effective mass seen in the tangent direction
   */
  public tangentMass: number = 0;

  /**
   * Direction from center of mass of bodyA to contact point
   */
  public aToContact: Vector = new Vector(0, 0);

  /**
   * Direction from center of mass of bodyB to contact point
   */
  public bToContact: Vector = new Vector(0, 0);

  /**
   * Original contact velocity combined with bounciness
   */
  public originalVelocityAndRestitution: number = 0;
}
