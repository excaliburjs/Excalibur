// ============================================================================
// ExcaliburJS Serialization System - Centralized Architecture
// ============================================================================

import { Entity } from '../EntityComponentSystem/Entity';
import { Actor } from '../Actor';
import { Component, ComponentCtor } from '../EntityComponentSystem/Component';
import { MotionComponent, TransformComponent } from '../EntityComponentSystem';
import { PointerComponent } from '../Input/PointerComponent';
import { GraphicsComponent } from '../Graphics/GraphicsComponent';
import { ActionsComponent } from '../Actions/ActionsComponent';
import { BodyComponent } from '../Collision/BodyComponent';
import { ColliderComponent } from '../Collision/ColliderComponent';
import { Graphic } from '../Graphics';

// ============================================================================
// Core Serialization Interfaces
// ============================================================================

/**
 * Base interface for all serialized data
 */
export interface SerializedData {
  type: string;
  version?: string;
}

/**
 * Entity serialization format
 */
export interface EntityData extends SerializedData {
  type: 'Entity' | 'Actor';
  name: string;
  tags: string[];
  components: ComponentData[];
  children: EntityData[];
  customInstance?: string;
}

/**
 * Component serialization format
 */
export interface ComponentData extends SerializedData {
  type: string;
  [key: string]: any;
}

// ============================================================================
// Serialization System - Central Manager
// ============================================================================

/**
 * Central serialization system for ExcaliburJS
 * Handles all serialization/deserialization with extensible registry
 */
export class Serializer {
  // ============================================================================
  // Private Members
  // ============================================================================

  // Component type registry
  private static _componentRegistry = new Map<string, ComponentCtor>();
  // Graphics registry for reference-based serialization
  private static _graphicsRegistry = new Map<string, typeof Graphic>();
  // Actor class registry for custom actor types
  private static _actorRegistry = new Map<string, typeof Actor>();
  // Custom serializers for complex types
  private static _customSerializers = new Map<
    string,
    {
      serialize: (obj: any) => any;
      deserialize: (data: any) => any;
    }
  >();
  private static _initialized = false;

  // ============================================================================
  // Initialization
  // ============================================================================

  static init(autoRegisterComponents: boolean = true): void {
    if (Serializer._initialized) {
      console.warn('Serializer already initialized. Call reset() before re-initializing.');
      return;
    }

    Serializer.registerBuiltInSerializers();
    if (autoRegisterComponents) {
      Serializer.registerCommonComponents();
    }
    Serializer._initialized = true;
  }

  // ============================================================================
  // Component Registry
  // ============================================================================

  // #region compRegistry
  static registerComponent<T extends Component>(ctor: ComponentCtor<T>): void {
    if (!Serializer._initialized) {
      console.warn('Serializer not initialized. Call init() before registering components.');
      return;
    }

    const typeName = ctor.name;
    if (Serializer._componentRegistry.has(typeName)) {
      console.warn(`Component ${typeName} is already registered`);
      return;
    }
    Serializer._componentRegistry.set(typeName, ctor);
  }

  private static registerCommonComponents(): void {
    const commonComponents: ComponentCtor[] = [
      TransformComponent,
      MotionComponent,
      GraphicsComponent,
      PointerComponent,
      ActionsComponent,
      BodyComponent,
      ColliderComponent
    ];

    Serializer.registerComponents(commonComponents);
  }

  static registerComponents(ctors: ComponentCtor[]): void {
    if (!Serializer._initialized) {
      console.warn('Serializer not initialized. Call init() before registering components.');
      return;
    }
    for (const ctor of ctors) {
      Serializer.registerComponent(ctor);
    }
  }

  /**
   * Check if a component type is registered
   */
  static isComponentRegistered(typeName: string): boolean {
    return Serializer._componentRegistry.has(typeName);
  }

  /**
   * Get all registered component types
   */
  static getRegisteredComponents(): string[] {
    return Array.from(Serializer._componentRegistry.keys());
  }

  /**
   * Unregister a component type
   */
  static unregisterComponent(typeName: string): boolean {
    if (!Serializer._initialized) {
      console.warn('Serializer not initialized. Call init() before registering components.');
      return false;
    }
    return Serializer._componentRegistry.delete(typeName);
  }

  /**
   * Clear all registered components
   */
  static clearComponents(): void {
    Serializer._componentRegistry.clear();
  }

  // #endregion compRegistry

  // ============================================================================
  // Custom Actor Class Registry
  // ============================================================================

  // #region customActorRegistry

  static registerCustomActor(ctor: typeof Actor): void {
    const typeName = ctor.name;
    if (Serializer._actorRegistry.has(typeName)) {
      console.warn(`Custom Actor ${typeName} is already registered`);
      return;
    }
    Serializer._actorRegistry.set(typeName, ctor);
  }

  static registerCustomActors(ctors: Array<typeof Actor>): void {
    for (const ctor of ctors) {
      Serializer.registerCustomActor(ctor);
    }
  }

  static isCustomActorRegistered(typeName: string): boolean {
    if (Serializer._actorRegistry.has(typeName)) return true;
    return false;
  }

  static getRegisteredCustomActors(): string[] {
    if (Serializer._actorRegistry.size > 0) return Array.from(Serializer._actorRegistry.keys());
    return [];
  }

  static getCustomActor(typeName: string): typeof Actor | null {
    if (Serializer._actorRegistry.has(typeName)) {
      return Serializer._actorRegistry.get(typeName)!;
    }
    return null;
  }

  static unregisterCustomActor(typeName: string): boolean {
    if (Serializer._actorRegistry.has(typeName)) {
      return Serializer._actorRegistry.delete(typeName);
    }
    return false;
  }

  static clearCustomActors(): void {
    Serializer._actorRegistry.clear();
  }

  // #endregion customActorRegistry

  // ============================================================================
  // Graphics Registry
  // ============================================================================

  // #region graphicsRegistry

  static registerGraphic(id: string, graphic: any): void {
    if (Serializer._graphicsRegistry.has(id)) {
      console.warn(`Graphic ${id} is already registered`);
      return;
    }
    Serializer._graphicsRegistry.set(id, graphic);
  }

  static registerGraphics(graphics: Record<string, any>): void {
    for (const [id, graphic] of Object.entries(graphics)) {
      Serializer.registerGraphic(id, graphic);
    }
  }
  static getGraphic(id: string): any | undefined {
    return Serializer._graphicsRegistry.get(id);
  }

  /**
   * Check if a graphic is registered
   */
  static isGraphicRegistered(id: string): boolean {
    return Serializer._graphicsRegistry.has(id);
  }

  /**
   * Get all registered graphic IDs
   */
  static getRegisteredGraphics(): string[] {
    return Array.from(Serializer._graphicsRegistry.keys());
  }

  /**
   * Unregister a graphic
   */
  static unregisterGraphic(id: string): boolean {
    return Serializer._graphicsRegistry.delete(id);
  }

  /**
   * Clear all registered graphics
   */
  static clearGraphics(): void {
    Serializer._graphicsRegistry.clear();
  }

  // #endregion graphicsRegistry

  // ============================================================================
  // Component Serialization
  // ============================================================================

  // #region componentSerialization

  /**
   * Serialize a component
   */
  static serializeComponent(component: Component): ComponentData | null {
    if (!Serializer._initialized) {
      console.warn('Serializer not initialized. Call init() before registering components.');
      return null;
    }
    if (!component.serialize) {
      console.warn(`Component ${component.constructor.name} does not have a serialize method`);
      return null;
    }

    try {
      const data = component.serialize();
      // Ensure type field is set
      return {
        type: component.constructor.name,
        ...data
      };
    } catch (error) {
      console.error(`Error serializing component ${component.constructor.name}:`, error);
      return null;
    }
  }

  /**
   * Deserialize a component
   */
  static deserializeComponent(data: ComponentData): Component | null {
    if (!Serializer._initialized) {
      console.warn('Serializer not initialized. Call init() before registering components.');
      return null;
    }
    if (!data.type) {
      console.error('Component data missing type field');
      return null;
    }

    let attachGraphic = data.type == 'GraphicsComponent';

    const Ctor = Serializer._componentRegistry.get(data.type);
    if (!Ctor) {
      console.warn(`Component type ${data.type} is not registered`);
      return null;
    }

    try {
      const component = new Ctor();
      if (component.deserialize) {
        component.deserialize(data);

        if (attachGraphic) {
          debugger;
          let grph = Serializer.getGraphic((data as any).current).clone();
          if (grph) {
            (component as GraphicsComponent).use(grph);
          }

          if (data.tint) {
            (component as GraphicsComponent).current!.tint = Serializer._customSerializers.get('Color')!.deserialize(data.tint);
          }
        }
      }
      return component;
    } catch (error) {
      console.error(`Error deserializing component ${data.type}:`, error);
      return null;
    }
  }

  // #endregion componentSerialization

  // ============================================================================
  // Entity Serialization
  // ============================================================================

  // #region entitySerialization

  static serializeEntity(entity: Entity): EntityData {
    const components: ComponentData[] = [];

    // Serialize tags
    const tags: string[] = [];
    for (const tag of entity.tags) {
      tags.push(tag);
    }

    for (const component of entity.getComponents()) {
      const componentData = Serializer.serializeComponent(component);
      if (componentData) {
        components.push(componentData);
      }
    }

    const children: EntityData[] = [];
    for (const child of entity.children) {
      children.push(Serializer.serializeEntity(child));
    }

    return {
      type: 'Entity',
      name: entity.name,
      tags,
      components,
      children
    };
  }

  static deserializeEntity(data: EntityData): Entity | null {
    try {
      const entity = new Entity();
      entity.name = data.name;

      // Deserialize components
      for (const componentData of data.components) {
        const component = Serializer.deserializeComponent(componentData);
        if (component) {
          entity.addComponent(component);
        }
      }

      // Recursively deserialize children
      for (const childData of data.children) {
        const child = Serializer.deserializeEntity(childData);
        if (child) {
          entity.addChild(child);
        }
      }

      return entity;
    } catch (error) {
      console.error('Error deserializing entity:', error);
      return null;
    }
  }

  // #endregion entitySerialization

  // ============================================================================
  // Actor Serialization
  // ============================================================================

  // #region actorSerialization

  static serializeActor(actor: Actor): EntityData {
    const components: ComponentData[] = [];

    // is actor custom actor

    let customInstance: string | undefined = undefined;

    for (const [key, ctor] of Serializer._actorRegistry.entries()) {
      if (actor instanceof ctor) {
        customInstance = key;
        break;
      }
    }

    // Serialize tags
    const tags: string[] = [];
    for (const tag of actor.tags) {
      tags.push(tag);
    }

    for (const component of actor.getComponents()) {
      const componentData = Serializer.serializeComponent(component);
      if (componentData) {
        components.push(componentData);
      }
    }

    const children: EntityData[] = [];
    for (const child of actor.children) {
      children.push(Serializer.serializeEntity(child));
    }

    return {
      type: 'Actor',
      name: actor.name,
      tags,
      components,
      children,
      customInstance
    };
  }
  static deserializeActor(data: EntityData): Actor | null {
    try {
      let entity: Actor;

      if (data.customInstance) {
        const ctor = Serializer._actorRegistry.get(data.customInstance);
        if (ctor) {
          entity = new ctor() as Actor;
        }
      } else {
        entity = new Actor();
      }
      entity.name = data.name;

      //remove all existing components
      // debugger;
      for (const component of entity.getComponents()) {
        entity.removeComponent(component, true);
      }

      // debugger;

      // Deserialize components
      for (const componentData of data.components) {
        const component = Serializer.deserializeComponent(componentData);
        if (component) {
          entity.addComponent(component);
        }
      }

      // Setup actor references and getters/setters
      if (entity.get(TransformComponent)) {
        entity.transform = entity.get(TransformComponent)!;
      }
      if (entity.get(PointerComponent)) {
        entity.pointer = entity.get(PointerComponent)!;
      }
      if (entity.get(GraphicsComponent)) {
        entity.graphics = entity.get(GraphicsComponent)!;
      }
      if (entity.get(MotionComponent)) {
        entity.motion = entity.get(MotionComponent)!;
      }
      if (entity.get(ActionsComponent)) {
        entity.actions = entity.get(ActionsComponent)!;
      }
      if (entity.get(BodyComponent)) {
        entity.body = entity.get(BodyComponent)!;
      }
      if (entity.get(ColliderComponent)) {
        entity.collider = entity.get(ColliderComponent);
      }

      // Recursively deserialize children
      for (const childData of data.children) {
        const child = Serializer.deserializeEntity(childData);
        if (child) {
          entity.addChild(child);
        }
      }

      return entity;
    } catch (error) {
      console.error('Error deserializing entity:', error);
      return null;
    }
  }

  // #endregion actorSerialization

  // ============================================================================
  // JSON Conversion
  // ============================================================================

  // #region JSONConversion

  /**
   * Serialize entity to JSON string
   */
  static entityToJSON(entity: Entity, pretty: boolean = false): string {
    const data = Serializer.serializeEntity(entity);
    return JSON.stringify(data, null, pretty ? 2 : 0);
  }

  /**
   * Deserialize entity from JSON string
   */
  static entityFromJSON(json: string): Entity | null {
    try {
      const data = JSON.parse(json);
      return Serializer.deserializeEntity(data);
    } catch (error) {
      console.error('Error parsing entity JSON:', error);
      return null;
    }
  }

  static actorToJSON(actor: Actor, pretty: boolean = false): string {
    const data = Serializer.serializeActor(actor);
    return JSON.stringify(data, null, pretty ? 2 : 0);
  }

  static actorFromJSON(json: string): Actor | null {
    try {
      const data = JSON.parse(json);
      return Serializer.deserializeActor(data);
    } catch (error) {
      console.error('Error parsing actor JSON:', error);
      return null;
    }
  }

  // #endregion JSONConversion

  // ============================================================================
  // Validation
  // ============================================================================

  // #region validation

  /**
   * Validate entity data structure
   */
  static validateEntityData(data: any): data is EntityData {
    if (!data || typeof data !== 'object') return false;
    if (data.type !== 'Entity') return false;
    if (typeof data.name !== 'string') return false;
    if (!Array.isArray(data.components)) return false;
    if (!Array.isArray(data.children)) return false;

    // Validate components
    for (const comp of data.components) {
      if (!comp.type || typeof comp.type !== 'string') return false;
    }

    // Recursively validate children
    for (const child of data.children) {
      if (!Serializer.validateEntityData(child)) return false;
    }

    return true;
  }

  // #endregion validation

  // ============================================================================
  // Utilities
  // ============================================================================

  // #region Utilities

  /**
   * Reset all registrations (useful for testing)
   */

  static reset(): void {
    Serializer._componentRegistry.clear();
    Serializer._customSerializers.clear();
    Serializer._graphicsRegistry.clear();
    Serializer._actorRegistry.clear();
    Serializer._initialized = false;
  }

  // ============================================================================
  // Custom Type Serializers
  // ============================================================================

  private static registerBuiltInSerializers(): void {
    // Vector serializer
    Serializer.registerCustomSerializer(
      'Vector',
      (vec) => ({ x: vec.x, y: vec.y }),
      (data) => ({ x: data.x, y: data.y })
    );

    // Color serializer
    Serializer.registerCustomSerializer(
      'Color',
      (color) => ({ r: color.r, g: color.g, b: color.b, a: color.a }),
      (data) => ({ r: data.r, g: data.g, b: data.b, a: data.a })
    );

    // BoundingBox serializer
    Serializer.registerCustomSerializer(
      'BoundingBox',
      (bb) => ({ left: bb.left, top: bb.top, right: bb.right, bottom: bb.bottom }),
      (data) => ({ left: data.left, top: data.top, right: data.right, bottom: data.bottom })
    );
  }

  /**
   * Register a custom serializer for a specific type
   * Useful for types like Vector, Color, BoundingBox, etc.
   */
  static registerCustomSerializer(typeName: string, serialize: (obj: any) => any, deserialize: (data: any) => any): void {
    if (!Serializer._initialized) {
      console.warn('Serializer not initialized. Call init() before registering components.');
      return;
    }
    Serializer._customSerializers.set(typeName, { serialize, deserialize });
  }

  // #endregion Utilities
}
