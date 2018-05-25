/// <reference path="Mocks.ts" />

describe('Action', () => {
	
   var actor: ex.Actor;
   
   var engine: ex.Engine;
   var scene: ex.Scene;
   var mock = new Mocks.Mocker();

   beforeEach(() => {
      engine = mock.engine(100, 100);

      actor = new ex.Actor();
      scene = new ex.Scene(engine);
      engine.currentScene = scene;

      spyOn(scene, 'draw').and.callThrough();
      spyOn(actor, 'draw');

      
   });

   describe('blink', () => {
      it('can blink on and off', () => {
         expect(actor.visible).toBe(true);
         actor.actions.blink(200, 200);

         actor.update(engine, 200);
         expect(actor.visible).toBe(false);

         actor.update(engine, 250);
         expect(actor.visible).toBe(true);
      });

      it('can blink at a frequency forever', () => {
         expect(actor.visible).toBe(true);
         actor.actions.blink(200, 200).repeatForever();
         
         for (var i = 0; i < 2; i++) {
            actor.update(engine, 200);
            expect(actor.visible).toBe(false);

            actor.update(engine, 200);
            expect(actor.visible).toBe(true);

            actor.update(engine, 200);
         }
      });
      
      it('can be stopped', () => {
         expect(actor.visible).toBe(true);
         actor.actions.blink(1, 3000);

         actor.update(engine, 500);
         expect(actor.visible).toBe(false);

         actor.actions.clearActions();
         
         actor.update(engine, 500);
         actor.update(engine, 500);
         expect(actor.visible).toBe(true);
      });   
   });

   describe('color', () => {
      it('is cloned from constructor', () => {
         const color = ex.Color.Azure;
         const sut = new ex.Actor(null, null, null, null, color);

         expect(sut.color).not.toBe(color, 'Color is not expected to be same instance');
      });

      it('is cloned from property setter', () => {
         const color = ex.Color.Azure;
         const sut = new ex.Actor();

         sut.color = color;

         expect(sut.color).not.toBe(color, 'Color is not expected to be same instance');
      });
   });

   describe('die', () => {
      it('can remove actor from scene', () => {
         scene.add(actor);
         expect(scene.actors.length).toBe(1);
         actor.actions.die();
         scene.update(engine, 100);
         expect(scene.actors.length).toBe(0);
      });

      it('can perform actions and then die', () => {
         scene.add(actor);
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);
         expect(scene.actors.length).toBe(1);

         actor.actions.moveTo(100, 0, 100).delay(1000).die();
         actor.update(engine, 1000);

         expect(actor.pos.x).toBe(100);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 500);
         expect(actor.pos.x).toBe(100);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1000);
         scene.update(engine, 100);
         expect(scene.actors.length).toBe(0);
      });   
   });

   describe('delay', () => {
      it('can be delay an action by an amount off time', () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.actions.delay(1000).moveTo(20, 0, 20);
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(0);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(20);
      });
      
      it('can be stopped', () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.actions.delay(1000).moveTo(20, 0, 20);
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(0);

         actor.actions.clearActions();
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(0);
      });
   });

   describe('moveBy', () => {
      
      it('can be moved to a location by a certain time', () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.actions.moveBy(100, 0,  2000);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(50);
         expect(actor.pos.y).toBe(0);
      });

      it('can be stopped', () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.actions.moveBy(20, 0, 1000);
         actor.update(engine, 500);

         actor.actions.clearActions();
         expect(actor.pos.x).toBe(10);
         expect(actor.pos.y).toBe(0);

         // Actor should not move after stop
         actor.update(engine, 500);
         expect(actor.pos.x).toBe(10);
         expect(actor.pos.y).toBe(0);
      });
   });

   describe('moveTo', () => {
      it('can be moved to a location at a speed', () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.actions.moveTo(100, 0, 100);
         actor.update(engine, 500);

         expect(actor.pos.x).toBe(50);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 500);
         expect(actor.pos.x).toBe(100);
         expect(actor.pos.y).toBe(0);
      });
      
      it('can be stopped', () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.actions.moveTo(20, 0, 10);
         actor.update(engine, 500);

         actor.actions.clearActions();
         expect(actor.pos.x).toBe(5);
         expect(actor.pos.y).toBe(0);

         // Actor should not move after stop
         actor.update(engine, 500);
         expect(actor.pos.x).toBe(5);
         expect(actor.pos.y).toBe(0);
      });
   });

   describe('repeat', () => {
      it('can repeat previous actions', () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.actions.moveTo(20, 0, 10).moveTo(0, 0, 10).repeat();

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(10);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(20);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1);
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(10);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1);
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(10);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(20);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(20);
         expect(actor.pos.y).toBe(0);
      });
      
      it('can be stopped', () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.actions.moveTo(20, 0, 10).moveTo(0, 0, 10).repeat();

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(10);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(20);
         expect(actor.pos.y).toBe(0);

         actor.actions.clearActions();
         actor.update(engine, 1);
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(20);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(20);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1);
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(20);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(20);
         expect(actor.pos.y).toBe(0);

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(20);
         expect(actor.pos.y).toBe(0);
      });      
   });

   describe('repeatForever', () => {
      it('can repeat previous actions forever', () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.actions.moveTo(20, 0, 10).moveTo(0, 0, 10).repeatForever();

         for (var i = 0; i < 20; i++) {
            actor.update(engine, 1000);
            expect(actor.pos.x).toBe(10);
            expect(actor.pos.y).toBe(0);

            actor.update(engine, 1000);
            expect(actor.pos.x).toBe(20);
            expect(actor.pos.y).toBe(0);

            actor.update(engine, 1);
            actor.update(engine, 1000);
            expect(actor.pos.x).toBe(10);
            expect(actor.pos.y).toBe(0);

            actor.update(engine, 1000);
            expect(actor.pos.x).toBe(0);
            expect(actor.pos.y).toBe(0);

            actor.update(engine, 1);
         }
      });

      it('can be stopped', () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         actor.actions.moveTo(20, 0, 10).moveTo(0, 0, 10).repeatForever();

         actor.update(engine, 1000);
         expect(actor.pos.x).toBe(10);
         expect(actor.pos.y).toBe(0);

         actor.actions.clearActions();

         for (var i = 0; i < 20; i++) {
            actor.update(engine, 1000);
            expect(actor.pos.x).toBe(10);
            expect(actor.pos.y).toBe(0);
         }
      });
   });

   describe('rotateTo', () => {
      
      it('can be rotated to an angle at a speed via ShortestPath (default)', () => {
         expect(actor.rotation).toBe(0);

         actor.actions.rotateTo(Math.PI / 2, Math.PI / 2);

         actor.update(engine, 500);
         expect(actor.rotation).toBe(Math.PI / 4);

         actor.update(engine, 500);
         expect(actor.rotation).toBe(Math.PI / 2);

         actor.update(engine, 500);
         expect(actor.rx).toBe(0);
      });
      
      it('can be rotated to an angle at a speed via LongestPath', () => {
         expect(actor.rotation).toBe(0);

         actor.actions.rotateTo(Math.PI / 2, Math.PI / 2, ex.RotationType.LongestPath);

         actor.update(engine, 1000);
         //rotation is currently incremented by rx delta ,so will be negative while moving counterclockwise
         expect(actor.rotation).toBe(-1 * Math.PI / 2);

         actor.update(engine, 2000);
         expect(actor.rotation).toBe(-3 * Math.PI / 2);

         actor.update(engine, 500);
         expect(actor.rotation).toBe(Math.PI / 2);
         expect(actor.rx).toBe(0);
      });

      it('can be rotated to an angle at a speed via Clockwise', () => {
         expect(actor.rotation).toBe(0);

         actor.actions.rotateTo(3 * Math.PI / 2, Math.PI / 2, ex.RotationType.Clockwise);

         actor.update(engine, 2000);
         expect(actor.rotation).toBe(Math.PI);

         actor.update(engine, 1000);
         expect(actor.rotation).toBe(3 * Math.PI / 2);

         actor.update(engine, 500);
         expect(actor.rotation).toBe(3 * Math.PI / 2);
         expect(actor.rx).toBe(0);
      });

      it('can be rotated to an angle at a speed via CounterClockwise', () => {
         expect(actor.rotation).toBe(0);

         actor.actions.rotateTo(Math.PI / 2, Math.PI / 2, ex.RotationType.CounterClockwise);
         actor.update(engine, 2000);
         expect(actor.rotation).toBe(-Math.PI);

         actor.update(engine, 1000);
         expect(actor.rotation).toBe(-3 * Math.PI / 2);

         actor.update(engine, 500);
         expect(actor.rotation).toBe(Math.PI / 2);
         expect(actor.rx).toBe(0);

         // rotating back to 0, starting at PI / 2
         actor.actions.rotateTo(0, Math.PI / 2, ex.RotationType.CounterClockwise);
         actor.update(engine, 1000);
         expect(actor.rotation).toBe(0);

         actor.update(engine, 1);
         expect(actor.rx).toBe(0);

      });

      it('can be stopped', () => {
         expect(actor.rotation).toBe(0);

         actor.actions.rotateTo(Math.PI / 2, Math.PI / 2);

         actor.update(engine, 500);
         expect(actor.rotation).toBe(Math.PI / 4);

         actor.actions.clearActions();

         actor.update(engine, 500);
         expect(actor.rotation).toBe(Math.PI / 4);
      });
   });

   describe('rotateBy', () => {
         
      // it('can be rotated to an angle by a certain time', () => {
      // 	expect(actor.rotation).toBe(0);

      // 	actor.rotateBy(Math.PI/2, 2000);
      // 	actor.update(engine, 1000);

      // 	expect(actor.rotation).toBe(Math.PI/4);
      // 	actor.update(engine, 1000);

      // 	expect(actor.rotation).toBe(Math.PI/2);
      //});

      it('can be rotated to an angle by a certain time via ShortestPath (default)', () => {
         expect(actor.rotation).toBe(0);

         actor.actions.rotateBy(Math.PI / 2, 2000);

         actor.update(engine, 1000);
         expect(actor.rotation).toBe(Math.PI / 4);

         actor.update(engine, 1000);
         expect(actor.rotation).toBe(Math.PI / 2);

         actor.update(engine, 500);
         expect(actor.rx).toBe(0);
      });

      it('can be rotated to an angle by a certain time via LongestPath', () => {
         expect(actor.rotation).toBe(0);

         actor.actions.rotateBy(Math.PI / 2, 3000, ex.RotationType.LongestPath);

         actor.update(engine, 1000);
         expect(actor.rotation).toBe(-1 * Math.PI / 2);

         actor.update(engine, 2000);
         expect(actor.rotation).toBe(-3 * Math.PI / 2);

         actor.update(engine, 500);
         expect(actor.rotation).toBe(Math.PI / 2);
         expect(actor.rx).toBe(0);
      });

      it('can be rotated to an angle by a certain time via Clockwise', () => {
         expect(actor.rotation).toBe(0);

         actor.actions.rotateBy(Math.PI / 2, 1000, ex.RotationType.Clockwise);

         actor.update(engine, 500);
         expect(actor.rotation).toBe(Math.PI / 4);

         actor.update(engine, 500);
         expect(actor.rotation).toBe(Math.PI / 2);

         actor.update(engine, 500);
         expect(actor.rotation).toBe(Math.PI / 2);
         expect(actor.rx).toBe(0);
      });

      it('can be rotated to an angle by a certain time via CounterClockwise', () => {
         expect(actor.rotation).toBe(0);

         actor.actions.rotateBy(Math.PI / 2, 3000, ex.RotationType.LongestPath);

         actor.update(engine, 1000);
         expect(actor.rotation).toBe(-1 * Math.PI / 2);

         actor.update(engine, 2000);
         expect(actor.rotation).toBe(-3 * Math.PI / 2);

         actor.update(engine, 500);
         expect(actor.rotation).toBe(Math.PI / 2);
         expect(actor.rx).toBe(0);
      });
      it('can be stopped', () => {
         expect(actor.rotation).toBe(0);

         actor.actions.rotateBy(Math.PI / 2, 2000);
         
         actor.update(engine, 1000);
         actor.actions.clearActions();
         expect(actor.rotation).toBe(Math.PI / 4);

         actor.update(engine, 1000);
         expect(actor.rotation).toBe(Math.PI / 4);
      });
   });

   describe('scaleTo', () => {
      it('can be scaled at a speed', () => {
         expect(actor.scale.x).toBe(1);
         expect(actor.scale.y).toBe(1);

         actor.actions.scaleTo(2, 4, .5, .5);
         actor.update(engine, 1000);

         expect(actor.scale.x).toBe(1.5);
         expect(actor.scale.y).toBe(1.5);
         actor.update(engine, 1000);

         expect(actor.scale.x).toBe(2);
         expect(actor.scale.y).toBe(2);
         actor.update(engine, 1000);

         expect(actor.scale.x).toBe(2);
         expect(actor.scale.y).toBe(2.5);
      });
      
      it('can be stopped', () => {
         expect(actor.scale.x).toBe(1);
         expect(actor.scale.y).toBe(1);

         actor.actions.scaleTo(2, 2, .5, .5);
         actor.update(engine, 1000);

         actor.actions.clearActions();
         expect(actor.scale.x).toBe(1.5);
         expect(actor.scale.y).toBe(1.5);

         actor.update(engine, 1000);
         expect(actor.scale.x).toBe(1.5);
         expect(actor.scale.y).toBe(1.5);
      });
   });

   describe('scaleBy', () => {
         
      it('can be scaled by a certain time', () => {
         expect(actor.scale.x).toBe(1);
         expect(actor.scale.y).toBe(1);

         actor.actions.scaleBy(4, 5, 1000);

         actor.update(engine, 500);
         expect(actor.scale.x).toBe(2.5);
         expect(actor.scale.y).toBe(3);

         actor.update(engine, 500);
         expect(actor.scale.x).toBe(4);
         expect(actor.scale.y).toBe(5);
      });   
      
      it('can be stopped', () => {
         expect(actor.scale.x).toBe(1);
         expect(actor.scale.y).toBe(1);

         actor.actions.scaleBy(4, 4, 1000);

         actor.update(engine, 500);

         actor.actions.clearActions();
         expect(actor.scale.x).toBe(2.5);
         expect(actor.scale.y).toBe(2.5);

         actor.update(engine, 500);
         expect(actor.scale.x).toBe(2.5);
         expect(actor.scale.y).toBe(2.5);
      });

   });

   describe('follow', () => {
      it('can work with another actor', () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         var actorToFollow = new ex.Actor(10, 0);
         actorToFollow.actions.moveTo(100, 0, 10);
         actor.actions.follow(actorToFollow);
         // actor.update(engine, 1000);
         // expect(actor.pos.x).toBe(actorToFollow.x);

         for (var i = 1; i < 10; i++) {
            // actor.follow(actorToFollow);
            actorToFollow.update(engine, 1000);
            actor.update(engine, 1000);
            expect(actor.pos.x).toBe(actorToFollow.pos.x - 10);
         }
         //TODO test different follow distances?
      });

      
   });

   describe('meet', () => {
      it('can meet another actor' , () => {
         expect(actor.pos.x).toBe(0);
         expect(actor.pos.y).toBe(0);

         // testing basic meet
         var actorToMeet = new ex.Actor(10, 0);
         actorToMeet.actions.moveTo(100, 0, 10);
         actor.actions.meet(actorToMeet);

         for (var i = 0; i < 9; i++) {
            actorToMeet.update(engine, 1000);
            actor.update(engine, 1000);
            expect(actor.pos.x).toBe(actorToMeet.pos.x - 10);
         }

         // actor should have caught up to actorToFollow since it stopped moving
         actorToMeet.update(engine, 1000);
         actor.update(engine, 1000);
         expect(actor.pos.x).toBe (actorToMeet.pos.x);

         //TODO have actor to be followed traveling at a diagonal 'toward' the following actor
         // testing when actorToMeet is moving in a direction towards the following actor
      });
   });

   describe('fade', () => {
      
      it ('can go from 1 from 0', () => {
         actor.opacity = 0;

         actor.actions.fade(1, 200);
         for (var i = 0; i < 10; i++) {
            actor.update(engine, 20);
         }

         expect(actor.opacity).toBe(1);
      });

      it ('can go back and forth from 0 to 1 (#512)', () => {
         actor.opacity = 0;
         
         actor.actions.fade(1, 200).fade(0, 200);
         for (var i = 0; i < 20; i++) {
            actor.update(engine, 20);
         }

         expect(actor.opacity).toBe(0);
      });

      it ('can go back and forth from 0 to 1 more than once (#512)', () => {
         actor.opacity = 0;
         
         actor.actions.fade(1, 200).fade(0, 200).repeat(1);
         for (var i = 0; i < 40; i++) {
            actor.update(engine, 20);
         }

         expect(actor.opacity).toBe(0);
      });
   });

});