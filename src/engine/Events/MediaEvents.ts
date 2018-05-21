import { GameEvent } from '../Events';
import { Sound } from '../Resources/Sound/Sound';
import { Actor } from '../Actor';

export class MediaEvent extends GameEvent<Sound> {
   /**
    * Media event cannot bubble
    */
   public set bubbles(_value: boolean) {
      // stubbed
   };
   /**
    * Media event cannot bubble
    */
   public get bubbles(): boolean {
      return false;
   };
   /**
    * Media event cannot bubble, so they have no path
    */
   protected get _path(): Actor[] {
      return null;
   };
   /**
    * Media event cannot bubble, so they have no path
    */
   protected set _path(_val: Actor[]) {
      // stubbed
   };


   constructor(public target: Sound, protected _name: string = 'MediaEvent') {
      super();
   }

   /**
    * Prevents event from bubbling
    */
   public stopPropagation(): void {
      /**
       * Stub
       */
   }
   /**
    * Action, that calls when event happens
    */
   public action(): void {
      /**
       * Stub
       */
   }
   /**
    * Propagate event further through event path
    */
   public propagate(): void {
      /**
       * Stub
       */
   }

   public layPath(_actor: Actor): void {
      /**
       * Stub
       */
   }
}

export class NativeSoundEvent extends MediaEvent {
   constructor(target: Sound) {
      super(target, 'NativeSoundEvent');
   }
}