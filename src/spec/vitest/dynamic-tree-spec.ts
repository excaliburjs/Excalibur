import * as ex from '@excalibur';
import { createId } from '../../engine/id';
import type { ColliderProxy } from '../../engine/collision/detection/dynamic-tree';
import { TestUtils } from '../__util__/test-utils';

function makeProxy(id: number, bounds: ex.BoundingBox): ColliderProxy<any> {
  return {
    id: createId('collider', id),
    owner: null,
    bounds
  };
}

const defaultConfig = { boundsPadding: 5, velocityMultiplier: 2 };

describe('A DynamicTree', () => {
  it('exists', () => {
    expect(ex.DynamicTree).toBeDefined();
  });

  it('can be constructed with default world bounds', () => {
    const tree = new ex.DynamicTree(defaultConfig);
    expect(tree.root).toBeUndefined();
    expect(tree.getHeight()).toBe(0);
    expect(tree.getNodes()).toEqual([]);
  });

  it('tracks a single collider as the root leaf', () => {
    const tree = new ex.DynamicTree(defaultConfig);
    const proxy = makeProxy(1, new ex.BoundingBox(0, 0, 10, 10));
    tree.trackCollider(proxy);

    expect(tree.root).toBeDefined();
    expect(tree.root!.isLeaf()).toBe(true);
    expect(tree.root!.data).toBe(proxy);
    expect(tree.getHeight()).toBe(0);
  });

  it('pads the bounds of a tracked collider by 2px on insert', () => {
    const tree = new ex.DynamicTree(defaultConfig);
    const proxy = makeProxy(1, new ex.BoundingBox(0, 0, 10, 10));
    tree.trackCollider(proxy);

    expect(tree.root!.bounds.left).toBe(-2);
    expect(tree.root!.bounds.top).toBe(-2);
    expect(tree.root!.bounds.right).toBe(12);
    expect(tree.root!.bounds.bottom).toBe(12);
  });

  it('builds a tree that maintains height/bounds invariants across many inserts', () => {
    const tree = new ex.DynamicTree(defaultConfig);
    for (let i = 0; i < 30; i++) {
      const x = (i % 6) * 100;
      const y = Math.floor(i / 6) * 100;
      tree.trackCollider(makeProxy(i, new ex.BoundingBox(x, y, x + 20, y + 20)));
    }

    // 30 leaves in a full binary tree means 29 internal nodes = 59 nodes total
    expect(tree.getNodes().length).toBe(59);
    expect(tree.getHeight()).toBeGreaterThan(1);

    const verifyInvariants = (node?: ex.TreeNode<any>) => {
      if (!node) {
        return;
      }
      if (node.isLeaf()) {
        expect(node.height).toBe(0);
      } else {
        expect(node.height).toBe(1 + Math.max(node.left!.height, node.right!.height));
        // a parent's bounds must fully contain both children's bounds
        expect(node.bounds.left).toBeLessThanOrEqual(node.left!.bounds.left);
        expect(node.bounds.top).toBeLessThanOrEqual(node.left!.bounds.top);
        expect(node.bounds.right).toBeGreaterThanOrEqual(node.left!.bounds.right);
        expect(node.bounds.bottom).toBeGreaterThanOrEqual(node.left!.bounds.bottom);

        expect(node.bounds.left).toBeLessThanOrEqual(node.right!.bounds.left);
        expect(node.bounds.top).toBeLessThanOrEqual(node.right!.bounds.top);
        expect(node.bounds.right).toBeGreaterThanOrEqual(node.right!.bounds.right);
        expect(node.bounds.bottom).toBeGreaterThanOrEqual(node.right!.bounds.bottom);
      }
      verifyInvariants(node.left);
      verifyInvariants(node.right);
    };
    verifyInvariants(tree.root);
  });

  it('untracks a collider, removing it from the tree', () => {
    const tree = new ex.DynamicTree(defaultConfig);
    const a = makeProxy(1, new ex.BoundingBox(0, 0, 10, 10));
    const b = makeProxy(2, new ex.BoundingBox(100, 100, 110, 110));
    tree.trackCollider(a);
    tree.trackCollider(b);
    expect(tree.getNodes().length).toBe(3);

    tree.untrackCollider(a);
    expect(tree.getNodes().length).toBe(1);
    expect(tree.root!.data).toBe(b);
  });

  it('untrackCollider is a no-op for an unknown collider', () => {
    const tree = new ex.DynamicTree(defaultConfig);
    const a = makeProxy(1, new ex.BoundingBox(0, 0, 10, 10));
    tree.trackCollider(a);

    const unknown = makeProxy(999, new ex.BoundingBox(0, 0, 1, 1));
    expect(() => tree.untrackCollider(unknown)).not.toThrow();
    expect(tree.getNodes().length).toBe(1);
  });

  describe('updateCollider', () => {
    it('returns false for an untracked collider', () => {
      const tree = new ex.DynamicTree(defaultConfig);
      const unknown = makeProxy(1, new ex.BoundingBox(0, 0, 10, 10));
      expect(tree.updateCollider(unknown)).toBe(false);
    });

    it('returns false and does not reinsert if the new bounds are still contained by the padded node bounds', () => {
      const tree = new ex.DynamicTree(defaultConfig);
      const proxy = makeProxy(1, new ex.BoundingBox(0, 0, 10, 10));
      tree.trackCollider(proxy);
      const originalNode = tree.root;

      // tiny move within the 2px padding applied at insert time
      proxy.bounds = new ex.BoundingBox(0.5, 0.5, 10.5, 10.5);
      expect(tree.updateCollider(proxy)).toBe(false);
      expect(tree.root).toBe(originalNode);
    });

    it('returns true and repositions the node when bounds move outside the padded bounds', () => {
      const tree = new ex.DynamicTree(defaultConfig);
      const proxy = makeProxy(1, new ex.BoundingBox(0, 0, 10, 10));
      tree.trackCollider(proxy);

      proxy.bounds = new ex.BoundingBox(500, 500, 510, 510);
      expect(tree.updateCollider(proxy)).toBe(true);
      expect(tree.root!.bounds.left).toBeLessThanOrEqual(500);
      expect(tree.root!.bounds.right).toBeGreaterThanOrEqual(510);
    });

    it('untracks and warns when a collider moves outside the tree world bounds', () => {
      const tree = new ex.DynamicTree(defaultConfig, new ex.BoundingBox(0, 0, 100, 100));
      const proxy = makeProxy(1, new ex.BoundingBox(0, 0, 10, 10));
      tree.trackCollider(proxy);

      const logger = ex.Logger.getInstance();
      vi.spyOn(logger, 'warn');

      proxy.bounds = new ex.BoundingBox(1000, 1000, 1010, 1010);
      const result = tree.updateCollider(proxy);

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalled();
      expect(tree.getNodes().length).toBe(0);
    });
  });

  describe('query', () => {
    it('finds overlapping colliders excluding itself', () => {
      const tree = new ex.DynamicTree(defaultConfig);
      const a = makeProxy(1, new ex.BoundingBox(0, 0, 10, 10));
      const b = makeProxy(2, new ex.BoundingBox(5, 5, 15, 15));
      const c = makeProxy(3, new ex.BoundingBox(1000, 1000, 1010, 1010));
      tree.trackCollider(a);
      tree.trackCollider(b);
      tree.trackCollider(c);

      const found: any[] = [];
      tree.query(a, (other) => {
        found.push(other);
        return false;
      });

      expect(found).toEqual([b]);
    });

    it('stops searching once the callback returns true', () => {
      const tree = new ex.DynamicTree(defaultConfig);
      const a = makeProxy(1, new ex.BoundingBox(0, 0, 100, 100));
      const b = makeProxy(2, new ex.BoundingBox(0, 0, 100, 100));
      const c = makeProxy(3, new ex.BoundingBox(0, 0, 100, 100));
      tree.trackCollider(a);
      tree.trackCollider(b);
      tree.trackCollider(c);

      const callback = vi.fn(() => true);
      tree.query(a, callback);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('rayCastQuery', () => {
    it('finds colliders intersecting the ray', () => {
      const tree = new ex.DynamicTree(defaultConfig);
      const a = makeProxy(1, new ex.BoundingBox(50, -10, 70, 10));
      const b = makeProxy(2, new ex.BoundingBox(1000, 1000, 1010, 1010));
      tree.trackCollider(a);
      tree.trackCollider(b);

      const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
      const hits: any[] = [];
      tree.rayCastQuery(ray, Infinity, (other) => {
        hits.push(other);
        return false;
      });

      expect(hits).toEqual([a]);
    });

    it('respects the max distance', () => {
      const tree = new ex.DynamicTree(defaultConfig);
      const a = makeProxy(1, new ex.BoundingBox(500, -10, 520, 10));
      tree.trackCollider(a);

      const ray = new ex.Ray(ex.vec(0, 0), ex.Vector.Right);
      const hits: any[] = [];
      tree.rayCastQuery(ray, 10, (other) => {
        hits.push(other);
        return false;
      });

      expect(hits).toEqual([]);
    });
  });

  it('debug draws leaf and internal node bounds without throwing', () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
    const tree = new ex.DynamicTree(defaultConfig);
    tree.trackCollider(makeProxy(1, new ex.BoundingBox(0, 0, 10, 10)));
    tree.trackCollider(makeProxy(2, new ex.BoundingBox(100, 100, 110, 110)));

    expect(() => tree.debug(engine.graphicsContext)).not.toThrow();

    engine.dispose();
  });
});
