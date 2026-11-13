// Type stub for the SDF text plugin imported by URL in sdf-text.ts, see plugin-pathfinding.d.ts.
// Mirrors dist/types of @excaliburjs/plugin-sdf-text (vendored at site/static/plugins/excalibur-sdf-text/1.0.0) so `npm run typecheck:samples` can check the sample.
declare module 'https://excaliburjs.com/plugins/excalibur-sdf-text/1.0.0/excalibur-sdf-text.js' {
  import type { BoundingBox, Color, ExcaliburGraphicsContext, Graphic, GraphicOptions, Loadable, Plugin } from 'excalibur';

  export type SDFTextAlign = 'left' | 'center' | 'right';
  export type UnicodeCodePointRange = [startCodePoint: number, endCodePoint: number];

  export abstract class SDFSource {
    color: Color;
    fontSize: number;
    readonly isLoaded: boolean;
    measureText(text: string, size: number, maxWidth?: number, lineHeight?: number): BoundingBox;
  }

  export interface SDFFontOptions {
    fontFamily: string;
    fontFile?: string;
    color?: Color;
    fontWeight?: number | string;
    fontStyle?: string;
    alphabet?: string | UnicodeCodePointRange[];
    fontSize?: number;
  }

  export class SDFFont extends SDFSource implements Loadable<HTMLCanvasElement> {
    constructor(options: SDFFontOptions);
    readonly atlas: HTMLCanvasElement;
    readonly data: HTMLCanvasElement;
    readonly isLoaded: boolean;
    load(): Promise<HTMLCanvasElement>;
  }

  export interface SDFAtlasOptions {
    atlasPath: string;
    metadataPath: string;
  }

  export class SDFAtlas extends SDFSource {
    constructor(options: SDFAtlasOptions);
    readonly isLoaded: boolean;
    load(): Promise<unknown>;
  }

  export interface SDFTextOptions extends GraphicOptions {
    sdf: SDFSource;
    text: string;
    size?: number;
    color?: Color;
    visibleCharacters?: number;
    textAlign?: SDFTextAlign;
    maxWidth?: number;
    lineHeight?: number;
  }

  export class SDFText extends Graphic {
    constructor(options: SDFTextOptions);
    text: string;
    size: number;
    color?: Color;
    visibleCharacters: number;
    textAlign: SDFTextAlign;
    maxWidth?: number;
    lineHeight: number;
    protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void;
    clone(): SDFText;
  }

  export class SDFTextPlugin extends Plugin {
    constructor();
    onGraphicsPostInitialize(context: ExcaliburGraphicsContext): void;
  }
}
