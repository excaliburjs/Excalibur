import { Loadable } from '../Interfaces/Loadable';
import { Class } from '../Class';
import { Engine } from '../Engine';
import { Promise } from '../Promises';
import { Logger } from '../Util/Log';

/**
 * The [[Resource]] type allows games built in Excalibur to load generic resources.
 * For any type of remote resource it is recommended to use [[Resource]] for preloading.
 */
export class Resource<T> extends Class implements Loadable {
  public data: T = null;
  public logger: Logger = Logger.getInstance();
  public arrayBuffer: ArrayBuffer = null;

  /**
   * @param path          Path to the remote resource
   * @param responseType  The type to expect as a response: "" | "arraybuffer" | "blob" | "document" | "json" | "text";
   * @param bustCache     Whether or not to cache-bust requests
   */
  constructor(
    public path: string,
    public responseType: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text',
    public bustCache: boolean = true
  ) {
    super();
  }

  /**
   * Returns true if the Resource is completely loaded and is ready
   * to be drawn.
   */
  public isLoaded(): boolean {
    return this.data !== null;
  }

  public wireEngine(_engine: Engine) {
    // override me
  }

  private _cacheBust(uri: string): string {
    const query: RegExp = /\?\w*=\w*/;
    if (query.test(uri)) {
      uri += '&__=' + Date.now();
    } else {
      uri += '?__=' + Date.now();
    }
    return uri;
  }

  private _start() {
    this.logger.debug('Started loading resource ' + this.path);
  }

  /**
   * Begin loading the resource and returns a promise to be resolved on completion
   */
  public load(): Promise<T> {
    const complete = new Promise<T>();

    // Exit early if we already have data
    if (this.data !== null) {
      this.logger.debug('Already have data for resource', this.path);
      complete.resolve(this.data);
      this.oncomplete();
      return complete;
    }

    const request = new XMLHttpRequest();
    request.open('GET', this.bustCache ? this._cacheBust(this.path) : this.path, true);
    request.responseType = this.responseType;
    request.onloadstart = () => {
      this._start();
    };
    request.onprogress = this.onprogress;
    request.onerror = this.onerror;
    request.onload = () => {
      // XHR on file:// success status is 0, such as with PhantomJS
      if (request.status !== 0 && request.status !== 200) {
        this.logger.error('Failed to load resource ', this.path, ' server responded with error code', request.status);
        this.onerror(request.response);
        complete.resolve(request.response);
        return;
      }

      this.data = this.processData(request.response);

      this.oncomplete();
      this.logger.debug('Completed loading resource', this.path);
      complete.resolve(this.data);
    };
    request.send();
    return complete;
  }

  /**
   * Returns the loaded data once the resource is loaded
   */
  public getData(): any {
    return this.data;
  }

  public getArrayData(): any {
    return this.arrayBuffer;
  }

  /**
   * Sets the data for this resource directly
   */
  public setData(data: any) {
    this.data = this.processData(data);
  }

  /**
   * This method is meant to be overridden to handle any additional
   * processing. Such as decoding downloaded audio bits.
   */
  public processData(data: T): any {
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
    // Blob requires an object url
    if (this.responseType === 'blob') {
      return URL.createObjectURL(data);
    }
    return data;
  }

  public onprogress: (e: any) => void = () => {
    return;
  };

  public oncomplete: () => void = () => {
    return;
  };

  public onerror: (e: any) => void = () => {
    return;
  };
}
