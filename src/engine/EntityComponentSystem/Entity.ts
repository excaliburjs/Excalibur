import { Component, ComponentCtor, TagComponent } from './Component';

import { Observable, Message } from '../Util/Observable';
import { Class } from '../Class';
import { OnInitialize, OnPreUpdate, OnPostUpdate } from '../Interfaces/LifecycleEvents';
import { Engine } from '../Engine';
import { InitializeEvent, PreUpdateEvent, PostUpdateEvent } from '../Events';
import { EventDispatcher } from '../EventDispatcher';
import { Util } from '..';

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
  constructor(public data: EntityComponent) {}
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
  constructor(public data: EntityComponent) {}
}

/**
 * Type guard to know if message is for a Removed Component
 */
export function isRemovedComponent(x: Message<EntityComponent>): x is RemovedComponent {
  return !!x && x.type === 'Component Removed';
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
export class Entity extends Class implements OnInitialize, OnPreUpdate, OnPostUpdate {
  private static _ID = 0;

  constructor(components?: Component[], name?: string) {
    super();
    this._setName(name);
    if (components) {
      for (const component of components) {
        this.addComponent(component);
      }
    }
  }

  /**
   * The unique identifier for the entity
   */
  public id: number = Entity._ID++;

  private _name: string = 'anonymous';
  protected _setName(name: string) {
    if (name) {
      this._name = name;
    }
  }
  public get name(): string {
    return this._name;
  }

  public get events(): EventDispatcher {
    return this.eventDispatcher;
  }

  /**
   * Whether this entity is active, if set to false it will be reclaimed
   */
  public active: boolean = true;

  /**
   * Kill the entity, means it will no longer be updated. Kills are deferred to the end of the update.
   */
  public kill() {
    this.active = false;
  }

  public isKilled() {
    return !this.active;
  }

  /**
   * Specifically get the tags on the entity from [[TagComponent]]
   */
  public get tags(): readonly string[] {
    return this._tagsMemo;
  }

  /**
   * Check if a tag exists on the entity
   * @param tag name to check for
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Adds a tag to an entity
   * @param tag
   * @returns Entity
   */
  public addTag(tag: string) {
    return this.addComponent(new TagComponent(tag));
  }

  /**
   * Removes a tag on the entity
   *
   * Removals are deferred until the end of update
   * @param tag
   * @param force Remove component immediately, no deferred
   */
  public removeTag(tag: string, force = false) {
    return this.removeComponent(tag, force);
  }

  /**
   * The types of the components on the Entity
   */
  public get types(): string[] {
    return this._typesMemo;
  }

  /**
   * Bucket to hold on to deferred removals
   */
  private _componentsToRemove: (Component | string)[] = [];
  private _componentTypeToInstance = new Map<ComponentCtor, Component>();
  private _componentStringToInstance = new Map<string, Component>();

  private _tagsMemo: string[] = [];
  private _typesMemo: string[] = [];
  private _rebuildMemos() {
    this._tagsMemo = Array.from(this._componentStringToInstance.values())
      .filter((c) => c instanceof TagComponent)
      .map((c) => c.type);
    this._typesMemo = Array.from(this._componentStringToInstance.keys());
  }

  public getComponents(): Component[] {
    return Array.from(this._componentStringToInstance.values());
  }

  /**
   * Observable that keeps track of component add or remove changes on the entity
   */
  public componentAdded$ = new Observable<AddedComponent>();
  private _notifyAddComponent(component: Component) {
    this._rebuildMemos();
    const added = new AddedComponent({
      component,
      entity: this
    });
    this.componentAdded$.notifyAll(added);
  }

  public componentRemoved$ = new Observable<RemovedComponent>();
  private _notifyRemoveComponent(component: Component) {
    const removed = new RemovedComponent({
      component,
      entity: this
    });
    this.componentRemoved$.notifyAll(removed);
    this._rebuildMemos();
  }

  private _parent: Entity = null;
  public get parent(): Entity {
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
      Util.removeItemFromArray(entity, this._children);
      entity._parent = null;
      this.childrenRemoved$.notifyAll(entity);
    }
    return this;
  }

  /**
   * Removes all children from this entity
   */
  public removeAllChildren(): Entity {
    this.children.forEach((c) => {
      this.removeChild(c);
    });
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
      queue = queue.concat(curr.children);
      result = result.concat(curr.children);
    }
    return result;
  }

  /**
   * Creates a deep copy of the entity and a copy of all its components
   */
  public clone(): Entity {
    const newEntity = new Entity();
    for (const c of this.types) {
      newEntity.addComponent(this.get(c).clone());
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
  public addComponent<T extends Component>(component: T, force: boolean = false): Entity {
    // if component already exists, skip if not forced
    if (this.has(component.type)) {
      if (force) {
        // Remove existing component type if exists when forced
        this.removeComponent(component);
      } else {
        // early exit component exits
        return this;
      }
    }

    // TODO circular dependencies will be a problem
    if (component.dependencies && component.dependencies.length) {
      for (const ctor of component.dependencies) {
        this.addComponent(new ctor());
      }
    }

    component.owner = this;
    const constuctorType = component.constructor as ComponentCtor<T>;
    this._componentTypeToInstance.set(constuctorType, component);
    this._componentStringToInstance.set(component.type, component);
    if (component.onAdd) {
      component.onAdd(this);
    }
    this._notifyAddComponent(component);

    return this;
  }

  /**
   * Removes a component from the entity, by default removals are deferred to the end of entity update to avoid consistency issues
   *
   * Components can be force removed with the `force` flag, the removal is not deferred and happens immediately
   * @param componentOrType
   * @param force
   */
  public removeComponent<ComponentOrType extends string | Component>(componentOrType: ComponentOrType, force = false): Entity {
    if (force) {
      if (typeof componentOrType === 'string') {
        this._removeComponentByType(componentOrType);
      } else if (componentOrType instanceof Component) {
        this._removeComponentByType(componentOrType.type);
      }
    } else {
      this._componentsToRemove.push(componentOrType);
    }

    return this as any;
  }

  private _removeComponentByType(type: string) {
    if (this.has(type)) {
      const component = this.get(type);
      component.owner = null;
      if (component.onRemove) {
        component.onRemove(this);
      }
      const ctor = component.constructor as ComponentCtor;
      this._componentTypeToInstance.delete(ctor);
      this._componentStringToInstance.delete(component.type);
      this._notifyRemoveComponent(component);
    }
  }

  /**
   * @hidden
   * @internal
   */
  public processComponentRemoval() {
    for (const componentOrType of this._componentsToRemove) {
      const type = typeof componentOrType === 'string' ? componentOrType : componentOrType.type;
      this._removeComponentByType(type);
    }
    this._componentsToRemove.length = 0;
  }

  /**
   * Check if a component type exists
   * @param type
   */
  public has<T extends Component>(type: ComponentCtor<T>): boolean;
  public has(type: string): boolean;
  public has<T extends Component>(type: ComponentCtor<T> | string): boolean {
    if (typeof type === 'string') {
      return this._componentStringToInstance.has(type);
    } else {
      return this._componentTypeToInstance.has(type);
    }
  }

  /**
   * Get a component by type with typecheck
   *
   * (Does not work on tag components, use .hasTag("mytag") instead)
   * @param type
   */
  public get<T extends Component>(type: ComponentCtor<T>): T | null;
  public get<T extends Component>(type: string): T | null;
  public get<T extends Component>(type: ComponentCtor<T> | string): T | null {
    if (typeof type === 'string') {
      return this._componentStringToInstance.get(type) as T;
    } else {
      return this._componentTypeToInstance.get(type) as T;
    }
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
   *
   * @internal
   */
  public _initialize(engine: Engine) {
    if (!this.isInitialized) {
      this.onInitialize(engine);
      super.emit('initialize', new InitializeEvent(engine, this));
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
    this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
    this.onPreUpdate(engine, delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
   * @internal
   */
  public _postupdate(engine: Engine, delta: number): void {
    this.emit('postupdate', new PostUpdateEvent(engine, delta, this));
    this.onPostUpdate(engine, delta);
  }

  /**
   * `onInitialize` is called before the first update of the entity. This method is meant to be
   * overridden.
   *
   * Synonymous with the event handler `.on('initialize', (evt) => {...})`
   */
  public onInitialize(_engine: Engine): void {
    // Override me
  }

  /**
   * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPreUpdate` is called directly before an entity is updated.
   */
  public onPreUpdate(_engine: Engine, _delta: number): void {
    // Override me
  }

  /**
   * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
   *
   * `onPostUpdate` is called directly after an entity is updated.
   */
  public onPostUpdate(_engine: Engine, _delta: number): void {
    // Override me
  }

  /**
   *
   * Entity update lifecycle, called internally
   *
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
}
