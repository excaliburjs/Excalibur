/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by the ExcaliburJS Team.
4. Neither the name of the creator nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE EXCALIBURJS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE EXCALIBURJS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


module Common {
   

   export interface IEngine {
      getKeys();
      getKeyMap() : {[key:string]:number;};
      getActors() : Common.IActor[];
      getLevel() : Common.IActor[];
      getGraphicsCtx() : CanvasRenderingContext2D;
      getCanvas() : HTMLCanvasElement;
      update(engine: IEngine, delta: number);
      draw(ctx: CanvasRenderingContext2D, delta: number);
   }

   
   export interface IPhysicsSystem {
      update(delta: number);
      addActor(actor: Common.IActor):void;
      removeActor(actor: Common.IActor): void;
      getProperty(key: string):any;
      setProperty(key: string, value: any):void;
   }

   export interface IColor {
      r: number;
      g: number;
      b: number;
      a: number;
      toString(): string;
   }

   export interface IOverlap{
      x:number;
      y:number;
   }

   export interface ICollidable {
      collides(primitive: ICollidable): boolean;
      collidesWithBox(box: IBoundingBox): boolean;
      collidesWithCircle(circle: IBoundingCircle): boolean;
      collidesWithPoly(poly: IBoundingPoly): boolean;
      collidesWithPixels(pixels: IBoundingPixels): boolean;

      getOverlapWithBox(box: IBoundingBox): IOverlap;
      getOverlapWithCircle(circle: IBoundingCircle): IOverlap;
      getOverlapWithPoly(poly: IBoundingPoly): IOverlap;
      getOverlapWithPixels(pixels: IBoundingPixels): IOverlap;

   }

   export interface IBoundingBox extends ICollidable {
   }

   export interface IBoundingCircle extends ICollidable {
   }
   export interface IBoundingPoly extends ICollidable {
   }
   export interface IBoundingPixels extends ICollidable {
   }

   export interface IBox {
      getLeft():number;
      setLeft(left: number);

      getRight():number;
      setRight(right: number);

      getTop():number;
      setTop(top: number);

      getBottom(): number;
      setBottom(bottom: number);

      getOverlap(box: IBox): IOverlap;
      
      collides(box : IBox): boolean;
   }


   export interface IActor {
      getX(): number;
      setX(x: number);

      getY(): number;
      setY(y: number);

      getDx(): number;
      setDx(dx: number);

      getDy(): number;
      setDy(dy: number);

      getAx(): number;
      setAx(ax: number);

      getAy(): number;
      setAy(ay:number);

      adjustX(x: number);
      adjustY(y: number);

      setPhysicsSystem(IPhysicsSystem);
      getPhysicsSystem():IPhysicsSystem;

      setBox(box: IBox);
      getBox(): IBox;
      
      setColor(color: IColor);
      getColor(): IColor;

      update(engine: IEngine, delta: number);
      draw(ctx: CanvasRenderingContext2D, delta: number);
   }
}

