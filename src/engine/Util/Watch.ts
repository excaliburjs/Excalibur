/**
 * Watch an object with a proxy, only fires if property value is different
 */
export function watch<T extends object>(type: T, change: (type: T) => any): T {
  if (!type) {
    return type;
  }
  if ((type as any).__isProxy === undefined) {
    // expando hack to mark a proxy
    return new Proxy(type, {
      set: (obj, prop, value) => {
        // The default behavior to store the value
        if ((obj as any)[prop] !== value) {
          (obj as any)[prop] = value;
          // Avoid watching private junk
          if (typeof prop === 'string') {
            if (prop[0] !== '_') {
              change(obj);
            }
          }
        }
        // Indicate success
        return true;
      },
      get: (obj, prop) => {
        if (prop !== '__isProxy') {
          return (obj as any)[prop];
        }
        return true;
      }
    });
  }
  return type;
}

/**
 * Watch an object with a proxy, fires change on any property value change
 */
export function watchAny<T extends object>(type: T, change: (type: T) => any): T {
  if (!type) {
    return type;
  }
  if ((type as any).__isProxy === undefined) {
    // expando hack to mark a proxy
    return new Proxy(type, {
      set: (obj, prop, value) => {
        // The default behavior to store the value
        (obj as any)[prop] = value;
        // Avoid watching private junk
        if (typeof prop === 'string') {
          if (prop[0] !== '_') {
            change(obj);
          }
        }

        // Indicate success
        return true;
      },
      get: (obj, prop) => {
        if (prop !== '__isProxy') {
          return (obj as any)[prop];
        }
        return true;
      }
    });
  }
  return type;
}
