import type { Entity } from './Entity';

/**
 * Component Constructor Types
 */
export declare type ComponentCtor<TComponent extends Component = Component> = new (...args: any[]) => TComponent;

/**
 *
 */
export function isComponentCtor(value: any): value is ComponentCtor<Component> {
  return !!value && !!value.prototype && !!value.prototype.constructor;
}

/**
 * Type guard to check if a component implements clone
 * @param x
 */
function hasClone(x: any): x is { clone(): any } {
  return !!x?.clone;
}

/**
 * Components are containers for state in Excalibur, the are meant to convey capabilities that an Entity possesses
 *
 * Implementations of Component must have a zero-arg constructor to support dependencies
 *
 * ```typescript
 * class MyComponent extends ex.Component {
 *   // zero arg support required if you want to use component dependencies
 *   constructor(public optionalPos?: ex.Vector) {}
 * }
 * ```
 */
export abstract class Component {
  // TODO maybe generate a unique id?

  /**
   * Optionally list any component types this component depends on
   * If the owner entity does not have these components, new components will be added to the entity
   *
   * Only components with zero-arg constructors are supported as automatic component dependencies
   */
  readonly dependencies?: ComponentCtor[];

  /**
   * Current owning {@apilink Entity}, if any, of this component. Null if not added to any {@apilink Entity}
   */
  owner?: Entity = undefined;

  /**
   * Clones any properties on this component, if that property value has a `clone()` method it will be called
   */
  clone(): Component {
    const newComponent = new (this.constructor as any)();
    for (const prop in this) {
      if (this.hasOwnProperty(prop)) {
        const val = this[prop];
        if (hasClone(val) && prop !== 'owner' && prop !== 'clone') {
          newComponent[prop] = val.clone();
        } else {
          newComponent[prop] = val;
        }
      }
    }
    return newComponent;
  }

  /**
   * Optional callback called when a component is added to an entity
   */
  onAdd?(owner: Entity): void;

  /**
   * Optional callback called when a component is removed from an entity
   */
  onRemove?(previousOwner: Entity): void;

  /*
   * Serialization, Deserialization, and toJSONhandled
   */

  toJSON(pretty: boolean = false): string {
    return JSON.stringify(this.serialize(), null, pretty ? 2 : 0);
  }

  serialize(): Record<string, any> {
    const data: Record<string, any> = {
      type: this.constructor.name
    };

    for (const prop in this) {
      if (!this.hasOwnProperty(prop)) {
        continue;
      }

      // Skip owner, private fields, functions, and non-serializable objects
      if (
        prop === 'owner' ||
        prop === 'dependencies' ||
        prop.startsWith('_') ||
        typeof this[prop] === 'function' ||
        !this._isSerializable(this[prop])
      ) {
        continue;
      }

      data[prop] = this._serializeValue(this[prop]);
    }

    return data;
  }

  deserialize(data: Record<string, any>): void {
    for (const key in data) {
      if (key === 'type' || key === 'owner' || key === 'dependencies') {
        continue;
      }

      if (this.hasOwnProperty(key)) {
        (this as any)[key] = this._deserializeValue(data[key], (this as any)[key]);
      }
    }
  }

  protected _serializeValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    // Handle Vector-like objects (any object with x/y numeric properties)
    if (value && typeof value === 'object' && 'x' in value && 'y' in value && typeof value.x === 'number' && typeof value.y === 'number') {
      return { x: value.x, y: value.y };
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((v) => this._serializeValue(v));
    }

    // Handle plain objects
    if (value && typeof value === 'object' && value.constructor === Object) {
      const obj: Record<string, any> = {};
      for (const k in value) {
        if (value.hasOwnProperty(k)) {
          obj[k] = this._serializeValue(value[k]);
        }
      }
      return obj;
    }

    // Primitives (string, number, boolean) and other types
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    // Skip non-serializable objects
    return undefined;
  }

  protected _deserializeValue(data: any, existingValue?: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // If existing value has x/y (Vector-like), update it in place
    if (
      existingValue &&
      typeof existingValue === 'object' &&
      'x' in existingValue &&
      'y' in existingValue &&
      data &&
      typeof data === 'object' &&
      'x' in data &&
      'y' in data
    ) {
      existingValue.x = data.x;
      existingValue.y = data.y;
      return existingValue;
    }

    // Otherwise return the deserialized data as-is
    return data;
  }

  private _isSerializable(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    const type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return true;
    }

    // Check for Observable or other non-serializable objects
    if (type === 'object' && value.subscribe) {
      return false;
    }
    if (type === 'function') {
      return false;
    }

    return true;
  }
}
