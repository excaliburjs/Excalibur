
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
         return this._find(this._root, element);
      }

      private _find(node: BinaryTreeNode, element: any): boolean {
         if (node == null) {
            return false;
         } else if (this._getComparable.call(element) == node.getKey()) {
            if (node.getData().indexOf(element) > -1) {
               return true;
            } else {
               return false;
            }
         } else if (this._getComparable.call(element) < node.getKey()) {
            return this._find(node.getLeft(), element);
         } else {
            return this._find(node.getRight(), element);
         }
      }

      // returns the array of elements at a specific key value
      //public get(key: number): any[] {
      //   //TODO
      //}

      public add(element: any): boolean {
         if (this._root == null) {
            this._root = new BinaryTreeNode(this._getComparable.call(element), [element], null, null);
            return true;
         } else {
            return this._insert(this._root, element);
         }
         return false;
      }

      private _insert(node: BinaryTreeNode, element: any): boolean {
         console.log("preparing to add element: " + this._getComparable.call(element));
         if (node != null) {
            if (this._getComparable.call(element) == node.getKey()) {
               if (node.getData().indexOf(element) > -1) {
                  return false; // duplicate element
               } else {
                  console.log("adding element: " + this._getComparable.call(element));
                  node.getData().push(element);
                  return true;
               }
            } else if (this._getComparable.call(element) < node.getKey()) {
               if (node.getLeft() == null) {
                  console.log("adding element " + this._getComparable.call(element) + " as left child of " + node.getKey());
                  node.setLeft(new BinaryTreeNode(this._getComparable.call(element), [element], null, null));
                  return true;
               } else {
                  console.log("traversing left");
                  return this._insert(node.getLeft(), element);
               }
            } else {
               if (node.getRight() == null) {
                  console.log("adding element " + this._getComparable.call(element) + " as right child of " + node.getKey());
                  node.setRight(new BinaryTreeNode(this._getComparable.call(element), [element], null, null));
                  return true;
               } else {
                  console.log("traversing right");
                  return this._insert(node.getRight(), element);
               }
            }
         }
         return false;
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

   export class MockedElement {
      private _key: number = 0;

      constructor(key: number) {
         this._key = key;
      }

      public getTheKey() {
         return this._key;
      }

      public setKey(key: number) {
         this._key = key;
      }
   }

} 