import { Font } from '../graphics/font';
import type { FontOptions } from '../graphics/font-common';
import type { GraphicOptions, RasterOptions } from '../graphics';
import type { Loadable } from '../interfaces/loadable';
import { Resource } from './resource';

export interface FontSourceOptions extends Omit<FontOptions, 'family'>, GraphicOptions, RasterOptions {
  /**
   * Whether or not to cache-bust requests
   */
  bustCache?: boolean;
}

export class FontSource implements Loadable<FontFace> {
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

  async load(): Promise<FontFace> {
    if (this.isLoaded()) {
      return this.data;
    }

    try {
      const blob = await this._resource.load();
      const url = URL.createObjectURL(blob);

      if (!this.data) {
        this.data = new FontFace(this.family, `url(${url})`);
        document.fonts.add(this.data);
      }

      await this.data.load();
      this._isLoaded = true;
    } catch (error) {
      throw `Error loading FontSource from path '${this.path}' with error [${(error as Error).message}]`;
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
