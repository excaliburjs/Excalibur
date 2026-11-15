import { Font } from '../graphics/font';
import type { FontOptions } from '../graphics/font-common';
import type { GraphicOptions, RasterOptions } from '../graphics';
import type { Loadable } from '../interfaces/loadable';
import { Resource } from './resource';
import { SharedLoad, throwIfAborted, withAbort } from './abort';

export interface FontSourceOptions extends Omit<FontOptions, 'family'>, GraphicOptions, RasterOptions {
  /**
   * Whether or not to cache-bust requests
   */
  bustCache?: boolean;
}

export class FontSource implements Loadable<FontFace> {
  private _sharedLoad = new SharedLoad<FontFace>();
  private _resource: Resource<Blob>;
  private _isLoaded = false;
  private _options: FontSourceOptions;

  data!: FontFace;

  constructor(
    /**
     * Path to the font resource relative from the HTML document hosting the game, or absolute
     */
    public readonly path: string,
    /**
     * The font family name
     */
    public readonly family: string,
    { bustCache, ...options }: FontSourceOptions = {}
  ) {
    this._resource = new Resource(path, 'blob', bustCache);
    this._options = options;
  }

  load(signal?: AbortSignal): Promise<FontFace> {
    if (!signal) {
      return this._load();
    }
    return this._sharedLoad.load((activeSignal) => this._load(activeSignal), signal);
  }

  private async _load(signal?: AbortSignal): Promise<FontFace> {
    throwIfAborted(signal);
    if (this.isLoaded()) {
      return this.data;
    }

    let url: string | undefined;
    try {
      const blob = await this._resource.load(signal);
      throwIfAborted(signal);
      url = URL.createObjectURL(blob);
      const fontFace = !signal && this.data ? this.data : new FontFace(this.family, `url(${url})`);
      if (!signal && !this.data) {
        this.data = fontFace;
        document.fonts.add(fontFace);
      }
      await withAbort(fontFace.load(), signal);
      throwIfAborted(signal);
      if (signal) {
        document.fonts.add(fontFace);
        this.data = fontFace;
      }
      this._isLoaded = true;
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        throw error;
      }
      throw `Error loading FontSource from path '${this.path}' with error [${(error as Error).message}]`;
    } finally {
      // An unsignaled failed load retains its FontFace for a later retry.
      if (url && (signal || this._isLoaded)) {
        URL.revokeObjectURL(url);
      }
    }
    return this.data;
  }

  isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * Build a font from this FontSource.
   * @param options {FontOptions} Override the font options
   */
  toFont(options?: FontOptions & GraphicOptions & RasterOptions): Font {
    return new Font({ family: this.family, ...this._options, ...options });
  }
}
