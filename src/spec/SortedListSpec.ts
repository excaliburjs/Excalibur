/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../engine/Engine.ts" />
/// <reference path="../engine/Util/SortedList.ts" />

describe('A SortedList', () => {

   var sortedList;

   beforeEach(() => {
      sortedList = new ex.SortedList(ex.MockedElement.prototype.getTheKey);
      console.log('=============');
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
      //TODO
      expect(true).toBe(false);
   });

   it('will update its internal list every time an element is added or removed', () => {
      //TODO
      expect(true).toBe(false);
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

      var stuff = sortedList.list();

      expect(stuff.length).toBe(5);

      expect(stuff[0]).toBe(element2);
      expect(stuff[1]).toBe(element4);
      expect(stuff[2]).toBe(element5);
      expect(stuff[3]).toBe(element7);
      expect(stuff[4]).toBe(element23);
   });

   it('can return all of the elements at a specified key value', () => {
      //TODO
      expect(true).toBe(false);
   });

});