import { Resource } from '../Resources/Resource';
import { Sprite } from './Sprite';
import { Loadable } from '../Interfaces/Index';
import { Logger } from '../Util/Log';
import { TextureLoader } from '.';
import { ImageFiltering } from './Filtering';
import { Future } from '../Util/Future';

export class ImageSource implements Loadable<HTMLImageElement> {
  private _logger = Logger.getInstance();
  private _resource: Resource<Blob>;
  private _filtering: ImageFiltering;

  /**
   * The original size of the source image in pixels
   */
  public get width() {
    return this.image.naturalWidth;
  }

  /**
   * The original height of the source image in pixels
   */
  public get height() {
    return this.image.naturalHeight;
  }

  private _src: string;
  /**
   * Returns true if the Texture is completely loaded and is ready
   * to be drawn.
   */
  public isLoaded(): boolean {
    if (!this._src) {
      // this boosts speed of access
      this._src = this.data.src;
    }
    return !!this._src;
  }

  /**
   * Access to the underlying html image element
   */
  public data: HTMLImageElement = new Image();
  public get image(): HTMLImageElement {
    return this.data;
  }

  private _readyFuture = new Future<HTMLImageElement>();
  /**
   * Promise the resolves when the image is loaded and ready for use, does not initiate loading
   */
  public ready: Promise<HTMLImageElement> = this._readyFuture.promise;

  /**
   * The path to the image, can also be a data url like 'data:image/'
   * @param path {string} Path to the image resource relative from the HTML document hosting the game, or absolute
   * @param bustCache {boolean} Should excalibur add a cache busting querystring?
   * @param filtering {ImageFiltering} Optionally override the image filtering set by [[EngineOptions.antialiasing]]
   */
  constructor(public readonly path: string, bustCache: boolean = false, filtering?: ImageFiltering) {
    this._resource = new Resource(path, 'blob', bustCache);
    this._filtering = filtering;
    if (path.endsWith('.svg') || path.endsWith('.gif')) {
      this._logger.warn(`Image type is not fully supported, you may have mixed results ${path}. Fully supported: jpg, bmp, and png`);
    }
  }

  /**
   * Begins loading the image and returns a promise that resolves when the image is loaded
   */
  async load(): Promise<HTMLImageElement> {
    if (this.isLoaded()) {
      return this.data;
    }
    try {
      // Load base64 or blob if needed
      let url: string;
      if (!this.path.includes('data:image/')) {
        const blob = await this._resource.load();
        url = URL.createObjectURL(blob);
      } else {
        url = this.path;
      }

      // Decode the image
      const image = new Image();
      // Use Image.onload over Image.decode()
      // https://bugs.chromium.org/p/chromium/issues/detail?id=1055828#c7
      // Otherwise chrome will throw still Image.decode() failures for large textures
      const loadedFuture = new Future<void>();
      image.onload = () => loadedFuture.resolve();
      image.src = url;
      image.setAttribute('data-original-src', this.path);

      await loadedFuture.promise;

      // Set results
      this.data = image;
    } catch (error) {
      throw `Error loading ImageSource from path '${this.path}' with error [${error.message}]`;
    }
    TextureLoader.load(this.data, this._filtering);
    // todo emit complete
    this._readyFuture.resolve(this.data);
    return this.data;
  }

  /**
   * Build a sprite from this ImageSource
   */
  public toSprite(): Sprite {
    return Sprite.from(this);
  }

  /**
   * Unload images from memory
   */
  unload(): void {
    this.data = new Image();
  }
}
