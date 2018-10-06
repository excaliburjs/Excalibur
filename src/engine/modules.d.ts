declare module '*.png' {
  const value: string;
  export = value;
}

declare module '*.css' {
  const value: { toString: () => string };
  export = value;
}
