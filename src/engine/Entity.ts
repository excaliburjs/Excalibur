import { Class } from './Class';
import { Component } from './Component';

export type NullableComponent = Component | null | undefined;
export type ComponentMap = { [type: string]: NullableComponent };
export type ComponentMapProp<T extends Component['type'], U extends { type: Component['type'] }> = U extends { type: T } ? U : never;

export class Entity<T extends Component = Component> extends Class {
  private static _ID = 0;

  /**
   * The unique identifier for the entity
   */
  public id: number = Entity._ID++;

  constructor(components: T[] = []) {
    super();
    components.forEach((c) => this.addComponent(c));
  }

  public readonly components: { [t in T['type']]: ComponentMapProp<t, T> } & ComponentMap = {} as any;

  public addComponent(component: Component): Entity<T> {
    component.owner = this;
    (this.components as ComponentMap)[component.type] = component;
    return this;
  }

  public removeComponent(name: string): Entity<T> {
    delete this.components[name];
    return this;
  }

  public hasComponent(name: string): boolean {
    return !!this.components[name];
  }
}
