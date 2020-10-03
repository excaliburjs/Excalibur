export class Flags {
  private static _frozen = false;
  public static freeze() {
    Flags._frozen = true;
  }
  private static _flags: Record<string, boolean> = {};

  public static enable(flagName: string): void {
    if (this._frozen) {
      throw Error('Feature flags can only be enabled before Engine constructor time');
    }
    Flags._flags[flagName] = true;
  }

  public static disable(flagName: string): void {
    if (this._frozen) {
      throw Error('Feature flags can only be disabled before Engine constructor time');
    }
    Flags._flags[flagName] = false;
  }

  public static isEnabled(flagName: string): boolean {
    return !!Flags._flags[flagName];
  }

  public static show(): string[] {
    return Object.keys(Flags._flags);
  }
}
