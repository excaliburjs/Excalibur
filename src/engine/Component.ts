import { Entity } from './Entity';

export interface Component<T extends string = string> {
  readonly type: T;

  /**
   * Current owning [[Entity]], if any, of this component. Null if not added to any [[Entity]]
   */
  owner?: Entity;
}
