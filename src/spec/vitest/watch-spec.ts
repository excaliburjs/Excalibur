import { watch, watchAny, watchDeep } from '../../engine/util/watch';

describe('watch', () => {
  it('exists', () => {
    expect(watch).toBeDefined();
    expect(watchDeep).toBeDefined();
    expect(watchAny).toBeDefined();
  });

  describe('watch()', () => {
    it('fires the change callback when a property value changes', () => {
      const change = vi.fn();
      const proxy = watch({ x: 1 }, change);

      proxy.x = 2;

      expect(change).toHaveBeenCalledTimes(1);
      expect(proxy.x).toBe(2);
    });

    it('does not fire the change callback when set to the same value', () => {
      const change = vi.fn();
      const proxy = watch({ x: 1 }, change);

      proxy.x = 1;

      expect(change).not.toHaveBeenCalled();
    });

    it('does not fire the change callback for underscore-prefixed (private) properties', () => {
      const change = vi.fn();
      const proxy = watch({ _x: 1 } as any, change);

      (proxy as any)._x = 2;

      expect(change).not.toHaveBeenCalled();
      expect((proxy as any)._x).toBe(2);
    });

    it('returns the same value if it is already a proxy', () => {
      const change = vi.fn();
      const proxy = watch({ x: 1 }, change);
      const doubleProxy = watch(proxy, change);

      expect(doubleProxy).toBe(proxy);
    });

    it('returns falsy values unchanged', () => {
      const change = vi.fn();
      expect(watch(null as any, change)).toBe(null);
      expect(watch(undefined as any, change)).toBe(undefined);
    });
  });

  describe('watchAny()', () => {
    it('fires the change callback even when set to the same value', () => {
      const change = vi.fn();
      const proxy = watchAny({ x: 1 }, change);

      proxy.x = 1;

      expect(change).toHaveBeenCalledTimes(1);
    });

    it('does not fire the change callback for underscore-prefixed (private) properties', () => {
      const change = vi.fn();
      const proxy = watchAny({ _x: 1 } as any, change);

      (proxy as any)._x = 2;

      expect(change).not.toHaveBeenCalled();
    });

    it('returns the same value if it is already a proxy', () => {
      const change = vi.fn();
      const proxy = watchAny({ x: 1 }, change);
      const doubleProxy = watchAny(proxy, change);

      expect(doubleProxy).toBe(proxy);
    });

    it('returns falsy values unchanged', () => {
      const change = vi.fn();
      expect(watchAny(null as any, change)).toBe(null);
    });
  });

  describe('watchDeep()', () => {
    it('fires the change callback when a top level property changes', () => {
      const change = vi.fn();
      const proxy = watchDeep({ x: 1, nested: { y: 2 } }, change);

      proxy.x = 2;

      expect(change).toHaveBeenCalledTimes(1);
    });

    it('fires the change callback when a nested property changes', () => {
      const change = vi.fn();
      const proxy = watchDeep({ x: 1, nested: { y: 2 } }, change);

      proxy.nested.y = 3;

      expect(change).toHaveBeenCalledTimes(1);
      expect(proxy.nested.y).toBe(3);
    });

    it('does not fire the change callback for underscore-prefixed (private) properties', () => {
      const change = vi.fn();
      const proxy = watchDeep({ _x: 1 } as any, change);

      (proxy as any)._x = 2;

      expect(change).not.toHaveBeenCalled();
    });

    it('returns the same value if it is already a proxy', () => {
      const change = vi.fn();
      const proxy = watchDeep({ x: 1 }, change);
      const doubleProxy = watchDeep(proxy, change);

      expect(doubleProxy).toBe(proxy);
    });

    it('returns falsy values unchanged', () => {
      const change = vi.fn();
      expect(watchDeep(null as any, change)).toBe(null);
    });
  });
});
