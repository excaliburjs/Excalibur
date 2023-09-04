import { Loadable } from '../Interfaces/Loadable';
import { Logger } from '../Util/Log';
import { EventEmitter } from '../EventEmitter';

export type ResourceEvents = {
  complete: any,
  load: ProgressEvent<XMLHttpRequestEventTarget>,
  loadstart: ProgressEvent<XMLHttpRequestEventTarget>,
  progress: ProgressEvent<XMLHttpRequestEventTarget>,
  error: ProgressEvent<XMLHttpRequestEventTarget>
}

export const ResourceEvents = {
  Complete: 'complete',
  Load: 'load',
  LoadStart: 'loadstart',
  Progress: 'progress',
  Error: 'error'
};

export type ResponseTypes = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';

export interface ResourceOptions {
  /**
   * Path to the remote resource
   */
  path: string,
  /**
   * The type to expect as a response: "" | "arraybuffer" | "blob" | "document" | "json" | "text";
   */
  responseType: ResponseTypes,
  /**
   * Optionally bust browser cache, by default set to false
   */
  bustCache?: boolean
}

/**
 * The [[Resource]] type allows games built in Excalibur to load generic resources.
 * For any type of remote resource it is recommended to use [[Resource]] for preloading.
 */
export class Resource<T> implements Loadable<T> {
  public data: T = null;
  public logger: Logger = Logger.getInstance();
  public events = new EventEmitter();

  public readonly path: string;
  public readonly responseType: ResponseTypes;
  public bustCache: boolean = false;

  // TODO fallback ctor

  constructor(options: ResourceOptions) {
    const { path, responseType, bustCache } = options;
    this.path = path;
    this.responseType = responseType;
    this.bustCache = bustCache ?? this.bustCache;
  }

  /**
   * Returns true if the Resource is completely loaded and is ready
   * to be drawn.
   */
  public isLoaded(): boolean {
    return this.data !== null;
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
  /**
   * Begin loading the resource and returns a promise to be resolved on completion
   */
  public load(): Promise<T> {
    return new Promise((resolve, reject) => {
      // Exit early if we already have data
      if (this.data !== null) {
        this.logger.debug('Already have data for resource', this.path);
        this.events.emit('complete', this.data as any);
        resolve(this.data);
        return;
      }

      const request = new XMLHttpRequest();
      request.open('GET', this.bustCache ? this._cacheBust(this.path) : this.path, true);
      request.responseType = this.responseType;
      request.addEventListener('loadstart', (e) => this.events.emit('loadstart', e as any));
      request.addEventListener('progress', (e) => this.events.emit('progress', e as any));
      request.addEventListener('error', (e) => this.events.emit('error', e as any));
      request.addEventListener('load', (e) => this.events.emit('load', e as any));
      request.addEventListener('load', () => {
        // XHR on file:// success status is 0, such as with PhantomJS
        if (request.status !== 0 && request.status !== 200) {
          this.logger.error('Failed to load resource ', this.path, ' server responded with error code', request.status);
          this.events.emit('error', request.response);
          reject(new Error(request.statusText));
          return;
        }

        this.data = request.response;
        this.events.emit('complete', this.data as any);
        this.logger.debug('Completed loading resource', this.path);
        resolve(this.data);
      });
      request.send();
    });
  }
}
