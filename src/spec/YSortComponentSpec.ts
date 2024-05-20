import * as ex from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';

describe('A YSortComponent', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('exists', () => {
    expect(ex.YSortComponent).toBeDefined();
  });

  it('can be constructed', () => {
    const ysort = new ex.YSortComponent();
    expect(ysort).toBeDefined();
  });

  it('sets all options in constructor', () => {
    const ysort = new ex.YSortComponent({
      offset: 10,
      order: -1
    });
    expect(ysort.offset).toBe(10);
    expect(ysort.order).toBe(-1);
  });

  it('sets the z-index based on transform.y', () => {
    const entity = new ex.Entity();
    const transform = new ex.TransformComponent();
    const ysort = new ex.YSortComponent();

    entity.addComponent(transform);
    entity.addComponent(ysort);
    transform.pos = ex.vec(10, 42);

    ysort.updateZ();
    expect(transform.z).toBe(42);
  });

  it('orders in descending order', () => {
    const entity = new ex.Entity();
    const transform = new ex.TransformComponent();
    const ysort = new ex.YSortComponent({ order: -1 });

    entity.addComponent(transform);
    entity.addComponent(ysort);
    transform.pos = ex.vec(10, 42);

    ysort.updateZ();
    expect(transform.z).toBe(-42);
  });

  it('applies an offset', () => {
    const entity = new ex.Entity();
    const transform = new ex.TransformComponent();
    const ysort = new ex.YSortComponent({ offset: 10 });

    entity.addComponent(transform);
    entity.addComponent(ysort);
    transform.pos = ex.vec(10, 42);

    ysort.updateZ();
    expect(transform.z).toBe(52);
  });
});
