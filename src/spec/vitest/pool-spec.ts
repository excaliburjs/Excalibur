import * as ex from '@excalibur';

class MockPoolable {
  constructor(public recycled: boolean = false) {}
  dispose() {
    this.recycled = true;
    return this;
  }
}

class MockEnemy {
  constructor(
    public kind: string = 'basic',
    public speed: number = 1
  ) {}
  reset(kind: string = 'basic', speed: number = 1) {
    this.kind = kind;
    this.speed = speed;
    return this;
  }
}

describe('An object Pool', () => {
  it('should exist', () => {
    expect(ex.ArenaPool).toBeDefined();
  });

  it('can be constructed', () => {
    const pool = new ex.ArenaPool<MockPoolable>(
      () => new MockPoolable(),
      (m) => m.dispose(),
      10
    );
    expect(pool).toBeDefined();
  });

  it('can get instances up to the maximum', () => {
    const pool = new ex.ArenaPool<MockPoolable>(
      () => new MockPoolable(),
      (m) => m.dispose(),
      10
    );
    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warn');
    for (let i = 0; i < 10; i++) {
      pool.get();
    }

    expect(pool.totalAllocations).toBe(10);
    expect(logger.warn).not.toHaveBeenCalled();
    pool.get();
    expect(logger.warn).toHaveBeenCalledExactlyOnceWith('Max pooled objects reached, possible memory leak? Doubling');
  });

  it('can get instances and return them to get recycled', () => {
    const recycler = vi.fn((m) => m.dispose());
    const pool = new ex.ArenaPool<MockPoolable>(() => new MockPoolable(), recycler, 10);
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
      expect(instance.recycled).toBe(true);
    }

    expect(recycler).toHaveBeenCalledTimes(10);
  });

  it('can borrow a single instance temporarily', () => {
    const pool = new ex.ArenaPool<MockPoolable>(
      () => new MockPoolable(),
      (m) => m.dispose(),
      10
    );
    pool.get();
    pool.borrow((instance) => {
      expect(instance).toBeDefined();
      expect(pool.index).toBe(2);
    });
    expect(pool.index).toBe(1);
  });

  it('can be used in a using which are then reclaimed', () => {
    const pool = new ex.ArenaPool<MockPoolable>(
      () => new MockPoolable(),
      (m) => m.dispose(),
      10
    );
    for (let i = 0; i < 10; i++) {
      pool.using((pool) => {
        for (let i = 0; i < 10; i++) {
          pool.get();
        }
      });
    }
    expect(pool.index).toBe(0);
    expect(pool.totalAllocations).toBe(10);
  });

  it('can have instances unhooked from the pool', () => {
    const pool = new ex.ArenaPool<MockPoolable>(
      () => new MockPoolable(),
      (m) => m.dispose(),
      10
    );
    const is = pool.using((pool) => {
      const instances = [];
      for (let i = 0; i < 10; i++) {
        const i = pool.get();
        expect(pool.objects.indexOf(i)).not.toBe(-1);
        instances.push(i);
      }
      return instances;
    });

    for (let i = 0; i < 10; i++) {
      expect(pool.objects.indexOf(is[i])).toBe(-1);
    }
  });

  it('can get instances built with arguments', () => {
    const builder = vi.fn((kind: string = 'basic', speed: number = 1) => new MockEnemy(kind, speed));
    const pool = new ex.ArenaPool(builder, undefined, 10);

    const rocket = pool.getWith('rocket', 3);

    expect(rocket.kind).toBe('rocket');
    expect(rocket.speed).toBe(3);
    expect(builder).toHaveBeenCalledExactlyOnceWith('rocket', 3);
    expect(pool.totalAllocations).toBe(1);
    expect(pool.index).toBe(1);
  });

  it('passes getWith arguments to the recycler when an instance is reused', () => {
    const builder = vi.fn((kind: string = 'basic', speed: number = 1) => new MockEnemy(kind, speed));
    const recycler = vi.fn((enemy: MockEnemy, kind?: string, speed?: number) => enemy.reset(kind, speed));
    const pool = new ex.ArenaPool(builder, recycler, 10);

    const rocket = pool.getWith('rocket', 3);
    pool.done();
    const saucer = pool.getWith('saucer', 5);

    expect(saucer).toBe(rocket);
    expect(saucer.kind).toBe('saucer');
    expect(saucer.speed).toBe(5);
    expect(builder).toHaveBeenCalledTimes(1);
    expect(recycler).toHaveBeenCalledExactlyOnceWith(rocket, 'saucer', 5);
    expect(pool.totalAllocations).toBe(1);
  });

  it('returns a reused instance as it was from getWith when there is no recycler', () => {
    const pool = new ex.ArenaPool((kind: string = 'basic') => new MockEnemy(kind), undefined, 10);

    const rocket = pool.getWith('rocket');
    pool.done();
    const reused = pool.getWith('saucer');

    expect(reused).toBe(rocket);
    expect(reused.kind).toBe('rocket');
  });

  it('can mix get and getWith on the same pool', () => {
    const pool = new ex.ArenaPool(
      (kind: string = 'basic', speed: number = 1) => new MockEnemy(kind, speed),
      (enemy, kind, speed) => enemy.reset(kind, speed),
      10
    );

    expect(pool.get().kind).toBe('basic');
    expect(pool.getWith('rocket', 3).kind).toBe('rocket');
    pool.done();
    expect(pool.getWith('saucer').kind).toBe('saucer');
    expect(pool.get().kind).toBe('basic');
    expect(pool.totalAllocations).toBe(2);
  });

  it('warns and doubles when getWith goes past the maximum', () => {
    const pool = new ex.ArenaPool((kind: string = 'basic') => new MockEnemy(kind), undefined, 2);
    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warn');

    pool.getWith('rocket');
    pool.getWith('rocket');
    expect(logger.warn).not.toHaveBeenCalled();
    pool.getWith('rocket');

    expect(logger.warn).toHaveBeenCalledExactlyOnceWith('Max pooled objects reached, possible memory leak? Doubling');
    expect(pool.maxObjects).toBe(4);
    expect(pool.totalAllocations).toBe(3);
  });

  it('types getWith from the builder parameters', () => {
    const pool = new ex.ArenaPool((kind: string = 'basic', speed: number = 1) => new MockEnemy(kind, speed));
    expectTypeOf(pool.getWith).parameters.toEqualTypeOf<[kind?: string, speed?: number]>();
    expectTypeOf(pool.getWith).returns.toEqualTypeOf<MockEnemy>();

    const shortRecycler = new ex.ArenaPool(
      (kind: string = 'basic') => new MockEnemy(kind),
      (enemy) => enemy
    );
    expectTypeOf(shortRecycler.getWith).parameters.toEqualTypeOf<[kind?: string]>();

    const noArgs = new ex.ArenaPool<MockPoolable>(() => new MockPoolable());
    expectTypeOf(noArgs.getWith).parameters.toEqualTypeOf<[]>();

    // @ts-expect-error the builder decides the argument types
    pool.getWith(3);
    // @ts-expect-error get() and preallocate() build with no arguments, so builder parameters need defaults
    new ex.ArenaPool((kind: string) => new MockEnemy(kind));
    const recycleWithKind = (enemy: MockEnemy, kind: string) => enemy.reset(kind);
    // @ts-expect-error get() recycles with no arguments, so recycler parameters need to be optional
    new ex.ArenaPool((kind: string = 'basic') => new MockEnemy(kind), recycleWithKind);
  });
});
