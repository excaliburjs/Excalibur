import type { BoundingBox } from '../collision/bounding-box';
import type { Color } from '../color';
import { Logger } from '../util/log';
import type { Font } from './font';
import { FontTextInstance } from './font-text-instance';

export class FontCache {
  public static FONT_TIMEOUT = 500;
  private static _LOGGER = Logger.getInstance();
  private static _TEXT_USAGE = new Map<FontTextInstance, number>();
  private static _TEXT_CACHE = new Map<string, FontTextInstance>();
  private static _MEASURE_CACHE = new Map<string, BoundingBox>();

  static measureText(text: string, font: Font, maxWidth?: number): BoundingBox {
    const hash = FontTextInstance.getHashCode(font, text);
    if (FontCache._MEASURE_CACHE.has(hash)) {
      return FontCache._MEASURE_CACHE.get(hash)!;
    }
    FontCache._LOGGER.debug(`Font text measurement cache miss: ${hash}`);
    const measurement = font.measureTextWithoutCache(text, maxWidth);
    FontCache._MEASURE_CACHE.set(hash, measurement);
    return measurement;
  }

  static getTextInstance(text: string, font: Font, color: Color): FontTextInstance {
    const hash = FontTextInstance.getHashCode(font, text, color);
    let textInstance = FontCache._TEXT_CACHE.get(hash);
    if (!textInstance) {
      textInstance = new FontTextInstance(font, text, color);
      FontCache._TEXT_CACHE.set(hash, textInstance);
      FontCache._LOGGER.debug(`Font text instance cache miss: ${hash}`);
    }

    // Cache the bitmap for certain amount of time
    FontCache._TEXT_USAGE.set(textInstance, performance.now());

    return textInstance;
  }

  static checkAndClearCache() {
    const deferred: FontTextInstance[] = [];
    const currentHashCodes = new Set<string>();
    for (const [textInstance, time] of FontCache._TEXT_USAGE.entries()) {
      // if bitmap hasn't been used in 100 ms clear it
      if (time + FontCache.FONT_TIMEOUT < performance.now()) {
        FontCache._LOGGER.debug(`Text cache entry timed out ${textInstance.text}`);
        deferred.push(textInstance);
        textInstance.dispose();
      } else {
        const hash = textInstance.getHashCode(false);
        currentHashCodes.add(hash);
      }
    }
    // Deferred removal of text instances
    deferred.forEach((t) => {
      FontCache._TEXT_USAGE.delete(t);
    });

    // Regenerate text instance cache
    this._TEXT_CACHE.clear();
    for (const [textInstance] of this._TEXT_USAGE.entries()) {
      this._TEXT_CACHE.set(textInstance.getHashCode(), textInstance);
    }

    // Regenerated measurement cache
    const newTextMeasurementCache = new Map<string, BoundingBox>();
    for (const current of currentHashCodes) {
      if (FontCache._MEASURE_CACHE.has(current)) {
        newTextMeasurementCache.set(current, FontCache._MEASURE_CACHE.get(current)!);
      }
    }
    this._MEASURE_CACHE.clear();
    this._MEASURE_CACHE = newTextMeasurementCache;
  }

  public static get cacheSize() {
    return FontCache._TEXT_USAGE.size;
  }

  /**
   * Force clear all cached text bitmaps
   */
  public static clearCache() {
    for (const [textInstance] of FontCache._TEXT_USAGE.entries()) {
      textInstance.dispose();
    }
    FontCache._TEXT_USAGE.clear();
    FontCache._TEXT_CACHE.clear();
    FontCache._MEASURE_CACHE.clear();
  }
}
