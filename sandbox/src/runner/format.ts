import { safeStringify } from '../../../playground/src/utils/safe-stringify';

export type Segment = { text: string; style?: string; object?: boolean };

const inspect = (value: unknown) => safeStringify(value).replace(/\s+/g, ' ');

/**
 * Chrome-style console formatting: `%c` applies a CSS string to the following text
 * (until the next `%c`), `%s/%d/%i/%f/%o/%O` consume arguments as substitutions.
 * Anything left over is appended like devtools does (strings as-is, objects inspected).
 */
export function formatConsoleArgs(args: unknown[]): Segment[] {
  const segments: Segment[] = [];
  let style: string | undefined;

  const pushText = (text: string, object = false) => {
    if (!text) {
      return;
    }
    const last = segments[segments.length - 1];
    if (last && last.style === style && !!last.object === object) {
      last.text += text;
    } else {
      segments.push({ text, style, object });
    }
  };

  let index = 0;
  const first = args[0];
  if (typeof first === 'string' && /%[sdifoOc%]/.test(first)) {
    index = 1;
    let text = '';
    for (let i = 0; i < first.length; i++) {
      const char = first[i];
      if (char !== '%' || i === first.length - 1) {
        text += char;
        continue;
      }
      const specifier = first[++i];
      pushText(text);
      text = '';
      const hasArg = index < args.length;
      const arg = args[index];
      switch (specifier) {
        case 'c':
          style = hasArg ? String(arg) || undefined : undefined;
          index++;
          break;
        case 's':
          if (hasArg) {
            pushText(typeof arg === 'string' ? arg : inspect(arg), typeof arg !== 'string');
            index++;
          } else {
            text = '%s';
          }
          break;
        case 'd':
        case 'i':
          if (hasArg) {
            pushText(String(Math.trunc(Number(arg))));
            index++;
          } else {
            text = '%' + specifier;
          }
          break;
        case 'f':
          if (hasArg) {
            pushText(String(Number(arg)));
            index++;
          } else {
            text = '%f';
          }
          break;
        case 'o':
        case 'O':
          if (hasArg) {
            pushText(inspect(arg), true);
            index++;
          } else {
            text = '%' + specifier;
          }
          break;
        case '%':
          text = '%';
          break;
        default:
          text = '%' + specifier;
      }
    }
    pushText(text);
  }

  for (; index < args.length; index++) {
    if (segments.length > 0) {
      pushText(' ');
    }
    const arg = args[index];
    if (typeof arg === 'string') {
      pushText(arg);
    } else {
      pushText(inspect(arg), true);
    }
  }

  return segments;
}

/** Concatenated plain text of the segments, truncated to `max` characters. */
export function truncateSegments(segments: Segment[], max: number): { segments: Segment[]; plain: string } {
  const plain = segments.map((segment) => segment.text).join('');
  if (plain.length <= max) {
    return { segments, plain };
  }
  const truncated: Segment[] = [];
  let remaining = max;
  for (const segment of segments) {
    if (remaining <= 0) {
      break;
    }
    const text = segment.text.slice(0, remaining);
    remaining -= text.length;
    truncated.push({ ...segment, text });
  }
  const last = truncated[truncated.length - 1];
  if (last) {
    last.text += '…';
  }
  return { segments: truncated, plain: plain.slice(0, max) + '…' };
}
