/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('A generic Resource', () => {
   
   var resource: ex.Resource<any>;
   var mocker = new Mocks.Mocker();
   
   beforeEach(() => {
      
      resource = new ex.Resource<any>('a/path/to/a/resource.png', 'image/png');
      
      URL = <any>mocker.URL();
      
      spyOn(URL, 'createObjectURL').and.callThrough();

      ex.Logger.getInstance().defaultLevel = ex.LogLevel.Error;
   });
   
   it('should not be loaded by default', () => {
      
      expect(resource.isLoaded()).toBe(false);
      
   });
   
   describe('with some data', () => {
      
      beforeEach(() => {               
         resource.setData('data');  
      });           
      
      it('should be loaded immediately', () => {
         expect(resource.isLoaded()).toBe(true);
      });           
      
      it('should return the processed data', () => {
         expect(resource.getData()).toBe('blob://data');
      });
      
      it('should not trigger an XHR when load is called', (done) => {
         var data;
         
         resource.load().then((data) => {
            data = data;
            done();
         });        
                   
         expect(data).not.toBeNull();         
      });
      
      it('should call processData handler', () => {
         
         var spy = jasmine.createSpy('handler');
         
         resource.processData = spy;
         resource.setData('data');
         
         expect(spy).toHaveBeenCalledWith('data');
      });
      
   });
   
   
   
});