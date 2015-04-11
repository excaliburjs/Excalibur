
module ex {

   // NOTE: this implementation is not self-balancing
   export class SortedList<T> {

      private _sortedList = [];

      private _getComparable: Function;
      private _root: BinaryTreeNode;

      constructor(getComparable: () => any) {
         this._getComparable = getComparable;
      }

      public find(element: any): boolean {
         //TODO
      }

      // returns the array of elements at a specific key value
      public get(key: number): any[] {
         //TODO
      }

      public add(element: any): boolean {
         //TODO
      }

      public remove(element: any): void {
         //TODO
      }

      public list(): Array<any> {
         return this._sortedList;
      }

   }

   export class BinaryTreeNode {
      private _key: number;
      private _data: Array<any>;
      private _left: BinaryTreeNode;
      private _right: BinaryTreeNode;

      constructor(key: number, data: Array<any>, left: BinaryTreeNode, right: BinaryTreeNode) {
         this._key = key;
         this._data = data;
         this._left = left;
         this._right = right;
      }

      public getKey(): number {
         return this._key
      }

      public setKey(key: number) {
         this._key = key;
      }

      public getData(): Array<any> {
         return this._data;
      }

      public setData(data: any) {
         this._data = data;
      }

      public getLeft(): BinaryTreeNode {
         return this._left
      }

      public setLeft(left: BinaryTreeNode) {
         this._left = left;
      }

      public getRight(): BinaryTreeNode {
         return this._right;
      }

      public setRight(right: BinaryTreeNode) {
         this._right = right;
      }
   }

} 