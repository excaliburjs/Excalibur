// Color Tests 
/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../engine/Core.ts" />

describe('A color', ()=>{
   var color;
   beforeEach(()=>{
      color = new ex.Color(0, 0, 0);
   });


   it('should be loaded', () => {
      expect(ex.Color).toBeTruthy();
   });

   it('should default to rgba(0, 0, 0, 1)', ()=>{
      expect(color.toString()).toBe('rgba(0, 0, 0, 1)');
   });

   it('should handle alpha values of 0', ()=>{
      var color = new ex.Color(255, 255, 255, 0);
      expect(color.toString()).toBe('rgba(255, 255, 255, 0)');
   });

   it('can be parsed from hex', ()=>{
      color = ex.Color.fromHex('ffffff');
      expect(color.r).toBe(255);
      expect(color.g).toBe(255);
      expect(color.b).toBe(255);
      expect(color.a).toBe(1);

      color = ex.Color.fromHex('#ffffff');
      expect(color.r).toBe(255);
      expect(color.g).toBe(255);
      expect(color.b).toBe(255);
      expect(color.a).toBe(1);

      color = ex.Color.fromHex('aaffff00');
      expect(color.a).toBe(0);

      color = ex.Color.fromHex('#00bbaa00');
      expect(color.a).toBe(0);
   })

   it('should have a default alpha of 255 if not specified', ()=>{
      color = ex.Color.fromHex('#000000');
      expect(color.a).toBe(1);
      color = ex.Color.fromRGB(0,0,0);
      expect(color.a).toBe(1);
   });

   it('should have the correct alpha parsed', ()=>{
      color = ex.Color.fromHex('#1111111f');
      expect(color.a).toBe(31/255);
      color = ex.Color.fromRGB(17,17,17,31/255);
      expect(color.a).toBe(31/255);
   });
});