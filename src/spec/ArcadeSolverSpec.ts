import * as ex from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';

describe('An ArcadeSolver', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('should exist', () => {
    expect(ex.ArcadeSolver).toBeDefined();
  });

  it('should only solve position for overlapping contacts', ()=> {

    const wall1 = new ex.Actor({x: 0, y: 0, width: 100, height: 100, collisionType: ex.CollisionType.Fixed});
    const wall2 = new ex.Actor({x: 100, y: 0, width: 100, height: 100, collisionType: ex.CollisionType.Fixed});

    const player = new ex.Actor({x: 50, y: 99, width: 100, height: 100, collisionType: ex.CollisionType.Active});

    const pair1 = new ex.Pair(player.collider.get(), wall1.collider.get());
    const pair2 = new ex.Pair(player.collider.get(), wall2.collider.get());

    const contacts = [...pair1.collide(), ...pair2.collide()];
    expect(contacts.length).toBe(2);

    const sut = new ex.ArcadeSolver();

    sut.solvePosition(contacts);

    // Each contact has the same mtv
    expect(contacts[0].mtv).toBeVector(ex.vec(0, -1));
    expect(contacts[1].mtv).toBeVector(ex.vec(0, -1));

    // Only 1 contact mtv is applied
    expect(player.pos.y).toBe(100);
    expect(player.pos.x).toBe(50);
  });
});