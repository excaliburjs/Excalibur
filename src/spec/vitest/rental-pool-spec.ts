import { RentalPool } from '../../engine/util/rental-pool';

class MockObject {
  public value: number = 0;
  constructor(value = 0) {
    this.value = value;
  }
}

describe('A RentalPool', () => {
  it('should exist', () => {
    expect(RentalPool).toBeDefined();
  });

  it('can be constructed and pre-allocates', () => {
    const pool = new RentalPool<MockObject>(
      () => new MockObject(),
      (m) => m,
      5
    );
    expect(pool._pool.length).toBe(5);
  });

  it('can rent and return objects', () => {
    const pool = new RentalPool<MockObject>(
      () => new MockObject(),
      (m) => m,
      2
    );
    const a = pool.rent();
    const b = pool.rent();
    expect(pool._pool.length).toBe(0);

    pool.return(a);
    pool.return(b);
    expect(pool._pool.length).toBe(2);
  });

  it('grows automatically when depleted', () => {
    const pool = new RentalPool<MockObject>(
      () => new MockObject(),
      (m) => m,
      2
    );
    pool.rent();
    pool.rent();
    expect(pool._pool.length).toBe(0);

    const c = pool.rent();
    expect(c).toBeDefined();
    expect(pool._pool.length).toBe(1);
  });

  it('guards against double-returns', () => {
    const pool = new RentalPool<MockObject>(
      () => new MockObject(),
      (m) => m,
      3
    );
    const a = pool.rent();
    const initialLength = pool._pool.length;

    pool.return(a);
    expect(pool._pool.length).toBe(initialLength + 1);

    // Double return should be ignored
    pool.return(a);
    expect(pool._pool.length).toBe(initialLength + 1);
  });

  it('clears the double-return guard when an object is re-rented', () => {
    const pool = new RentalPool<MockObject>(
      () => new MockObject(),
      (m) => m,
      2
    );
    const a = pool.rent();
    const b = pool.rent();

    pool.return(a);
    pool.return(b);
    const lengthAfterReturns = pool._pool.length;

    // Rent both again (LIFO order means we get them reversed)
    const first = pool.rent();
    const second = pool.rent();

    // Both should be the original objects (just in different order due to LIFO)
    expect([first, second].sort((x, y) => x.value - y.value)).toStrictEqual([a, b].sort((x, y) => x.value - y.value));

    // Return both again - should work since guards were cleared on rent
    pool.return(first);
    pool.return(second);
    expect(pool._pool.length).toBe(lengthAfterReturns);
  });

  it('can use the clean option', () => {
    const cleaner = vi.fn((m: MockObject) => {
      m.value = 0;
      return m;
    });
    const pool = new RentalPool<MockObject>(() => new MockObject(42), cleaner, 1);

    const a = pool.rent(true);
    expect(cleaner).toHaveBeenCalled();
    expect(a.value).toBe(0);
  });
});
