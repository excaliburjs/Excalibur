import * as ex from '../../build/dist/excalibur';
import { Mocks } from './util/Mocks';

describe('An Actor Group', () => {
  let engine: ex.Engine;
  let scene: ex.Scene;
  let group: ex.Group;
  const mock = new Mocks.Mocker();

  beforeEach(() => {
    engine = mock.engine(100, 100);
    scene = new ex.Scene(engine);
    group = new ex.Group('name', scene);
    engine.currentScene = scene;
  });

  it('exists', () => {
    expect(ex.Group).toBeDefined();
  });

  it('can be created', () => {
    expect(group).toBeTruthy();
    group = scene.createGroup('newname');
    expect(group).toBeTruthy();
  });

  it('has members', () => {
    group.add(new ex.Actor());
    expect(group.getMembers().length).toBe(1);

    // we are going to add this actor muliple times to the group, the number
    // of members should only increase to 2
    const dupActor = new ex.Actor();
    group.add(dupActor);
    expect(group.getMembers().length).toBe(2);

    group.add(dupActor);
    expect(group.getMembers().length).toBe(2);
  });

  it('members ares automatically add to the scene', () => {
    const actor = new ex.Actor();

    group.add(actor);
    expect(group.contains(actor)).toBeTruthy();
    // the actor should be a member of the scene
    expect(scene.contains(actor)).toBeTruthy();
  });

  it('can remove members', () => {
    const actor = new ex.Actor();
    group.add(actor);
    expect(group.contains(actor)).toBeTruthy();

    group.remove(actor);
    expect(group.contains(actor)).toBeFalsy();
    expect(scene.contains(actor)).toBeTruthy();
  });

  it('can aggregate events across multiple actors', () => {
    let eventCount = 0;
    // arrange
    const a1 = new ex.Actor();
    const a2 = new ex.Actor();
    const a3 = new ex.Actor();

    // act
    group.add([a1, a2, a3]);

    group.on('someevent', () => {
      eventCount++;
    });

    a1.eventDispatcher.emit('someevent', null);
    a2.eventDispatcher.emit('someevent', null);
    a2.eventDispatcher.emit('someevent', null);

    // assert
    expect(eventCount).toBe(3);
  });

  it('can return the containing bounding box of all members', () => {
    const a1 = new ex.Actor(0, 0, 100, 100);
    a1.anchor.setTo(0, 0);
    const a2 = new ex.Actor(100, 100, 200, 190);
    a2.anchor.setTo(0, 0);

    group.add([a1, a2]);

    expect(group.getBounds().getWidth()).toBe(300);
    expect(group.getBounds().getHeight()).toBe(290);
  });

  it('can get a random member', () => {
    // arrange
    const a1 = new ex.Actor();
    const a2 = new ex.Actor();
    const a3 = new ex.Actor();

    // act
    group.add([a1, a2, a3]);

    const ran = group.getRandomMember();
    expect(group.contains(ran)).toBeTruthy();
  });

  it('can move many actors at once by a delta', () => {
    const a1 = new ex.Actor(0, 0, 100, 100);
    const a2 = new ex.Actor(100, 100, 200, 190);

    group.add([a1, a2]);
    group.move(-10, 10);

    expect(a1.pos.x).toBe(-10);
    expect(a2.pos.x).toBe(90);

    expect(a1.pos.y).toBe(10);
    expect(a2.pos.y).toBe(110);
  });

  it('can rotate many actors at once by an angle', () => {
    const a1 = new ex.Actor(0, 0, 100, 100);
    a1.rotation = Math.PI / 3;
    const a2 = new ex.Actor(100, 100, 200, 190);
    a2.rotation = Math.PI / 2;

    group.add([a1, a2]);
    group.rotate(Math.PI / 3);

    expect(a1.rotation).toBeCloseTo((Math.PI * 2) / 3, 0.001);
    expect(a2.rotation).toBeCloseTo((Math.PI * 5) / 6, 0.001);
  });

  it('can call actions off of actors', () => {
    const a1 = new ex.Actor(0, 0, 100, 100);

    group.add(a1);

    group.actions.moveTo(100, 0, 100);
    a1.update(engine, 500);

    expect(a1.pos.x).toBe(50);
    expect(a1.pos.y).toBe(0);

    a1.update(engine, 500);
    expect(a1.pos.x).toBe(100);
    expect(a1.pos.y).toBe(0);
  });
});
