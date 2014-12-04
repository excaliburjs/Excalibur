/// <reference path="Engine.ts" />
/// <reference path="Algebra.ts" />

module ex {

   /**
   * A base implementation of a camera. This class is meant to be extended.
   * @class Camera
   * @constructor
   * @param engine {Engine} Reference to the current engine
   */
   export class BaseCamera {
      follow: Actor;
      focus: Point = new Point(0, 0);
      lerp: boolean = false;
      private _cameraMoving: boolean = false;
      private _currentLerpTime: number = 0;
      private _lerpDuration: number = 1* 1000; // 5 seconds
      private _totalLerpTime: number = 0;
      private _lerpStart: Point = null;
      private _lerpEnd: Point = null;

      //camera effects
      isShaking: boolean = false;
      private shakeMagnitudeX: number = 0;
      private shakeMagnitudeY: number = 0;
      private shakeDuration: number = 0;
      private elapsedShakeTime: number = 0;

      isZooming: boolean = false;
      private currentZoomScale: number = 1;
      private maxZoomScale: number = 1;
      private zoomDuration: number = 0;
      private elapsedZoomTime: number = 0;
      private zoomIncrement: number = 0.01;

      constructor() { }

      private easeInOutCubic(currentTime: number, startValue: number, endValue: number, duration: number){
         
         endValue = (endValue - startValue);
         currentTime /= duration/2;
         if (currentTime < 1) return endValue/2*currentTime*currentTime*currentTime + startValue;
         currentTime -= 2;
         return endValue/2*(currentTime*currentTime*currentTime + 2) + startValue;
      }

      /**
      * Sets the {{#crossLink Actor}}{{/crossLink}} to follow with the camera
      * @method setActorToFollow
      * @param actor {Actor} The actor to follow
      */
      public setActorToFollow(actor: Actor) {
         this.follow = actor;
      }

      /**
      * Returns the focal point of the camera
      * @method getFocus
      * @returns Point
      */
      public getFocus() {
         return this.focus;
      }

      /**
      * Sets the focal point of the camera. This value can only be set if there is no actor to be followed.
      * @method setFocus
      * @param x {number} The x coordinate of the focal point
      * @param y {number} The y coordinate of the focal point
      */
      public setFocus(x: number, y: number) {
         if (!this.follow && !this.lerp) {
            this.focus.x = x;
            this.focus.y = y;
         }

         if(this.lerp){
            this._lerpStart = this.focus.clone();
            this._lerpEnd = new Point(x, y);
            this._currentLerpTime = 0;
            this._cameraMoving = true;
         }

      }

      /**
      * Sets the camera to shake at the specified magnitudes for the specified duration
      * @method shake
      * @param magnitudeX {number} the x magnitude of the shake
      * @param magnitudeY {number} the y magnitude of the shake
      * @param duration {number} the duration of the shake
      */
      public shake(magnitudeX: number, magnitudeY: number, duration: number) {
         this.isShaking = true;
         this.shakeMagnitudeX = magnitudeX;
         this.shakeMagnitudeY = magnitudeY;
         this.shakeDuration = duration;
      }

      /**
      * Zooms the camera in or out by the specified scale over the specified duration. 
      * If no duration is specified, it will zoom by a set amount until the scale is reached.
      * @method zoom
      * @param scale {number} the scale of the zoom
      * @param [duration] {number} the duration of the zoom
      */
      public zoom(scale: number, duration?: number) {
         this.isZooming = true;
         this.maxZoomScale = scale;
         this.zoomDuration = duration | 0;
         if (duration) {
            this.zoomIncrement = Math.abs(this.maxZoomScale - this.currentZoomScale) / duration * 1000;
         }

         if (this.maxZoomScale < 1) {
            if (duration) {
               this.zoomIncrement = -1 * this.zoomIncrement;
            } else {
               this.isZooming = false;
               this.setCurrentZoomScale(this.maxZoomScale);
            }
         }else{
            if(!duration){
               this.isZooming = false;
               this.setCurrentZoomScale(this.maxZoomScale);
            }
         }

         // console.log("zoom increment: " + this.zoomIncrement);
      }

      /**
      * gets the current zoom scale
      * @method getZoom
      * @returns {Number} the current zoom scale
      */
      public getZoom() {
         return this.currentZoomScale;
      }

      private setCurrentZoomScale(zoomScale: number) {
         this.currentZoomScale = zoomScale;
      }

      /**
      * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
      * @method update
      * @param delta {number} The number of milliseconds since the last update
      */
      public update(ctx: CanvasRenderingContext2D, delta: number) {
         var focus = this.getFocus();

         var xShake = 0;
         var yShake = 0;

         var canvasWidth = ctx.canvas.width;
         var canvasHeight = ctx.canvas.height;
         var newCanvasWidth = canvasWidth * this.getZoom();
         var newCanvasHeight = canvasHeight * this.getZoom();

         if(this.lerp){
            if(this._currentLerpTime < this._lerpDuration && this._cameraMoving){
               
               if(this._lerpEnd.x < this._lerpStart.x){
                  this.focus.x = this._lerpStart.x - (this.easeInOutCubic(this._currentLerpTime, this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x); 
               }else{
                  this.focus.x = this.easeInOutCubic(this._currentLerpTime, this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
               }

               if(this._lerpEnd.y < this._lerpStart.y){
                  this.focus.y = this._lerpStart.y - (this.easeInOutCubic(this._currentLerpTime, this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
               }else{
                  this.focus.y = this.easeInOutCubic(this._currentLerpTime, this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);                  
               }
               this._currentLerpTime += delta;
            }else{               
               this._lerpStart = null;
               this._lerpEnd = null;
               this._currentLerpTime = 0;
               this._cameraMoving = false;
            }
         }

         if (this.isDoneShaking()) {
               this.isShaking = false;
               this.elapsedShakeTime = 0;
               this.shakeMagnitudeX = 0;
               this.shakeMagnitudeY = 0;
               this.shakeDuration = 0;
            } else {
               this.elapsedShakeTime += delta;
               xShake = (Math.random() * this.shakeMagnitudeX | 0) + 1;
               yShake = (Math.random() * this.shakeMagnitudeY | 0) + 1;
            }

         ctx.translate(-focus.x + xShake + (newCanvasWidth/2), -focus.y + yShake + (newCanvasHeight/2));

         if (this.isDoneZooming()) {
            this.isZooming = false;
            this.elapsedZoomTime = 0;
            this.zoomDuration = 0;
            this.setCurrentZoomScale(this.maxZoomScale);

         } else {
            this.elapsedZoomTime += delta;

            this.setCurrentZoomScale(this.getZoom() + this.zoomIncrement * delta / 1000);
         }

         ctx.scale(this.getZoom(), this.getZoom());
      }

      public debugDraw(ctx: CanvasRenderingContext2D){
         var focus = this.getFocus();
         ctx.fillStyle = 'red';
         ctx.beginPath();
         ctx.arc(focus.x, focus.y, 15, 0, Math.PI*2);
         ctx.closePath();
         ctx.fill();
      }

      private isDoneShaking(): boolean {
         return !(this.isShaking) || (this.elapsedShakeTime >= this.shakeDuration);
      }

      private isDoneZooming(): boolean {
         if (this.zoomDuration != 0) {
            return (this.elapsedZoomTime >= this.zoomDuration);
            } else {
               if (this.maxZoomScale < 1) {
                     return (this.currentZoomScale <= this.maxZoomScale);
                  } else {
                     return (this.currentZoomScale >= this.maxZoomScale);
                  }
            }
         
      }
   }

   /**
   * An extension of BaseCamera that is locked vertically; it will only move side to side.
   * @class SideCamera
   * @extends BaseCamera
   * @constructor
   * @param engine {Engine} Reference to the current engine
   */
   export class SideCamera extends BaseCamera {
            
      public getFocus(){
         if(this.follow){
            return new Point(this.follow.x + this.follow.getWidth()/2, this.focus.y)
         }else{
            return this.focus;
         }
      }
   }

   /**
   * An extension of BaseCamera that is locked to an actor or focal point; the actor will appear in the center of the screen.
   * @class TopCamera
   * @extends BaseCamera
   * @constructor
   * @param engine {Engine} Reference to the current engine
   */
   export class TopCamera extends BaseCamera {
      
      public getFocus(){
         if(this.follow){
            return new Point(this.follow.x + this.follow.getWidth()/2, this.follow.y + this.follow.getHeight()/2)
         }else{
            return this.focus;
         }
      }
   }
}
