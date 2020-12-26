export interface Message<T> {
  type: string;
  data: T;
}

export interface Observer<T> {
  notify(message: T): void;
}

export type MaybeObserver<T> = Partial<Observer<T>>;

export class Observable<T> {
  public observers: Observer<T>[] = [];

  register(observer: Observer<T>) {
    this.observers.push(observer);
  }

  unregister(observer: Observer<T>) {
    const i = this.observers.indexOf(observer);
    if (i !== -1) {
      this.observers.splice(i, 1);
    }
  }

  notifyAll(message: T) {
    this.observers.forEach((o) => o.notify(message));
  }
}
