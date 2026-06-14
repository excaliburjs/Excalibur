export interface NativeEventable {
  addEventListener(name: string, handler: (...any: any[]) => any): any;
  removeEventListener(name: string, handler: (...any: any[]) => any): any;
}

export class BrowserComponent<T extends NativeEventable> {
  private _paused = false;
  private _handlers = new Map<string, { handler: (evt: any) => void; wrapper: (evt: any) => void }>();

  on(eventName: string, handler: (evt: any) => void): void {
    const existing = this._handlers.get(eventName);
    if (existing) {
      this.nativeComponent.removeEventListener(eventName, existing.wrapper);
    }
    const wrapper = this._decorate(handler);
    this._handlers.set(eventName, { handler, wrapper });
    this.nativeComponent.addEventListener(eventName, wrapper);
  }
  off(eventName: string, handler?: (event: any) => void): void {
    const entry = this._handlers.get(eventName);
    if (!entry) {
      return;
    }
    if (!handler || entry.handler === handler) {
      this.nativeComponent.removeEventListener(eventName, entry.wrapper);
      this._handlers.delete(eventName);
    }
  }

  private _decorate(handler: (evt: any) => void): (evt: any) => void {
    return (evt: any) => {
      if (!this._paused) {
        handler(evt);
      }
    };
  }

  public pause() {
    this._paused = true;
  }

  public resume() {
    this._paused = false;
  }

  public clear() {
    for (const eventName of this._handlers.keys()) {
      this.off(eventName);
    }
  }

  constructor(public nativeComponent: T) {}
}

export class BrowserEvents {
  private _windowComponent: BrowserComponent<Window>;
  private _documentComponent: BrowserComponent<Document>;
  constructor(
    private _windowGlobal: Window,
    private _documentGlobal: Document
  ) {
    this._windowComponent = new BrowserComponent(this._windowGlobal);
    this._documentComponent = new BrowserComponent(this._documentGlobal);
  }

  public get window(): BrowserComponent<Window> {
    return this._windowComponent;
  }

  public get document(): BrowserComponent<Document> {
    return this._documentComponent;
  }

  public pause() {
    this.window.pause();
    this.document.pause();
  }

  public resume() {
    this.window.resume();
    this.document.resume();
  }

  public clear() {
    this.window.clear();
    this.document.clear();
  }
}
