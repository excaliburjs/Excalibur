export function glsl(strings: TemplateStringsArray, ...values: any[]): string {
  // Combine template strings and values
  let source = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] !== undefined ? values[i] : '');
  }, '');

  // Add WebGL2 version directive if not present
  if (!source.trim().startsWith('#version')) {
    source = '#version 300 es\n' + source;
  }

  return source;
}
