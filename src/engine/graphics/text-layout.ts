/** How a Text graphic wraps words when a maximum width is provided. */
export type WordWrap = 'normal' | 'break-word';

/** Wrap at separating spaces, preserving other spaces and explicit line breaks. */
export function getWrappedTextLines(
  text: string,
  maxWidth: number | undefined,
  wordWrap: WordWrap,
  measure: (text: string) => number
): string[] {
  if (maxWidth == null) {
    return text.split('\n');
  }
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    let spaces = '';
    for (const token of paragraph.match(/ +|[^ ]+/g) ?? []) {
      if (/^ +$/.test(token)) {
        spaces += token;
        continue;
      }
      if (line.length && measure(line + spaces + token) > maxWidth) {
        lines.push(line);
        line = '';
        spaces = '';
      }
      line += spaces;
      spaces = '';
      if (wordWrap === 'normal' || measure(line + token) <= maxWidth) {
        line += token;
        continue;
      }
      let remaining = token;
      while (remaining) {
        let prefix = '';
        let fitting = '';
        for (const character of remaining) {
          prefix += character;
          if (measure(line + prefix) <= maxWidth) {
            fitting = prefix;
          }
        }
        // An overwide character still needs a line; never retry it indefinitely.
        const fragment = fitting || [...remaining][0];
        line += fragment;
        remaining = remaining.slice(fragment.length);
        if (remaining) {
          lines.push(line);
          line = '';
        }
      }
    }
    lines.push(line + spaces);
  }
  return lines;
}
