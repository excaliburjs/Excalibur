import * as ex from '@excalibur';
import { watchDeep } from '../../engine/util/watch';

describe('Utility functions', () => {
  it('can watch deep', () => {
    const deepObject = {
      top: {
        oneLevel: {
          twoLevel: {
            value: true
          }
        }
      }
    };

    const changed = vi.fn();
    const watched = watchDeep(deepObject, changed);
    watched.top.oneLevel.twoLevel.value = false;

    expect(changed).toHaveBeenCalledWith(deepObject);
    expect(watched.top.oneLevel.twoLevel.value).toEqual(false);
    expect(deepObject.top.oneLevel.twoLevel.value).toEqual(false);
  });

  it('can clamp a number to a maximum and minimum', () => {
    expect(ex.clamp(0, 10, 20)).toBe(10);
    expect(ex.clamp(15, 10, 20)).toBe(15);
    expect(ex.clamp(30, 10, 20)).toBe(20);
    expect(ex.clamp(-Infinity, 0, 1)).toBe(0);
    expect(ex.clamp(Infinity, 0, 1)).toBe(1);
    expect(ex.clamp(12, -Infinity, Infinity)).toBe(12);
    expect(ex.clamp(12, -Infinity, 100)).toBe(12);
    expect(ex.clamp(12, -100, Infinity)).toBe(12);
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
});
