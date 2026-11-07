import { createContext, useContext } from '../../engine/context';

describe('A Context', () => {
  it('creates a context', () => {
    expect(createContext()).toBeDefined();
  });

  describe('useContext', () => {
    it('returns undefined outside of scope', () => {
      const ctx = createContext();
      expect(useContext(ctx)).toBeUndefined();
    });

    it('returns scoped value', () => {
      const ctx = createContext();
      ctx.scope('value', () => {
        expect(useContext(ctx)).toBe('value');
      });
    });

    it('returns scoped value in sequential scopes', () => {
      const ctx = createContext();
      ctx.scope('value', () => {
        expect(useContext(ctx)).toBe('value');
      });
      ctx.scope('value2', () => {
        expect(useContext(ctx)).toBe('value2');
      });
    });

    it('returns scoped value in nested scopes', () => {
      const ctx = createContext();
      ctx.scope('value', () => {
        expect(useContext(ctx)).toBe('value');
        ctx.scope('value2', () => {
          expect(useContext(ctx)).toBe('value2');
        });
      });
    });

    it('persists value reference after a nested context', () => {
      const ctx = createContext();
      ctx.scope([], () => {
        const value = useContext(ctx);
        expect(value).toEqual([]);
        ctx.scope([1], () => null);
        expect(value).toEqual([]);
      });
    });

    it('returns value in an async callback', async () => {
      const ctx = createContext();
      await ctx.scope('value', async () => {
        const value = useContext(ctx);
        await Promise.resolve();
        expect(value).toBe('value');
      });
    });

    it('returns the value after an await in an async callback', async () => {
      const ctx = createContext();
      await ctx.scope('value', async () => {
        await Promise.resolve();
        expect(useContext(ctx)).toBe('value');
        await new Promise((resolve) => setTimeout(resolve, 5));
        expect(useContext(ctx)).toBe('value');
      });
    });

    it('is undefined again after an async scope resolves', async () => {
      const ctx = createContext();
      await ctx.scope('value', async () => {
        await Promise.resolve();
      });
      expect(useContext(ctx)).toBeUndefined();
    });

    it('is undefined again after an async scope rejects', async () => {
      const ctx = createContext();
      await expect(
        ctx.scope('value', async () => {
          await Promise.resolve();
          throw new Error('boom');
        })
      ).rejects.toThrow('boom');
      expect(useContext(ctx)).toBeUndefined();
    });

    it('is restored after a sync scope throws', () => {
      const ctx = createContext();
      expect(() =>
        ctx.scope('value', () => {
          throw new Error('boom');
        })
      ).toThrow('boom');
      expect(useContext(ctx)).toBeUndefined();
    });

    it('sync scopes take precedence over pending async scopes', async () => {
      const ctx = createContext();
      const outer = ctx.scope('async', async () => {
        await Promise.resolve();
        ctx.scope('sync', () => {
          expect(useContext(ctx)).toBe('sync');
        });
        expect(useContext(ctx)).toBe('async');
      });
      await outer;
    });

    it('does not clobber other scopes when an async scope settles', async () => {
      const ctx = createContext();
      let release!: () => void;
      const gate = new Promise<void>((resolve) => (release = resolve));
      const slow = ctx.scope('slow', async () => {
        await gate;
      });
      const fast = ctx.scope('fast', async () => {
        await Promise.resolve();
      });
      await fast;
      // 'slow' is still pending, its value must still be visible
      expect(useContext(ctx)).toBe('slow');
      release();
      await slow;
      expect(useContext(ctx)).toBeUndefined();
    });
  });
});
