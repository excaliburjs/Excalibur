import { ActionContext } from "./ActionContext";
import { Component } from "../EntityComponentSystem/Component"
import { Actor, Entity, MotionComponent, TransformComponent } from "..";
import { Vector } from "../Math/vector";
import { EasingFunction } from "../Util/EasingFunctions";
import { ActionQueue } from "./ActionQueue";
import { RotationType } from "./RotationType";

export interface ActionContextMethods extends Pick<ActionContext, keyof ActionContext> {};

export class ActionsComponent extends Component<'ex.actions'> implements ActionContextMethods {
  public readonly type = "ex.actions";
  dependencies = [TransformComponent, MotionComponent]
  
  private _ctx: ActionContext;
  
  onAdd(entity: Entity) {
    this._ctx = new ActionContext(entity);
  }
  
  onRemove() {
    this._ctx = null;
  }
  
  public getQueue(): ActionQueue {
    return this._ctx?.getQueue();
  }
  public update(elapsedMs: number): void {
    return this._ctx?.update(elapsedMs);
  }
  public clearActions(): void {
    this._ctx?.clearActions();
  }
  public easeTo(pos: Vector, duration: number, easingFcn?: EasingFunction): ActionContext;
  public easeTo(x: number, y: number, duration: number, easingFcn?: EasingFunction): ActionContext;
  public easeTo(...args: any[]): ActionContext {
    return this._ctx.easeTo.apply(this._ctx, args);
  }
  public moveTo(pos: Vector, speed: number): ActionContext;
  public moveTo(x: number, y: number, speed: number): ActionContext;
  public moveTo(xOrPos: number | Vector, yOrSpeed: number, speedOrUndefined?: number): ActionContext {
    return this._ctx.moveTo.apply(this._ctx, [xOrPos, yOrSpeed, speedOrUndefined]);
  }
  public moveBy(offset: Vector, speed: number): ActionContext;
  public moveBy(xOffset: number, yOffset: number, speed: number): ActionContext;
  public moveBy(xOffsetOrVector: number | Vector, yOffsetOrSpeed: number, speedOrUndefined?: number): ActionContext {
    return this._ctx.moveBy.apply(this._ctx, [xOffsetOrVector, yOffsetOrSpeed, speedOrUndefined]);
  }
  public rotateTo(angleRadians: number, speed: number, rotationType?: RotationType): ActionContext {
    return this._ctx.rotateTo(angleRadians, speed, rotationType);
  }
  public rotateBy(angleRadiansOffset: number, speed: number, rotationType?: RotationType): ActionContext {
    return this._ctx.rotateBy(angleRadiansOffset, speed, rotationType);
  }
  public scaleTo(size: Vector, speed: Vector): ActionContext;
  public scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): ActionContext;
  public scaleTo(sizeXOrVector: number | Vector, sizeYOrSpeed: number | Vector, speedXOrUndefined?: number, speedYOrUndefined?: number): ActionContext {
    return this._ctx.scaleTo.apply(this._ctx, [sizeXOrVector, sizeYOrSpeed, speedXOrUndefined, speedYOrUndefined])
  }
  public scaleBy(offset: Vector, speed: number): ActionContext;
  public scaleBy(sizeOffsetX: number, sizeOffsetY: number, speed: number): ActionContext;
  public scaleBy(sizeOffsetXOrVector: number | Vector, sizeOffsetYOrSpeed: number, speed?: number): ActionContext {
    return this._ctx.scaleBy.apply(this._ctx, [sizeOffsetXOrVector, sizeOffsetYOrSpeed, speed]);
  }
  public blink(timeVisible: number, timeNotVisible: number, numBlinks?: number): ActionContext {
    return this._ctx.blink(timeVisible, timeNotVisible, numBlinks);
  }
  public fade(opacity: number, time: number): ActionContext {
    return this._ctx.fade(opacity, time);
  }
  public delay(time: number): ActionContext {
    return this._ctx.delay(time);
  }
  public die(): ActionContext {
    return this._ctx.die();
  }
  public callMethod(method: () => any): ActionContext {
    return this._ctx.callMethod(method);
  }
  public repeat(repeatBuilder: (repeatContext: ActionContext) => any, times?: number): ActionContext {
    return this._ctx.repeat(repeatBuilder, times);
  }
  public repeatForever(repeatBuilder: (repeatContext: ActionContext) => any): ActionContext {
    return this._ctx.repeatForever(repeatBuilder);
  }
  public follow(actor: Actor, followDistance?: number): ActionContext {
    return this._ctx.follow(actor, followDistance);
  }
  public meet(actor: Actor, speed?: number): ActionContext {
    return this._ctx.meet(actor, speed);
  }
  public toPromise(): Promise<void> {
    return this._ctx.toPromise();
  }
}