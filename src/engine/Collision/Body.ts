/// <reference path="../Algebra.ts" />

module ex {
   export class Body {
       
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
       * The current momemnt of inertia, moi can be thought of as the resistance to rotation.
       */
      public moi: number = 1000;
      
      /**
       * The current "motion" of the actor, used to calculated sleep in the physics simulation
       */
      public motion: number = 10;

      /**
       * This idicates whether the current actor is asleep in the physics simulation
       */
      // TODO implement sleeping public sleeping: boolean = false;
      
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
      public rx: number = 0; //radions/sec
   }   
}