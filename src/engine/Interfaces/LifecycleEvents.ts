import { Engine } from './../Engine';
import * as Events from './../Events';
import { Scene } from '../Scene';

export interface ICanInitialize {
  /**
   * Overridable implementation
   */
  onInitialize(_engine: Engine): void;

  /**
   * Event signatures
   */
  on(eventName: Events.initialize, handler: (event?: Events.InitializeEvent) => void): void;
  once(eventName: Events.initialize, handler: (event?: Events.InitializeEvent) => void): void;
  off(eventName: Events.initialize, handler?: (event?: Events.InitializeEvent) => void): void;
}

export interface ICanActivate {
  /**
   * Overridable implementation
   */
  onActivate(oldScene: Scene, newScene: Scene): void;

  /**
   * Event signatures
   */
  on(eventName: Events.activate, handler: (event?: Events.ActivateEvent) => void): void;
  once(eventName: Events.activate, handler: (event?: Events.ActivateEvent) => void): void;
  off(eventName: Events.activate, handler?: (event?: Events.ActivateEvent) => void): void;
}

export interface ICanDeactivate {
  /**
   * Overridable implementation
   */
  onDeactivate(oldScene: Scene, newScene: Scene): void;

  /**
   * Event signature
   */
  on(eventName: Events.deactivate, handler: (event?: Events.DeactivateEvent) => void): void;
  once(eventName: Events.deactivate, handler: (event?: Events.DeactivateEvent) => void): void;
  off(eventName: Events.deactivate, handler?: (event?: Events.DeactivateEvent) => void): void;
}

export interface ICanUpdate {
  /**
   * Overridable implementation
   */
  onPreUpdate(_engine: Engine, _delta: number): void;

  /**
   * Event signature
   */
  on(eventName: Events.preupdate, handler: (event?: Events.PreUpdateEvent) => void): void;
  once(eventName: Events.preupdate, handler: (event?: Events.PreUpdateEvent) => void): void;
  off(eventName: Events.preupdate, handler?: (event?: Events.PreUpdateEvent) => void): void;

  /**
   * Overridable implementation
   */
  onPostUpdate(_engine: Engine, _delta: number): void;

  /**
   * Event signatures
   */
  on(eventName: Events.postupdate, handler: (event?: Events.PostUpdateEvent) => void): void;
  once(eventName: Events.postupdate, handler: (event?: Events.PostUpdateEvent) => void): void;
  off(eventName: Events.postupdate, handler?: (event?: Events.PostUpdateEvent) => void): void;
}

export interface ICanDraw {
  /**
   * Overridable implementation
   */
  onPreDraw(_ctx: CanvasRenderingContext2D, _delta: number): void;

  /**
   * Event signatures
   */
  on(eventName: Events.predraw, handler: (event?: Events.PreDrawEvent) => void): void;
  once(eventName: Events.predraw, handler: (event?: Events.PreDrawEvent) => void): void;
  off(eventName: Events.predraw, handler?: (event?: Events.PreDrawEvent) => void): void;

  /**
   * Overridable implementation
   */
  onPostDraw(_ctx: CanvasRenderingContext2D, _delta: number): void;

  /**
   * Event signatures
   */
  on(eventName: Events.postdraw, handler: (event?: Events.PostDrawEvent) => void): void;
  once(eventName: Events.postdraw, handler: (event?: Events.PostDrawEvent) => void): void;
  off(eventName: Events.postdraw, handler?: (event?: Events.PostDrawEvent) => void): void;
}

export interface ICanBeKilled {
  /**
   * Overridable implementation
   */
  onPreKill(_scene: Scene): void;

  /**
   * Event signatures
   */
  on(eventName: Events.prekill, handler: (event?: Events.PreKillEvent) => void): void;
  once(eventName: Events.prekill, handler: (event?: Events.PreKillEvent) => void): void;
  off(eventName: Events.prekill, handler: (event?: Events.PreKillEvent) => void): void;

  /**
   * Overridable implementation
   */
  onPostKill(_scene: Scene): void;

  /**
   * Event signatures
   */
  on(eventName: Events.postkill, handler: (event?: Events.PostKillEvent) => void): void;
  once(eventName: Events.postkill, handler: (event?: Events.PostKillEvent) => void): void;
  off(eventName: Events.postkill, handler: (event?: Events.PostKillEvent) => void): void;
}
