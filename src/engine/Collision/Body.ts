/// <reference path="../Algebra.ts" />

module ex {
   export class Body {

      /**
       * Constructs a new physics body associated with an actor
       */
      constructor(public actor: Actor) {}

      /**
       * [ICollisionArea|Collision area] of this physics body, defines the shape for rigid body collision
       */
      public collisionArea: ICollisionArea = null;
       
      /**
       * The (x, y) position of the actor this will be in the middle of the actor if the [[anchor]] is set to (0.5, 0.5) which is default. 
       * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0). 
       */
      public pos: Vector = new ex.Vector(0, 0);
      
      /**
       * The position of the actor last frame (x, y) in pixels
       */
      public oldPos: Vector = new ex.Vector(0, 0);    
      
      /**
       * The current velocity vector (vx, vy) of the actor in pixels/second
       */
      public vel: Vector = new ex.Vector(0, 0);
      
      /**
       * The velocity of the actor last frame (vx, vy) in pixels/second
       */
      public oldVel: Vector = new ex.Vector(0, 0);
      
      /**
       * The curret acceleration vector (ax, ay) of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may 
       * be useful to simulate a gravitational effect.  
       */
      public acc: Vector = new ex.Vector(0, 0);    
      
      /**
       * The current torque applied to the actor
       */
      public torque: number = 0;
      
      /**
       * The current mass of the actor, mass can be thought of as the resistance to acceleration.
       */
      public mass: number = 1.0;
      
      /**
       * The current moment of inertia, moi can be thought of as the resistance to rotation.
       */
      public moi: number = 1000;
      
      /**
       * The current "motion" of the actor, used to calculated sleep in the physics simulation
       */
      public motion: number = 10;
      
      /**
       * The coefficient of friction on this actor
       */
      public friction: number = .99;
      
      /**
       * The coefficient of restitution of this actor, represents the amount of energy preserved after collision
       */
      public restitution: number = .2;
      
      /** 
       * The rotation of the actor in radians
       */
      public rotation: number = 0; // radians
      
      /** 
       * The rotational velocity of the actor in radians/second
       */
      public rx: number = 0; //radians/sec

      /**
       * Returns the body's [[BoundingBox]] calculated for this instant in world space.
       */
      public getBounds() {
         if (ex.Physics.collisionResolutionStrategy === ex.CollisionResolutionStrategy.Box) {
            return this.actor.getBounds();
         } else {
            return this.collisionArea.getBounds();
         }
      }

      /**
       * Returns the actor's [[BoundingBox]] relative to the actors position.
       */
      public getRelativeBounds() {
         if (ex.Physics.collisionResolutionStrategy === ex.CollisionResolutionStrategy.Box) {
            return this.actor.getRelativeBounds();
         } else {
            return this.actor.getRelativeBounds();
         }
      }

      /**
       * Updates the collision area geometry and internal caches
       */
      public update() {
         if (this.collisionArea) {
            this.collisionArea.recalc();
         }
      }


      /**
       * Sets up a box collision area based on the current bounds of the associated actor of this physics body.
       * 
       * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
       */
      public useBoxCollision(center: Vector = ex.Vector.Zero.clone()) {
         
         this.collisionArea = new PolygonArea({
            body: this,
            points: this.actor.getRelativeBounds().getPoints(),
            pos: center // position relative to actor
         });

         // in case of a nan moi, coalesce to a safe default
         this.moi = this.collisionArea.getMomentOfInertia() || this.moi;

      }

      /**
       * Sets up a polygon collision area based on a list of of points relative to the anchor of the associated actor of this physics body.
       * 
       * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported. 
       * 
       * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
       */
      public usePolygonCollision(points: Vector[], center: Vector = ex.Vector.Zero.clone()) {
         this.collisionArea = new PolygonArea({
            body: this,
            points: points,
            pos: center // position relative to actor
         });

         // in case of a nan moi, collesce to a safe default
         this.moi = this.collisionArea.getMomentOfInertia() || this.moi;
      } 

      /**
       * Sets up a [[CircleArea|circle collision area]] with a specified radius in pixels.
       * 
       * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
       */
      public useCircleCollision(radius?: number, center: Vector = ex.Vector.Zero.clone()) {
         if (!radius) {
            radius = this.actor.getWidth() / 2;
         }
         this.collisionArea = new ex.CircleArea({
            body: this,
            radius: radius,
            pos: center
         });
         this.moi = this.collisionArea.getMomentOfInertia() || this.moi;
      }

      /**
       * Sets up an [[EdgeArea|edge collision]] with a start point and an end point relative to the anchor of the associated actor 
       * of this physics body. 
       * 
       * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
       */
      public useEdgeCollision(begin: Vector, end: Vector, center: Vector = ex.Vector.Zero.clone()) {
         this.collisionArea = new ex.EdgeArea({
            begin: begin,
            end: end,
            body: this
         });

         this.moi = this.collisionArea.getMomentOfInertia() || this.moi;
      }

      /* istanbul ignore next */
      public debugDraw(ctx: CanvasRenderingContext2D) {
         
         // Draw motion vectors
         if (ex.Physics.showMotionVectors) {
            ex.Util.DrawUtil.vector(ctx, ex.Color.Yellow, this.pos, (this.acc.add(ex.Physics.acc)));
            ex.Util.DrawUtil.vector(ctx, ex.Color.Red, this.pos, (this.vel));
            ex.Util.DrawUtil.point(ctx, ex.Color.Red, this.pos);
         }
         
         if (ex.Physics.showBounds) {
            this.getBounds().debugDraw(ctx, Color.Yellow);
         }

         if (ex.Physics.showArea) {
            this.collisionArea.debugDraw(ctx, ex.Color.Green);
         }
      }
   }   
}