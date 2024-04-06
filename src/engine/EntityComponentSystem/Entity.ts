import { Component, ComponentCtor, isComponentCtor } from './Component';

import { Observable, Message } from '../Util/Observable';
import { OnInitialize, OnPreUpdate, OnPostUpdate } from '../Interfaces/LifecycleEvents';
import { Engine } from '../Engine';
import { InitializeEvent, PreUpdateEvent, PostUpdateEvent } from '../Events';
import { KillEvent } from '../Events';
import { EventEmitter, EventKey, Handler, Subscription } from '../EventEmitter';
import { Scene } from '../Scene';
import { removeItemFromArray } from '../Util/Util';
import { MaybeKnownComponent } from './Types';

/**
 * Interface holding an entity component pair
 */
export interface EntityComponent {
  component: Component;
  entity: Entity;
}

/**
 * AddedComponent message
 */
export class AddedComponent implements Message<EntityComponent> {
  readonly type: 'Component Added' = 'Component Added';
  constructor(public data: EntityComponent) { }
}

/**
 * Type guard to know if message is f an Added Component
 */
export function isAddedComponent(x: Message<EntityComponent>): x is AddedComponent {
  return !!x && x.type === 'Component Added';
}

/**
 * RemovedComponent message
 */
export class RemovedComponent implements Message<EntityComponent> {
  readonly type: 'Component Removed' = 'Component Removed';
  constructor(public data: EntityComponent) { }
}

/**
 * Type guard to know if message is for a Removed Component
 */
export function isRemovedComponent(x: Message<EntityComponent>): x is RemovedComponent {
  return !!x && x.type === 'Component Removed';
}

/**
 * Built in events supported by all entities
 */
export type EntityEvents = {
  'initialize': InitializeEvent;
  'preupdate': PreUpdateEvent;
  'postupdate': PostUpdateEvent;
  'kill': KillEvent
};

export const EntityEvents = {
  Initialize: 'initialize',
  PreUpdate: 'preupdate',
  PostUpdate: 'postupdate',
  Kill: 'kill'
} as const;

export interface EntityOptions<TComponents extends Component> {
  name?: string;
  components: TComponents[];
}

/**
 * An Entity is the base type of anything that can have behavior in Excalibur, they are part of the built in entity component system
 *
 * Entities can be strongly typed with the components they contain
 *
 * ```typescript
 * const entity = new Entity<ComponentA | ComponentB>();
 * entity.components.a; // Type ComponentA
 * entity.components.b; // Type ComponentB
 * ```
 */
export class Entity<TKnownComponents extends Component = any> implements OnInitialize, OnPreUpdate, OnPostUpdate {
  private static _ID = 0;
  /**
   * The unique identifier for the entity
   */
  public id: number = Entity._ID++;

  public name = `Entity#${this.id}`;

  /**
   * Listen to or emit events for an entity
   */
  public events = new EventEmitter<EntityEvents>();
  private _tags = new Set<string>();
  public componentAdded$ = new Observable<Component>;
  public componentRemoved$ = new Observable<Component>;
  public tagAdded$ = new Observable<string>;
  public tagRemoved$ = new Observable<string>;
  /**
   * Current components on the entity
   *
   * **Do not modify**
   *
   * Use addComponent/removeComponent otherwise the ECS will not be notified of changes.
   */
  public readonly components = new Map<Function, Component>();
  private _componentsToRemove: ComponentCtor[] = [];

  private _instanceOfComponentCacheDirty = true;
  private _instanceOfComponentCache = new Map<Function, Component>();

  constructor(options: EntityOptions<TKnownComponents>);
  constructor(components?: TKnownComponents[], name?: string);
  constructor(componentsOrOptions?: TKnownComponents[] | EntityOptions<TKnownComponents>, name?: string) {
    let componentsToAdd!: TKnownComponents[];
    let nameToAdd: string | undefined;
    if (Array.isArray(componentsOrOptions)) {
      componentsToAdd = componentsOrOptions;
      nameToAdd = name;
    } else if (componentsOrOptions && typeof componentsOrOptions === 'object') {
      const { components, name } = componentsOrOptions;
      componentsToAdd = components;
      nameToAdd = name;
    }
    if (nameToAdd) {
      this.name = nameToAdd;
    }
    if (componentsToAdd) {
      for (const component of componentsToAdd) {
        this.addComponent(component);
      }
    }
    // this.addComponent(this.tagsComponent);
  }

  /**
   * The current scene that the entity is in, if any
   */
  public scene: Scene | null = null;

  /**
   * Whether this entity is active, if set to false it will be reclaimed
   */
  public active: boolean = true;

  /**
   * Kill the entity, means it will no longer be updated. Kills are deferred to the end of the update.
   * If parented it will be removed from the parent when killed.
   */
  public kill() {
    if (this.active) {
      this.active = false;
      this.unparent();
    }
    this.emit('kill', new KillEvent(this));
  }

  public isKilled() {
    return !this.active;
  }

  /**
   * Specifically get the tags on the entity from [[TagsComponent]]
   */
  public get tags(): Set<string> {
    return this._tags;
  }

  /**
   * Check if a tag exists on the entity
   * @param tag name to check for
   */
  public hasTag(tag: string): boolean {
    return this._tags.has(tag);
  }

  /**
   * Adds a tag to an entity
   * @param tag
   */
  public addTag(tag: string): Entity<TKnownComponents> {
    this._tags.add(tag);
    this.tagAdded$.notifyAll(tag);
    return this;
  }

  /**
   * Removes a tag on the entity
   *
   * Removals are deferred until the end of update
   * @param tag
   */
  public removeTag(tag: string): Entity<TKnownComponents> {
    this._tags.delete(tag);
    this.tagRemoved$.notifyAll(tag);
    return this;
  }

  /**
   * The types of the components on the Entity
   */
  public get types(): ComponentCtor[] {
    return Array.from(this.components.keys()) as ComponentCtor[];
  }

  /**
   * Returns all component instances on entity
   */
  public getComponents(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Verifies that an entity has all the required types
   * @param requiredTypes
   */
  hasAll<TComponent extends Component>(requiredTypes: ComponentCtor<TComponent>[]): boolean {
    for (let i = 0; i < requiredTypes.length; i++) {
      if (!this.components.has(requiredTypes[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Verifies that an entity has all the required tags
   * @param requiredTags
   */
  hasAllTags(requiredTags: string[]): boolean {
    for (let i = 0; i < requiredTags.length; i++) {
      if (!this.tags.has(requiredTags[i])) {
        return false;
      }
    }
    return true;
  }

  private _getCachedInstanceOfType<TComponent extends Component>(
    type: ComponentCtor<TComponent>): MaybeKnownComponent<TComponent, TKnownComponents> | undefined {
    if (this._instanceOfComponentCacheDirty) {
      this._instanceOfComponentCacheDirty = false;
      this._instanceOfComponentCache.clear();
    }

    if (this._instanceOfComponentCache.has(type)) {
      return this._instanceOfComponentCache.get(type) as MaybeKnownComponent<TComponent, TKnownComponents>;
    }

    for (const instance of this.components.values()) {
      if (instance instanceof type) {
        this._instanceOfComponentCache.set(type, instance);
        return instance as MaybeKnownComponent<TComponent, TKnownComponents>;
      }
    }
    return undefined;
  }

  get<TComponent extends Component>(type: ComponentCtor<TComponent>): MaybeKnownComponent<TComponent, TKnownComponents> {
    const maybeComponent = this._getCachedInstanceOfType(type);
    return maybeComponent ?? this.components.get(type) as MaybeKnownComponent<TComponent, TKnownComponents>;
  }

  private _parent: Entity | null = null;
  public get parent(): Entity | null {
    return this._parent;
  }

  public childrenAdded$ = new Observable<Entity>();
  public childrenRemoved$ = new Observable<Entity>();

  private _children: Entity[] = [];
  /**
   * Get the direct children of this entity
   */
  public get children(): readonly Entity[] {
    return this._children;
  }

  /**
   * Unparents this entity, if there is a parent. Otherwise it does nothing.
   */
  public unparent() {
    if (this._parent) {
      this._parent.removeChild(this);
      this._parent = null;
    }
  }

  /**
   * Adds an entity to be a child of this entity
   * @param entity
   */
  public addChild(entity: Entity): Entity {
    if (entity.parent === null) {
      if (this.getAncestors().includes(entity)) {
        throw new Error('Cycle detected, cannot add entity');
      }
      this._children.push(entity);
      entity._parent = this;
      this.childrenAdded$.notifyAll(entity);
    } else {
      throw new Error('Entity already has a parent, cannot add without unparenting');
    }
    return this;
  }

  /**
   * Remove an entity from children if it exists
   * @param entity
   */
  public removeChild(entity: Entity): Entity {
    if (entity.parent === this) {
      removeItemFromArray(entity, this._children);
      entity._parent = null;
      this.childrenRemoved$.notifyAll(entity);
    }
    return this;
  }

  /**
   * Removes all children from this entity
   */
  public removeAllChildren(): Entity {
    // Avoid modifying the array issue by walking backwards
    for (let i = this.children.length - 1; i >= 0; i--) {
      this.removeChild(this.children[i]);
    }
    return this;
  }

  /**
   * Returns a list of parent entities starting with the topmost parent. Includes the current entity.
   */
  public getAncestors(): Entity[] {
    const result: Entity[] = [this];
    let current = this.parent;
    while (current) {
      result.push(current);
      current = current.parent;
    }
    return result.reverse();
  }

  /**
   * Returns a list of all the entities that descend from this entity. Includes the current entity.
   */
  public getDescendants(): Entity[] {
    let result: Entity[] = [this];
    let queue: Entity[] = [this];
    while (queue.length > 0) {
      const curr = queue.pop();
      if (curr) {
        queue = queue.concat(curr.children);
        result = result.concat(curr.children);
      }
    }
    return result;
  }

  /**
   * Creates a deep copy of the entity and a copy of all its components
   */
  public clone(): Entity {
    const newEntity = new Entity();
    for (const c of this.types) {
      const componentInstance = this.get(c);
      if (componentInstance) {
        newEntity.addComponent(componentInstance.clone());
      }
    }
    for (const child of this.children) {
      newEntity.addChild(child.clone());
    }
    return newEntity;
  }

  /**
   * Adds a copy of all the components from another template entity as a "prefab"
   * @param templateEntity Entity to use as a template
   * @param force Force component replacement if it already exists on the target entity
   */
  public addTemplate(templateEntity: Entity, force: boolean = false): Entity {
    for (const c of templateEntity.getComponents()) {
      this.addComponent(c.clone(), force);
    }
    for (const child of templateEntity.children) {
      this.addChild(child.clone().addTemplate(child));
    }
    return this;
  }

  /**
   * Adds a component to the entity
   * @param component Component or Entity to add copy of components from
   * @param force Optionally overwrite any existing components of the same type
   */
  public addComponent<TComponent extends Component>(component: TComponent, force: boolean = false): Entity<TKnownComponents | TComponent> {
    this._instanceOfComponentCacheDirty = true;
    // if component already exists, skip if not forced
    if (this.has(component.constructor as ComponentCtor)) {
      if (force) {
        // Remove existing component type if exists when forced
        this.removeComponent(component.constructor as ComponentCtor, true);
      } else {
        // early exit component exits
        return this as Entity<TKnownComponents | TComponent>;
      }
    }

    // TODO circular dependencies will be a problem
    if (component.dependencies && component.dependencies.length) {
      for (const ctor of component.dependencies) {
        this.addComponent(new ctor());
      }
    }

    component.owner = this;
    this.components.set(component.constructor, component);
    if (component.onAdd) {
      component.onAdd(this);
    }

    this.componentAdded$.notifyAll(component);
    return this as Entity<TKnownComponents | TComponent>;
  }

  /**
   * Removes a component from the entity, by default removals are deferred to the end of entity update to avoid consistency issues
   *
   * Components can be force removed with the `force` flag, the removal is not deferred and happens immediately
   * @param typeOrInstance
   * @param force
   */
  public removeComponent<TComponent extends Component>(
    typeOrInstance: ComponentCtor<TComponent> | TComponent, force = false): Entity<Exclude<TKnownComponents, TComponent>> {

    let type: ComponentCtor<TComponent>;
    if (isComponentCtor(typeOrInstance)) {
      type = typeOrInstance;
    } else {
      type = typeOrInstance.constructor as ComponentCtor<TComponent>;
    }

    if (force) {
      const componentToRemove = this.components.get(type);
      if (componentToRemove) {
        this.componentRemoved$.notifyAll(componentToRemove);
        componentToRemove.owner = undefined;
        if (componentToRemove.onRemove) {
          componentToRemove.onRemove(this);
        }
      }
      this.components.delete(type); // remove after the notify to preserve typing
      this._instanceOfComponentCacheDirty = true;
    } else {
      this._componentsToRemove.push(type);
    }

    return this as any;
  }

  public clearComponents() {
    const components = this.types;
    for (const c of components) {
      this.removeComponent(c);
    }
  }

  /**
   * @hidden
   * @internal
   */
  public processComponentRemoval() {
    for (const type of this._componentsToRemove) {
      this.removeComponent(type, true);
    }
    this._componentsToRemove.length = 0;
  }

  /**
   * Check if a component type exists
   * @param type
   */
  public has<TComponent extends Component>(type: ComponentCtor<TComponent>): boolean {
    return this.components.has(type);
  }

  private _isInitialized = false;

  /**
   * Gets whether the actor is Initialized
   */
  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Initializes this entity, meant to be called by the Scene before first update not by users of Excalibur.
   *
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   * @internal
   */
  public _initialize(engine: Engine) {
    if (!this.isInitialized) {
      this.onInitialize(engine);
      this.events.emit('initialize', new InitializeEvent(engine, this));
      this._isInitialized = true;
    }
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
   * @internal
   */
  public _preupdate(engine: Engine, delta: number): void {
    this.events.emit('preupdate', new PreUpdateEvent(engine, delta, this));
    this.onPreUpdate(engine, delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
   * @internal
   */
  public _postupdate(engine: Engine, delta: number): void {
    this.events.emit('postupdate', new PostUpdateEvent(engine, delta, this));
    this.onPostUpdate(engine, delta);
  }

  /**
   * `onInitialize` is called before the first update of the entity. This method is meant to be
   * overridden.
   *
   * Synonymous with the event handler `.on('initialize', (evt) => {...})`
   */
  public onInitialize(engine: Engine): void {
    // Override me
  }

  /**
   * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPreUpdate` is called directly before an entity is updated.
   */
  public onPreUpdate(engine: Engine, delta: number): void {
    // Override me
  }

  /**
   * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
   *
   * `onPostUpdate` is called directly after an entity is updated.
   */
  public onPostUpdate(engine: Engine, delta: number): void {
    // Override me
  }

  /**
   *
   * Entity update lifecycle, called internally
   * @internal
   * @param engine
   * @param delta
   */
  public update(engine: Engine, delta: number): void {
    this._initialize(engine);
    this._preupdate(engine, delta);
    for (const child of this.children) {
      child.update(engine, delta);
    }
    this._postupdate(engine, delta);
  }

  public emit<TEventName extends EventKey<EntityEvents>>(eventName: TEventName, event: EntityEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<EntityEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<EntityEvents>>(eventName: TEventName, handler: Handler<EntityEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<EntityEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<EntityEvents>>(eventName: TEventName, handler: Handler<EntityEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<EntityEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<EntityEvents>>(eventName: TEventName, handler: Handler<EntityEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<EntityEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    if (handler) {
      this.events.off(eventName, handler);
    } else {
      this.events.off(eventName);
    }
  }
}
