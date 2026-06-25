import * as lz from 'lz-string';

export async function shareCode(code: string) {
  const encoded = `code=${lz.compressToEncodedURIComponent(code)}`;
  const url = `${window.location}?${encoded}`;

  if (window.isSecureContext) {
    await navigator.clipboard.writeText(url);
  } else {
    console.warn('Cannot write to clipboard', url);
  }

  window.history.pushState({}, '', '?' + encoded);
}
