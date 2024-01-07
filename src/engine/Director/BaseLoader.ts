import { WebAudio } from '../Util/WebAudio';
import { Engine } from '../Engine';
import { Loadable } from '../Interfaces/Loadable';
import { Canvas } from '../Graphics/Canvas';
import { ImageFiltering } from '../Graphics/Filtering';
import { clamp } from '../Math/util';
import { Sound } from '../Resources/Sound/Sound';
import { Future } from '../Util/Future';
import { EventEmitter, EventKey, Handler, Subscription } from '../EventEmitter';
import { Color } from '../Color';

export interface LoaderOptions {
  loadables: Loadable<any>[];
  suppressPlayButton: boolean;
}

export type LoaderEvents = {
  // Add event types here
}

export const LoaderEvents = {
  // Add event types here
};

// TODO RENAME DefaultLoader :D
export class BaseLoader implements Loadable<Loadable<any>[]> {
  public data: Loadable<any>[];
  public events = new EventEmitter();
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
  public engine: Engine;


  /**
   * @param loadables  Optionally provide the list of resources you want to load at constructor time
   */
  constructor(loadables?: Loadable<any>[]) {
    if (loadables) {
      this.addResources(loadables);
    }
  }

  public onInitialize(engine: Engine) {
    this.engine = engine;
    this.canvas.width = this.engine.canvas.width;
    this.canvas.height = this.engine.canvas.height;
  }

  public async onBeforeLoad() {
    // override me
  }

  public async onAfterLoad() {
    // override me
  }

  /**
   * Add a resource to the loader to load
   * @param loadable  Resource to add
   */
  public addResource(loadable: Loadable<any>) {
    this._resources.push(loadable);
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

  /**
   * Returns true if the loader has completely loaded all resources
   */
  public isLoaded() {
    return this._numLoaded === this._resources.length;
  }

  /**
   *
   * @param _engine
   * @param _elapsedMilliseconds
   */
  onUpdate(_engine: Engine, _elapsedMilliseconds: number): void {
    // override me
  }

  /**
   * Optionally override the onDraw
   */
  onDraw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = Color.Black.toRGBA();
    ctx.fillRect(0, 0, this.engine.screen.drawWidth, this.engine.screen.drawHeight);

    ctx.fillStyle = 'lime';
    ctx.font = '30px Consolas';
    ctx.fillText((this.progress * 100).toFixed(2) + '%', this.engine.screen.center.x, this.engine.screen.center.y);
  }


  private _loadingFuture = new Future<void>();
  public areResourcesLoaded() {
    return this._loadingFuture.promise;
  }

  /**
   * Begin loading all of the supplied resources, returning a promise
   * that resolves when loading of all is complete AND the user has clicked the "Play button"
   */
  public async load(): Promise<Loadable<any>[]> {
    await this.onBeforeLoad();
    this.events.emit('beforeload');
    this.canvas.flagDirty();

    await Promise.all(
      this._resources.map(async (r) => {
        await r.load().finally(() => {
          // capture progress
          this._numLoaded++;
          this.canvas.flagDirty();
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
    await WebAudio.unlock();

    await this.onAfterLoad();
    this.events.emit('afterload');
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
    this.events.off(eventName, handler);
  }
}
