import { Engine } from '../Engine';
import { Color } from '../Color';
import { vec } from '../Math/vector';
import { Rectangle } from '../Graphics';
import { Transition, TransitionOptions } from './Transition';

export interface FadeOptions {
  duration?: number;
  color?: Color;
}

export class FadeInOut extends Transition {
  screenCover: Rectangle;
  color: Color;
  constructor(options: FadeOptions & TransitionOptions) {
    super({
      ...options,
      duration: options.duration ?? 2000
    });
    this.name = `FadeInOut#${this.id}`;
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