/// <reference path="ILoadable.ts" />

module ex {
   
   export interface ILoader extends ILoadable {
      draw(ctx: CanvasRenderingContext2D, delta: number);
      update(engine: Engine, delta: number);
   }
}