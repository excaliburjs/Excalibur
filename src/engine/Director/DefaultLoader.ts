import { WebAudio } from '../Util/WebAudio';
import type { Engine } from '../Engine';
import type { Loadable } from '../Interfaces/Loadable';
import { Canvas } from '../Graphics/Canvas';
import { ImageFiltering } from '../Graphics/Filtering';
import { clamp } from '../Math/util';
import { Sound } from '../Resources/Sound/Sound';
import { Future } from '../Util/Future';
import type { EventKey, Handler, Subscription } from '../EventEmitter';
import { EventEmitter } from '../EventEmitter';
import { Color } from '../Color';
import { delay } from '../Util/Util';

export interface DefaultLoaderOptions {
  /**
   * List of loadables
   */
  loadables?: Loadable<any>[];
}

export type LoaderEvents = {
  // Add event types here
  beforeload: void;
  afterload: void;
  useraction: void;
  loadresourcestart: Loadable<any>;
  loadresourceend: Loadable<any>;
};

export const LoaderEvents = {
  // Add event types here
  BeforeLoad: 'beforeload',
  AfterLoad: 'afterload',
  UserAction: 'useraction',
  LoadResourceStart: 'loadresourcestart',
  LoadResourceEnd: 'loadresourceend'
};

export type LoaderConstructor = new (...args: any[]) => DefaultLoader;
/**
 * Returns true if the constructor is for an Excalibur Loader
 */
export function isLoaderConstructor(x: any): x is LoaderConstructor {
  return !!x?.prototype && !!x?.prototype?.constructor?.name;
}

export class DefaultLoader implements Loadable<Loadable<any>[]> {
  public data!: Loadable<any>[];
  public events = new EventEmitter<LoaderEvents>();
  public canvas: Canvas = new Canvas({
    filtering: ImageFiltering.Blended,
    smoothing: true,
    cache: false,
    draw: this.onDraw.bind(this)
  });
  private _resources: Loadable<any>[] = [];
  public get resources(): readonly Loadable<any>[] {
    return this._resources;
  }
  private _numLoaded: number = 0;
  public engine!: Engine;

  /**
   * @param options Optionally provide the list of resources you want to load at constructor time
   */
  constructor(options?: DefaultLoaderOptions) {
    if (options && options.loadables?.length) {
      this.addResources(options.loadables);
    }
  }

  /**
   * Called by the engine before loading
   * @param engine
   */
  public onInitialize(engine: Engine) {
    this.engine = engine;
    this.canvas.width = this.engine.screen.resolution.width;
    this.canvas.height = this.engine.screen.resolution.height;
  }

  /**
   * Return a promise that resolves when the user interacts with the loading screen in some way, usually a click.
   *
   * It's important to implement this in order to unlock the audio context in the browser. Browsers automatically prevent
   * audio from playing until the user performs an action.
   *
   */
  public async onUserAction(): Promise<void> {
    return await Promise.resolve();
  }

  /**
   * Overridable lifecycle method, called directly before loading starts
   */
  public async onBeforeLoad() {
    // override me
  }

  /**
   * Overridable lifecycle method, called after loading has completed
   */
  public async onAfterLoad() {
    // override me
    await delay(500, this.engine.clock); // avoid a flicker
  }

  /**
   * Add a resource to the loader to load
   * @param loadable  Resource to add
   */
  public addResource(loadable: Loadable<any>) {
    this._resources.push(loadable);
    this._loaded = false;
  }

  /**
   * Add a list of resources to the loader to load
   * @param loadables  The list of resources to load
   */
  public addResources(loadables: Loadable<any>[]) {
    let i = 0;
    const len = loadables.length;

    for (i; i < len; i++) {
      this.addResource(loadables[i]);
    }
    this._loaded = false;
  }

  public markResourceComplete(): void {
    this._numLoaded++;
  }

  /**
   * Returns the progress of the loader as a number between [0, 1] inclusive.
   */
  public get progress(): number {
    const total = this._resources.length;
    return total > 0 ? clamp(this._numLoaded, 0, total) / total : 1;
  }

  private _loaded = false;
  /**
   * Returns true if the loader has completely loaded all resources
   */
  public isLoaded() {
    return this._loaded;
  }

  private _totalTimeMs = 0;

  /**
   * Optionally override the onUpdate
   * @param engine
   * @param elapsed
   */
  onUpdate(engine: Engine, elapsed: number): void {
    this._totalTimeMs += elapsed;
    // override me
  }

  /**
   * Optionally override the onDraw
   */
  onDraw(ctx: CanvasRenderingContext2D) {
    const seconds = this._totalTimeMs / 1000;

    ctx.fillStyle = Color.Black.toRGBA();
    ctx.fillRect(0, 0, this.engine.screen.resolution.width, this.engine.screen.resolution.height);

    ctx.save();
    ctx.translate(this.engine.screen.resolution.width / 2, this.engine.screen.resolution.height / 2);
    const speed = seconds * 10;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.arc(0, 0, 40, speed, speed + (Math.PI * 3) / 2);
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = '16px sans-serif';
    const text = (this.progress * 100).toFixed(0) + '%';
    const textbox = ctx.measureText(text);
    const width = Math.abs(textbox.actualBoundingBoxLeft) + Math.abs(textbox.actualBoundingBoxRight);
    const height = Math.abs(textbox.actualBoundingBoxAscent) + Math.abs(textbox.actualBoundingBoxDescent);
    ctx.fillText(text, -width / 2, height / 2); // center
    ctx.restore();
  }

  private _loadingFuture = new Future<void>();
  public areResourcesLoaded() {
    if (this._resources.length === 0) {
      // special case no resources mean loaded;
      return Promise.resolve();
    }
    return this._loadingFuture.promise;
  }

  /**
   * Not meant to be overridden
   *
   * Begin loading all of the supplied resources, returning a promise
   * that resolves when loading of all is complete AND the user has interacted with the loading screen
   */
  public async load(): Promise<Loadable<any>[]> {
    if (this.isLoaded()) {
      // Already loaded quick exit
      return (this.data = this._resources);
    }
    await this.onBeforeLoad();
    this.events.emit('beforeload');
    this.canvas.flagDirty();

    await Promise.all(
      this._resources
        .filter((r) => {
          return !r.isLoaded();
        })
        .map(async (r) => {
          this.events.emit('loadresourcestart', r);
          await r.load().finally(() => {
            // capture progress
            this._numLoaded++;
            this.canvas.flagDirty();
            this.events.emit('loadresourceend', r);
          });
        })
    );

    // Wire all sound to the engine
    for (const resource of this._resources) {
      if (resource instanceof Sound) {
        resource.wireEngine(this.engine);
      }
    }

    this._loadingFuture.resolve();
    this.canvas.flagDirty();
    // Unlock browser AudioContext in after user gesture
    // See: https://github.com/excaliburjs/Excalibur/issues/262
    // See: https://github.com/excaliburjs/Excalibur/issues/1031
    await this.onUserAction();
    this.events.emit('useraction');
    await WebAudio.unlock();

    await this.onAfterLoad();
    this.events.emit('afterload');
    this._loaded = true;
    return (this.data = this._resources);
  }

  public emit<TEventName extends EventKey<LoaderEvents>>(eventName: TEventName, event: LoaderEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<LoaderEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<LoaderEvents>>(eventName: TEventName, handler: Handler<LoaderEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<LoaderEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<LoaderEvents>>(eventName: TEventName, handler: Handler<LoaderEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<LoaderEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<LoaderEvents>>(eventName: TEventName, handler: Handler<LoaderEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<LoaderEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    (this.events as any).off(eventName, handler);
  }
}
