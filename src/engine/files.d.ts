declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.mp3';
declare module '*.svg';

declare module '*.css' {
  const value: { toString: () => string };
  export default value;
}
