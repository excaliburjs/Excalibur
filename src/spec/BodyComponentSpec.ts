import * as ex from '@excalibur';
import { BodyComponent } from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';

describe('A body component', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  })
  it('exists', () => {
    expect(ex.BodyComponent).toBeDefined();
  });

  it('can set the mass and cache their values', () => {

    const actor = new ex.Actor({
      x: 0,
      y: 0,
      width: 10,
      height: 10
    });

    actor.body.mass = 100;

    expect(actor.body.mass).toBe(100);
    expect(actor.body.inertia).toBeCloseTo(1666.6, 0);
    expect(actor.body.inverseInertia).toBeCloseTo(.0006, 0);

    expect((actor.body as any)._cachedInertia).toBeCloseTo(1666.6, 0);
    expect((actor.body as any)._cachedInverseInertia).toBeCloseTo(0.0006, 0);

    actor.body.mass = 1;
    expect((actor.body as any)._cachedInertia).toBe(undefined);
    expect((actor.body as any)._cachedInverseInertia).toBe(undefined);
  });

  it('will reflect the transform positions', () => {
    const actor = new ex.Actor({
      pos: ex.vec(100, 100)
    });

    const child = new ex.Actor({
      pos: ex.vec(10, 10)
    });

    actor.addChild(child);

    const body = child.get(BodyComponent);
    expect(body.pos).toBeVector(ex.vec(10, 10));
    expect(body.globalPos).toBeVector(ex.vec(110, 110));
  });

});