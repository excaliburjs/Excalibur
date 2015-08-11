/// <reference path="jasmine.d.ts" />

describe('An Actor Group', () => {
   var group: ex.Group;
   var scene: ex.Scene;
   beforeEach(() => {
      scene = new ex.Scene();
      group = new ex.Group('name', scene);
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
      var dupActor = new ex.Actor();
      group.add(dupActor);
      expect(group.getMembers().length).toBe(2);

      group.add(dupActor);
      expect(group.getMembers().length).toBe(2);

   });

   it('members ares automatically add to the scene', () => {
      var actor = new ex.Actor();

      group.add(actor);
      expect(group.contains(actor)).toBeTruthy();
      // the actor should be a member of the scene
      expect(scene.contains(actor)).toBeTruthy();
   });

   it('can remove members', () => {
      var actor = new ex.Actor();
      group.add(actor);
      expect(group.contains(actor)).toBeTruthy();

      group.remove(actor);
      expect(group.contains(actor)).toBeFalsy();
      expect(scene.contains(actor)).toBeTruthy();
   });

   it('can aggregate events across multiple actors', () => {
      var eventCount = 0;
      // arrange
      var a1 = new ex.Actor();
      var a2 = new ex.Actor();
      var a3 = new ex.Actor();

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
      var a1 = new ex.Actor(0, 0, 100, 100);
      a1.anchor.setTo(0, 0);
      var a2 = new ex.Actor(100, 100, 200, 190);
      a2.anchor.setTo(0, 0);

      group.add([a1, a2]);

      expect(group.getBounds().getWidth()).toBe(300);
      expect(group.getBounds().getHeight()).toBe(290);

   });

   it('can get a random member', () => {
      // arrange
      var a1 = new ex.Actor();
      var a2 = new ex.Actor();
      var a3 = new ex.Actor();

      // act
      group.add([a1, a2, a3]);

      var ran = group.getRandomMember();
      expect(group.contains(ran)).toBeTruthy();

   });

   it('can move many actors at once by a delta', () => {
      var a1 = new ex.Actor(0, 0, 100, 100);
      var a2 = new ex.Actor(100, 100, 200, 190);

      group.add([a1, a2]);
      group.move(-10, 10);

      expect(a1.x).toBe(-10);
      expect(a2.x).toBe(90);

      expect(a1.y).toBe(10);
      expect(a2.y).toBe(110);
   });

   it('can rotate many actors at once by an angle', () => {
      var a1 = new ex.Actor(0, 0, 100, 100);
      a1.rotation = Math.PI / 3;
      var a2 = new ex.Actor(100, 100, 200, 190);
      a2.rotation = Math.PI / 2;

      group.add([a1, a2]);
      group.rotate(Math.PI / 3);

      expect(a1.rotation).toBeCloseTo(Math.PI * 2 / 3, .001);
      expect(a2.rotation).toBeCloseTo(Math.PI * 5 / 6, .001);
   });

}); 