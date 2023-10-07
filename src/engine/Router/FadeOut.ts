import { Color, Engine, Rectangle, vec } from '..';
import { Transition, TransitionOptions } from './Transition';

export interface FadeOptions {
  duration?: number;
  direction?: 'in' | 'out';
  color?: Color;
}

export class FadeOut extends Transition {
  screenCover: Rectangle;
  color: Color;
  constructor(options: FadeOptions & TransitionOptions) {
    super({
      ...options,
      duration: options.duration ?? 2000,
      direction: options.direction ?? 'in'
    });
    this.name = `FadeOut#${this.id}`;
    this.color = options.color ?? Color.Black;
  }

  public onInitialize(engine: Engine): void {
    const bounds = engine.screen.getWorldBounds();
    this.transform.pos = vec(bounds.left, bounds.top);
    this.screenCover = new Rectangle({
      width: bounds.width,
      height: bounds.height,
      color: this.color
    });
    this.graphics.add(this.screenCover);
    this.graphics.opacity = this.progress;
  }

  override onReset() {
    this.graphics.opacity = this.progress;
  }

  override onStart(progress: number): void {
    this.graphics.opacity = progress;
  }

  override onEnd(progress: number): void {
    this.graphics.opacity = progress;
  }

  override onUpdate(progress: number): void {
    this.graphics.opacity = progress;
  }
}