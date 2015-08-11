/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />

describe('A Class', () => {
   it('can be extended indefinitely', () => {
      var Person: any = ex.Class.extend({
         name: '',
         constructor: function(name){
            this.name = name;
         }
      });

      var BatMan: any = Person.extend({
         parents : false,
         constructor: function(){
            //this.__super__.init('Bruce Wayne');
            this.name = 'Bruce Wayne';
         },
         getName: function(){
            return this.name;
         }

      });

      var Robin: any = BatMan.extend({
         isNightWing: false,
         constructor: function () {
            //this.__super__.init();

            this.name = 'Dick Grayson';
         },
         getName: function () {
            /*console.log(this.super);
            console.log(this);
            console.log(this.__super__);*/
            return BatMan.prototype.getName.call(this);
            //return this.super.getName.call(this);
         },
         getName2: function () {
            return this.super.getName.call(this);
         }
      });

      var p = new Person('test');
      var b = new BatMan();
      var r = new Robin();


      expect(p.name).toBe('test');

      expect(b.name).toBe('Bruce Wayne');
      expect(b.parents).toBe(false);

      expect(r.name).toBe('Dick Grayson');
      expect(r.parents).toBe(false);
      expect(r.isNightWing).toBe(false);
      expect(r.getName()).toBe('Dick Grayson');

   });

   it('does not share the same instance of the super type', () => {
      var Person: any = ex.Class.extend({
         name: '',
         constructor: function(name){
            this.name = name;
         }
      });

      var p1 = new Person('1');     
      var p2 = new Person('2');

      expect(p1.name).toBe('1');
      expect(p2.name).toBe('2');

   });

});