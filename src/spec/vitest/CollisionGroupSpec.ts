import * as ex from '@excalibur';

describe('A Collision Group', () => {
  let groupA: ex.CollisionGroup;
  let groupB: ex.CollisionGroup;
  let groupC: ex.CollisionGroup;
  beforeAll(() => {
    groupA = ex.CollisionGroupManager.create('groupA');
    groupB = ex.CollisionGroupManager.create('groupB');
    groupC = ex.CollisionGroupManager.create('groupC');
  });

  afterEach(() => {
    ex.CollisionGroupManager.reset();
  });

  it('should not collide with itself', () => {
    expect(groupA.canCollide(groupA), 'Group groupA should not collide with itself').toBe(false);
    expect(groupB.canCollide(groupB), 'Group groupB should not collide with itself').toBe(false);
    expect(groupC.canCollide(groupC), 'Group groupC should not collide with itself').toBe(false);
  });

  it('should collide with other groups', () => {
    expect(groupA.canCollide(groupB)).toBe(true);
    expect(groupA.canCollide(groupC)).toBe(true);

    expect(groupB.canCollide(groupA)).toBe(true);
    expect(groupB.canCollide(groupC)).toBe(true);

    expect(groupC.canCollide(groupA)).toBe(true);
    expect(groupC.canCollide(groupB)).toBe(true);
  });

  it('can invert collision groups', () => {
    const invertedA = groupA.invert();
    expect(invertedA.category).toBe(~groupA.category);
    expect(invertedA.mask).toBe(~groupA.mask);
    expect(invertedA.name).toBe('~(groupA)');
    expect(groupA.canCollide(groupA)).toBe(false);
    expect(groupA.canCollide(groupB)).toBe(true);
    expect(groupA.canCollide(groupC)).toBe(true);
    expect(invertedA.canCollide(groupA)).toBe(true);
    expect(invertedA.canCollide(groupB)).toBe(false);
    expect(invertedA.canCollide(groupC)).toBe(false);
  });

  it('can combine collision groups', () => {
    const AandB = ex.CollisionGroup.combine([groupA, groupB]);
    expect(AandB.name).toBe('groupA+groupB');
    expect(AandB.canCollide(groupA)).toBe(false);
    expect(AandB.canCollide(groupB)).toBe(false);
    expect(AandB.canCollide(groupC)).toBe(true);
  });

  it('can create collidesWith groups', () => {
    const collidesWithBAndC = ex.CollisionGroup.collidesWith([groupB, groupC]);
    expect(collidesWithBAndC.name).toBe('collidesWith(groupB+groupC)');
    expect(collidesWithBAndC.canCollide(groupA)).toBe(false);
    expect(collidesWithBAndC.canCollide(groupB)).toBe(true);
    expect(collidesWithBAndC.canCollide(groupC)).toBe(true);
  });

  it('should collide with the All collision group', () => {
    expect(ex.CollisionGroup.All.canCollide(groupA), 'All should collide with groupA').toBe(true);
    expect(ex.CollisionGroup.All.canCollide(groupB), 'All should collide with groupB').toBe(true);
    expect(ex.CollisionGroup.All.canCollide(groupC), 'All should collide with groupC').toBe(true);
    expect(ex.CollisionGroup.All.canCollide(ex.CollisionGroup.All), 'All collision group should collide with itself').toBe(true);
  });

  it('should be accessible by name', () => {
    ex.CollisionGroupManager.reset();
    groupA = ex.CollisionGroupManager.create('groupA');
    groupB = ex.CollisionGroupManager.create('groupB');
    groupC = ex.CollisionGroupManager.create('groupC');

    const maybeGroupA = ex.CollisionGroupManager.groupByName('groupA');
    expect(maybeGroupA).toBe(groupA);

    const maybeGroupB = ex.CollisionGroupManager.groupByName('groupB');
    expect(maybeGroupB).toBe(groupB);

    const maybeGroupC = ex.CollisionGroupManager.groupByName('groupC');
    expect(maybeGroupC).toBe(groupC);
  });

  it('should throw if 2 groups of the same name are created', () => {
    ex.CollisionGroupManager.reset();
    const maybeA = ex.CollisionGroupManager.create('A', 0b1);
    expect(() => {
      const maybeAAlso = ex.CollisionGroupManager.create('A', 0b10);
    }).toThrowError('Collision group A already exists with a different mask!');
  });

  it('should allow 32 collision groups', () => {
    expect(() => {
      ex.CollisionGroupManager.reset();
      for (let i = 0; i < 32; i++) {
        ex.CollisionGroupManager.create('group' + i);
      }
    }).not.toThrow();

    expect(() => {
      ex.CollisionGroupManager.create('group33');
    }).toThrow();
  });

  it('should collide as expected for all 32 groups', () => {
    ex.CollisionGroupManager.reset();
    for (let i = 0; i < 32; i++) {
      ex.CollisionGroupManager.create('group' + i);
    }

    for (let i = 0; i < 32; i++) {
      const groupI = ex.CollisionGroupManager.groupByName('group' + i);
      for (let j = 0; j < 32; j++) {
        const groupJ = ex.CollisionGroupManager.groupByName('group' + j);
        if (i === j) {
          expect(groupI.canCollide(groupJ)).toBe(false);
        } else {
          expect(groupI.canCollide(groupJ)).toBe(true);
        }
        expect(groupJ.canCollide(ex.CollisionGroup.All)).toBe(true);
      }
    }
  });
});
