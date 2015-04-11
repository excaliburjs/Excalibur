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
      //TODO
      expect(true).toBe(false);
   });

   it('will not remove a node when removing an element, if that node contains other elements', () => {
      //TODO
      expect(true).toBe(false);
   });

   it('will remove a node when removing an element, when that node is empty', () => {
      //TODO
      expect(true).toBe(false);
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
      //TODO
      expect(true).toBe(false);
   });

   it('can return all of the elements at a specified key value', () => {
      //TODO
      expect(true).toBe(false);
   });

});