import { Engine } from './../Engine';
import * as Events from './../Events';

export interface ICanInitialize {

   /**
    * Overridable implementation
    */
   onInitialize(_engine: Engine): void;

   /**
    * Event signature
    */
   on(eventName: Events.initialize, handler: (event?: Events.InitializeEvent) => void): void;
}

export interface ICanActivate {

   /**
    * Overridable implementation
    */
   onActivate(_engine: Engine): void;

   /**
    * Event signature
    */
   on(eventName: Events.activate, handler: (event?: Events.ActivateEvent) => void): void;

}

export interface ICanDeactivate {
   /**
    * Overridable implementation
    */
   onDeactivate(_engine: Engine): void;

   /**
    * Event signature
    */
   on(eventName: Events.deactivate, handler: (event?: Events.DeactivateEvent) => void): void;
}

export interface ICanUpdate {
   /**
    * Overridable implementation
    */
   onPreUpdate(_engine: Engine): void;

   /**
    * Event signature
    */
   on(eventName: Events.preupdate, handler: (event?: Events.PreUpdateEvent) => void): void;


   /**
    * Overridable implementation
    */
   onPostUpdate(_engine: Engine): void;

   /**
    * Event signature
    */
   on(eventName: Events.postupdate, handler: (event?: Events.PostUpdateEvent) => void): void;
}

export interface ICanDraw {
   /**
    * Overridable implementation
    */
   onPreDraw(_ctx: CanvasRenderingContext2D, delta: number): void;

   /**
    * Event signature
    */
   on(eventName: Events.predraw, handler: (event?: Events.PreDrawEvent) => void): void;


   /**
    * Overridable implementation
    */
   onPostDraw(_ctx: CanvasRenderingContext2D, delta: number): void;

   /**
    * Event signature
    */
   on(eventName: Events.postdraw, handler: (event?: Events.PostDrawEvent) => void): void;

}