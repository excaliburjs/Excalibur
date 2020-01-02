import { Resource } from '../Resources/Index';

export class RawImage extends Resource<HTMLImageElement> {
  private static _ID = 0;
  public readonly id = RawImage._ID++;

  /**
   * The original size of the image before any sizing
   */
  public get width() {
    return this.image.naturalWidth;
  }

  /**
   * The original height of the image for any sizing
   */
  public get height() {
    return this.image.naturalHeight;
  }

  public image: HTMLImageElement = new Image();

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

  load(): Promise<HTMLImageElement> {
    return new Promise((resolve, _reject) => {
      if (this.isLoaded()) {
        resolve(this.image);
        return;
      }

      this._resolveWhenLoaded(resolve);
      if (this._isDataUrl(this.path)) {
        this.image.src = this.path;
      } else {
        super.load().then(() => {
          this.image.src = super.getData();
        });
      }
    });
  }

  /**
   * Unload images from memory
   */
  unload(): void {
    this.data = null;
    this.image = new Image();
  }
}
