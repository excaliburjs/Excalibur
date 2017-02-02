import { BoundingBox } from './Collision/BoundingBox';
import { GameEvent } from './Events';
import { Vector } from './Algebra';
import { Scene } from './Scene';
import { ActionContext } from './Actions/ActionContext';
import { Actor } from './Actor';
import { Logger } from './Util/Log';
import { IEvented } from './Interfaces/IEvented';
import { IActionable } from './Actions/IActionable';
import { Class } from './Class';


/**
 * Groups are used for logically grouping Actors so they can be acted upon
 * in bulk.
 *
 * [[include:Groups.md]]
 */
export class Group extends Class implements IActionable, IEvented {

   private _logger: Logger = Logger.getInstance();
   private _members: Actor[] = [];

   public actions: ActionContext = new ActionContext();


   constructor(public name: string, public scene: Scene) {
      super();
      if (scene == null) {
         this._logger.error('Invalid constructor arguments passed to Group: ', name, ', scene must not be null!');
      } else {
         var existingGroup = scene.groups[name];
         if (existingGroup) {
            this._logger.warn('Group with name', name, 'already exists. This new group will replace it.');
         }
         scene.groups[name] = this;
      }
   }

   public add(actor: Actor);
   public add(actors: Actor[]);
   public add(actorOrActors: any) {
      if (actorOrActors instanceof Actor) {
         actorOrActors = [].concat(actorOrActors);
      }

      var i = 0, len = actorOrActors.length, groupIdx: number;

      for (i; i < len; i++) {
         groupIdx = this.getMembers().indexOf(actorOrActors[i]);
         if (groupIdx === -1) {
            this._members.push(actorOrActors[i]);
            this.scene.add(actorOrActors[i]);
            this.actions.addActorToContext(actorOrActors[i]);
            this.eventDispatcher.wire(actorOrActors[i].eventDispatcher);
         }
      }
   }

   public remove(actor: Actor): void {
      var index = this._members.indexOf(actor);
      if (index > -1) {
         this._members.splice(index, 1);
         this.actions.removeActorFromContext(actor);
         this.eventDispatcher.unwire(actor.eventDispatcher);
      }
   }

   public move(vector: Vector): void;
   public move(dx: number, dy: number): void;
   public move(args: Vector | number): void {
      var i = 0, members = this.getMembers(), len = members.length;

      if (arguments.length === 1 && args instanceof Vector) {
         for (i; i < len; i++) {
            members[i].pos.x += args.x;
            members[i].pos.y += args.y;
         }
      } else if (typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
         var x = arguments[0];
         var y = arguments[1];

         for (i; i < len; i++) {
            members[i].pos.x += x;
            members[i].pos.y += y;
         }
      } else {
         this._logger.error('Invalid arguments passed to group move', this.name, 'args:', arguments);
      }

   }

   public rotate(angle: number): void {
      if (typeof arguments[0] === 'number') {
         var r = arguments[0], i = 0, members = this.getMembers(), len = members.length;
         for (i; i < len; i++) {
            members[i].rotation += r;
         }
      } else {
         this._logger.error('Invalid arguments passed to group rotate', this.name, 'args:', arguments);
      }
   }


   public on(eventName: string, handler: (event?: GameEvent) => void) {
      this.eventDispatcher.on(eventName, handler);
   }

   public off(eventName: string, handler?: (event?: GameEvent) => void) {
      this.eventDispatcher.off(eventName, handler);
   }

   public emit(topic: string, event?: GameEvent) {
      this.eventDispatcher.emit(topic, event);
   }

   public contains(actor: Actor): boolean {
      return this.getMembers().indexOf(actor) > -1;
   }

   public getMembers(): Actor[] {
      return this._members;
   }

   public getRandomMember(): Actor {
      return this._members[Math.floor(Math.random() * this._members.length)];
   }

   public getBounds(): BoundingBox {
      return this.getMembers().map(a => a.getBounds()).reduce((prev: BoundingBox, curr: BoundingBox) => {
         return prev.combine(curr);
      });
   }

}