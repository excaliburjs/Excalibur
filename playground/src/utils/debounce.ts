export function debounce(func: (..._: any[]) => any, delay: number) {
  let timeout: number;
  return function (this: unknown, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay) as unknown as number;
  };
}
