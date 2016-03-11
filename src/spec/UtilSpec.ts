/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('Utility functions', () => {
   it('can determine the opposite side', () => {
      expect(ex.Util.getOppositeSide(ex.Side.Left)).toBe(ex.Side.Right);
      expect(ex.Util.getOppositeSide(ex.Side.Right)).toBe(ex.Side.Left);
      expect(ex.Util.getOppositeSide(ex.Side.Bottom)).toBe(ex.Side.Top);
      expect(ex.Util.getOppositeSide(ex.Side.Top)).toBe(ex.Side.Bottom);
   });
   
   it('can determine the side from a vector', () => {
      expect(ex.Util.getSideFromVector(ex.Vector.Left)).toBe(ex.Side.Left);
      expect(ex.Util.getSideFromVector(ex.Vector.Right)).toBe(ex.Side.Right);
      expect(ex.Util.getSideFromVector(ex.Vector.Up)).toBe(ex.Side.Top);
      expect(ex.Util.getSideFromVector(ex.Vector.Down)).toBe(ex.Side.Bottom);
   });
});