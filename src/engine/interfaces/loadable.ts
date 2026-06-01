/**
 * An interface describing loadable resources in Excalibur. Built-in loadable
 * resources include {@link ImageSource}, {@link Sound}, and a generic {@link Resource}.
 */
export interface Loadable<T> {
  /**
   * Data associated with a loadable
   */
  data: T;

  /**
   * Begins loading the resource and returns a promise to be resolved on completion
   */
  load(): Promise<T>;

  /**
   * Returns true if the loadable is loaded
   */
  isLoaded(): boolean;
}
