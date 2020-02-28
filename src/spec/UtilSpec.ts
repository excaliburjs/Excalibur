import * as ex from '@excalibur';

fdescribe('Utility functions', () => {
  it('can determine the opposite side', () => {
    expect(ex.Util.getOppositeSide(ex.Side.Left)).toBe(ex.Side.Right);
    expect(ex.Util.getOppositeSide(ex.Side.Right)).toBe(ex.Side.Left);
    expect(ex.Util.getOppositeSide(ex.Side.Bottom)).toBe(ex.Side.Top);
    expect(ex.Util.getOppositeSide(ex.Side.Top)).toBe(ex.Side.Bottom);
  });

  it('can determine the side from a vector', () => {
    expect(ex.Util.getSideFromDirection(ex.Vector.Left)).toBe(ex.Side.Left);
    expect(ex.Util.getSideFromDirection(ex.Vector.Right)).toBe(ex.Side.Right);
    expect(ex.Util.getSideFromDirection(ex.Vector.Up)).toBe(ex.Side.Top);
    expect(ex.Util.getSideFromDirection(ex.Vector.Down)).toBe(ex.Side.Bottom);
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

  describe('removeItemFromArray function', () => {
    it('should be a function', () => {
      expect(typeof ex.Util.removeItemFromArray).toBe('function');
    });

    it('should return true when successfully removing an item', () => {
      const arrayToRemove = ['Stark', 'Lannister', 'Targaryen'];
      expect(ex.Util.removeItemFromArray('Lannister', arrayToRemove)).toBe(true);
      expect(arrayToRemove.length).toBe(2);
    });

    it('should return false when item to delete is not present', () => {
      const arrayToRemove = ['Godfrey', 'Crizzo', 'Fullstack'];
      expect(ex.Util.removeItemFromArray('Lannister', arrayToRemove)).toBe(false);
    });
  });

  describe('nullish', () => {
    it('should return the default if null or undefined', () => {
      const defaultNull = ex.Util.nullish(null, 1);
      const defaultUndefined = ex.Util.nullish(undefined, 2);
      expect(defaultNull).toBe(1);
      expect(defaultUndefined).toBe(2);
    });

    it('should return a value if not null or undefined', () => {
      const value = ex.Util.nullish('value', 'otherValue');
      expect(value).toBe('value');
    });
  });

  describe('extend', () => {
    it('should merge simple objects', () => {
      const obj1 = { foo: true };
      const obj2 = { bar: true };
      expect(ex.Util.extend({}, obj1, obj2)).toEqual({
        ...obj1,
        ...obj2
      });
    });

    it('should merge deep complex objects', () => {
      const obj1 = { foo: true, deep: { switch: false, donotswitch: true } };
      const obj2 = { bar: true, deep: { switch: true } };
      expect(ex.Util.extend({}, obj1, obj2)).toEqual({
        foo: true,
        bar: true,
        deep: {
          switch: true,
          donotswitch: true
        }
      });
    });
  });
});
