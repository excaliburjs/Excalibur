import * as ex from '@excalibur';

describe('Projections', () => {
  it('exists', () => {
    expect(ex.Projection).toBeDefined();
  });

  it('can be constructed', () => {
    const proj = new ex.Projection(5, 10);
    expect(proj).toBeTruthy();
  });

  it('can detect overlap between projections', () => {
    const proj = new ex.Projection(5, 10);
    const proj2 = new ex.Projection(7, 12);
    expect(proj.getOverlap(proj2)).toBe(3);
  });

  it('can detect overlap between projections across zero', () => {
    const proj = new ex.Projection(-5, 2);
    const proj2 = new ex.Projection(-2, 5);
    expect(proj.getOverlap(proj2)).toBe(4);
  });

  it('can detect no overlap between projections', () => {
    const proj = new ex.Projection(5, 10);
    const proj2 = new ex.Projection(10, 12);
    expect(proj.getOverlap(proj2)).toBe(0);
  });

  it('can detect no overlap between projections with separation', () => {
    const proj = new ex.Projection(5, 10);
    const proj2 = new ex.Projection(11, 12);
    expect(proj.getOverlap(proj2)).toBe(0);
  });
});
