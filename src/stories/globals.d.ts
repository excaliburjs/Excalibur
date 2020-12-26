declare module '*.md';

interface Story {
  (): Element;
  story?: {
    decorators?: any;
    parameters?: any;
  };
}
