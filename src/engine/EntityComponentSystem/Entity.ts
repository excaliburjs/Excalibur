import { Component, ComponentCtor, TagComponent } from './Component';

import { Observable, Message } from '../Util/Observable';
import { Class } from '../Class';
import { OnInitialize, OnPreUpdate, OnPostUpdate } from '../Interfaces/LifecycleEvents';
import { Engine } from '../Engine';
import { InitializeEvent, PreUpdateEvent, PostUpdateEvent } from '../Events';
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

export type ComponentMap = { [type: string]: Component };

// Given a TypeName string (Component.type), find the ComponentType that goes with that type name
export type MapTypeNameToComponent<TypeName extends string, ComponentType extends Component> =
  // If the ComponentType is a Component with type = TypeName then that's the type we are looking for
  ComponentType extends Component<TypeName> ? ComponentType : never;

// Given a type union of PossibleComponentTypes, create a dictionary that maps that type name string to those individual types
export type ComponentMapper<PossibleComponentTypes extends Component> = {
  [TypeName in PossibleComponentTypes['type']]: MapTypeNameToComponent<TypeName, PossibleComponentTypes>;
} &
ComponentMap;

export type ExcludeType<TypeUnion, TypeNameOrType> = TypeNameOrType extends string
  ? Exclude<TypeUnion, Component<TypeNameOrType>>
  : Exclude<TypeUnion, TypeNameOrType>;

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
export class Entity<KnownComponents extends Component = never> extends Class implements OnInitialize, OnPreUpdate, OnPostUpdate {
  private static _ID = 0;

  /**
   * The unique identifier for the entity
   */
  public id: number = Entity._ID++;

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
  public get tags(): string[] {
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
   * The types of the components on the Entity
   */
  public get types(): string[] {
    return this._typesMemo;
  }

  private _tagsMemo: string[] = [];
  private _typesMemo: string[] = [];
  private _rebuildMemos() {
    this._tagsMemo = Object.values(this.components)
      .filter((c) => c instanceof TagComponent)
      .map((c) => c.type);
    this._typesMemo = Object.keys(this.components);
  }

  /**
   * Bucket to hold on to deferred removals
   */
  private _componentsToRemove: (Component | string)[] = [];

  /**
   * Proxy handler for component changes, responsible for notifying observers
   */
  private _handleChanges = {
    defineProperty: (obj: any, prop: any, descriptor: PropertyDescriptor) => {
      obj[prop] = descriptor.value;
      this._rebuildMemos();
      const added = new AddedComponent({
        component: descriptor.value as Component,
        entity: this
      });
      this.changes.notifyAll(added);
      this.componentAdded$.notifyAll(added)
      return true;
    },
    deleteProperty: (obj: any, prop: any) => {
      if (prop in obj) {
        const removed = new RemovedComponent({
          component: obj[prop] as Component,
          entity: this
        });
        this.changes.notifyAll(removed);
        this.componentRemoved$.notifyAll(removed);
        delete obj[prop];
        this._rebuildMemos();
        return true;
      }
      return false;
    }
  };

  /**
   * Dictionary that holds entity components
   */
  public components = new Proxy<ComponentMapper<KnownComponents>>({} as any, this._handleChanges);
  private _componentMap = new Map<ComponentCtor, Component>();

  /**
   * Observable that keeps track of component add or remove changes on the entity
   */
  public changes = new Observable<AddedComponent | RemovedComponent>();
  public componentAdded$ = new Observable<AddedComponent>();
  public componentRemoved$ = new Observable<RemovedComponent>();

  private _parent: Entity = null;
  public get parent(): Entity {
    return this._parent
  }

  public childrenAdded$ = new Observable<Entity>();
  public childrenRemoved$ = new Observable<Entity>();

  private _children: Entity[] = [];
  public get children(): readonly Entity[] {
    return this._children;
  }

  public unparent() {
    this._parent = null;
  }

  // TODO Cycle detection?
  public add(entity: Entity): Entity {
    if (entity.parent === null) {
      this._children.push(entity);
      entity._parent = this;
      this.childrenAdded$.notifyAll(entity);
    } else {
      // TODO should throw error
    }
    return this;
  }

  public remove(entity: Entity): Entity {
    if (entity.parent === this) {
      Util.removeItemFromArray(entity, this._children)
      entity._parent = null;
      this.childrenRemoved$.notifyAll(entity);
    } else {
      // TODO should throw error
    }
    return this;
  }

  public removeAll(): Entity {
    this.children.forEach(c => {
      this.remove(c);
    });
    return this;
  }

  public getAncestors(): Entity[] {
    const result: Entity[] = [this];
    let current = this.parent
    while (current) {
      result.push(current);
      current = current.parent;
    }
    return result.reverse();
  }

  /**
   * Creates a deep copy of the entity and a copy of all its components
   */
  public clone(): Entity {
    const newEntity = new Entity();
    for (const c of this.types) {
      newEntity.addComponent(this.components[c].clone());
    }
    return newEntity;
  }

  /**
   * Adds a component to the entity, or adds a copy of all the components from another entity as a "prefab"
   * @param componentOrEntity Component or Entity to add copy of components from
   * @param force Optionally overwrite any existing components of the same type
   */
  public addComponent<T extends Component>(componentOrEntity: T | Entity<T>, force: boolean = false): Entity<KnownComponents | T> {
    // If you use an entity as a "prefab" or template
    if (componentOrEntity instanceof Entity) {
      for (const c in componentOrEntity.components) {
        this.addComponent(componentOrEntity.components[c].clone(), force);
      }
      // Normal component case
    } else {
      // if component already exists, skip if not forced
      if (this.components[componentOrEntity.type] && !force) {
        return this as Entity<KnownComponents | T>;
      }

      // Remove existing component type if exists when forced
      if (this.components[componentOrEntity.type] && force) {
        this.removeComponent(componentOrEntity);
      }

      // todo circular dependencies will be a problem
      if (componentOrEntity.dependencies && componentOrEntity.dependencies.length) {
        for (const ctor of componentOrEntity.dependencies) {
          this.addComponent(new ctor());
        }
      }

      componentOrEntity.owner = this;
      (this.components as ComponentMap)[componentOrEntity.type] = componentOrEntity;
      const type = componentOrEntity.constructor as ComponentCtor<T>;
      this._componentMap.set(type, componentOrEntity);
      if (componentOrEntity.onAdd) {
        componentOrEntity.onAdd(this);
      }
    }
    return this as Entity<KnownComponents | T>;
  }

  /**
   * Removes a component from the entity, by default removals are deferred to the end of entity processing to avoid consistency issues
   *
   * Components can be force removed with the `force` flag, the removal is not deferred and happens immediately
   * @param componentOrType
   * @param force
   */
  public removeComponent<ComponentOrType extends string | Component>(
    componentOrType: ComponentOrType,
    force = false
  ): Entity<ExcludeType<KnownComponents, ComponentOrType>> {
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
    if (this.components[type]) {
      this.components[type].owner = null;
      if (this.components[type].onRemove) {
        this.components[type].onRemove(this);
      }
      const ctor = this.components[type].constructor as ComponentCtor;
      this._componentMap.delete(ctor);
      delete this.components[type];
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
  public has<T extends Component>(type: ComponentCtor<T>): boolean {
    // return !!this.components[type];
    return this._componentMap.has(type);
  }

  /**
   * Get a component by type with typecheck
   * @param type 
   */
  // public get<ComponentType extends Component<string>>(type: ComponentStringType<ComponentType>): ComponentType | null {
  //   return (this.components[type] as unknown) as ComponentType;
  // }

  public get<T extends Component>(type: ComponentCtor<T>): T {
    return this._componentMap.get(type) as T;
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
   * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
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
   * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
   * @internal
   */
  public _preupdate(engine: Engine, delta: number): void {
    this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
    this.onPreUpdate(engine, delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
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
}
