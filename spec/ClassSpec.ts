/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../ts/Util.ts" />

describe("A Class", ()=>{
   it("can be extended indefinitely", ()=>{
      var Person: any = ex.Util.Class.extend({
         name: '',
         init: function(name){
            this.name = name;
         }
      });

      var BatMan: any = Person.extend({
         parents : false,
         init: function(){
            this._super('Bruce Wayne');
         }
      });

      var Robin: any = BatMan.extend({
         isNightWing: false,
         init: function(){
            this._super();
            this.name = 'Dick Grayson';
         }
      })

      var p = new Person('test');
      var b = new BatMan();
      var r = new Robin();


      expect(p.name).toBe('test');

      expect(b.name).toBe('Bruce Wayne');
      expect(b.parents).toBe(false);

      expect(r.name).toBe('Dick Grayson');
      expect(r.parents).toBe(false);
      expect(r.isNightWing).toBe(false);

   });

});