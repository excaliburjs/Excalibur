/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../engine/Core.ts" />

describe("A Collision Group", ()=>{

   var scene;
   var actor1;
   var actor2;

   beforeEach(()=>{
      scene = new ex.Scene();
      actor1 = new ex.Actor(100, 100, 100, 100);
      actor2 = new ex.Actor(100, 100, 100, 100);
   });

   it("does not effect actors without collision groupings", ()=>{
      expect(actor1.collides(actor2)).not.toBe(ex.Side.NONE);
      expect(actor2.collides(actor1)).not.toBe(ex.Side.NONE);
   });

   it("can be added before or after an actor is added to a scene", ()=>{

   });

   it("can be removed before or after an actor is added to a scene", ()=>{

   });

});