import * as ex from '@excalibur';

describe('An ArcadeSolver', () => {
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

    expect(player.pos.y).toBe(100);
    expect(player.pos.x).toBe(50);
  });
});