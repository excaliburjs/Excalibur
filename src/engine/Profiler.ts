export interface ProfilerData {
  name: string,
  value: number,
  children: ProfilerData[];
}
// TODO use decorator!?
export class Profiler {
  static enabled = false;
  static data: ProfilerData = {
    name: 'root',
    value: performance.now(), // store the start time
    children: []
  };

  static stack: ProfilerData[] = [this.data];

  static init() {
    Profiler.enabled = true;
    Profiler.data = {
      name: 'root',
      value: performance.now(), // store the start time
      children: []
    };
    Profiler.stack = [Profiler.data];
  }

  static start(name: string) {
    if (!Profiler.enabled) return;
    // attach the frame to the parent
    const parent = Profiler.stack.at(-1);
    const frame: ProfilerData = {
      name,
      value: performance.now(),
      children: []
    }
    parent.children.push(frame);
    Profiler.stack.push(frame);
  }

  static end() {
    if (!this.enabled) return;
    const now = performance.now();
    if (Profiler.stack.length > 1) {
      const frame = Profiler.stack.pop();
      frame.value = now - frame.value; // store the total time
      // console.log(frame.value);
    } else {
      Profiler.stack[0].value = now - Profiler.stack[0].value;
    }
  }

  static collect() {
    while (Profiler.stack.length > 1) {
      Profiler.end();
    }
    Profiler.end();
    Profiler.enabled = false;
    return Profiler.data;
  }
}

export function profile() {
  return function (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor) {
    propertyDescriptor =
      propertyDescriptor ||
      Object.getOwnPropertyDescriptor(target, propertyKey);
    const scopename =
      (target instanceof Function
        ? `static ${target.name}`
        : target.constructor.name) + `::${propertyKey}`;
    const originalMethod = propertyDescriptor.value;
    propertyDescriptor.value = function (...args: unknown[]) {
      Profiler.start(scopename);
      try {
        const result = originalMethod.apply(this as any, args);
        return result;
      } catch (e) {
        throw e;
      } finally {
        Profiler.end();
      }
    }
    return propertyDescriptor;
  }
}