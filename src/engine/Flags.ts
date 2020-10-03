/**
 * Flags is a feature flag implementation for Excalibur. They can only be operated **before [[Engine]] construction**
 * after which they are frozen and are read-only.
 *
 * Flags are used to enable experimental or preview features in Excalibur.
 */
export class Flags {
  private static _frozen = false;
  private static _flags: Record<string, boolean> = {};

  /**
   * Freeze all flag modifications making them readonly
   */
  public static freeze() {
    Flags._frozen = true;
  }

  /**
   * Resets internal flag state, not meant to be called by users. Only used for testing.
   *
   * Calling this in your game is UNSUPPORTED
   * @internal
   */
  public static _reset() {
    Flags._frozen = false;
    Flags._flags = {};
  }

  /**
   * Enable a specific feature flag by name. **Note: can only be set before [[Engine]] constructor time**
   * @param flagName
   */
  public static enable(flagName: string): void {
    if (this._frozen) {
      throw Error('Feature flags can only be enabled before Engine constructor time');
    }
    Flags._flags[flagName] = true;
  }

  /**
   * Disable a specific feature flag by name. **Note: can only be set before [[Engine]] constructor time**
   * @param flagName
   */
  public static disable(flagName: string): void {
    if (this._frozen) {
      throw Error('Feature flags can only be disabled before Engine constructor time');
    }
    Flags._flags[flagName] = false;
  }

  /**
   * Check if a flag is enabled. If the flag is disabled or does not exist `false` is returned
   * @param flagName
   */
  public static isEnabled(flagName: string): boolean {
    return !!Flags._flags[flagName];
  }

  /**
   * Show a list of currently known flags
   */
  public static show(): string[] {
    return Object.keys(Flags._flags);
  }
}
