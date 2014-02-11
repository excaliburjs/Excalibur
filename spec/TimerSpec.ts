/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../ts/Core.ts" />

describe("A Timer", ()=>{
   var timer;
   var scene;
   beforeEach(()=>{
      timer = new ex.Timer(function(){}, 500);     
      scene = new ex.Scene();
   });

   it("has a unique id", ()=>{
      var newtimer = new ex.Timer(function(){}, 500);
      expect(timer.id).not.toBe(newtimer.id);
      expect(timer.id).toBe(newtimer.id - 1);

      var newtimer2 = new ex.Timer(function(){}, 500);
      expect(timer.id).not.toBe(newtimer2.id);
      expect(timer.id).toBe(newtimer2.id -2);

   });

   it("fires after a specific interval", ()=>{
      //scene.addTimer(timer);
      //scene.update(null, 501);
      timer.update(501);
      timer.update(501);
      expect(timer.complete).toBeTruthy();
   });

   it("can repeat itself multiple number of times", ()=>{
      // count the number of fires
      var count = 0;
      timer = new ex.Timer(function(){count++;}, 500, true);

      timer.update(501);
      timer.update(501);
      timer.update(501);

      expect(count).toBe(3);
   });

   it("can be canceled", ()=>{
      var count = 0;
      timer = new ex.Timer(function(){count++;}, 500, true);
      scene.addTimer(timer);

      scene.update(null, 501);
      scene.update(null, 501);
      scene.update(null, 501);
      timer.cancel();
      scene.update(null, 501);
      scene.update(null, 501);
      scene.update(null, 501);

      expect(count).toBe(3);
   });

   it("is removed from the scene when it is completed", ()=>{
      scene.addTimer(timer);

      expect(scene.isTimerActive(timer)).toBeTruthy();
      scene.update(null, 501);
      expect(scene.isTimerActive(timer)).toBeFalsy();
   });

   it("is in the completed state once it is finished", ()=>{
      scene.addTimer(timer);
      scene.update(null, 501);
      expect(timer.complete).toBeTruthy();
   });

   it("has no completed state when running forever", ()=>{
      // count the number of fires
      var count = 0;
      timer = new ex.Timer(function(){count++;}, 500, true);
      scene.addTimer(timer);

      scene.update(null, 501);
      expect(count).toBe(1);
      expect(timer.repeats).toBeTruthy();
      expect(timer.complete).toBeFalsy();

      scene.update(null, 501);
      expect(count).toBe(2);
      expect(timer.repeats).toBeTruthy();
      expect(timer.complete).toBeFalsy();

      scene.update(null, 501);
      expect(count).toBe(3);
      expect(timer.repeats).toBeTruthy();
      expect(timer.complete).toBeFalsy();
   });

});