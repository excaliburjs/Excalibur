export interface NativeEventable {
  addEventListener(name: string, handler: (...any: any[]) => any): any;
  removeEventListener(name: string, handler: (...any: any[]) => any): any;
}

export class BrowserComponent<T extends NativeEventable> {
  private _paused = false;
  private _nativeHandlers: { [key: string]: (handler: any) => void } = {};

  on(eventName: string, handler: (evt: any) => void): void {
    if (this._nativeHandlers[eventName]) {
      this.off(eventName, this._nativeHandlers[eventName]);
    }
    this._nativeHandlers[eventName] = this._decorate(handler);
    this.nativeComponet.addEventListener(eventName, this._nativeHandlers[eventName]);
  }
  off(eventName: string, handler?: (event: any) => void): void {
    if (!handler) {
      handler = this._nativeHandlers[eventName];
    }
    this.nativeComponet.removeEventListener(eventName, handler);
    this._nativeHandlers[eventName] = null;
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
    for (const event in this._nativeHandlers) {
      this.off(event);
    }
  }

  constructor(public nativeComponet: T) {}
}

export class BrowserEvents {
  private _windowComponent: BrowserComponent<Window>;
  private _documentComponent: BrowserComponent<Document>;
  constructor(private _windowGlobal: Window, private _documentGlobal: Document) {
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
