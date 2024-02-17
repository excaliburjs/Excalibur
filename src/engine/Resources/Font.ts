import { Font } from "../Graphics/Font"
import { FontOptions } from "../Graphics/FontCommon"
import { GraphicOptions, RasterOptions } from "../Graphics"
import { Loadable } from "../Interfaces/Loadable"
import { Resource } from "./Resource"

export interface FontSourceOptions
  extends Omit<FontOptions, 'family'>,
    GraphicOptions,
    RasterOptions {
  bustCache?: boolean
}

export class FontSource implements Loadable<FontFace> {
  private _resource: Resource<Blob>
  private _isLoaded = false  
  private path: string
  private options: FontSourceOptions  

  data!: FontFace

  /**
   * The font family name
   */
  family: string

  constructor(
    path: string,
    family: string,
    { bustCache, ...options }: FontSourceOptions = {}
  ) {
    this.path = path
    this._resource = new Resource(path, 'blob', bustCache)
    this.options = options
    this.family = family
  }

  async load(): Promise<FontFace> {
    if (this.isLoaded()) {
      return this.data
    }

    try {
      const blob = await this._resource.load()
      const url = URL.createObjectURL(blob)

      if (!this.data) {
        this.data = new FontFace(this.family, `url(${url})`)
        document.fonts.add(this.data)
      }

      await this.data.load()      
      this._isLoaded = true
    } catch (error) {
      throw `Error loading FontSource from path '${this.path}' with error [${
        (error as Error).message
      }]`
    }
    return this.data
  }

  isLoaded(): boolean {
    return this._isLoaded
  }

  /**
   * Build a font from this FontSource. 
   * 
   * @param options {FontOptions} Override the font options
   */
  toFont(options?: FontOptions): Font {
    return new Font({ family: this.family, ...this.options, ...options })
  }

}
