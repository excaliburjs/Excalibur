export interface NativeEventable {
  addEventListener(name: string, handler: (...any: any[]) => any): any;
  removeEventListener(name: string, handler: (...any: any[]) => any): any;
}

export class BrowserComponent<T extends NativeEventable> {
  private _paused = false;
  /**
   * Event name -> (original handler -> decorated wrapper)
   *
   * Supports multiple handlers per event name. Each registered handler is
   * decorated with pause-awareness; the original handler reference is the key
   * so callers can `off(eventName, originalHandler)` by the same reference they
   * passed to `on`.
   */
  private _nativeHandlers: Map<string, Map<(evt: any) => void, (evt: any) => void>> = new Map();

  on(eventName: string, handler: (evt: any) => void): void {
    let perEvent = this._nativeHandlers.get(eventName);
    if (!perEvent) {
      perEvent = new Map();
      this._nativeHandlers.set(eventName, perEvent);
    }
    if (perEvent.has(handler)) {
      return;
    }
    const decorated = this._decorate(handler);
    perEvent.set(handler, decorated);
    this.nativeComponent.addEventListener(eventName, decorated);
  }

  off(eventName: string, handler?: (event: any) => void): void {
    const perEvent = this._nativeHandlers.get(eventName);
    if (!perEvent) {
      return;
    }
    if (!handler) {
      for (const [, decorated] of perEvent) {
        this.nativeComponent.removeEventListener(eventName, decorated);
      }
      this._nativeHandlers.delete(eventName);
      return;
    }
    const decorated = perEvent.get(handler);
    if (decorated) {
      this.nativeComponent.removeEventListener(eventName, decorated);
      perEvent.delete(handler);
      if (perEvent.size === 0) {
        this._nativeHandlers.delete(eventName);
      }
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
    for (const [eventName, perEvent] of this._nativeHandlers) {
      for (const [, decorated] of perEvent) {
        this.nativeComponent.removeEventListener(eventName, decorated);
      }
    }
    this._nativeHandlers.clear();
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
