/// <reference path="Actions/IActionable.ts"/>
/// <reference path="Actions/ActionContext.ts"/>
/// <reference path="Collision/BoundingBox.ts"/>

module ex {

   /**
    * @todo Document this
    */
   export class Group extends Class implements IActionable {

      private _logger: Logger = Logger.getInstance();
      private _members: Actor[] = [];

      public actions: ActionContext = new ActionContext();


      constructor(public name: string, public scene: Scene) {
         super();
         if (scene == null) {
            this._logger.error("Invalid constructor arguments passed to Group: ", name, ", scene must not be null!");
         } else {
            var existingGroup = scene.groups[name];
            if (existingGroup) {
               this._logger.warn("Group with name", name, "already exists. This new group will replace it.");
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
         actorOrActors.forEach(a => {
            var index = this.getMembers().indexOf(a);
            if (index === -1) {
               this._members.push(a);
               this.scene.add(a);
               this.actions.addActorToContext(a);
               this.eventDispatcher.wire(a.eventDispatcher);
            }
         });
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
         if (arguments.length === 1 && args instanceof Vector) {
            this.getMembers().forEach((a: Actor) => {
               a.x += args.x;
               a.y += args.y;
            });
         } else if (typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
            var x = arguments[0];
            var y = arguments[1];
            this.getMembers().forEach((a: Actor) => {
               a.x += x;
               a.y += y;
            });
         } else {
            this._logger.error("Invalid arguments passed to group move", this.name, "args:", arguments);
         }

      }

      public rotate(angle: number): void {
         if (typeof arguments[0] === 'number') {
            var r = arguments[0];
            this.getMembers().forEach((a: Actor) => {
               a.rotation += r;
            });
         } else {
            this._logger.error("Invalid arguments passed to group rotate", this.name, "args:", arguments);
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