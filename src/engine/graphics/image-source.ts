import { Resource } from '../resources/resource';
import type { SpriteOptions } from './sprite';
import { Sprite } from './sprite';
import type { Loadable } from '../interfaces/index';
import { Logger } from '../util/log';
import { ImageFiltering } from './filtering';
import { Future } from '../util/future';
import { TextureLoader } from '../graphics/context/texture-loader';
import { ImageWrapping } from './wrapping';
import type { GraphicOptions } from './graphic';

export interface ImageSourceOptions {
  filtering?: ImageFiltering;
  wrapping?: ImageWrapConfiguration | ImageWrapping;
  bustCache?: boolean;
}

export interface ImageWrapConfiguration {
  x: ImageWrapping;
  y: ImageWrapping;
}

export const ImageSourceAttributeConstants = {
  Filtering: 'filtering',
  WrappingX: 'wrapping-x',
  WrappingY: 'wrapping-y',
  ForceUpload: 'forceUpload'
} as const;

export class ImageSource implements Loadable<HTMLImageElement> {
  private _logger = Logger.getInstance();
  private _resource: Resource<Blob>;
  public filtering?: ImageFiltering;
  public wrapping?: ImageWrapConfiguration;

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

  private _src?: string;
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

  public readonly path: string;

  /**
   * The path to the image, can also be a data url like 'data:image/'
   * @param pathOrBase64 {string} Path to the image resource relative from the HTML document hosting the game, or absolute
   * @param options
   */
  constructor(pathOrBase64: string, options?: ImageSourceOptions);
  /**
   * The path to the image, can also be a data url like 'data:image/'
   * @param pathOrBase64 {string} Path to the image resource relative from the HTML document hosting the game, or absolute
   * @param bustCache {boolean} Should excalibur add a cache busting querystring?
   * @param filtering {ImageFiltering} Optionally override the image filtering set by {@apilink EngineOptions.antialiasing}
   */
  constructor(pathOrBase64: string, bustCache: boolean, filtering?: ImageFiltering);
  constructor(pathOrBase64: string, bustCacheOrOptions: boolean | ImageSourceOptions | undefined, filtering?: ImageFiltering) {
    this.path = pathOrBase64;
    let bustCache: boolean | undefined = false;
    let wrapping: ImageWrapConfiguration | ImageWrapping | undefined;
    if (typeof bustCacheOrOptions === 'boolean') {
      bustCache = bustCacheOrOptions;
    } else {
      ({ filtering, wrapping, bustCache } = { ...bustCacheOrOptions });
    }
    this._resource = new Resource(pathOrBase64, 'blob', bustCache);
    this.filtering = filtering ?? this.filtering;
    if (typeof wrapping === 'string') {
      this.wrapping = {
        x: wrapping,
        y: wrapping
      };
    } else {
      this.wrapping = wrapping ?? this.wrapping;
    }
    if (pathOrBase64.endsWith('.gif')) {
      this._logger.warn(
        `Use the ex.Gif type to load gifs, you may have mixed results with ${pathOrBase64} in ex.ImageSource. Fully supported: svg, jpg, bmp, and png`
      );
    }
  }

  /**
   * Create an ImageSource from and HTML <image> tag element
   * @param image
   */
  static fromHtmlImageElement(image: HTMLImageElement, options?: ImageSourceOptions) {
    const imageSource = new ImageSource('');
    imageSource._src = 'image-element';
    imageSource.data = image;
    imageSource.data.setAttribute('data-original-src', 'image-element');

    if (options?.filtering) {
      imageSource.data.setAttribute(ImageSourceAttributeConstants.Filtering, options?.filtering);
    } else {
      imageSource.data.setAttribute(ImageSourceAttributeConstants.Filtering, ImageFiltering.Blended);
    }

    if (options?.wrapping) {
      let wrapping: ImageWrapConfiguration;
      if (typeof options.wrapping === 'string') {
        wrapping = {
          x: options.wrapping,
          y: options.wrapping
        };
      } else {
        wrapping = {
          x: options.wrapping.x,
          y: options.wrapping.y
        };
      }
      imageSource.data.setAttribute(ImageSourceAttributeConstants.WrappingX, wrapping.x);
      imageSource.data.setAttribute(ImageSourceAttributeConstants.WrappingY, wrapping.y);
    } else {
      imageSource.data.setAttribute(ImageSourceAttributeConstants.WrappingX, ImageWrapping.Clamp);
      imageSource.data.setAttribute(ImageSourceAttributeConstants.WrappingY, ImageWrapping.Clamp);
    }

    TextureLoader.checkImageSizeSupportedAndLog(image);
    imageSource._readyFuture.resolve(image);
    return imageSource;
  }

  static fromHtmlCanvasElement(image: HTMLCanvasElement, options?: ImageSourceOptions): ImageSource {
    const imageSource = new ImageSource('');
    imageSource._src = 'canvas-element-blob';
    imageSource.data.setAttribute('data-original-src', 'canvas-element-blob');

    if (options?.filtering) {
      imageSource.data.setAttribute(ImageSourceAttributeConstants.Filtering, options?.filtering);
    } else {
      imageSource.data.setAttribute(ImageSourceAttributeConstants.Filtering, ImageFiltering.Blended);
    }

    if (options?.wrapping) {
      let wrapping: ImageWrapConfiguration;
      if (typeof options.wrapping === 'string') {
        wrapping = {
          x: options.wrapping,
          y: options.wrapping
        };
      } else {
        wrapping = {
          x: options.wrapping.x,
          y: options.wrapping.y
        };
      }
      imageSource.data.setAttribute(ImageSourceAttributeConstants.WrappingX, wrapping.x);
      imageSource.data.setAttribute(ImageSourceAttributeConstants.WrappingY, wrapping.y);
    } else {
      imageSource.data.setAttribute(ImageSourceAttributeConstants.WrappingX, ImageWrapping.Clamp);
      imageSource.data.setAttribute(ImageSourceAttributeConstants.WrappingY, ImageWrapping.Clamp);
    }

    TextureLoader.checkImageSizeSupportedAndLog(image);

    image.toBlob((blob) => {
      // TODO throw? if blob null?
      const url = URL.createObjectURL(blob!);
      imageSource.image.onload = () => {
        // no longer need to read the blob so it's revoked
        URL.revokeObjectURL(url);
        imageSource.data = imageSource.image;
        imageSource._readyFuture.resolve(imageSource.image);
      };
      imageSource.image.src = url;
    });

    return imageSource;
  }

  static fromSvgString(svgSource: string, options?: ImageSourceOptions) {
    const blob = new Blob([svgSource], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    return new ImageSource(url, options);
  }

  /**
   * Should excalibur add a cache busting querystring? By default false.
   * Must be set before loading
   */
  public get bustCache() {
    return this._resource.bustCache;
  }

  public set bustCache(val: boolean) {
    this._resource.bustCache = val;
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
      // We defer loading the texture into webgl until the first draw that way we avoid a singleton
      // and for the multi-engine case the texture needs to be created in EACH webgl context to work
      // See image-renderer.ts draw()
      this.data = image;

      // emit warning if potentially too big
      TextureLoader.checkImageSizeSupportedAndLog(this.data);
    } catch (error: any) {
      throw `Error loading ImageSource from path '${this.path}' with error [${error.message}]`;
    }
    // Do a bad thing to pass the filtering as an attribute
    this.data.setAttribute(ImageSourceAttributeConstants.Filtering, this.filtering as any); // TODO fix type
    this.data.setAttribute(ImageSourceAttributeConstants.WrappingX, this.wrapping?.x ?? ImageWrapping.Clamp);
    this.data.setAttribute(ImageSourceAttributeConstants.WrappingY, this.wrapping?.y ?? ImageWrapping.Clamp);

    // todo emit complete
    this._readyFuture.resolve(this.data);
    return this.data;
  }

  /**
   * Build a sprite from this ImageSource
   */
  public toSprite(options?: Omit<GraphicOptions & SpriteOptions, 'image'>): Sprite {
    return Sprite.from(this, options);
  }

  /**
   * Unload images from memory
   */
  unload(): void {
    this.data = new Image();
  }
}
