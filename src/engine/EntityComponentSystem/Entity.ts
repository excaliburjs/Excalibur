import { Component } from './Component';

import { Observable, Message } from '../Util/Observable';
import { Class } from '../Class';
import { OnInitialize, OnPreUpdate, OnPostUpdate } from '../Interfaces/LifecycleEvents';
import { Engine } from '../Engine';
import { InitializeEvent, PreUpdateEvent, PostUpdateEvent } from '../Events';

export interface EntityComponent {
  component: Component;
  entity: Entity;
}
export class AddedComponent implements Message<EntityComponent> {
  readonly type: 'Component Added' = 'Component Added';
  constructor(public data: EntityComponent) {}
}

export function isAddedComponent(x: Message<EntityComponent>): x is AddedComponent {
  return !!x && x.type === 'Component Added';
}

export class RemovedComponent implements Message<EntityComponent> {
  readonly type: 'Component Removed' = 'Component Removed';
  constructor(public data: EntityComponent) {}
}

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

  public kill() {
    this.active = false;
  }

  public isKilled() {
    return !this.active;
  }

  private _componentsToRemove: (Component | string)[] = [];

  /**
   * The types of the components on the Entity
   */
  public get types(): string[] {
    return this._dirty ? (this._typesMemo = Object.keys(this.components)) : this._typesMemo;
  }
  private _typesMemo: string[] = [];
  private _dirty = true;

  private _handleChanges = {
    defineProperty: (obj: any, prop: any, descriptor: PropertyDescriptor) => {
      obj[prop] = descriptor.value;
      this.changes.notifyAll(
        new AddedComponent({
          component: descriptor.value as Component,
          entity: this
        })
      );
      return true;
    },
    deleteProperty: (obj: any, prop: any) => {
      if (prop in obj) {
        this.changes.notifyAll(
          new RemovedComponent({
            component: obj[prop] as Component,
            entity: this
          })
        );
        delete obj[prop];
        return true;
      }
      return false;
    }
  };

  public components = new Proxy<ComponentMapper<KnownComponents>>({} as any, this._handleChanges);

  public changes = new Observable<AddedComponent | RemovedComponent>();

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

  public addComponent<T extends Component>(componentOrEntity: T | Entity<T>, force: boolean = false): Entity<KnownComponents | T> {
    // If you use an entity as a "prefab" or template
    if (componentOrEntity instanceof Entity) {
      for (const c in componentOrEntity.components) {
        this.addComponent(componentOrEntity.components[c].clone());
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
          this._dirty = true;
        }
      }

      componentOrEntity.owner = this;
      (this.components as ComponentMap)[componentOrEntity.type] = componentOrEntity;
      if (componentOrEntity.onAdd) {
        this._dirty = true;
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
      delete this.components[type];
      this._dirty = true;
    }
  }

  /**
   * @hidden
   * @internal
   */
  public processRemoval() {
    for (const componentOrType of this._componentsToRemove) {
      const type = typeof componentOrType === 'string' ? componentOrType : componentOrType.type;
      this._removeComponentByType(type);
    }
    this._componentsToRemove.length = 0;
  }

  public has(type: string): boolean {
    return !!this.components[type];
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
