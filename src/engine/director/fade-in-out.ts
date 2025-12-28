import type { Engine } from '../engine';
import { Color } from '../color';
import { Rectangle } from '../graphics';
import type { TransitionOptions } from './transition';
import { Transition } from './transition';

export interface FadeOptions {
  duration?: number;
  color?: Color;
}

export class FadeInOut extends Transition {
  screenCover!: Rectangle;
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
    this.transform.pos = engine.screen.unsafeArea.topLeft;
    this.screenCover = new Rectangle({
      width: engine.screen.resolution.width,
      height: engine.screen.resolution.height,
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
