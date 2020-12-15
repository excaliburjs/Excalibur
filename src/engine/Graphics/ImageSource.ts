import { Resource } from '../Resources/Resource';
import { Texture } from '../Resources/Texture';
import { TextureLoader } from './Context/texture-loader';
import { Sprite } from './Sprite';

export class ImageSource extends Resource<string> {
  /**
   * Unique id of raw image
   */
  public readonly id = TextureLoader.nextSourceId();

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
   * Access to the underlying html image elmeent
   */
  public image: HTMLImageElement = new Image();

  /**
   * Promise the resolves when the image is loaded, does not initiate loading
   */
  public whenLoaded: Promise<HTMLImageElement>;
  private _whenLoadedResolve: (value?: HTMLImageElement | PromiseLike<HTMLImageElement>) => void;

  /**
   * The path to the image, can also be a data url like 'data:image/'
   * @param path
   */
  constructor(public readonly path: string, bustCache: boolean = false) {
    super(path, 'blob', bustCache);
    this.whenLoaded = new Promise<HTMLImageElement>((resolve) => {
      this._whenLoadedResolve = resolve;
    });
  }

  /**
   * Image is already encoded
   * @param path
   */
  private _isDataUrl(path: string) {
    return path.indexOf('data:image/') > -1;
  }

  private _resolveWhenLoaded(resolve: (value: HTMLImageElement) => void) {
    this.image.addEventListener('load', () => {
      resolve(this.image);
      this._whenLoadedResolve(this.image);
    });
  }

  /**
   * Begins loading the image and returns a promise that resolves when the image is loaded
   */
  load(): Promise<HTMLImageElement> {
    return new Promise((resolve, _reject) => {
      if (this.isLoaded()) {
        resolve(this.image);
        return;
      }

      this._resolveWhenLoaded(resolve);
      if (this._isDataUrl(this.path)) {
        this.data = this.path;
        this.image.src = this.path;
      } else {
        super.load().then(() => {
          this.image.src = super.getData();
        });
      }
    });
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
      image.image = tex.image;
      image.data = tex.data;
    } else {
      tex.loaded.then(() => {
        image.image = tex.image;
        image.data = tex.data;
      });
    }
    return image;
  }

  /**
   * Unload images from memory
   */
  unload(): void {
    this.data = null;
    this.image = new Image();
  }
}
