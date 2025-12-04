declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.mp3';
declare module '*.svg';

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.glsl' {
  const value: string;
  export default value;
}

// vite import queries
declare module '*?raw' {
  const content: string;
  export default content;
}

declare module '*?inline' {
  const content: string;
  export default content;
}
