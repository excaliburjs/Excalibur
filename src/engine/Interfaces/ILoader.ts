import { ILoadable } from './ILoadable';
import { Engine } from '../Engine';
  
export interface ILoader extends ILoadable {
   draw(ctx: CanvasRenderingContext2D, delta: number);
   update(engine: Engine, delta: number);
}