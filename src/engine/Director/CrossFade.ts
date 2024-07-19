import { ImageSource, Sprite } from '../Graphics';
import { Engine } from '../Engine';
import { Scene } from '../Scene';
import { Transition, TransitionOptions } from './Transition';
import { vec } from '../Math/vector';

export interface CrossFadeOptions {
  duration: number;
}

/**
 * CrossFades between the previous scene and the destination scene
 *
 * Note: CrossFade only works as an "in" transition
 */
export class CrossFade extends Transition {
  engine: Engine;
  image: HTMLImageElement;
  screenCover: Sprite;
  constructor(options: TransitionOptions & CrossFadeOptions) {
    super({ direction: 'in', ...options }); // default the correct direction
    this.name = `CrossFade#${this.id}`;
  }

  override async onPreviousSceneDeactivate(scene: Scene<unknown>) {
    this.image = await scene.engine.screenshot(true);
    // Firefox is particularly slow
    // needed in case the image isn't ready yet
    await this.image.decode();
  }

  override onInitialize(engine: Engine): void {
    this.engine = engine;
    this.transform.pos = engine.screen.unsafeArea.topLeft;
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
