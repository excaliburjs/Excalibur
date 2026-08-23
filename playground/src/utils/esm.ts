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
  // Append (not prepend) a unique comment so the data-URL module specifier is always unique,
  // keeping the browser's dynamic-import cache busted while preserving user line numbers in
  // stack traces. Without this, Run/Restart of unchanged code silently no-ops (cached module).
  const bust = `\n/* ${Math.random().toString(36).slice(2)} */`;
  import(/* @vite-ignore */ esm`${text}${bust}`);
}
