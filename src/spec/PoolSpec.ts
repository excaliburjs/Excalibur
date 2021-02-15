import * as ex from '@excalibur';

class MockPoolable implements ex.Poolable {
  _pool = null;
  constructor(public recycled: boolean = false) {}
  dispose() {
    this.recycled = true;
    return this;
  }
}

describe('An object Pool', () => {

  it('should exist', () => {
    expect(ex.Pool).toBeDefined();
  });

  it('can be constructed', () => {
    const pool = new ex.Pool<MockPoolable>(() => new MockPoolable(), (m) => m.dispose(), 10);
    expect(pool).toBeDefined();
  });

  it('can get instances up to the maximum', () => {
    const pool = new ex.Pool<MockPoolable>(() => new MockPoolable(), (m) => m.dispose(), 10);
    for (let i = 0; i < 10; i++) {
      const instance = pool.get();
    }
    expect(pool.totalAllocations).toBe(10);
    expect(() => {
      pool.get();
    }).toThrow();
  });

  it('can get instances and return them to get recycled', () => {
    const recycler = jasmine.createSpy().and.callFake((m) => m.dispose());
    const pool = new ex.Pool<MockPoolable>(() => new MockPoolable(), recycler, 10);
    const intances: MockPoolable[] = [];
    for (let i = 0; i < 10; i++) {
      const instance = pool.get();
      intances.push(instance);
    }
    expect(pool.index).toBe(10);
    pool.done();

    expect(pool.index).toBe(0);
    for (let i = 0; i < 10; i++) {
      const instance = pool.get();
      expect(instance.recycled).toBeTrue();
    }

    expect(recycler).toHaveBeenCalledTimes(10);
  });

  it('can borrow a single instance temporarily', () => {
    const pool = new ex.Pool<MockPoolable>(() => new MockPoolable(), (m) => m.dispose(), 10);
    pool.get();
    pool.borrow(instance => {
      expect(instance).toBeDefined();
      expect(pool.index).toBe(2);
    });
    expect(pool.index).toBe(1);
  });

  it('can be used in a using which are then reclaimed', () => {
    const pool = new ex.Pool<MockPoolable>(() => new MockPoolable(), (m) => m.dispose(), 10);
    for (let i = 0; i < 10; i++) {
      pool.using(pool => {
        for (let i = 0; i < 10; i++) {
          pool.get();
        }
      });
    }
    expect(pool.index).toBe(0);
    expect(pool.totalAllocations).toBe(10);
  });

  it('can have instances unhooked from the pool', () => {
    const pool = new ex.Pool<MockPoolable>(() => new MockPoolable(), (m) => m.dispose(), 10);
    const is = pool.using(pool => {
      const instances = [];
      for (let i = 0; i < 10; i++) {
        const i = pool.get();
        expect(i._pool).toBe(pool);
        instances.push(i);
      }
      return instances;
    });

    for (let i = 0; i < 10; i++) {
      expect(is[i]._pool).toBe(undefined);
    }
  });
});