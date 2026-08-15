export function safeStringify(value: unknown) {
  const seen = new WeakSet();

  if (typeof value === 'object') {
    return JSON.stringify(
      value,
      (_key, value) => {
        if (typeof Window !== 'undefined' && value instanceof Window) {
          return '[Window]';
        }

        if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) {
          return `[HTMLElement ${value.tagName.toLowerCase()}]`;
        }

        if (typeof Event !== 'undefined' && value instanceof Event) {
          return `[Event ${value.type}]`;
        }

        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }

          seen.add(value);
        }

        return value;
      },
      2
    );
  } else {
    return String(value);
  }
}
