/// <reference path="jasmine.d.ts" />
/// <reference path="Mocks.ts" />

describe('An animation', () => {
   var animation;
   beforeEach(() => {
      animation = new ex.Animation(null, null, 0);
   });

   it('should have loop default to true', () => {
      expect(animation.loop).toBeTruthy();
   });
});
