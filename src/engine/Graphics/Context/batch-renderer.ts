export abstract class BatchRenderer<T> {
  abstract updateVertex(command: T): void;
}
