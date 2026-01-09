import * as ex from '@excalibur';

describe('A Future', () => {
  it('exists', () => {
    expect(ex.Future).toBeDefined();
  });

  it('it can be constructed', () => {
    const future = new ex.Future();

    expect(future).toBeDefined();
  });

  it('can be resolved', () =>
    new Promise<void>((done) => {
      const future = new ex.Future<void>();

      expect(future.isCompleted).toBe(false);

      future.promise.then(() => {
        expect(future.isCompleted).toBe(true);
        done();
      });
      future.resolve();
    }));

  it('can be resolved multiple times without error', () =>
    new Promise<void>((done) => {
      const future = new ex.Future<void>();

      expect(future.isCompleted).toBe(false);

      future.promise.then(() => {
        expect(future.isCompleted).toBe(true);
        done();
      });
      expect(() => {
        future.resolve();
        future.resolve();
        future.resolve();
        future.resolve();
      }).not.toThrow();
    }));

  it('can be rejected', () =>
    new Promise<void>((done) => {
      const future = new ex.Future<void>();

      expect(future.isCompleted).toBe(false);

      future.promise.catch((err) => {
        expect(err).toEqual(new Error('Some error'));
        expect(future.isCompleted).toBe(true);
        done();
      });
      future.reject(new Error('Some error'));
    }));

  it('can be rejected multiple times without error', () =>
    new Promise<void>((done) => {
      const future = new ex.Future<void>();

      expect(future.isCompleted).toBe(false);

      future.promise.catch(() => {
        expect(future.isCompleted).toBe(true);
        done();
      });
      expect(() => {
        future.reject(new Error('Some error'));
        future.reject(new Error('Some error'));
        future.reject(new Error('Some error'));
        future.reject(new Error('Some error'));
        future.reject(new Error('Some error'));
      }).not.toThrow();
    }));
});
