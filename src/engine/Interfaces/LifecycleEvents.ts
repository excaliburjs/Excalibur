import { Engine } from './../Engine';
import * as Events from './../Events';
import { Scene } from '../Scene';
import { ExcaliburGraphicsContext } from '../Graphics';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface _initialize {
  _initialize(engine: Engine): void;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface _add {
  onAdd(scene: Scene): void;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface _remove {
  onRemove(engine: Engine): void;
}

/**
 * Type guard checking for internal initialize method
 * @internal
 * @param a
 */
export function has_initialize(a: any): a is _initialize {
  return !!a._initialize;
}

/**
 *
 */
export function has_add(a: any): a is _add {
  return !!a.onAdd;
}

/**
 *
 */
export function has_remove(a: any): a is _remove {
  return !!a.onRemove;
}

export interface OnInitialize {
  onInitialize(engine: Engine): void;
}

/**
 *
 */
export function hasOnInitialize(a: any): a is OnInitialize {
  return !!a.onInitialize;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface _preupdate {
  _preupdate(engine: Engine, elapsedMs: number): void;
}

/**
 *
 */
export function has_preupdate(a: any): a is _preupdate {
  return !!a._preupdate;
}

export interface OnPreUpdate {
  onPreUpdate(engine: Engine, elapsedMs: number): void;
}

/**
 *
 */
export function hasOnPreUpdate(a: any): a is OnPreUpdate {
  return !!a.onPreUpdate;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface _postupdate {
  _postupdate(engine: Engine, elapsedMs: number): void;
}

/**
 *
 */
export function has_postupdate(a: any): a is _postupdate {
  return !!a.onPostUpdate;
}

export interface OnPostUpdate {
  onPostUpdate(engine: Engine, elapsedMs: number): void;
}

/**
 *
 */
export function hasOnPostUpdate(a: any): a is OnPostUpdate {
  return !!a.onPostUpdate;
}

export interface CanInitialize {
  /**
   * Overridable implementation
   */
  onInitialize(engine: Engine): void;

  /**
   * Event signatures
   */
  on(eventName: Events.initialize, handler: (event: Events.InitializeEvent<any>) => void): void;
  once(eventName: Events.initialize, handler: (event: Events.InitializeEvent<any>) => void): void;
  off(eventName: Events.initialize, handler?: (event: Events.InitializeEvent<any>) => void): void;
}

export interface OnAdd {
  onAdd(engine: Engine): void;
}

/**
 *
 */
export function hasOnAdd(a: any): a is OnAdd {
  return !!a.onAdd;
}

export interface CanAdd {
  onAdd(engine: Engine): void;

  on(eventName: Events.add, handler: (event: Events.AddEvent<any>) => void): void;
  once(eventName: Events.add, handler: (event: Events.AddEvent<any>) => void): void;
  off(eventName: Events.add, handler?: (event: Events.AddEvent<any>) => void): void;
}

export interface OnRemove {
  onRemove(engine: Engine): void;
}

/**
 *
 */
export function hasOnRemove(a: any): a is OnRemove {
  return !!a.onRemove;
}

export interface CanRemove {
  onRemove(engine: Engine): void;

  on(eventName: Events.remove, handler: (event: Events.RemoveEvent<any>) => void): void;
  once(eventName: Events.remove, handler: (event: Events.RemoveEvent<any>) => void): void;
  off(eventName: Events.remove, handler?: (event: Events.RemoveEvent<any>) => void): void;
}

export interface SceneActivationContext<TData = undefined> {
  data?: TData;
  previousScene: Scene;
  nextScene: Scene;
  engine: Engine;
}

export interface CanActivate<TData = undefined> {
  /**
   * Overridable implementation
   */
  onActivate(context: SceneActivationContext<TData>): void;

  /**
   * Event signatures
   */
  on(eventName: Events.activate, handler: (event: Events.ActivateEvent) => void): void;
  once(eventName: Events.activate, handler: (event: Events.ActivateEvent) => void): void;
  off(eventName: Events.activate, handler?: (event: Events.ActivateEvent) => void): void;
}

export interface CanDeactivate {
  /**
   * Overridable implementation
   */
  onDeactivate(context: SceneActivationContext<never>): void;

  /**
   * Event signature
   */
  on(eventName: Events.deactivate, handler: (event: Events.DeactivateEvent) => void): void;
  once(eventName: Events.deactivate, handler: (event: Events.DeactivateEvent) => void): void;
  off(eventName: Events.deactivate, handler?: (event: Events.DeactivateEvent) => void): void;
}

export interface CanUpdate {
  /**
   * Overridable implementation
   */
  onPreUpdate(engine: Engine, elapsedMs: number): void;

  /**
   * Event signature
   */
  on(eventName: Events.preupdate, handler: (event: Events.PreUpdateEvent<any>) => void): void;
  once(eventName: Events.preupdate, handler: (event: Events.PreUpdateEvent<any>) => void): void;
  off(eventName: Events.preupdate, handler?: (event: Events.PreUpdateEvent<any>) => void): void;

  /**
   * Overridable implementation
   */
  onPostUpdate(engine: Engine, elapsedMs: number): void;

  /**
   * Event signatures
   */
  on(eventName: Events.postupdate, handler: (event: Events.PostUpdateEvent<any>) => void): void;
  once(eventName: Events.postupdate, handler: (event: Events.PostUpdateEvent<any>) => void): void;
  off(eventName: Events.postupdate, handler?: (event: Events.PostUpdateEvent<any>) => void): void;
}

export interface OnPreDraw {
  /**
   * Overridable implementation
   */
  onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void;

  /**
   * Event signatures
   */
  on(eventName: Events.predraw, handler: (event: Events.PreDrawEvent) => void): void;
  once(eventName: Events.predraw, handler: (event: Events.PreDrawEvent) => void): void;
  off(eventName: Events.predraw, handler?: (event: Events.PreDrawEvent) => void): void;
}

export interface OnPostDraw {
  /**
   * Overridable implementation
   */
  onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void;

  /**
   * Event signatures
   */
  on(eventName: Events.postdraw, handler: (event: Events.PostDrawEvent) => void): void;
  once(eventName: Events.postdraw, handler: (event: Events.PostDrawEvent) => void): void;
  off(eventName: Events.postdraw, handler?: (event: Events.PostDrawEvent) => void): void;
}

export interface CanDraw extends OnPreDraw, OnPostDraw {
  on(eventName: Events.predraw, handler: (event: Events.PreDrawEvent) => void): void;
  on(eventName: Events.postdraw, handler: (event: Events.PostDrawEvent) => void): void;

  once(eventName: Events.predraw, handler: (event: Events.PreDrawEvent) => void): void;
  once(eventName: Events.postdraw, handler: (event: Events.PostDrawEvent) => void): void;

  off(eventName: Events.predraw, handler?: (event: Events.PreDrawEvent) => void): void;
  off(eventName: Events.postdraw, handler?: (event: Events.PostDrawEvent) => void): void;
}

/**
 *
 */
export function hasPreDraw(a: any): a is OnPreDraw {
  return !!a.onPreDraw;
}

/**
 *
 */
export function hasPostDraw(a: any): a is OnPostDraw {
  return !!a.onPostDraw;
}

export interface CanBeKilled {
  /**
   * Overridable implementation
   */
  onPreKill(_scene: Scene): void;

  /**
   * Event signatures
   */
  on(eventName: Events.prekill, handler: (event: Events.PreKillEvent) => void): void;
  once(eventName: Events.prekill, handler: (event: Events.PreKillEvent) => void): void;
  off(eventName: Events.prekill, handler: (event: Events.PreKillEvent) => void): void;

  /**
   * Overridable implementation
   */
  onPostKill(_scene: Scene): void;

  /**
   * Event signatures
   */
  on(eventName: Events.postkill, handler: (event: Events.PostKillEvent) => void): void;
  once(eventName: Events.postkill, handler: (event: Events.PostKillEvent) => void): void;
  off(eventName: Events.postkill, handler: (event: Events.PostKillEvent) => void): void;
}
