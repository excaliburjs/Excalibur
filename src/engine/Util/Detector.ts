/// <reference path="Log.ts" />
module ex {

   export class Detector {
      
      public failedTests: string[] = [];
      
      // critical browser features required for ex to run
      private _criticalTests = {
         // Test canvas/2d context support
         canvasSupport: function() {
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
         },
         
         // Test array buffer support ex uses for downloading binary data
         arrayBufferSupport: function() {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/');
            try {
               xhr.responseType = 'arraybuffer';
            } catch (e) {
               return false;
            }
            return xhr.responseType === 'arraybuffer';
         },
         
         // Test data urls ex uses for sprites
         dataUrlSupport: function() {
            var canvas = document.createElement('canvas');
            return canvas.toDataURL('image/png').indexOf('data:image/png') === 0;
         },
         
         // Test object url support for loading
         objectUrlSupport: function() {
            return 'URL' in window && 'revokeObjectURL' in URL && 'createObjectURL' in URL;
         },
         
         // RGBA support for colors
         rgbaSupport: function() {
            var style = document.createElement('a').style;
            style.cssText = 'background-color:rgba(150,255,150,.5)';
            return ('' + style.backgroundColor).indexOf('rgba') > -1;
         }
      };
      
      // warnings excalibur performance will be degraded
      private _warningTest = {
         webAudioSupport: function() {
            return !!((<any>window).AudioContext || 
                     (<any>window).webkitAudioContext || 
                     (<any>window).mozAudioContext || 
                     (<any>window).msAudioContext || 
                     (<any>window).oAudioContext);
         },
         webglSupport: function() {
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('webgl'));
         }
      };
      
      public test(): boolean {			
         // Critical test will for ex not to run
         var failedCritical = false;
         for(var test in this._criticalTests) {
            if(!this._criticalTests[test]()) {
               this.failedTests.push(test);
               ex.Logger.getInstance().error('Critical browser feature missing, Excalibur requires:', 
                  test);
               failedCritical = true;
            }
         }
         if(failedCritical) {
            return false;
         }
         
         // Warning tests do not for ex to return false to compatibility
         for(var warning in this._warningTest) {
            if(!this._warningTest[warning]()) {
               ex.Logger.getInstance().warn('Warning browser feature missing, Excalibur will have reduced performance:', 
                  warning);
            }
         }
         
         return true;
      }
      
   }
	
}