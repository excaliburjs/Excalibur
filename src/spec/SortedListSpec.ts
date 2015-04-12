/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../engine/Engine.ts" />
/// <reference path="../engine/Util/SortedList.ts" />

describe('A SortedList', () => {

   var sortedList;

   beforeEach(() => {
      sortedList = new ex.SortedList(ex.MockedElement.prototype.getTheKey);
   });

   it('should be loaded', () => {
      expect(ex.SortedList).toBeTruthy();
   });

   it('can have an element added to it at a non-existant node', () => {
      var element = new ex.MockedElement(0);
      expect(sortedList.add(element)).toBe(true);
      expect(sortedList.find(element)).toBe(true);
   });

   it('can have an element added to it at an existing node', () => {
      var element1 = new ex.MockedElement(4);
      var element2 = new ex.MockedElement(4);
      expect(sortedList.add(element1)).toBe(true);
      expect(sortedList.add(element2)).toBe(true);
      expect(sortedList.find(element2)).toBe(true);
   });

   it('will indicate when an element is not present', () => {
      var element1 = new ex.MockedElement(0);
      expect(sortedList.find(element1)).toBe(false);

      sortedList.add(element1);
      var element2 = new ex.MockedElement(0);
      expect(sortedList.find(element2)).toBe(false);
   });

   it('can have an element removed from it', () => {
      var element = new ex.MockedElement(0);
      sortedList.add(element);
      expect(sortedList.find(element)).toBe(true);
      sortedList.remove(element);
      expect(sortedList.find(element)).toBe(false);
   });

   it('will maintain the tree when removing an intermediate node', () => {
      var element1 = new ex.MockedElement(1);

      var element2 = new ex.MockedElement(2);
      var element2a = new ex.MockedElement(2);

      var element3 = new ex.MockedElement(3);

      var element4 = new ex.MockedElement(4);
      var element4a = new ex.MockedElement(4);
      var element4b = new ex.MockedElement(4);
      var element4c = new ex.MockedElement(4);

      var element5 = new ex.MockedElement(5);

      //scenario 1
      sortedList.add(element1);
      sortedList.add(element2);
      sortedList.add(element3);

      sortedList.remove(element2);
      expect(sortedList.find(element1)).toBe(true);
      expect(sortedList.find(element3)).toBe(true);

      //scenario 2
      sortedList = new ex.SortedList(ex.MockedElement.prototype.getTheKey);
      sortedList.add(element1);
      sortedList.add(element3);
      sortedList.add(element2);
      sortedList.add(element4);

      sortedList.add(element2a);
      sortedList.add(element4a);
      sortedList.add(element4b);
      sortedList.add(element4c);

      sortedList.add(element5);

      sortedList.remove(element3);
      expect(sortedList.find(element2)).toBe(true);
      sortedList.list();
      expect(sortedList.find(element3)).toBe(false);
      expect(sortedList.find(element4)).toBe(true);
      expect(sortedList.find(element5)).toBe(true);
   });

   it('can return an ordered list of the elements it contains', () => {
      var element4 = new ex.MockedElement(4);
      var element5 = new ex.MockedElement(5);
      var element23 = new ex.MockedElement(23);
      var element7 = new ex.MockedElement(7);
      var element2 = new ex.MockedElement(2);

      expect(sortedList.add(element4)).toBe(true);
      expect(sortedList.add(element5)).toBe(true);
      expect(sortedList.add(element23)).toBe(true);
      expect(sortedList.add(element7)).toBe(true);
      expect(sortedList.add(element2)).toBe(true);

      var results = sortedList.list();

      expect(results.length).toBe(5);

      expect(results[0]).toBe(element2);
      expect(results[1]).toBe(element4);
      expect(results[2]).toBe(element5);
      expect(results[3]).toBe(element7);
      expect(results[4]).toBe(element23);
   });

   it('can return all of the elements at a specified key value', () => {
      var element1 = new ex.MockedElement(1);
      var element2 = new ex.MockedElement(2);
      var element3 = new ex.MockedElement(2);

      sortedList.add(element1);
      sortedList.add(element2);
      sortedList.add(element3);

      var results = sortedList.get(2);
      expect(results.length).toBe(2);
      expect(results[0]).toBe(element2);
      expect(results[1]).toBe(element3);

      var results = sortedList.get(1);
      expect(results[0]).toBe(element1);
   });

});