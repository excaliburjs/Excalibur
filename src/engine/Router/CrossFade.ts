import { Engine, ImageSource, Scene, Sprite } from '..';
import { Transition, TransitionOptions } from './Transition';
import { vec } from '../Math/vector';

export interface CrossFadeOptions {
  duration: number;
}

export class CrossFade extends Transition {
  engine: Engine;
  image: HTMLImageElement;
  screenCover: Sprite;
  // TODO how do I keep track of the previous scene screen shot
  constructor(options: TransitionOptions & CrossFadeOptions) {
    super(options);
    this.name = `CrossFade#${this.id}`;
  }

  override async onPreviousSceneDeactivate(scene: Scene<unknown>) {
    this.image = await scene.engine.screenshot(true);
  }

  override onInitialize(engine: Engine): void {
    this.engine = engine;
    const bounds = engine.screen.getWorldBounds();
    this.transform.pos = vec(bounds.left, bounds.top);
    this.screenCover = ImageSource.fromHtmlImageElement(this.image).toSprite();
    this.graphics.add(this.screenCover);
    this.transform.scale = vec(1 / engine.screen.pixelRatio, 1 / engine.screen.pixelRatio);
    this.graphics.opacity = this.progress;
  }

  override onStart(_progress: number): void {
    this.graphics.opacity = this.progress;
  }

  override onReset() {
    this.graphics.opacity = this.progress;
  }

  override onEnd(progress: number): void {
    this.graphics.opacity = progress;
  }

  override onUpdate(progress: number): void {
    this.graphics.opacity = progress;
  }
}