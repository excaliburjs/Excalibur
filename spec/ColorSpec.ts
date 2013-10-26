// Color Tests 
/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../ts/Core.ts" />

describe('A color', ()=>{
   var color;
   beforeEach(()=>{
      color = new Color(0, 0, 0);
   });


   it('should be loaded', () => {
      expect(Color).toBeTruthy();
   });

   it('should default to rgba(0, 0, 0, 255)', ()=>{
      expect(color.toString()).toBe('rgba(0, 0, 0, 255)');
   });

   it('can be parsed from hex', ()=>{
      color = Color.fromHex('ffffff');
      expect(color.r).toBe(255);
      expect(color.g).toBe(255);
      expect(color.b).toBe(255);
      expect(color.a).toBe(255);

      color = Color.fromHex('#ffffff');
      expect(color.r).toBe(255);
      expect(color.g).toBe(255);
      expect(color.b).toBe(255);
      expect(color.a).toBe(255);

      color = Color.fromHex('aaffff00');
      expect(color.a).toBe(0);

      color = Color.fromHex('#00bbaa00');
      expect(color.a).toBe(0);
   })

   it('should have a default alpha of 255 if not specified', ()=>{
      color = Color.fromHex('#000000');
      expect(color.a).toBe(255);
      color = Color.fromRGB(0,0,0);
      expect(color.a).toBe(255);
   });

   it('should have the correct alpha parsed', ()=>{
      color = Color.fromHex('#1111111f');
      expect(color.a).toBe(31);
      color = Color.fromRGB(17,17,17,31);
      expect(color.a).toBe(31);
   });
});