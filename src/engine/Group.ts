/// <reference path="Actions/IActionable.ts"/>
/// <reference path="Actions/ActionContext.ts"/>
/// <reference path="Collision/BoundingBox.ts"/>

module ex {

   /**
    * Grouping
    *
    * Groups are used for logically grouping Actors so they can be acted upon
    * in bulk.
    *
    * Groups can be used to detect collisions across a large nubmer of actors. For example 
    * perhaps a large group of "enemy" actors.
    *
    * ```typescript
    * var enemyShips = engine.currentScene.createGroup("enemy");
    * var enemies = [...]; // Large array of enemies;
    * enemyShips.add(enemies);
    *
    * var player = new Actor();
    * engine.currentScene.add(player);
    *
    * enemyShips.on('collision', function(ev: CollisionEvent){
    *   if (e.other === player) {
    *       //console.log("collision with player!");
    *   }       
    * });
    *
    * ```
    */
   export class Group extends Class implements IActionable {

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
      public move(args): void {
         var i = 0, members = this.getMembers(), len = members.length;

         if (arguments.length === 1 && args instanceof Vector) {
            for (i; i < len; i++) {
               members[i].x += args.x;
               members[i].y += args.y;
            }
         } else if (typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
            var x = arguments[0];
            var y = arguments[1];

            for (i; i < len; i++) {
               members[i].x += x;
               members[i].y += y;
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
         this.eventDispatcher.subscribe(eventName, handler);
      }

      public off(eventName: string, handler?: (event?: GameEvent) => void) {
         this.eventDispatcher.unsubscribe(eventName, handler);
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

}