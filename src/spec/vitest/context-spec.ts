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
  });
});
