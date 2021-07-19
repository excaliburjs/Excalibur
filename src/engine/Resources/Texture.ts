import { Resource } from './Resource';
import { Sprite } from '../Drawing/Sprite';
import { Loadable } from '../Interfaces/Index';
/**
 * The [[Texture]] object allows games built in Excalibur to load image resources.
 * [[Texture]] is an [[Loadable]] which means it can be passed to a [[Loader]]
 * to pre-load before starting a level or game.
 */
export class Texture implements Loadable<HTMLImageElement> {
  private _resource: Resource<Blob>;
  /**
   * The width of the texture in pixels
   */
  public width: number;

  /**
   * The height of the texture in pixels
   */
  public height: number;

  private _sprite: Sprite = null;

  /**
   * Populated once loading is complete
   */
  public data: HTMLImageElement;
  public get image() {
    return this.data;
  }

  private _loadedResolve: (image: HTMLImageElement) => any;
  public loaded = new Promise<HTMLImageElement>(resolve => {
    this._loadedResolve = resolve;
  });

  /**
   * @param path       Path to the image resource or a base64 string representing an image "data:image/png;base64,iVB..."
   * @param bustCache  Optionally load texture with cache busting
   */
  constructor(public path: string, public bustCache = true) {
    this._resource = new Resource(path, 'blob', bustCache);
    this._sprite = new Sprite(this, 0, 0, 0, 0);
  }

  /**
   * Returns true if the Texture is completely loaded and is ready
   * to be drawn.
   */
  public isLoaded(): boolean {
    return !!this.data;
  }

  /**
   * Begins loading the texture and returns a promise to be resolved on completion
   */
  public async load(): Promise<HTMLImageElement> {
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
      this.width = this._sprite.width = image.naturalWidth;
      this.height = this._sprite.height = image.naturalHeight;
      this._sprite = new Sprite(this, 0, 0, this.width, this.height);
    } catch {
      await Promise.reject('Error loading texture');
    }
    // todo emit complete
    this._loadedResolve(this.data);
    return this.data;
  }

  public asSprite(): Sprite {
    return this._sprite;
  }
}
