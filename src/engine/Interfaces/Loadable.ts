import { Promise } from '../Promises';
import { Engine } from '../Engine';

/**
 * An interface describing loadable resources in Excalibur. Built-in loadable
 * resources include [[Texture]], [[Sound]], and a generic [[Resource]].
 */
export interface Loadable {
  /**
   * Begins loading the resource and returns a promise to be resolved on completion
   */
  load(): Promise<any>;

  /**
   * Gets the data that was loaded
   */
  getData(): any;

  /**
   * Sets the data (can be populated from remote request or in-memory data)
   */
  setData(data: any): void;

  /**
   * Processes the downloaded data. Meant to be overridden.
   */
  processData(data: any): any;

  /**
   * Wires engine into loadable to receive game level events
   */
  wireEngine(engine: Engine): void;

  /**
   * onprogress handler
   */
  onprogress: (e: any) => void;
  /**
   * oncomplete handler
   */
  oncomplete: () => void;
  /**
   * onerror handler
   */
  onerror: (e: any) => void;

  /**
   * Returns true if the loadable is loaded
   */
  isLoaded(): boolean;
}
