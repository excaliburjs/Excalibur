import * as ex from '../../build/dist/excalibur';

describe('A Collision Group', () => {
  let groupA: ex.CollisionGroup;
  let groupB: ex.CollisionGroup;
  let groupC: ex.CollisionGroup;
  beforeAll(() => {
    groupA = ex.CollisionGroupManager.create('groupA');
    groupB = ex.CollisionGroupManager.create('groupB');
    groupC = ex.CollisionGroupManager.create('groupC');
  });

  it('should not collide with itself', () => {
    expect(groupA.canCollide(groupA)).toBe(false, 'Group groupA should not collide with itself');
    expect(groupB.canCollide(groupB)).toBe(false, 'Group groupB should not collide with itself');
    expect(groupC.canCollide(groupC)).toBe(false, 'Group groupC should not collide with itself');
  });

  it('should collide with other groups', () => {
    expect(groupA.canCollide(groupB)).toBe(true);
    expect(groupA.canCollide(groupC)).toBe(true);

    expect(groupB.canCollide(groupA)).toBe(true);
    expect(groupB.canCollide(groupC)).toBe(true);

    expect(groupC.canCollide(groupA)).toBe(true);
    expect(groupC.canCollide(groupB)).toBe(true);
  });

  it('should collide with the All collision group', () => {
    expect(ex.CollisionGroup.All.canCollide(groupA)).toBe(true, 'All should collide with groupA');
    expect(ex.CollisionGroup.All.canCollide(groupB)).toBe(true, 'All should collide with groupB');
    expect(ex.CollisionGroup.All.canCollide(groupC)).toBe(true, 'All should collide with groupC');
    expect(ex.CollisionGroup.All.canCollide(ex.CollisionGroup.All)).toBe(true, 'All collision group should collide with itself');
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
    const maybeA = ex.CollisionGroupManager.create('A');
    expect(() => {
      const maybeAAlso = ex.CollisionGroupManager.create('A');
    }).toThrowError('Collision group A already exists');
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
