/// <reference path="BoundingBox.ts"/>

module ex {
   export class TreeNode {
      public left: TreeNode;
      public right: TreeNode;
      public bounds: BoundingBox;
      public height: number;
      public body: Body;
      constructor(public parent?) {
         this.parent = parent || null;
         this.body = null;
         this.bounds = new BoundingBox();
         this.left = null;
         this.right = null;
         this.height = 0;
      }

      public isLeaf(): boolean {
         return (!this.left && !this.right);
      }
   }

   export class DynamicTree {

      public root: TreeNode;
      public nodes: {[key: number]: TreeNode};
      constructor() {
         this.root = null;
         this.nodes = {};
      }

      public insert(leaf: TreeNode): void {

         // If there are no nodes in the tree, make this the root leaf
         if (this.root === null) {
            this.root = leaf;
            this.root.parent = null;
            return;
         }

         // Search the tree for a node that is not a leaf and find the best place to insert
         var leafAABB = leaf.bounds;
         var currentRoot = this.root;
         while (!currentRoot.isLeaf()) {
            var left = currentRoot.left;
            var right = currentRoot.right;

            var area = currentRoot.bounds.getPerimeter();
            var combinedAABB = currentRoot.bounds.combine(leafAABB);
            var combinedArea = combinedAABB.getPerimeter();

            // Calculate cost heuristic for creating a new parent and leaf
            var cost = 2 * combinedArea;

            // Minimum cost of pushing the leaf down the tree
            var inheritanceCost = 2 * (combinedArea - area);

            // Cost of descending
            var leftCost = 0;
            var leftCombined = leafAABB.combine(left.bounds);
            var newArea;
            var oldArea;
            if (left.isLeaf()) {
               leftCost = leftCombined.getPerimeter() + inheritanceCost;
            } else {
               oldArea = left.bounds.getPerimeter();
               newArea = leftCombined.getPerimeter();
               leftCost = (newArea - oldArea) + inheritanceCost;
            }

            var rightCost = 0;
            var rightCombined = leafAABB.combine(right.bounds);
            if (right.isLeaf()) {
               rightCost = rightCombined.getPerimeter() + inheritanceCost;
            } else {
               oldArea = right.bounds.getPerimeter();
               newArea = rightCombined.getPerimeter();
               rightCost = (newArea - oldArea) + inheritanceCost;
            }

            // cost is acceptable
            if (cost < leftCost && cost < rightCost) {
               break;
            }

            // Descend to the depths
            if (leftCost < rightCost) {
               currentRoot = left;
            } else {
               currentRoot = right;
            }
         }

         // Create the new parent node and insert into the tree
         var oldParent = currentRoot.parent;
         var newParent = new TreeNode(oldParent);
         newParent.bounds = leafAABB.combine(currentRoot.bounds);
         newParent.height = currentRoot.height + 1;

         if (oldParent !== null) {
            // The sibling node was not the root
            if (oldParent.left === currentRoot) {
               oldParent.left = newParent;
            } else {
               oldParent.right = newParent;
            }

            newParent.left = currentRoot;
            newParent.right = leaf;

            currentRoot.parent = newParent;
            leaf.parent = newParent;
         } else {
            // The sibling node was the root
            newParent.left = currentRoot;
            newParent.right = leaf;

            currentRoot.parent = newParent;
            leaf.parent = newParent;
            this.root = newParent;
         }

         // Walk up the tree fixing heights and AABBs
         var currentNode = leaf.parent;
         while (currentNode) {
            currentNode = this.balance(currentNode);

            if (!currentNode.left) {
               throw new Error('Parent of current leaf cannot have a null left child' + currentNode);
            }
            if (!currentNode.right) {
               throw new Error('Parent of current leaf cannot have a null right child' + currentNode);
            }

            currentNode.height = 1 + Math.max(currentNode.left.height, currentNode.right.height);
            currentNode.bounds = currentNode.left.bounds.combine(currentNode.right.bounds);

            currentNode = currentNode.parent;
         }
      }

      public remove(leaf: TreeNode) {
         if (leaf === this.root) {
            this.root = null;
            return;
         }

         var parent = leaf.parent;
         var grandParent = parent.parent;
         var sibling: TreeNode;
         if (parent.left === leaf) {
            sibling = parent.right;
         } else {
            sibling = parent.left;
         }

         if (grandParent) {
            if (grandParent.left === parent) {
               grandParent.left = sibling;
            } else {
               grandParent.right = sibling;
            }
            sibling.parent = grandParent;

            var currentNode = grandParent;
            while (currentNode) {
               currentNode = this.balance(currentNode);
               currentNode.bounds = currentNode.left.bounds.combine(currentNode.right.bounds);
               currentNode.height = 1 + Math.max(currentNode.left.height, currentNode.right.height);

               currentNode = currentNode.parent;
            }

         } else {
            this.root = sibling;
            sibling.parent = null;
         }

      }

      public trackBody(body: Body) {
         var node = new TreeNode();
         node.body = body;
         node.bounds = body.getBounds();
         node.bounds.left -= 2;
         node.bounds.top -= 2;
         node.bounds.right += 2;
         node.bounds.bottom += 2;
         this.nodes[body.actor.id] = node;
         this.insert(node);
      }

      public updateBody(body: Body) {
         var node = this.nodes[body.actor.id];
         if (!node) { return; }
         var b = body.getBounds();
         if (node.bounds.contains(b)) {
            return false;
         }

         this.remove(node);
         b.left -= ex.Physics.boundsPadding;
         b.top -= ex.Physics.boundsPadding;
         b.right += ex.Physics.boundsPadding;
         b.bottom += ex.Physics.boundsPadding;

         var multdx = body.vel.x * ex.Physics.dynamicTreeVelocityMultiplyer;
         var multdy = body.vel.y * ex.Physics.dynamicTreeVelocityMultiplyer;

         if (multdx < 0) {
            b.left += multdx;
         } else {
            b.right += multdx;
         }

         if (multdy < 0) {
            b.top += multdy;
         } else {
            b.bottom += multdy;
         }

         node.bounds = b;
         this.insert(node);
         return true;
      }

      public untrackBody(body: Body) {
         var node = this.nodes[body.actor.id];
         if (!node) { return; }
         this.remove(node);
         this.nodes[body.actor.id] = null;
         delete this.nodes[body.actor.id];
      }

      public balance(node: TreeNode) {
         if (node === null) {
            throw new Error('Cannot balance at null node');
         }

         if (node.isLeaf() || node.height < 2) {
            return node;
         }

         var left = node.left;
         var right = node.right;

         var a = node;
         var b = left;
         var c = right;
         var d = left.left;
         var e = left.right;
         var f = right.left;
         var g = right.right;

         var balance = c.height - b.height;
         // Rotate c node up
         if (balance > 1) {
            // Swap the right node with it's parent
            c.left = a;
            c.parent = a.parent;
            a.parent = c;

            // The original node's old parent should point to the right node
            // this is mega confusing
            if (c.parent) {
               if (c.parent.left === a) {
                  c.parent.left = c;
               } else {
                  c.parent.right = c;
               }
            } else {
               this.root = c;
            }

            // Rotate
            if (f.height > g.height) {
               c.right = f;
               a.right = g;
               g.parent = a;

               a.bounds = b.bounds.combine(g.bounds);
               c.bounds = a.bounds.combine(f.bounds);

               a.height = 1 + Math.max(b.height, g.height);
               c.height = 1 + Math.max(a.height, f.height);

            } else {
               c.right = g;
               a.right = f;
               f.parent = a;

               a.bounds = b.bounds.combine(f.bounds);
               c.bounds = a.bounds.combine(g.bounds);

               a.height = 1 + Math.max(b.height, f.height);
               c.height = 1 + Math.max(a.height, g.height);

            }

            return c;

         }
         // Rotate left node up
         if (balance < -1) {

            // swap
            b.left = a;
            b.parent = a.parent;
            a.parent = b;

            // node's old parent should point to b
            if (b.parent) {
               if (b.parent.left === a) {
                  b.parent.left = b;
               } else {
                  if (b.parent.right !== a) { throw 'Error rotating Dynamic Tree'; }
                  b.parent.right = b;
               }
            } else {
               this.root = b;
            }

            // rotate
            if (d.height > e.height) {
               b.right = d;
               a.left = e;
               e.parent = a;

               a.bounds = c.bounds.combine(e.bounds);
               b.bounds = a.bounds.combine(d.bounds);

               a.height = 1 + Math.max(c.height, e.height);
               b.height = 1 + Math.max(a.height, d.height);
            } else {
               b.right = e;
               a.left = d;
               d.parent = a;

               a.bounds = c.bounds.combine(d.bounds);
               b.bounds = a.bounds.combine(e.bounds);

               a.height = 1 + Math.max(c.height, d.height);
               b.height = 1 + Math.max(a.height, e.height);
            }
            return b;

         }

         return node;
      }

      public getHeight(): number {
         if (this.root === null) {
            return 0;
         }
         return this.root.height;
      }

      public query(body: Body, callback: (other: Body) => boolean): void {
         var bounds = body.getBounds();
         var helper = (currentNode: TreeNode) => {
            if (currentNode && currentNode.bounds.collides(bounds)) {
               if (currentNode.isLeaf() && currentNode.body !== body) {
                  if (callback.call(body, currentNode.body)) {
                     return true;
                  }
               } else {
                  return helper(currentNode.left) || helper(currentNode.right);
               }
            } else {
               return null;
            }
         };
         return helper(this.root);
      }

      public rayCast(ray: Ray, max): Actor {
         // todo implement
         return null;
      }

      
      public getNodes(): TreeNode[] {
         var helper = currentNode => {
            if (currentNode) {
               return [currentNode].concat(helper(currentNode.left), helper(currentNode.right));
            } else {
               return [];
            }
         };
         return helper(this.root);

      }

      public debugDraw(ctx: CanvasRenderingContext2D, delta: number) {
         // draw all the nodes in the Dynamic Tree
         var helper = currentNode => {
            
            if (currentNode) {
               if (currentNode.isLeaf()) {
                  ctx.lineWidth = 1;
                  ctx.strokeStyle = 'green';
               } else {
                  ctx.lineWidth = 1;
                  ctx.strokeStyle = 'white';
               }
               currentNode.bounds.debugDraw(ctx);

               if (currentNode.left) { helper(currentNode.left); }
               if (currentNode.right) { helper(currentNode.right); }
            }
         };

         helper(this.root);
      }
   }
}