import { Entity } from './Entity';

/**
 * Component Contructor Types
 */
export declare type ComponentCtor<T extends Component = Component> = new (...args:any[]) => T;

/**
 * Type guard to check if a component implements clone
 * @param x
 */
function hasClone(x: any): x is { clone(): any } {
  return !!x?.clone;
}

export type ComponentType<ComponentToParse> = ComponentToParse extends Component<infer TypeName> ? TypeName : never;

/**
 * Plucks the string type out of a component type
 */
export type ComponentStringType<T> = T extends Component<infer R> ? R : string;

/**
 * Components are containers for state in Excalibur, the are meant to convey capabilities that an Entity possesses
 *
 * Implementations of Component must have a zero-arg constructor to support dependencies
 *
 * ```typescript
 * class MyComponent extends ex.Component<'my'> {
 *   public readonly type = 'my';
 *   // zero arg support required if you want to use component dependencies
 *   constructor(public optionalPos?: ex.Vector) {}
 * }
 * ```
 */
export abstract class Component<TypeName extends string = string> {
  /**
   * Optionally list any component types this component depends on
   * If the owner entity does not have these components, new components will be added to the entity
   *
   * Only components with zero-arg constructors are supported as automatic component dependencies
   */
  readonly dependencies?: ComponentCtor[];

  // todo implement optional
  readonly optional?: ComponentCtor[];

  /**
   * Type of this component, must be a unique type among component types in you game.
   */
  abstract readonly type: TypeName;

  /**
   * Current owning [[Entity]], if any, of this component. Null if not added to any [[Entity]]
   */
  owner?: Entity = null;

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
   * Optional callback called when a component is added to an entity
   */
  onRemove?(previousOwner: Entity): void;
}

/**
 * Tag components are a way of tagging a component with label and a simple value
 *
 * For example:
 *
 * ```typescript
 * const isOffscreen = new TagComponent('offscreen');
 * entity.addComponent(isOffscreen);
 * entity.tags.includes
 * ```
 */
export class TagComponent<TypeName extends string, MaybeValueType extends string | symbol | number | boolean = never> extends Component<
TypeName
> {
  constructor(public readonly type: TypeName, public readonly value?: MaybeValueType) {
    super();
  }
}
