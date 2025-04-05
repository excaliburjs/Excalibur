import * as ex from '@excalibur';

describe('A QuadTree', () => {
  it('exists', () => {
    expect(ex.QuadTree).toBeDefined();
  });

  it('can add things to track', () => {
    const sut = new ex.QuadTree<{ id: number; bounds: ex.BoundingBox }>(
      new ex.BoundingBox({
        left: 0,
        top: 0,
        bottom: 100,
        right: 100
      })
    );

    const bb1 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(0, 0));
    const bb2 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(90, 90));
    const bb3 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(90, 0));
    const bb4 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(0, 90));

    sut.insert({ id: 1, bounds: bb1 });
    sut.insert({ id: 2, bounds: bb2 });
    sut.insert({ id: 3, bounds: bb3 });
    sut.insert({ id: 4, bounds: bb4 });

    expect(sut.getAllItems().length).toBe(4);
  });

  it('can remove things', () => {
    const sut = new ex.QuadTree<{ id: number; bounds: ex.BoundingBox }>(
      new ex.BoundingBox({
        left: 0,
        top: 0,
        bottom: 100,
        right: 100
      }),
      {
        capacity: 1
      }
    );

    const bb1 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(0, 0));
    const bb2 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(90, 90));
    const bb3 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(90, 0));
    const bb4 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(0, 90));

    const item1 = { id: 1, bounds: bb1 };
    const item2 = { id: 2, bounds: bb2 };
    const item3 = { id: 3, bounds: bb3 };
    const item4 = { id: 4, bounds: bb4 };
    sut.insert(item1);
    sut.insert(item2);
    sut.insert(item3);
    sut.insert(item4);

    sut.remove(item1);
    expect(sut.getAllItems().length).toBe(3);

    sut.remove(item2);
    expect(sut.getAllItems().length).toBe(2);

    sut.remove(item3);
    expect(sut.getAllItems().length).toBe(1);

    sut.remove(item4);
    expect(sut.getAllItems().length).toBe(0);
  });

  it('can be cleared', () => {
    const sut = new ex.QuadTree<{ id: number; bounds: ex.BoundingBox }>(
      new ex.BoundingBox({
        left: 0,
        top: 0,
        bottom: 100,
        right: 100
      })
    );

    const bb1 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(0, 0));
    const bb2 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(90, 90));
    const bb3 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(90, 0));
    const bb4 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(0, 90));

    const item1 = { id: 1, bounds: bb1 };
    const item2 = { id: 2, bounds: bb2 };
    const item3 = { id: 3, bounds: bb3 };
    const item4 = { id: 4, bounds: bb4 };
    sut.insert(item1);
    sut.insert(item2);
    sut.insert(item3);
    sut.insert(item4);

    sut.clear();

    expect(sut.items.length).toBe(0);
  });

  it('can be queried', () => {
    const sut = new ex.QuadTree<{ id: number; bounds: ex.BoundingBox }>(
      new ex.BoundingBox({
        left: 0,
        top: 0,
        bottom: 100,
        right: 100
      }),
      {
        capacity: 1
      }
    );

    const bb1 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(0, 0));
    const bb2 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(90, 90));
    const bb3 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(90, 0));
    const bb4 = ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(0, 90));

    const item1 = { id: 1, bounds: bb1 };
    const item2 = { id: 2, bounds: bb2 };
    const item3 = { id: 3, bounds: bb3 };
    const item4 = { id: 4, bounds: bb4 };
    sut.insert(item1);
    sut.insert(item2);
    sut.insert(item3);
    sut.insert(item4);

    const items = sut.query(ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.vec(0, 0)));

    expect(items.length).toBe(1);
    expect(items[0]).toBe(item1);

    const manyItems = sut.query(ex.BoundingBox.fromDimension(100, 100, ex.Vector.Zero, ex.Vector.Zero));

    expect(manyItems.length).toBe(4);
  });

  it('will respect max depth', () => {
    const sut = new ex.QuadTree<{ id: number; bounds: ex.BoundingBox }>(
      new ex.BoundingBox({
        left: 0,
        top: 0,
        bottom: 100,
        right: 100
      }),
      {
        capacity: 1,
        maxDepth: 10
      }
    );

    let id = 0;
    for (let i = 0; i < 15; i++) {
      sut.insert({ id: id++, bounds: ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero, ex.Vector.Zero) });
    }

    const items = sut.getAllItems();
    expect(items.length).toBe(15);

    const depth = sut.getTreeDepth();

    expect(depth).toBe(10);
  });
});
