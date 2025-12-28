import * as ex from '@excalibur';

describe('A Semaphore', () => {
  it('should exist', () => {
    expect(ex.Semaphore).toBeDefined();
  });

  it('can be constructed with a count', () => {
    const semaphore = new ex.Semaphore(10);
    expect(semaphore.count).toBe(10);
  });

  it('a trivial exit does not decrement semaphor', () => {
    const semaphore = new ex.Semaphore(10);
    for (let i = 0; i < 20; i++) {
      semaphore.enter();
    }
    expect(semaphore.waiting).toBe(10);
    expect(semaphore.count).toBe(0);
    semaphore.exit(0);
    expect(semaphore.waiting).toBe(10);
    expect(semaphore.count).toBe(0);
  });

  it('can limit async calls', () => {
    const semaphore = new ex.Semaphore(10);
    for (let i = 0; i < 20; i++) {
      semaphore.enter();
    }
    expect(semaphore.waiting).toBe(10);
    semaphore.exit();
    semaphore.exit();
    semaphore.exit();
    expect(semaphore.waiting).toBe(7);
  });

  it('can block async calls', () =>
    new Promise<void>((done) => {
      const mockFuture1 = new ex.Future<void>();
      const mockMethod1 = () => {
        return mockFuture1.promise;
      };

      const mockFuture2 = new ex.Future<void>();
      const mockMethod2 = () => {
        return mockFuture2.promise;
      };
      const semaphore = new ex.Semaphore(1);

      const spy1 = vi.fn();
      const spy2 = vi.fn();

      semaphore
        .enter()
        .then(() => {
          expect(semaphore.count).toBe(0);
          expect(semaphore.waiting).toBe(0);
          mockMethod1().then(() => {
            spy1();
            semaphore.exit();
          });
          const final = semaphore.enter().then(() => {
            mockMethod2().then(() => {
              spy2();
              semaphore.exit();
            });
          });
          expect(semaphore.count).toBe(0);
          expect(semaphore.waiting).toBe(1);
          return final;
        })
        .finally(() => {
          expect(spy1).toHaveBeenCalled();
          expect(spy2).toHaveBeenCalled();
          expect(spy1).toHaveBeenCalledBefore(spy2);
          done();
        });

      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();

      mockFuture1.resolve();
      mockFuture2.resolve();
    }));
});
