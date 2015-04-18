
module ex {

   // NOTE: this implementation is not self-balancing
   export class SortedList<T> {

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
      public get(key: number): any[] {
         return this._get(this._root, key);
      }

      private _get(node: BinaryTreeNode, key: number) {
         if (node == null) {
            return [];
         } else if (key == node.getKey()) {
            return node.getData();
         } else if (key < node.getKey()) {
            return this._get(node.getLeft(), key);
         } else {
            return this._get(node.getRight(), key);
         }
      }

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
         if (node != null) {
            if (this._getComparable.call(element) == node.getKey()) {
               if (node.getData().indexOf(element) > -1) {
                  return false; // the element we're trying to insert already exists
               } else {
                  node.getData().push(element);
                  return true;
               }
            } else if (this._getComparable.call(element) < node.getKey()) {
               if (node.getLeft() == null) {
                  node.setLeft(new BinaryTreeNode(this._getComparable.call(element), [element], null, null));
                  return true;
               } else {
                  return this._insert(node.getLeft(), element);
               }
            } else {
               if (node.getRight() == null) {
                  node.setRight(new BinaryTreeNode(this._getComparable.call(element), [element], null, null));
                  return true;
               } else {
                  return this._insert(node.getRight(), element);
               }
            }
         }
         return false;
      }

      public remove(element: any): void {
         this._root = this._remove(this._root, element);
      }

      private _remove(node: BinaryTreeNode, element: any): BinaryTreeNode {
         if (node == null) {
            return null;
         } else if (this._getComparable.call(element) == node.getKey()) {
            var elementIndex = node.getData().indexOf(element);
            // if the node contains the element, remove the element
            if (elementIndex > -1) {
               node.getData().splice(elementIndex, 1);
               // if we have removed the last element at this node, remove the node
               if (node.getData().length == 0) {
                  // if the node is a leaf
                  if (node.getLeft() == null && node.getRight() == null) {
                     return null;
                  } else if (node.getLeft() == null) {
                     return node.getRight();
                  } else if (node.getRight() == null) {
                     return node.getLeft();
                  }
                  // if node has 2 children
                  var temp = this._findMinNode(node.getRight());
                  node.setKey(temp.getKey());
                  node.setData(temp.getData());
                  node.setRight(this._cleanup(node.getRight(), temp)); //"cleanup nodes" (move them up recursively)
                  return node;

               } else {
                  // this prevents the node from being removed since it still contains elements
                  return node;
               }
            }
         } else if (this._getComparable.call(element) < node.getKey()) {
            node.setLeft(this._remove(node.getLeft(), element));
            return node;
         } else {
            node.setRight(this._remove(node.getRight(), element));
            return node;
         }
      }

      // called once we have successfully removed the element we wanted, recursively corrects the part of the tree below the removed node
      private _cleanup(node: BinaryTreeNode, element: BinaryTreeNode): BinaryTreeNode {
         var comparable = element.getKey();
         if (node == null) {
            return null;
         } else if (comparable == node.getKey()) {
            // if the node is a leaf
            if (node.getLeft() == null && node.getRight() == null) {
               return null;
            } else if (node.getLeft() == null) {
               return node.getRight();
            } else if (node.getRight() == null) {
               return node.getLeft();
            }
            // if node has 2 children
            var temp = this._findMinNode(node.getRight());
            node.setKey(temp.getKey());
            node.setData(temp.getData());

            node.setRight(this._cleanup(node.getRight(), temp));
            return node;
         } else if (this._getComparable.call(element) < node.getKey()) {
            node.setLeft(this._cleanup(node.getLeft(), element));
            return node;
         } else {
            node.setRight(this._cleanup(node.getRight(), element));
            return node;
         }
      }

      private _findMinNode(node: BinaryTreeNode): BinaryTreeNode {
         var current = node;
         while (current.getLeft() != null) {
            current = current.getLeft();
         }
         return current;
      }

      public list(): Array<T> {
         var results = new Array<any>();
         this._list(this._root, results);
         return results;
      }

      private _list(treeNode: BinaryTreeNode, results: Array<T>): void {
         if (treeNode != null) {
            this._list(treeNode.getLeft(), results);
            treeNode.getData().forEach(function (element) {
               results.push(element);
            });
            this._list(treeNode.getRight(), results);
         }
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