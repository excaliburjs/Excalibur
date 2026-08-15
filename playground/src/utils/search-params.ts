import * as lz from 'lz-string';

import { templates } from '../templates';

type Options = typeof options;
type Option = keyof Options;

/**
 * Extract all the initial values and media state ready for the initial render
 */

const searchParams = new URLSearchParams(document.location.search);

const isEmbedded = (searchParams.get('embed') ?? 'false') === 'true';

// A page may choose to switch to the console by passing tab=console
const initialTab = searchParams.get('tab') ?? 'editor';

let initialCode = templates.default;
try {
  if (searchParams.has('code')) {
    initialCode = lz.decompressFromEncodedURIComponent(searchParams.get('code') ?? '');
  }
} catch {}

const options = {
  initialLightMode: window.matchMedia('(prefers-color-scheme: light)').matches,
  isEmbedded,
  initialAutoPlay: (searchParams.get('autoplay') ?? 'true') === 'true',
  initialTab,
  initialCode
} as const;

export function getSearchParam<K extends Option>(key: K): Options[K] {
  return options[key];
}
