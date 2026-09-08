import * as ex from '@excalibur';
import { getDefaultPhysicsConfig } from '../../engine/collision/physics-config';
import { buildContactIslands } from '../../engine/collision/island';

describe('A contact Island', () => {
  const makeStack = () => {
    const bottom = new ex.Actor({ x: 0, y: 0, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    const top = new ex.Actor({ x: 0, y: -38, width: 40, height: 40, collisionType: ex.CollisionType.Active });
    bottom.body.canSleep = true;
    top.body.canSleep = true;
    bottom.collider.update();
    top.collider.update();
    // the motion system normally captures these before integrating, without them a body looks like it moved from the origin
    bottom.body.captureOldTransform();
    top.body.captureOldTransform();
    const contacts = bottom.collider.collide(top.collider);
    expect(contacts.length).toBe(1);
    return { bottom, top, contacts };
  };

  it('groups bodies connected through contacts', () => {
    const { bottom, top, contacts } = makeStack();
    const islands = buildContactIslands(getDefaultPhysicsConfig().bodies, [bottom.body, top.body], contacts);
    expect(islands.length).toBe(1);
    expect(islands[0].bodies).toContain(bottom.body);
    expect(islands[0].bodies).toContain(top.body);
  });

  it('wakes every body when the island is only partially asleep', () => {
    const { bottom, top, contacts } = makeStack();
    bottom.body.sleep();
    expect(bottom.body.isSleeping).toBe(true);
    expect(top.body.isSleeping).toBe(false);

    const [island] = buildContactIslands(getDefaultPhysicsConfig().bodies, [bottom.body, top.body], contacts);
    island.updateSleepState(16);

    expect(bottom.body.isSleeping).toBe(false);
    expect(top.body.isSleeping).toBe(false);
  });

  it('leaves a fully sleeping island asleep', () => {
    const { bottom, top, contacts } = makeStack();
    bottom.body.sleep();
    top.body.sleep();

    const [island] = buildContactIslands(getDefaultPhysicsConfig().bodies, [bottom.body, top.body], contacts);
    island.updateSleepState(16);

    expect(bottom.body.isSleeping).toBe(true);
    expect(top.body.isSleeping).toBe(true);
  });
});
