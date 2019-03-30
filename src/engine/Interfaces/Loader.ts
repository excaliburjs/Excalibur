import { Loadable } from './Loadable';
import { Engine } from '../Engine';

export interface CanLoad extends Loadable {
  suppressPlayButton: boolean;
  draw(ctx: CanvasRenderingContext2D, delta: number): void;
  update(engine: Engine, delta: number): void;
}
