import { Engine } from '../Engine';
import { Color } from '../Color';
import { Rectangle } from '../Graphics';
import { Transition, TransitionOptions } from './Transition';
import { Screen } from '../excalibur';

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
    this.transform.pos = engine.screen.unsafeArea.topLeft;
    this._generateScreenCover(engine.screen);
    engine.screen.events.on('resize', () => this._generateScreenCover(engine.screen));
  }

  private _generateScreenCover(screen: Screen) {
    this.screenCover = new Rectangle({
      // depending on pixel density you need to add a little extra
      width: screen.resolution.width + 1,
      height: screen.resolution.height + 1,
      color: this.color
    });
    this.graphics.use(this.screenCover);
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
