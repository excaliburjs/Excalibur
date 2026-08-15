import { Logger } from '../../util/log';

/**
 * Emitted into the preamble so that re-applying the tag to its own output is a no-op.
 *
 * Without this, a second pass would rename the `texture(...)` calls inside the injected helper
 * bodies and turn `ex_texture` into infinite recursion.
 */
const PROCESSED_MARKER = '// processed by the excalibur glsl tag';

/**
 * Leading `#version ...` directive, must be the very first thing in a shader
 */
const VERSION_REGEX = /^\s*#version[^\n]*\r?\n?/;

/**
 * A `precision <qualifier> float;` declaration anywhere in the source
 */
const FLOAT_PRECISION_REGEX = /^[ \t]*precision\s+(lowp|mediump|highp)\s+float\s*;/m;

/**
 * The fragment shader color output, for example `out vec4 fragColor;` or
 * `layout(location = 0) out vec4 color;`
 */
const FRAGMENT_OUT_REGEX = /\bout\s+(?:(?:lowp|mediump|highp)\s+)?vec4\s+([A-Za-z_][A-Za-z0-9_]*)\s*;/;

/**
 * The author's entry point
 */
const MAIN_REGEX = /\bvoid\s+main\s*\(/;

/**
 * Opt out of the automatic alpha premultiplication `#pragma excalibur premultiply(off)`
 */
const NO_PREMULTIPLY_PRAGMA_REGEX = /^[ \t]*#pragma\s+excalibur\s+premultiply\s*\(\s*off\s*\)[ \t]*\r?\n?/m;

/**
 * Matches any function call identifier, the replacer decides whether to rename it. Matching the
 * whole identifier (rather than using a lookbehind) is what keeps `pixel_texture(` and an already
 * renamed `ex_texture(` from being rewritten, and avoids overlapping-match bugs on adjacent calls
 * like `texture(texture(...))`.
 */
const CALL_REGEX = /([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;

/**
 * Built in glsl sampling functions that return a premultiplied value in Excalibur, mapped to the
 * un-premultiplying wrapper injected in the preamble.
 */
const SAMPLER_RENAMES: Record<string, string> = {
  texture: 'ex_texture',
  textureLod: 'ex_textureLod',
  texelFetch: 'ex_texelFetch'
};

/**
 * Heuristic for authors who hand rolled the premultiply the tag now does for them
 */
const MANUAL_PREMULTIPLY_REGEX = /[A-Za-z_][A-Za-z0-9_]*\.rgb\s*(?:\*=|=)[^;]*\.a\s*;/;

/**
 * Alpha space conversion helpers. Emitted one per line to keep the shader compile error line
 * numbering (see `Shader._processSourceForError`) as close to the author's as possible.
 */
const ALPHA_HELPERS = [
  'vec4 ex_premultiply(vec4 color) { return vec4(color.rgb * color.a, color.a); }',
  'vec4 ex_unpremultiply(vec4 color) { return color.a > 0.0 ? vec4(color.rgb / color.a, color.a) : color; }',
  'vec4 ex_texture_raw(in sampler2D tex, in vec2 uv) { return texture(tex, uv); }',
  'vec4 ex_texture(in sampler2D tex, in vec2 uv) { return ex_unpremultiply(texture(tex, uv)); }',
  'vec4 ex_texture(in sampler2D tex, in vec2 uv, in float bias) { return ex_unpremultiply(texture(tex, uv, bias)); }',
  'vec4 ex_textureLod(in sampler2D tex, in vec2 uv, in float lod) { return ex_unpremultiply(textureLod(tex, uv, lod)); }',
  'vec4 ex_texelFetch(in sampler2D tex, in ivec2 coord, in int lod) { return ex_unpremultiply(texelFetch(tex, coord, lod)); }'
];

/**
 * Inigo Quilez pixel art filter https://jorenjoestar.github.io/post/pixel_art_filtering/
 *
 * Returned in the same alpha space as everything else the author sees.
 */
function pixelTextureSource(premultiply: boolean): string[] {
  const sample = premultiply ? 'ex_unpremultiply(texture(tex, pixel_uv))' : 'texture(tex, pixel_uv)';
  return [
    'vec4 pixel_texture(in sampler2D tex, in vec2 uv) {',
    '  vec2 pixel = uv * vec2(textureSize(tex, 0));',
    '  vec2 seam = floor(pixel + .5);',
    '  vec2 dudv = fwidth(pixel);',
    '  pixel = seam + clamp((pixel - seam) / dudv, -.5, .5);',
    '  vec2 pixel_uv = pixel / vec2(textureSize(tex, 0));',
    `  return ${sample};`,
    '}'
  ];
}

/**
 * Tagged template literal for authoring Excalibur {@apilink Material} fragment shaders.
 *
 * It handles the boilerplate and, most importantly, the alpha space bookkeeping.
 *
 * ## Automatic alpha premultiplication
 *
 * Excalibur's WebGL pipeline is premultiplied end to end. Textures are uploaded with
 * `UNPACK_PREMULTIPLY_ALPHA_WEBGL`, so a raw `texture(u_graphic, uv)` hands back a premultiplied
 * value, and the blend function is `(ONE, ONE_MINUS_SRC_ALPHA)`, so the fragment output must be
 * premultiplied too. Doing your own alpha math in the middle of that is a reliable source of
 * washed out blending and dark halos on antialiased edges.
 *
 * Shaders written with this tag instead get a **straight (un-premultiplied) alpha authoring
 * space**. Sampling calls are un-premultiplied on the way in and your color output is
 * premultiplied on the way out, so ordinary intuitive alpha math works in between:
 *
 * ```ts
 * const material = game.graphicsContext.createMaterial({
 *   name: 'fade',
 *   fragmentSource: glsl`
 *     in vec2 v_uv;
 *     uniform sampler2D u_graphic;
 *     out vec4 fragColor;
 *     void main() {
 *       vec4 color = texture(u_graphic, v_uv);
 *       color.a *= 0.5; // just works, no manual premultiply needed
 *       fragColor = color;
 *     }`
 * });
 * ```
 *
 * Filtering still happens in premultiplied space where it belongs, only the filtered result is
 * converted. See https://www.realtimerendering.com/blog/gpus-prefer-premultiplication/
 *
 * To sample a texture that is not color data (a lookup table, a noise or data texture) use
 * `ex_texture_raw(tex, uv)`, which is passed through untouched. To turn the whole transform off
 * for a shader, add `#pragma excalibur premultiply(off)` to its source.
 *
 * ## Other conveniences
 *
 * * Adds `#version 300 es` and a `precision` declaration if you did not write them
 * * Injects the `pixel_texture(sampler2D, vec2)` pixel art filter if your source references it
 * * Injects `uniform vec2 u_graphic_resolution;` alongside it if you have not declared it
 * * Exposes `ex_premultiply(vec4)` / `ex_unpremultiply(vec4)` if you need to convert by hand
 */
export function glsl(strings: TemplateStringsArray, ...values: any[]): string {
  // Combine template strings and values
  let source = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] !== undefined ? values[i] : '');
  }, '');

  // Applying the tag to source that already went through it is a no-op
  if (source.includes(PROCESSED_MARKER)) {
    return source;
  }

  // Pull off any author supplied #version, exactly one is emitted at the top of the preamble
  source = source.replace(VERSION_REGEX, '');

  // Vertex shaders are left alone, they have their own default precision and no color output
  if (/\bgl_Position\b/.test(source)) {
    return `#version 300 es\n${PROCESSED_MARKER}\n` + source;
  }

  const premultiply = !NO_PREMULTIPLY_PRAGMA_REGEX.test(source);
  source = source.replace(NO_PREMULTIPLY_PRAGMA_REGEX, '');

  const usesPixelTexture = source.includes('pixel_texture(');
  // Fragment shaders have no default float precision, match the author's if they declared one
  const floatPrecision = FLOAT_PRECISION_REGEX.exec(source)?.[1] ?? 'mediump';

  if (premultiply) {
    if (process.env.NODE_ENV === 'development' && MANUAL_PREMULTIPLY_REGEX.test(source)) {
      Logger.getInstance().warnOnce(
        `A shader authored with the glsl tagged template literal looks like it premultiplies alpha by hand ` +
          `(for example "fragColor.rgb *= fragColor.a;").\n` +
          `The glsl tag already premultiplies your color output for you, so this will premultiply twice and ` +
          `darken antialiased edges. Remove the manual premultiply, or opt out of the automatic one with ` +
          `"#pragma excalibur premultiply(off)".`
      );
    }

    // Rename sampling calls in the author's source only. The preamble that defines the renamed
    // functions is prepended afterwards, so its own bodies are never rewritten.
    source = source.replace(CALL_REGEX, (match, name: string) => {
      const rename = SAMPLER_RENAMES[name];
      return rename ? `${rename}(` : match;
    });

    source = premultiplyOutput(source);
  }

  const preamble: string[] = ['#version 300 es', PROCESSED_MARKER, `precision ${floatPrecision} float;`];

  if (usesPixelTexture && !/\buniform\s+vec2\s+u_graphic_resolution\s*;/.test(source)) {
    preamble.push('uniform vec2 u_graphic_resolution;');
  }

  if (premultiply) {
    preamble.push(...ALPHA_HELPERS);
  }

  if (usesPixelTexture) {
    preamble.push(...pixelTextureSource(premultiply));
  }

  return preamble.join('\n') + '\n' + source;
}

/**
 * Renames the author's `main` and appends a new one that premultiplies the color output.
 *
 * `discard` still behaves correctly, in GLSL ES 3.0 it terminates the fragment from any call depth.
 */
function premultiplyOutput(source: string): string {
  // Already wrapped, applying the tag twice is a no-op
  if (/\bvoid\s+ex_main\s*\(/.test(source)) {
    return source;
  }

  const outName = FRAGMENT_OUT_REGEX.exec(source)?.[1];
  if (!outName || !MAIN_REGEX.test(source)) {
    // Nothing to premultiply, the shader has no vec4 color output or no entry point
    return source;
  }

  return source.replace(MAIN_REGEX, 'void ex_main(') + `\nvoid main() {\n  ex_main();\n  ${outName} = ex_premultiply(${outName});\n}\n`;
}
