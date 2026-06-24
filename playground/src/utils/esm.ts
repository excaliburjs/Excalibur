import { debounce } from './debounce';

const PREVIEW_DEBOUNCE_MS = 500;

/**
 * esm tagged template literal from Dr. Axel
 * https://2ality.com/2019/10/eval-via-import.html
 */
export function esm(templateStrings: TemplateStringsArray, ...substitutions: any[]) {
  let js = templateStrings.raw[0];
  for (let i = 0; i < substitutions.length; i++) {
    js += substitutions[i] + templateStrings.raw[i + 1];
  }
  return 'data:text/javascript;base64,' + btoa(js);
}

export function updateEsm(text: string) {
  import(/* @vite-ignore */ esm`${text}`);
}

export const debouncedUpdateEsm = debounce(updateEsm, PREVIEW_DEBOUNCE_MS);
