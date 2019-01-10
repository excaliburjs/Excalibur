import * as ex from '../../build/dist/excalibur';

describe('A collection', () => {
  var collection;
  beforeEach(() => {
    collection = new ex.Util.Collection<number>(4);
  });

  it('should be loaded', () => {
    expect(ex.Util.Collection).toBeTruthy();
  });

  it('can have items pushed onto it', () => {
    collection.push(1);
    expect(collection.count()).toBe(1);
    collection.push(1);
    expect(collection.count()).toBe(2);
    collection.push(1);
    expect(collection.count()).toBe(3);
  });

  it('can resize when more items are a added than the internal array', () => {
    expect(collection.internalSize()).toBe(4);
    for (var i = 0; i < 5; i++) {
      collection.push(1);
    }
    expect(collection.internalSize()).toBe(8);
    for (var j = 0; j < 8; j++) {
      collection.push(1);
    }
    expect(collection.internalSize()).toBe(16);
  });

  it('can have items removed from it', () => {
    collection.push(4);
    expect(collection.count()).toBe(1);
    expect(collection.pop()).toBe(4);
    expect(collection.count()).toBe(0);
  });

  it('does not resize when too many items are removed', () => {
    expect(collection.count()).toBe(0);
    expect(collection.internalSize()).toBe(4);
    expect(collection.pop()).toBeFalsy();
    expect(collection.pop()).toBeFalsy();
    expect(collection.count()).toBe(0);
    expect(collection.internalSize()).toBe(4);
  });

  it('can have items shifted off of the front', () => {
    collection.push(42);
    collection.push(100);
    expect(collection.count()).toBe(2);
    var fortyTwo = collection.remove(0);
    expect(fortyTwo).toBe(42);
    expect(collection.count()).toBe(1);
    var oneHundred = collection.remove(0);
    expect(oneHundred).toBe(100);
    expect(collection.count()).toBe(0);
  });

  it('can have elements accessed at an index', () => {
    for (var i = 0; i < 20; i++) {
      collection.push(i);
      //console.log(collection.elementAt(i));
      expect(collection.count()).toBe(i + 1);
      expect(collection.elementAt(i)).toBe(i);
    }

    expect(collection.count()).toBe(20);
    expect(() => collection.elementAt(20)).toThrowError('Invalid index 20');
  });

  it('can have elements removed at an index', () => {
    for (var i = 0; i < 20; i++) {
      collection.push(i);
    }
    expect(collection.elementAt(7)).toBe(7);
    expect(collection.remove(7)).toBe(7);
    expect(collection.count()).toBe(19);
    expect(collection.elementAt(7)).toBe(8);
  });

  it('can have the first instance of a value removed', () => {
    var collection = new ex.Util.Collection<string>();
    for (var i = 0; i < 20; i++) {
      collection.push(i.toString());
    }
    expect(collection.elementAt(7)).toBe('7');
    collection.removeElement('7');
    expect(collection.elementAt(7)).toBe('8');
    expect(collection.count()).toBe(19);
  });

  it('can have elements interted into it', () => {
    for (var i = 0; i < 20; i++) {
      collection.push(i);
    }
    expect(collection.elementAt(7)).toBe(7);
    expect(collection.count()).toBe(20);
    collection.insert(7, 21);
    expect(collection.elementAt(7)).toBe(21);
    expect(collection.count()).toBe(20);
  });

  it('can be cleared of all elements', () => {
    for (var i = 0; i < 20; i++) {
      collection.push(i);
    }
    expect(collection.count()).toBe(20);
    collection.clear();
    expect(collection.count()).toBe(0);
  });

  it('can be converted into an array', () => {
    for (var i = 0; i < 20; i++) {
      collection.push(i);
    }
    expect(collection.toArray().length).toBe(20);
  });

  it('has a forEach functionality', () => {
    for (var i = 0; i < 4; i++) {
      collection.push(i);
    }
    var sum = 0;
    collection.forEach(function(element: number, index: number) {
      sum += element;
    });

    expect(sum).toBe(6);
  });

  it('has a map functionality', () => {
    for (var i = 0; i < 4; i++) {
      collection.push(i);
    }
    collection.map(function(element: number, index: number) {
      return element * 2;
    });

    collection.forEach(function(element: number, index: number) {
      expect(element).toBe(index * 2);
    });
  });
});
