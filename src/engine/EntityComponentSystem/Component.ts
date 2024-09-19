import { Entity } from './Entity';

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
}
