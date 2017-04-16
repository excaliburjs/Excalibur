/// <reference path="jasmine.d.ts" />

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

   it('can clamp a number to a maximum and minimum', () => {
      expect(ex.Util.clamp(0, 10, 20)).toBe(10);
      expect(ex.Util.clamp(15, 10, 20)).toBe(15);
      expect(ex.Util.clamp(30, 10, 20)).toBe(20);
      expect(ex.Util.clamp(-Infinity, 0, 1)).toBe(0);
      expect(ex.Util.clamp(Infinity, 0, 1)).toBe(1);
      expect(ex.Util.clamp(12, -Infinity, Infinity)).toBe(12);
      expect(ex.Util.clamp(12, -Infinity, 100)).toBe(12);
      expect(ex.Util.clamp(12, -100, Infinity)).toBe(12);
   });
});