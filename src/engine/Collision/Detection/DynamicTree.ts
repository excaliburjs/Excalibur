import { Physics } from '../Physics';
import { BoundingBox } from '../BoundingBox';

import { Ray } from '../../Math/ray';
import { Logger } from '../../Util/Log';
import { Id } from '../../Id';
import { Entity } from '../../EntityComponentSystem/Entity';
import { BodyComponent } from '../BodyComponent';
import { Color, ExcaliburGraphicsContext } from '../..';

/**
 * Dynamic Tree Node used for tracking bounds within the tree
 */
export class TreeNode<T> {
  public left: TreeNode<T>;
  public right: TreeNode<T>;
  public bounds: BoundingBox;
  public height: number;
  public data: T;
  constructor(public parent?: TreeNode<T>) {
    this.parent = parent || null;
    this.data = null;
    this.bounds = new BoundingBox();
    this.left = null;
    this.right = null;
    this.height = 0;
  }

  public isLeaf(): boolean {
    return !this.left && !this.right;
  }
}

export interface ColliderProxy<T> {
  id: Id<'collider'>;
  owner: T;
  bounds: BoundingBox;
}

/**
 * The DynamicTrees provides a spatial partitioning data structure for quickly querying for overlapping bounding boxes for
 * all tracked bodies. The worst case performance of this is O(n*log(n)) where n is the number of bodies in the tree.
 *
 * Internally the bounding boxes are organized as a balanced binary tree of bounding boxes, where the leaf nodes are tracked bodies.
 * Every non-leaf node is a bounding box that contains child bounding boxes.
 */
export class DynamicTree<T extends ColliderProxy<Entity>> {
  public root: TreeNode<T>;
  public nodes: { [key: number]: TreeNode<T> };
  constructor(public worldBounds: BoundingBox = new BoundingBox(-Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)) {
    this.root = null;
    this.nodes = {};
  }

  /**
   * Inserts a node into the dynamic tree
   */
  private _insert(leaf: TreeNode<T>): void {
    // If there are no nodes in the tree, make this the root leaf
    if (this.root === null) {
      this.root = leaf;
      this.root.parent = null;
      return;
    }

    // Search the tree for a node that is not a leaf and find the best place to insert
    const leafAABB = leaf.bounds;
    let currentRoot = this.root;
    while (!currentRoot.isLeaf()) {
      const left = currentRoot.left;
      const right = currentRoot.right;

      const area = currentRoot.bounds.getPerimeter();
      const combinedAABB = currentRoot.bounds.combine(leafAABB);
      const combinedArea = combinedAABB.getPerimeter();

      // Calculate cost heuristic for creating a new parent and leaf
      const cost = 2 * combinedArea;

      // Minimum cost of pushing the leaf down the tree
      const inheritanceCost = 2 * (combinedArea - area);

      // Cost of descending
      let leftCost = 0;
      const leftCombined = leafAABB.combine(left.bounds);
      let newArea;
      let oldArea;
      if (left.isLeaf()) {
        leftCost = leftCombined.getPerimeter() + inheritanceCost;
      } else {
        oldArea = left.bounds.getPerimeter();
        newArea = leftCombined.getPerimeter();
        leftCost = newArea - oldArea + inheritanceCost;
      }

      let rightCost = 0;
      const rightCombined = leafAABB.combine(right.bounds);
      if (right.isLeaf()) {
        rightCost = rightCombined.getPerimeter() + inheritanceCost;
      } else {
        oldArea = right.bounds.getPerimeter();
        newArea = rightCombined.getPerimeter();
        rightCost = newArea - oldArea + inheritanceCost;
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
    const oldParent = currentRoot.parent;
    const newParent = new TreeNode(oldParent);
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
    let currentNode = leaf.parent;
    while (currentNode) {
      currentNode = this._balance(currentNode);

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

  /**
   * Removes a node from the dynamic tree
   */
  private _remove(leaf: TreeNode<T>) {
    if (leaf === this.root) {
      this.root = null;
      return;
    }

    const parent = leaf.parent;
    const grandParent = parent.parent;
    let sibling: TreeNode<T>;
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

      let currentNode = grandParent;
      while (currentNode) {
        currentNode = this._balance(currentNode);
        currentNode.bounds = currentNode.left.bounds.combine(currentNode.right.bounds);
        currentNode.height = 1 + Math.max(currentNode.left.height, currentNode.right.height);

        currentNode = currentNode.parent;
      }
    } else {
      this.root = sibling;
      sibling.parent = null;
    }
  }

  /**
   * Tracks a body in the dynamic tree
   */
  public trackCollider(collider: T) {
    const node = new TreeNode<T>();
    node.data = collider;
    node.bounds = collider.bounds;
    node.bounds.left -= 2;
    node.bounds.top -= 2;
    node.bounds.right += 2;
    node.bounds.bottom += 2;
    this.nodes[collider.id.value] = node;
    this._insert(node);
  }

  /**
   * Updates the dynamic tree given the current bounds of each body being tracked
   */
  public updateCollider(collider: T) {
    const node = this.nodes[collider.id.value];
    if (!node) {
      return false;
    }
    const b = collider.bounds;

    // if the body is outside the world no longer update it
    if (!this.worldBounds.contains(b)) {
      Logger.getInstance().warn(
        'Collider with id ' + collider.id.value + ' is outside the world bounds and will no longer be tracked for physics'
      );
      this.untrackCollider(collider);
      return false;
    }

    if (node.bounds.contains(b)) {
      return false;
    }

    this._remove(node);
    b.left -= Physics.boundsPadding;
    b.top -= Physics.boundsPadding;
    b.right += Physics.boundsPadding;
    b.bottom += Physics.boundsPadding;

    // THIS IS CAUSING UNECESSARY CHECKS
    if (collider.owner) {
      const body = collider.owner?.get(BodyComponent);
      if (body) {
        const multdx = ((body.vel.x * 32) / 1000) * Physics.dynamicTreeVelocityMultiplier;
        const multdy = ((body.vel.y * 32) / 1000) * Physics.dynamicTreeVelocityMultiplier;

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
      }
    }

    node.bounds = b;
    this._insert(node);
    return true;
  }

  /**
   * Untracks a body from the dynamic tree
   */
  public untrackCollider(collider: T) {
    const node = this.nodes[collider.id.value];
    if (!node) {
      return;
    }
    this._remove(node);
    this.nodes[collider.id.value] = null;
    delete this.nodes[collider.id.value];
  }

  /**
   * Balances the tree about a node
   */
  private _balance(node: TreeNode<T>) {
    if (node === null) {
      throw new Error('Cannot balance at null node');
    }

    if (node.isLeaf() || node.height < 2) {
      return node;
    }

    const left = node.left;
    const right = node.right;

    const a = node;
    const b = left;
    const c = right;
    const d = left.left;
    const e = left.right;
    const f = right.left;
    const g = right.right;

    const balance = c.height - b.height;
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
          if (b.parent.right !== a) {
            throw 'Error rotating Dynamic Tree';
          }
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

  /**
   * Returns the internal height of the tree, shorter trees are better. Performance drops as the tree grows
   */
  public getHeight(): number {
    if (this.root === null) {
      return 0;
    }
    return this.root.height;
  }

  /**
   * Queries the Dynamic Axis Aligned Tree for bodies that could be colliding with the provided body.
   *
   * In the query callback, it will be passed a potential collider. Returning true from this callback indicates
   * that you are complete with your query and you do not want to continue. Returning false will continue searching
   * the tree until all possible colliders have been returned.
   */
  public query(collider: T, callback: (other: T) => boolean): void {
    const bounds = collider.bounds;
    const helper = (currentNode: TreeNode<T>): boolean => {
      if (currentNode && currentNode.bounds.overlaps(bounds)) {
        if (currentNode.isLeaf() && currentNode.data !== collider) {
          if (callback.call(collider, currentNode.data)) {
            return true;
          }
        } else {
          return helper(currentNode.left) || helper(currentNode.right);
        }
      }
      return false;
    };
    helper(this.root);
  }

  /**
   * Queries the Dynamic Axis Aligned Tree for bodies that could be intersecting. By default the raycast query uses an infinitely
   * long ray to test the tree specified by `max`.
   *
   * In the query callback, it will be passed a potential body that intersects with the raycast. Returning true from this
   * callback indicates that your are complete with your query and do not want to continue. Return false will continue searching
   * the tree until all possible bodies that would intersect with the ray have been returned.
   */
  public rayCastQuery(ray: Ray, max: number = Infinity, callback: (other: T) => boolean): void {
    const helper = (currentNode: TreeNode<T>): boolean => {
      if (currentNode && currentNode.bounds.rayCast(ray, max)) {
        if (currentNode.isLeaf()) {
          if (callback.call(ray, currentNode.data)) {
            // ray hit a leaf! return the body
            return true;
          }
        } else {
          // ray hit but not at a leaf, recurse deeper
          return helper(currentNode.left) || helper(currentNode.right);
        }
      }
      return false; // ray missed
    };
    helper(this.root);
  }

  public getNodes(): TreeNode<T>[] {
    const helper = (currentNode: TreeNode<T>): TreeNode<T>[] => {
      if (currentNode) {
        return [currentNode].concat(helper(currentNode.left), helper(currentNode.right));
      } else {
        return [];
      }
    };
    return helper(this.root);
  }

  public debug(ex: ExcaliburGraphicsContext) {
    // draw all the nodes in the Dynamic Tree
    const helper = (currentNode: TreeNode<T>) => {
      if (currentNode) {
        if (currentNode.isLeaf()) {
          currentNode.bounds.draw(ex, Color.Green);
        } else {
          currentNode.bounds.draw(ex, Color.White);
        }

        if (currentNode.left) {
          helper(currentNode.left);
        }
        if (currentNode.right) {
          helper(currentNode.right);
        }
      }
    };

    helper(this.root);
  }
}
