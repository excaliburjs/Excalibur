import { Resource } from '../Resources/Resource';
import { Texture } from '../Drawing/Texture';
import { Sprite } from './Sprite';
import { Loadable } from '../Interfaces/Index';
import { Logger } from '../Util/Log';
import { TextureLoader } from '.';
import { ImageFiltering } from './Filtering';

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

  /**
   * Returns true if the Texture is completely loaded and is ready
   * to be drawn.
   */
  public isLoaded(): boolean {
    return !!this.data.src;
  }

  /**
   * Access to the underlying html image elmeent
   */
  public data: HTMLImageElement = new Image();
  public get image(): HTMLImageElement {
    return this.data;
  }

  /**
   * Promise the resolves when the image is loaded and ready for use, does not initiate loading
   */
  public ready: Promise<HTMLImageElement>;
  private _loadedResolve: (value?: HTMLImageElement | PromiseLike<HTMLImageElement>) => void;

  /**
   * The path to the image, can also be a data url like 'data:image/'
   * @param path {string} Path to the image resource relative from the HTML document hosting the game, or absolute
   * @param bustCache {boolean} Should excalibur add a cache busting querystring?
   * @param filtering {ImageFiltering} Optionally override the image filtering set by [[EngineOptions.antialiasing]]
   */
  constructor(public readonly path: string, bustCache: boolean = false, filtering?: ImageFiltering) {
    this._resource = new Resource(path, 'blob', bustCache);
    this._filtering = filtering
    if (path.endsWith('.svg') || path.endsWith('.gif')) {
      this._logger.warn(`Image type is not fully supported, you may have mixed results ${path}. Fully supported: jpg, bmp, and png`);
    }
    this.ready = new Promise<HTMLImageElement>((resolve) => {
      this._loadedResolve = resolve;
    });
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
      image.src = url;
      await image.decode();

      // Set results
      this.data = image;
    } catch (error) {
      throw `Error loading ImageSource from path '${this.path}' with error [${error.message}]`;
    }
    TextureLoader.load(this.data, this._filtering);
    // todo emit complete
    this._loadedResolve(this.data);
    return this.data;
  }

  /**
   * Build a sprite from this ImageSource
   */
  public toSprite(): Sprite {
    return Sprite.from(this);
  }

  /**
   * Create a ImageSource from legacy texture
   * @param tex
   */
  public static fromLegacyTexture(tex: Texture): ImageSource {
    const image = new ImageSource(tex.path);
    if (tex.isLoaded()) {
      image.data = tex.data;
    } else {
      tex.loaded.then(() => {
        image.data = tex.data;
      });
    }
    return image;
  }

  /**
   * Unload images from memory
   */
  unload(): void {
    this.data = new Image();
  }
}
