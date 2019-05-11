import { BoundingBox } from './Collision/BoundingBox';
import { GameEvent } from './Events';
import { Vector } from './Algebra';
import { Scene } from './Scene';
import { ActionContext } from './Actions/ActionContext';
import { Actor } from './Actor';
import { Logger } from './Util/Log';
import { Eventable } from './Interfaces/Evented';
import { Actionable } from './Actions/Actionable';
import { Class } from './Class';

/**
 * Groups are used for logically grouping Actors so they can be acted upon
 * in bulk.
 *
 * [[include:Groups.md]]
 */
export class Group extends Class implements Actionable, Eventable {
  private _logger: Logger = Logger.getInstance();
  private _members: Actor[] = [];

  public actions: ActionContext = new ActionContext();

  constructor(public name: string, public scene: Scene) {
    super();
    if (scene == null) {
      this._logger.error('Invalid constructor arguments passed to Group: ', name, ', scene must not be null!');
    } else {
      const existingGroup = scene.groups[name];
      if (existingGroup) {
        this._logger.warn('Group with name', name, 'already exists. This new group will replace it.');
      }
      scene.groups[name] = this;
    }
  }

  public add(actor: Actor): void;
  public add(actors: Actor[]): void;
  public add(actorOrActors: any): void {
    if (actorOrActors instanceof Actor) {
      actorOrActors = [].concat(actorOrActors);
    }

    let groupIdx: number;
    const len = actorOrActors.length;

    for (let i = 0; i < len; i++) {
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
    const index = this._members.indexOf(actor);
    if (index > -1) {
      this._members.splice(index, 1);
      this.actions.removeActorFromContext(actor);
      this.eventDispatcher.unwire(actor.eventDispatcher);
    }
  }

  public move(vector: Vector): void;
  public move(dx: number, dy: number): void;
  public move(args: Vector | number): void {
    const members = this.getMembers();
    const len = members.length;

    if (arguments.length === 1 && args instanceof Vector) {
      for (let i = 0; i < len; i++) {
        members[i].pos.x += args.x;
        members[i].pos.y += args.y;
      }
    } else if (typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
      const x = arguments[0];
      const y = arguments[1];

      for (let i = 0; i < len; i++) {
        members[i].pos.x += x;
        members[i].pos.y += y;
      }
    } else {
      this._logger.error('Invalid arguments passed to group move', this.name, 'args:', arguments);
    }
  }

  public rotate(angle: number): void {
    if (typeof angle !== 'number') {
      this._logger.error('Invalid arguments passed to group rotate', this.name, 'args:', arguments);
      return;
    }

    for (const member of this.getMembers()) {
      member.rotation += angle;
    }
  }

  public on(eventName: string, handler: (event: GameEvent<any>) => void) {
    this.eventDispatcher.on(eventName, handler);
  }

  public off(eventName: string, handler?: (event: GameEvent<any>) => void) {
    this.eventDispatcher.off(eventName, handler);
  }

  public emit(topic: string, event: GameEvent<any>) {
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
    return this.getMembers()
      .map((a) => a.getBounds())
      .reduce((prev: BoundingBox, curr: BoundingBox) => {
        return prev.combine(curr);
      });
  }
}
